import { get } from 'object-path'
import feedParser from 'feedparser-promised'
import delay from 'delay'

import { batch as logger } from '../../logger'
import throwIf from '../lib/throwIf'
import arrayToMap from '../lib/arrayToMap'
import YoutubePaginator from '../lib/youtubePaginator'
import ItemSequencer from '../lib/itemSequencer'

import { Video } from '../../models'

export default async (
  channelIDs,
  options = { skipExist: false, delayTime: 0 }
) => {
  // もし id配列が空なら例外
  throwIf(!Array.isArray(channelIDs), new Error('Parameter error of IDs.'))

  // もし id配列の長さが0なら終了
  if (channelIDs.length === 0) {
    logger.info(`Nothing to process.`)
    return
  }

  logger.info('START', '-', '<collect feed>', `(len: ${channelIDs.length})`)

  // API の処理を実装
  // cron fetch の仕組みを強引に組み込む
  const paginator = new YoutubePaginator(
    channelIDs,
    async (chunk, { next, maxChunkSize }) => {
      const id = chunk.join(',')
      const parse = await feedParser
        .parse(
          { url: `https://www.youtube.com/feeds/videos.xml?channel_id=${id}` },
          { normalize: true, addmeta: false }
        )
        .then((result) => result)
      return parse
    },
    1
  )

  // 連続処理
  const seq = new ItemSequencer()
  do {
    // API を叩く
    const items = await paginator.exec('')

    const cnt = `${paginator.getCursor()}/${paginator.getLength()}`
    const code = 200 // TODO: 取得方法が不明なため 200固定
    const next = paginator.hasNext()
    const mes2 = `(${cnt}, res:${code}, next:${next})`
    logger.debug('FETCH', '-', `${items.length} items.`, mes2)

    // item 配列が存在しなかったらエラー、空ならスキップ
    throwIf(!Array.isArray(items), new Error('Video feed fetch error.'))
    if (items.length === 0) continue

    // マッピング
    // video ID ではなく guid を使用
    const map = arrayToMap(items, (item) => get(item, 'guid'))

    // 逐次処理プロセス
    const res = await process(map, options)
    seq.merge(res)

    if (options.delayTime > 0) {
      await delay(options.delayTime)
    }
  } while (paginator.hasNext())

  // 結果表示
  const videoIds = seq.getResult()
  const len = seq.format('%c items.')
  const mes = seq.format('(%r%, %t/%l, skip:%s, err:%f)')
  logger.info('FINISH', '-', '<collect feed>', len, mes)

  return videoIds
}

/// //////////////////////////////////////////////////////////////////////

const process = async (map, options) => {
  const seq = new ItemSequencer(map)
  seq.onSuccess = ({ key, value, response, index, length, isSkip }) => {
    const head = `[${index + 1}/${length}]`
    if (!isSkip) {
      logger.debug(head, 'GET', '-', key, response)
    } else {
      logger.debug(head, 'SKIP', '-', key)
    }
  }
  seq.onError = ({ key, value, error, index, length }) => {
    const head = `[${index + 1}/${length}]`
    logger.error(head, 'ERROR', '-', error.message)
    logger.warn('-', 'KEY:', key || 'undefined')
    logger.warn('-', 'VALUE:', JSON.stringify(value, null, 2) || 'undefined')
  }

  // 一つずつ保存する
  await seq.forEach(async ({ key, value, index, length }) => {
    const head = `[${index + 1}/${length}]`
    logger.trace(head, 'TASK', '-', 'Video ID:', key)

    const videoId = get(value, 'yt:videoid.#')

    // もし ID が取得できなかったらエラー
    throwIf(!videoId, new Error('ID not founds.'))

    // option がある場合、 exist チェック
    if (options.skipExist) {
      // DB チェック
      const len = await Video.countDocuments({ video_id: videoId })

      // もし、存在するならスキップ
      if (len) return null
    }

    return videoId
  })

  // 結果表示
  const len = seq.format('%c items.')
  const mes = seq.format('(%r%, %t/%l, skip:%s, err:%f)')
  logger.debug('PROCESS', '-', len, mes)

  return seq
}
