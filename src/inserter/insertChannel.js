import { get } from 'object-path'

import { batch as logger } from '../../logger'
import throwIf from '../lib/throwIf'

import { Account, Channel, ChannelStat } from '../../models'

export default async (
  channelID,
  item,
  { doChain = false, skipExist = false }
) => {
  // DB から Document の取得 (失敗時は null)
  let channel = await Channel.findOne({ channel_id: channelID })
  const hasDatabase = channel != null

  // skipExist 時、DBに存在するなら何もしない
  if (skipExist && hasDatabase) {
    logger.trace(`> Skip because it existed.`)
    return null
  }

  // channel に削除処理は噛ませない

  // key と id の整合性の確認
  throwIf(get(item, 'id') !== channelID, new Error('ID does not match.'))

  // item が空ならエラー
  throwIf(item == null, new Error('No item data!'))

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
    channel_id: channelID,
    service: 'youtube',
    title: get(item, 'snippet.title'),
    text: get(item, 'snippet.description'),
    image: thumbnail,
    playlist: get(item, 'contentDetails.relatedPlaylists.uploads'),
    url: `https://www.youtube.com/channel/${channelID}`,
    published_at: get(item, 'snippet.publishedAt')
  }

  /// ////////////////////////////////////////////////////////////

  // DB 保存処理
  if (hasDatabase) {
    // ● Channel を更新
    channel.set(meta)
    channel.set('stats.now', stat)
    await channel.save()

    const ylog = `<${channel._id}>, ${channel.channel_id}, ${channel.title}`
    logger.trace(`> 'Channel' Update. ${ylog}`)
  } else {
    // channel が存在しない場合、アカウントを連鎖で作成する

    // 連鎖保存NGなら例外
    throwIf(!doChain, new Error("'Account' is not exist in the database."))

    // ■ Account を作成
    const name = get(item, 'snippet.title', 'undefined')
    const account = new Account()
    account.set('name', name)
    await account.save()

    const alog = `<${account._id}> ${account.name}`
    logger.trace(`> 'Account' Chaining Create. ${alog}`)

    // ■ Channel を作成
    channel = new Channel()
    channel.set('account', account._id)
    channel.set(meta)
    channel.set('stats.now', stat)
    await channel.save()

    const clog = `<${channel._id}>, ${channel.channel_id}, ${channel.title}`
    logger.trace(`> 'Channel' Create. ${clog}`)

    // Account に Channel を関連付け
    account.channels.addToSet(channel._id)
    await account.save()
  }

  // ■ Channel-Stat を作成
  const channelStat = new ChannelStat()
  channelStat.channel = channel._id
  channelStat.set(stat)
  await channelStat.save()

  const cslog = `<${channelStat._id}>, ${channelStat.timestamp.toISOString()}`
  logger.trace(`> 'ChannelStat' Create. ${cslog}`)

  return channel
}
