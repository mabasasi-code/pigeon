import moment from 'moment'
import schedule from 'node-schedule'

import { cron as logger, EOL } from '../logger'
import database from '../models'
import api from './lib/youtubeAPI'
import * as job from './job'

export default async () => {
  logger.info('Inintalization.' + EOL)
  await database()

  // test usage
  // await batch(api, moment('2019-10-29 00:05'))
  // process.exit(0)

  schedule.scheduleJob('*/5 * * * *', async function(fireDate) {
    await batch(api, moment(fireDate))
  })
}

/// ////////////////////////////////////////////////////////////

const batch = async (api, date) => {
  const ts = new Date()
  const dateStr = date.format('YYYY-MM-DDTHH:mm:ss.SSSZ')

  try {
    logger.info('------------------------------------------------------------')
    logger.info('START', '-', 'Batch processing.')
    logger.info('- date:', dateStr)
    logger.info('------------------------------------------------------------')

    const { hour, minute } = { hour: date.hours(), minute: date.minutes() }

    if (hour === 10) {
      // 毎日10時に channel データの更新をする
      logger.info('RUN', '-', 'Update all channels', '...')
      await job.channelUpdate(api)

      // 加えて 一週間分の video と archive を更新する
      logger.info('RUN', '-', 'Update videos for one week', '...')
      await job.weekVideoUpdate(api, date)
    }

    if (minute % 5 === 0) {
      // 5分ごとに 配信中 の video を更新する (delete は除外)
      logger.info('RUN', '-', 'Update live videos', '...')
      await job.liveVideoUpdate(api)

      // 加えて 配信予定 の video を確認して変更があれば保存する
      // true で確定保存 (delete は除外)
      logger.info('RUN', '-', 'Update scheduled videos', '...')
      await job.upcomingVideoUpdate(api, { skipUpcoming: minute !== 5 })
    }

    // 15分ごとに feed から video を更新する (5, 20, 35, 50)
    if ((minute - 5) % 15 === 0) {
      logger.info('RUN', '-', 'Add videos from feed', '...')
      await job.feedVideoUpdate(api, [], { skipExist: true, delayTime: 1000 })
    }
  } catch (err) {
    logger.error(err)
    logger.error('INTERRUPT!')
  } finally {
    const diffSec = (new Date() - ts) / 1000
    logger.info('------------------------------------------------------------')
    logger.info('FINISH', '-', 'Batch processing.')
    logger.info('-', 'date:', dateStr)
    logger.info('-', 'time:', diffSec.toFixed(2), 'sec')
    logger.info(
      `------------------------------------------------------------` + EOL
    )
  }
}
