import consola from 'consola'
import { get } from 'object-path'
import throwIf from '../lib/throwIf'

import { Account, Youtube, YoutubeStat } from '../../models'

export default async (item, { doChain = false }) => {
  // item が空ならエラー
  throwIf(item == null, new Error('No item data!'))

  // ID の取得
  const cid = get(item, 'id')
  consola.trace(`> run '${cid}'`)

  // DB から Document の取得 (失敗時は null)
  let youtube = await Youtube.findOne({ channel_id: cid })
  const hasDatabase = youtube != null

  // データ整形 ///////////////////////////////////////////////////

  // サムネイル選択
  const thumbnail =
    get(item, 'snippet.thumbnails.high.url') ||
    get(item, 'snippet.thumbnails.default.url')

  // 統計情報
  const stat = {
    timestamp: new Date(), // TODO: フェッチ日時にする
    view: get(item, 'statistics.viewCount'),
    comment: get(item, 'statistics.commentCount'),
    subscriber: get(item, 'statistics.subscriberCount'),
    video: get(item, 'statistics.videoCount')
  }

  // メインメタ情報
  const meta = {
    channel_id: cid,
    title: get(item, 'snippet.title'),
    text: get(item, 'snippet.description'),
    image: thumbnail,
    playlist: get(item, 'contentDetails.relatedPlaylists.uploads'),
    url: `https://www.youtube.com/channel/${cid}`,
    published_at: get(item, 'snippet.publishedAt')
  }

  /// ////////////////////////////////////////////////////////////

  // DB 保存処理
  if (hasDatabase) {
    // ● Youtube を更新
    youtube.set(meta)
    youtube.set('stats.now', stat)
    await youtube.save()

    const ylog = `<${youtube._id}>, ${youtube.channel_id}, ${youtube.title}`
    consola.trace(`> 'Youtube' Update. ${ylog}`)
  } else {
    // channel が存在しない場合、アカウントを連鎖で作成する

    // 連鎖保存NGなら例外
    throwIf(!doChain, new Error('Does not exist in the database.'))

    // ■ Account を作成
    const name = get(item, 'snippet.title', 'undefined')
    const account = new Account()
    account.set('name', name)
    await account.save()

    const alog = `<${account._id}> ${account.name}`
    consola.trace(`> 'Account' Chaining Create. ${alog}`)

    // ■ Youtube を作成
    youtube = new Youtube()
    youtube.set('account', account._id)
    youtube.set(meta)
    youtube.set('stats.now', stat)
    await youtube.save()

    const ylog = `<${youtube._id}>, ${youtube.channel_id}, ${youtube.title}`
    consola.trace(`> 'Youtube' Create. ${ylog}`)

    // Account に Youtube を関連付け
    account.youtube.addToSet(youtube._id)
    await account.save()
  }

  // ■ Youtube-Stat を作成
  const youtubeStat = new YoutubeStat()
  youtubeStat.youtube = youtube._id
  youtubeStat.set(stat)
  youtubeStat.save()

  const yslog = `<${youtubeStat._id}>, ${youtubeStat.timestamp.toISOString()}`
  consola.trace(`> 'YoutubeStat' Create. ${yslog}`)

  return youtube
}
