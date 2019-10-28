import { forEachSeries } from 'p-iteration'
import { Channel, Video } from '../models'

import updateChannel from './task/updateChannel'
import updateVideo from './task/updateVideo'
// import collectPlaylistVideos from './task/collectPlaylistVideos'
import collectFeedVideos from './task/collectFeedVideos'

// video info
// - type: upcoming, live, archive, video
// - status: public, unlisted, private, delete

/**
 * 全ての channel を更新する.
 * @param {YoutubeAPI} api api
 * @param {String[]|[]} channelIDs channelIDs 、未指定でDB の値をまるごと抜き出す
 * @param {Object} options option
 * @param {Boolean} options.doChain true でAccount が無くても保存する
 * @param {Boolean} options.skipExist true で DB に存在する際にスキップする
 */
export const channelUpdate = async function(
  api,
  channelIDs = [],
  options = { doChain: false, skipExist: false }
) {
  let cids = channelIDs
  if (cids.length === 0) {
    cids = await findChannelID({})
  }
  await updateChannel(api, cids, options)
}
/**
 * video を更新する (指定がない場合、最新20件).
 * MEMO: cron 処理では使用していない
 * @param {YoutubeAPI} api api
 * @param {String[]|[]} videoIDs videoIDs 、未指定でDB から最新20件を取得
 * @param {Object} options option
 * @param {Boolean} options.skipExist true で DB に存在する際にスキップする
 * @param {Boolean} options.all true で全ての video を対象とする(注意)
 */
export const videoUpdate = async function(
  api,
  videoIDs = [],
  options = { skipExist: false, all: false }
) {
  let vids = videoIDs
  if (videoIDs.length === 0) {
    const option = options.all ? {} : { sort: { start_time: -1 }, limit: 20 }
    vids = await findVideoID({}, option)
  }
  await updateVideo(api, vids, options)
}

/**
 * 配信中 の video を更新する. (delete は除外)
 * @param {YoutubeAPI} api api
 * @param {Object} options option
 * @param {Boolean} options.skipExist true で DB に存在する際にスキップする.
 */
export const liveVideoUpdate = async function(
  api,
  options = { skipExist: false }
) {
  const vids = await findVideoID({
    $and: [{ type: 'live' }, { status: { $ne: 'delete' } }]
  })
  await updateVideo(api, vids, options)
}

/**
 * 配信予定 の video を確認して変更があれば保存する. (delete は除外)
 * @param {YoutubeAPI} api api
 * @param {Object} options option
 * @param {Boolean} options.skipExist true で DB に存在する際にスキップする.
 * @param {Boolean} options.skipUpcoming true で upcoming の時に保存しない.
 */
export const upcomingVideoUpdate = async function(
  api,
  options = { skipExist: false, skipUpcoming: false }
) {
  const vids = await findVideoID({
    $and: [{ type: 'upcoming' }, { status: { $ne: 'delete' } }]
  })
  await updateVideo(api, vids, options)
}

// 一週間の範囲で 動画 と アーカイブ の video を更新する (delete も含む)
export const weekVideoUpdate = async function(api, date) {
  const limit = date.clone().subtract(7, 'days')

  const vids = await findVideoID({
    end_time: { $gte: limit },
    start_time: { $lt: date },
    type: { $in: ['live', 'upcoming'] }
  })
  await updateVideo(api, vids, { skipExist: false })
}

// feed から video を更新する
export const feedVideoUpdate = async function(api) {
  // TODO: 未最適化
  const cids = await findChannelID({})

  await forEachSeries(cids, async (cid, index) => {
    const vids = await collectFeedVideos(cid)
    await updateVideo(api, vids, { skipExist: true })
  })
}

/// ////////////////////////////////////////////////////////////

const findChannelID = async function(query, option = {}) {
  const channels = await Channel.find(query, ['channel_id'], option)
  const cids = channels.map((e) => e.channel_id).filter((e) => e)
  return cids
}

const findVideoID = async function(query, option = {}) {
  const videos = await Video.find(query, ['video_id'], option)
  const vids = videos.map((e) => e.video_id).filter((e) => e)
  return vids
}
