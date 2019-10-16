import consola from 'consola'
import moment from 'moment'
import schedule from 'node-schedule'
import { forEachSeries } from 'p-iteration'

import database, { Channel, Video } from '../models'
import api from './lib/youtubeAPI'

import updateChannel from './task/updateChannel'
import updateVideo from './task/updateVideo'
// import collectPlaylistVideos from './task/collectPlaylistVideos'
import collectFeedVideos from './task/collectFeedVideos'

export default async () => {
  consola.start('[cron] Initialization.')
  await database()

  await batch(api, moment('2019-10-16 10:00'))
  // schedule.scheduleJob('*/5 * * * *', async function(fireDate) {
  //   await batch(api, moment(fireDate))
  // })
}

/// ////////////////////////////////////////////////////////////

const batch = async (api, date) => {
  try {
    const { hour, minute } = { hour: date.hours(), minute: date.minutes() }
    consola.info(`[cron] start (date: ${date.format('YYYY-MM-DD HH:mm:ss')})`)

    // 毎日10時に channel データの更新をする
    if (hour === 10) {
      consola.info('[cron] run Update channels ...')
      const channels = await Channel.find({}, ['channel_id'])
      const cids = channels.map((e) => e.channel_id).filter((e) => e)
      await updateChannel(api, cids, { skipExist: false })
    }

    // 加えて 一週間分の video を更新する
    // await job.weekVideoUpdateJob(api)

    // 5分ごとに配信中の video を更新する
    if (minute % 5 === 0) {
      consola.info('[cron] run Update live videos ...')
      const q = { type: { $in: ['live'] } }
      const videos = await Video.find(q, ['video_id'])
      const vids = videos.map((e) => e.video_id).filter((e) => e)
      await updateVideo(api, vids, { skipExist: false })
    }

    // 5分ごとに待機中の video を確認する、保存は一時間毎？
    if (minute % 5 === 0) {
      consola.info('[cron] run Update upcoming videos ...')
      const q = { type: { $in: ['upcoming'] } }
      const videos = await Video.find(q, ['video_id'])
      const vids = videos.map((e) => e.video_id).filter((e) => e)
      await updateVideo(api, vids, { skipExist: minute === 0 })
    }

    // 15分ごとに feed を検索する (5, 20, 35, 50)
    if ((minute - 5) % 15 === 0) {
      consola.info('[cron] run Update feed videos ...')
      const channels = await Channel.find({}, ['channel_id'])
      const cids = channels.map((e) => e.channel_id).filter((e) => e)
      await forEachSeries(cids, async (cid) => {
        const vids = await collectFeedVideos(cid)
        await updateVideo(api, vids, { skipExist: true })
      })
    }

    const diff = moment().diff(date, 'seconds', true)
    consola.info(`[cron] success! (${diff.toFixed(2)}sec)\n`)
  } catch (err) {
    consola.error(err)
    consola.error('[cron] INTERRUPT!!\n')
  }
}
