import consola from 'consola'
import { get } from 'object-path'
import { forEachSeries } from 'p-iteration'
import { Account, Youtube } from '../../models'
import YoutubePaginator from '../lib/YoutubePaginator'
import ResultCounter from '../lib/resultCounter'

export default async (api, channelIDs = [], doChain = false) => {
  const len = channelIDs.length
  consola.info(`[Update Youtube] run ${len} items...`)

  // API の処理を実装
  const paginator = new YoutubePaginator(async (next) => {
    const res = await api.channels.list({
      id: channelIDs.join(', '),
      part: 'id, snippet, contentDetails, statistics',
      maxResults: 4,
      pageToken: next
    })
    return res
  })

  // API を叩く
  const items = await paginator.exec()

  // eslint-disable-next-line prettier/prettier
  consola.info(`[Update Youtube] Fetch ${items.length} items. (${paginator.statusCode}, next: ${paginator.hasNext()})`)

  // item が存在しなかったらエラー
  if (items.length === 0) {
    throw new Error('YouTube Channel fetch error.')
  }

  // マッピング処理 ({ key: item ... })
  const map = {}
  for (const item of items) {
    const cid = get(item, 'id')
    map[cid] = item
  }

  // 先頭から一つずつ保存処理
  const counter = new ResultCounter(len)
  await forEachSeries(channelIDs, async (channelID) => {
    try {
      await insert(channelID, map[channelID], doChain)
      counter.success()
    } catch (err) {
      // 内部でのエラーはログ出力のみ
      consola.warn(err)
      counter.skip()
    }
  })

  // eslint-disable-next-line prettier/prettier
  consola.info(`[Update Youtube] Save ${counter.t} items. (${counter.t}/${counter.len} ${counter.rate()}%)`)
}

/**
 *
 * @param {String} channelID
 * @param {Object|null} item
 * @param {boolean} doChain
 */
const insert = async (channelID, item, doChain) => {
  // データの存在チェック
  if (!item) {
    throw new Error(`<${channelID}> Fetch error.`)
  }

  // データの整合性チェック (ID)
  if (channelID !== get(item, 'id')) {
    throw new Error(`<${channelID}> ID does not match.`)
  }

  // DB Document の取得 (失敗時 null)
  let youtube = await Youtube.findOne({ channel_id: channelID })
  const hasDatabase = youtube !== null

  // データ整形 ///////////////////////////////////////////////////
  const thumbnail =
    get(item, 'snippet.thumbnails.high.url') ||
    get(item, 'snippet.thumbnails.default.url')

  const meta = {
    channel_id: channelID,
    title: get(item, 'snippet.title'),
    text: get(item, 'snippet.description'),
    image: thumbnail,
    url: `https://www.youtube.com/channel/${channelID}`,
    playlist: get(item, 'contentDetails.relatedPlaylists.uploads'),
    published_at: get(item, 'snippet.published_at')
  }
  /// ////////////////////////////////////////////////////////////

  // DB 保存処理
  if (hasDatabase) {
    // Youtube を更新
    youtube.set(meta)
    await youtube.save()

    const ylog = `<${youtube._id}> ${youtube.channel_id} ${youtube.title}`
    consola.debug(`[Update Youtube] Update ${ylog}`)
  } else {
    // チャンネルが存在しない場合、アカウントを連鎖で作成する

    // 連鎖保存NGなら例外
    if (!doChain) {
      throw new Error(`<${channelID}> Does not exist in the database.`)
    }

    // Account を作成
    const name = get(item, 'snippet.title', 'undefined')
    const account = new Account()
    account.set('name', name)
    await account.save()

    const alog = `<${account._id}> ${account.name}`
    consola.debug(`[Update Youtube] Chaining Create ${alog}`)

    // Youtube を作成
    youtube = new Youtube()
    youtube.account = account._id
    youtube.set(meta)
    await youtube.save()

    const ylog = `<${youtube._id}> ${youtube.channel_id} ${youtube.title}`
    consola.debug(`[Update Youtube] Create ${ylog}`)

    // Account に Youtube を関連付け
    account.youtube.addToSet(youtube._id)
    await account.save()
  }
}
