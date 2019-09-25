import consola from 'consola'
import { get } from 'object-path'
import throwIf from '../lib/throwIf'
import YoutubePaginator from '../lib/YoutubePaginator'
import ItemSequencer from '../lib/itemSequencer'

export default async (api, channelID) => {
  consola.info(`[Collect Playlist] run '${channelID}' ...`)

  // API の処理を実装
  const paginator = new YoutubePaginator(async (next) => {
    const res = await api.playlistItems.list({
      playlistId: channelID.join(', '),
      part: 'id, snippet',
      maxResults: 10,
      pageToken: next
    })
    return res
  })

  // 連続処理
  const res = new ItemSequencer()
  do {
    // API を叩く
    const items = await paginator.exec()

    const mes2 = `res:${paginator.statusCode}, next:${paginator.hasNext()}`
    consola.debug(`[Collect Playlist] Fetch ${items.length} items (${mes2})`)

    // item が取得できなかったら終了
    throwIf(items.length === 0, new Error('Youtube Playlist fetch error.'))

    // 処理プロセス
    const seq = process(items)
    res.merge(seq)
  } while (paginator.hasNext())

  const videoIds = res.getResult()
  const mes = res.format('%r%, %t/%l, skip:%f')
  consola.info(`[Collect Playlist] FIN. Get ${videoIds.length} items (${mes})`)

  return videoIds
}

/// //////////////////////////////////////////////////////////////////////

const process = (items) => {
  const seq = new ItemSequencer(items)

  // API値の整形
  let item = null
  while ((item = seq.next())) {
    const videoId = get(item, 'snippet.resourceId.videoId')
    if (videoId) {
      seq.success(videoId)
    } else {
      seq.error()
    }
  }

  const res = seq.getResult()
  const mes = seq.format('%r%, %t/%l, skip:%f')
  consola.debug(`[Collect Playlist] Get ${res.length} items  (${mes})`)

  return seq
}
