import consola from 'consola'
import { get } from 'object-path'
import throwIf from '../lib/throwIf'
import arrayToMap from '../lib/arrayToMap'
import YoutubePaginator from '../lib/YoutubePaginator'
import ItemSequencer from '../lib/itemSequencer'

import insertVideo from '../inserter/insertVideo'

export default async (
  api,
  videoIDs = [],
  options = { doChain: false, skipExist: false }
) => {
  const len = videoIDs.length
  consola.debug(`[Update Video] run ${len} items ...`)

  // もし id配列が空なら例外
  throwIf(!Array.isArray(videoIDs), new Error('Parameter error of IDs.'))

  // もし id配列の長さが0なら終了
  if (videoIDs.length === 0) {
    consola.info(`[Update Video] There is no data to process.`)
    return
  }

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
  const res = new ItemSequencer()
  do {
    // API を叩く
    const items = await paginator.exec()

    const mes2 = `res:${paginator.statusCode}, next:${paginator.hasNext()}`
    consola.debug(`[Update Video] Fetch ${items.length} items (${mes2})`)

    // item 配列が存在しなかったらエラー
    throwIf(!Array.isArray(items), new Error('Video data fetch error.'))
    // item 配列が空ならエラー => 削除されていて空の可能性もある
    // if (items.length === 0) continue

    // マッピング
    const map = arrayToMap(items, (item) => get(item, 'id'), paginator.useChunk)

    // 逐次処理プロセス
    const seq = await process(map, options)
    res.merge(seq)
  } while (paginator.hasNext())

  // 結果表示
  const results = res.getResult()
  const mes = res.format('%r%, %t/%l, skip:%f')
  consola.info(
    `[Update Video] Finish! Update ${results.length} items. (${mes})`
  )
}

/// ////////////////////////////////////////////////////////////

const process = async (map, options) => {
  const seq = new ItemSequencer(map)
  seq.onSuccess = (value, key, res) => {
    consola.debug(`[Update Video] Updated. '${key}' ${res.title}`)
  }
  seq.onError = (value, key, error) => {
    consola.warn({
      message: `[Update Video] '${key}' - ${error.message}`,
      badge: false
    })
  }

  // 一つずつ保存する
  await seq.forEach(async (value, key, iseq) => {
    const res = await insertVideo(value, key, options)
    return res
  })

  // 結果表示
  const res = seq.getResult()
  const mes = seq.format('%r%, %t/%l, skip:%f')
  consola.debug(`[Update Video] Update ${res.length} items. (${mes})`)

  return seq
}
