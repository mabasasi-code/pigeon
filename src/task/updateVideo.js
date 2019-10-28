import { get } from 'object-path'

import { batch as logger } from '../../logger'
import throwIf from '../lib/throwIf'
import arrayToMap from '../lib/arrayToMap'
import YoutubePaginator from '../lib/YoutubePaginator'
import ItemSequencer from '../lib/itemSequencer'

import insertVideo from '../inserter/insertVideo'

export default async (
  api,
  videoIDs = [],
  options = { doChain: false, skipExist: false, skipUpcoming: false }
) => {
  // もし id配列が空なら例外
  throwIf(!Array.isArray(videoIDs), new Error('Parameter error of IDs.'))

  // もし id配列の長さが0なら終了
  if (videoIDs.length === 0) {
    logger.info(`Nothing to process.`)
    return
  }

  logger.info('START', '-', '<update video>', `(len: ${videoIDs.length})`)

  // API の処理を実装
  const paginator = new YoutubePaginator(
    videoIDs,
    async (chunk, { next, maxChunkSize }) => {
      const res = await api.videos.list({
        id: chunk.join(', '),
        part:
          'id, snippet, contentDetails, liveStreamingDetails, status, statistics',
        maxResults: maxChunkSize,
        pageToken: next
      })
      return res
    }
  )

  // 連続処理
  const seq = new ItemSequencer()
  do {
    // API を叩く
    const items = await paginator.exec()

    const cnt = `${paginator.getCursor()}/${paginator.getLength()}`
    const code = paginator.statusCode
    const next = paginator.hasNext()
    const mes2 = `(${cnt}, res:${code}, next:${next})`
    logger.debug('FETCH', '-', `${items.length} items.`, mes2)

    // item 配列が存在しなかったらエラー
    throwIf(!Array.isArray(items), new Error('Video data fetch error.'))
    // item 配列が空ならエラー => 削除されていて空の可能性もある
    // if (items.length === 0) continue

    // マッピング
    const map = arrayToMap(items, (item) => get(item, 'id'), paginator.useChunk)

    // 逐次処理プロセス
    const res = await process(map, options)
    seq.merge(res)
  } while (paginator.hasNext())

  // 結果表示
  const mes = seq.format('%r%, %t/%l, skip:%s, err:%f')
  logger.info('PROCESS', '-', '<update video>', `(${mes})`)
}

/// ////////////////////////////////////////////////////////////

const process = async (map, options) => {
  const seq = new ItemSequencer(map)
  seq.onSuccess = ({ key, value, response, index, length, isSkip }) => {
    const head = `[${index + 1}/${length}]`
    if (!isSkip) {
      logger.debug(head, 'UPDATE', '-', key, response.title)
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

    const res = await insertVideo(key, value, options)
    return res
  })

  // 結果表示
  const mes = seq.format('%r%, %t/%l, skip:%s, err:%f')
  logger.debug('SUCCESS', '-', `(${mes})`)

  return seq
}
