import consola from 'consola'
import { get } from 'object-path'
import throwIf from '../lib/throwIf'
import arrayToMap from '../lib/arrayToMap'
import YoutubePaginator from '../lib/YoutubePaginator'
import ItemSequencer from '../lib/itemSequencer'

export default async (api, playlistId, options = { getAll: false }) => {
  // もし idが空なら例外
  throwIf(!playlistId, new Error('Parameter error of ID.'))

  consola.debug(`[Collect Playlist] run '${playlistId}' ...`)

  // API の処理を実装
  // TODO: とりあえず playlistID を外部から強制設定するようにした
  // playlist を配列で扱う方法があったら置き換える
  const paginator = new YoutubePaginator(
    playlistId, // 内部では使わない
    async (chunks, { next }) => {
      const res = await api.playlistItems.list({
        playlistId,
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

    // item 配列が存在しなかったらエラー、空ならスキップ
    throwIf(!Array.isArray(items), new Error('Channel Playlist fetch error.'))
    if (items.length === 0) continue

    // マッピング
    const map = arrayToMap(items, (item) => get(item, 'id'))

    // 逐次処理プロセス
    const seq = await process(map)
    res.merge(seq)
  } while (options.getAll && paginator.hasNext())

  // 結果表示
  const videoIds = res.getResult()
  const mes = res.format('%r%, %t/%l, err:%f')
  consola.debug(
    `[Collect Playlist] Finish! Get ${videoIds.length} items. (${mes}, id:'${playlistId}')`
  )

  return videoIds
}

/// //////////////////////////////////////////////////////////////////////

const process = async (map, options) => {
  const seq = new ItemSequencer(map)
  seq.onError = ({ index, key, value, error }) => {
    consola.warn({
      message: `[Collect Playlist] '${key}' - ${error.message}`,
      badge: false
    })
  }

  // API値の整形
  await seq.forEach(({ index, key, value }) => {
    const videoId = get(value, 'snippet.resourceId.videoId')
    if (videoId) {
      return videoId
    }

    throw new Error('No video ID!')
  })

  const res = seq.getResult()
  const mes = seq.format('%r%, %t/%l, err:%f')
  consola.debug(`[Collect Playlist] Get ${res.length} items. (${mes})`)

  return seq
}
