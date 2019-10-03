import consola from 'consola'
import { get } from 'object-path'
import throwIf from '../lib/throwIf'
import arrayToMap from '../lib/arrayToMap'
import YoutubePaginator from '../lib/YoutubePaginator'
import ItemSequencer from '../lib/itemSequencer'

export default async (api, playlistId, options = { getAll: false }) => {
  consola.info(`[Collect Playlist] run '${playlistId}' ...`)

  // もし idが空なら例外
  throwIf(!playlistId, new Error('Parameter error of ID.'))

  // API の処理を実装
  const paginator = new YoutubePaginator(
    playlistId,
    async (chunk, { next }) => {
      const res = await api.playlistItems.list({
        playlistId: chunk,
        part: 'id, snippet',
        maxResults: 50,
        pageToken: next
      })
      return res
    },
    1
  )

  // 連続処理
  const res = new ItemSequencer()
  do {
    // API を叩く
    const items = await paginator.exec()

    const mes2 = `res:${paginator.statusCode}, next:${paginator.hasNext()}`
    consola.debug(`[Collect Playlist] Fetch ${items.length} items. (${mes2})`)

    // item が一つも取得できなかったらエラー
    throwIf(items.length === 0, new Error('Channel Playlist fetch error.'))

    // マッピング
    const map = arrayToMap(items, (item) => get(item, 'id'))

    // 逐次処理プロセス
    const seq = await process(map)
    res.merge(seq)
  } while (options.getAll && paginator.hasNext())

  // 結果表示
  const videoIds = res.getResult()
  const mes = res.format('%r%, %t/%l, skip:%f')
  consola.info(
    `[Collect Playlist] Finish! Get ${videoIds.length} items. (${mes})`
  )

  return videoIds
}

/// //////////////////////////////////////////////////////////////////////

const process = async (map, options) => {
  const seq = new ItemSequencer(map)
  seq.onError = (value, key, error) => {
    consola.warn({
      message: `[Collect Playlist] '${key}' - ${error.message}`,
      badge: false
    })
  }

  // API値の整形
  await seq.forEach((value, key, iseq) => {
    const videoId = get(value, 'snippet.resourceId.videoId')
    if (videoId) {
      return videoId
    }

    throw new Error('No video ID!')
  })

  const res = seq.getResult()
  const mes = seq.format('%r%, %t/%l, skip:%f')
  consola.debug(`[Collect Playlist] Get ${res.length} items. (${mes})`)

  return seq
}
