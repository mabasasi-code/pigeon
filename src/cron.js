import consola from 'consola'
import moment from 'moment'
import schedule from 'node-schedule'

import database from '../models'
import api from './lib/youtubeAPI'
import * as job from './job'

export default async () => {
  consola.start('[cron] Initialization.')
  await database()

  // await batch(api, moment('2019-10-22 04:00'))
  // process.exit(0)

  schedule.scheduleJob('*/5 * * * *', async function(fireDate) {
    await batch(api, moment(fireDate))
  })
}

/// ////////////////////////////////////////////////////////////

const batch = async (api, date) => {
  try {
    const { hour, minute } = { hour: date.hours(), minute: date.minutes() }
    consola.info(`[cron] start (date: ${date.format('YYYY-MM-DD HH:mm:ss')})`)

    if (hour === 10) {
      // 毎日10時に channel データの更新をする
      consola.info('[cron] run Update channels ...')
      await job.channelUpdate(api)

      // 加えて 一週間分の video と archive を更新する
      consola.info('[cron] run Update week videos ...')
      await job.weekVideoUpdate(api)
    }

    if (minute % 5 === 0) {
      // 5分ごとに 配信中 の video を更新する (delete は除外)
      consola.info('[cron] run Update live videos ...')
      await job.liveVideoUpdate(api)
    }

    if (minute % 5 === 0) {
      // 5分ごとに 配信予定 の video を確認して変更があれば保存する
      // true で確定保存 (delete は除外)
      consola.info('[cron] run Update upcoming videos ...')
      await job.upcomingVideoUpdate(api, minute !== 5)
    }

    // 15分ごとに feed から video を更新する (5, 20, 35, 50)
    if ((minute - 5) % 15 === 0) {
      consola.info('[cron] run Update feed videos ...')
      await job.feedVideoUpdate(api)
    }

    const diff = moment().diff(date, 'seconds', true)
    consola.info(`[cron] success! (${diff.toFixed(2)}sec)\n`)
  } catch (err) {
    consola.error(err)
    consola.error('[cron] INTERRUPT!!\n')
  }
}
