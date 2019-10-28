import moment from 'moment'

import { batch as logger } from '../../logger'
import throwIf from '../lib/throwIf'

import { Video } from '../../models'

export default async (videoID, item, options) => {
  // key が空ならエラー
  throwIf(videoID == null, new Error('No item videoID.'))

  // DB から Document の取得 (失敗時は null)
  const video = await Video.findOne({ video_id: videoID })
  const hasDatabase = video != null

  // データベースに存在しないならエラー
  throwIf(!hasDatabase, new Error("'Video' is not exist in the database."))

  // データ整形 ///////////////////////////////////////////////////

  // タイムスタンプ
  const nowTime = moment() // TODO: フェッチ日時にする

  // メインメタ情報
  const meta = {
    video_id: videoID,
    status: 'delete'
  }

  // ライブ中なら archive と終了時刻を付与する
  // いつ終わったかわからないのでとりあえず取得時間
  if (video.type === 'live') {
    meta.status = 'archive'
    meta.end_time = nowTime.toISOString()
  }

  // DB 保存処理 //////////////////////////////////////////////////

  // ■ Video を作成
  video.set(meta)
  await video.save()

  const vlog = `<${video._id}>, ${video.video_id}, ${video.title}`
  logger.trace(`> 'Video' Delete. ${vlog}`)

  // Video-Stat は作成できない(データがないため)
  return video
}

/// ////////////////////////////////////////////////////////////
