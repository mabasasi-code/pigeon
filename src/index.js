import consola from 'consola'
import { get } from 'object-path'
import { google } from 'googleapis'

import mongo, { Account, Youtube } from '../models'

const boot = async () => {
  // DB アクティブ化
  await mongo()

  // google 認証
  const youtube = google.youtube({
    version: 'v3',
    auth: process.env.GOOGLE_API_KEY
  })

  // 試しのAPI叩き
  // なとり：UC1519-d1jzGiL1MPTxEdtSA
  // ちえり：UCP9ZgeIJ3Ri9En69R0kJc9Q
  const res = await youtube.channels.list({
    id: 'UC1519-d1jzGiL1MPTxEdtSA',
    part: 'id, snippet, contentDetails, statistics',
    maxResults: 50
  })

  const item = get(res, 'data.items.0')
  const cid = get(item, 'id')
  if (!cid) {
    throw new Error('取得ミス.')
  }

  // データ整形
  const thumbnail =
    get(item, 'snippet.thumbnails.high.url') ||
    get(item, 'snippet.thumbnails.default.url')

  const meta = {
    channel_id: cid,
    title: get(item, 'snippet.title'),
    text: get(item, 'snippet.description'),
    image: thumbnail,
    url: `https://www.youtube.com/channel/${cid}`,
    playlist: get(item, 'contentDetails.relatedPlaylists.uploads'),
    published_at: get(item, 'snippet.published_at')
  }

  console.log(JSON.stringify(meta, null, 2))

  // DB存在チェック
  let channel = await Youtube.findOne({ channel_id: cid })

  // チャンネルが存在しないなら作成する
  if (channel === null) {
    const name = get(item, 'snippet.title', 'undefined')
    const account = await Account.create({
      name
    })

    channel = new Youtube()
    channel.account = account._id
    channel.set(meta)
    await channel.save()

    console.log('id', channel._id)
    account.youtube.addToSet(channel._id)
    await account.save()
  } else {
    channel.set(meta)
    await channel.save()
  }

  console.log(JSON.stringify(channel, null, 2))
}

boot()
  .catch((err) => {
    consola.error(err)
  })
  .finally(() => {
    consola.info('finish!')
    process.exit(0)
  })
