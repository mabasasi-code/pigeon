import { forEachSeries } from 'p-iteration'
import { Channel, Video } from '../models'

import updateChannel from './task/updateChannel'
import updateVideo from './task/updateVideo'
// import collectPlaylistVideos from './task/collectPlaylistVideos'
import collectFeedVideos from './task/collectFeedVideos'

// video info
// - type: upcoming, live, archive, video
// - status: public, unlisted, private, delete

// 全てのチャンネルを更新する
export const channelUpdate = async function(api) {
  const cids = await findChannelID({})
  await updateChannel(api, cids, { skipExist: false })
}

// 配信中 の video を更新する (delete は除外)
export const liveVideoUpdate = async function(api) {
  const query = {
    $and: [{ type: 'live' }, { status: { $ne: 'delete' } }]
  }

  const vids = await findVideoID(query)
  await updateVideo(api, vids, { skipExist: false })
}

// 配信予定 の video を確認して変更があれば保存する、true で確定保存 (delete は除外)
export const upcomingVideoUpdate = async function(api, skipUpcoming) {
  const query = {
    $and: [{ type: 'upcoming' }, { status: { $ne: 'delete' } }]
  }

  const vids = await findVideoID(query)
  await updateVideo(api, vids, { skipExist: false, skipUpcoming })
}

// 一週間の範囲で 動画 と アーカイブ の video を更新する (delete も含む)
export const weekVideoUpdate = async function(api, date) {
  const limit = date.clone().subtract(7, 'days')

  const query = {
    end_time: { $gte: limit },
    start_time: { $lt: date },
    type: { $in: ['live', 'upcoming'] }
  }
  const vids = await findVideoID(query)
  await updateVideo(api, vids, { skipExist: false })
}

// feed から video を更新する
export const feedVideoUpdate = async function(api) {
  const cids = await findChannelID({})

  await forEachSeries(cids, async (cid, index) => {
    const vids = await collectFeedVideos(cid)
    await updateVideo(api, vids, { skipExist: true })
  })
}

/// ////////////////////////////////////////////////////////////

const findChannelID = async function(query) {
  const channels = await Channel.find(query, ['channel_id'])
  const cids = channels.map((e) => e.channel_id).filter((e) => e)
  return cids
}

const findVideoID = async function(query) {
  const videos = await Video.find(query, ['video_id'])
  const vids = videos.map((e) => e.video_id).filter((e) => e)
  return vids
}
