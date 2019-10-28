import { get } from 'object-path'

import { batch as logger } from '../../logger'
import throwIf from '../lib/throwIf'
import arrayToMap from '../lib/arrayToMap'
import YoutubePaginator from '../lib/YoutubePaginator'
import ItemSequencer from '../lib/itemSequencer'

export default async (api, playlistId, options = { getAll: false }) => {
  // もし idが空なら例外
  throwIf(!playlistId, new Error('Parameter error of ID.'))

  logger.info('START', '-', '<collect playlist>', `(playlistID: ${playlistId})`)

  // API の処理を実装
  // MEMO: とりあえず playlistID を外部から強制設定するようにした
  // playlist を配列で扱う方法があったら置き換える
  // ただ cron 処理で使う task でもないので、このままでもよさそう
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
  const seq = new ItemSequencer()
  do {
    // API を叩く
    const items = await paginator.exec()

    const cnt = `${paginator.getCursor()}/${paginator.getLength()}`
    const code = paginator.statusCode
    const next = paginator.hasNext()
    const mes2 = `(${cnt}, res:${code}, next:${next})`
    logger.debug('FETCH', '-', `${items.length} items.`, mes2)

    // item 配列が存在しなかったらエラー、空ならスキップ
    throwIf(!Array.isArray(items), new Error('Channel Playlist fetch error.'))
    if (items.length === 0) continue

    // マッピング
    const map = arrayToMap(items, (item) => get(item, 'id'))

    // 逐次処理プロセス
    const res = await process(map)
    seq.merge(res)
  } while (options.getAll && paginator.hasNext())

  // 結果表示
  const videoIds = seq.getResult()
  const mes = seq.format('%r%, %t/%l, skip:%s, err:%f')
  logger.info('FINISH', '-', '<collect playlist>', `(${mes})`)

  return videoIds
}

/// //////////////////////////////////////////////////////////////////////

const process = async (map, options) => {
  const seq = new ItemSequencer(map)
  seq.onError = ({ key, value, error, index, length }) => {
    const head = `[${index + 1}/${length}]`
    logger.error(head, 'ERROR', '-', error.message)
    logger.warn('-', 'KEY:', key || 'undefined')
    logger.warn('-', 'VALUE:', JSON.stringify(value, null, 2) || 'undefined')
  }

  // API値の整形
  await seq.forEach(({ index, key, value }) => {
    const videoId = get(value, 'snippet.resourceId.videoId')
    if (videoId) {
      return videoId
    }

    throw new Error('No video ID!')
  })

  // 結果表示
  const mes = seq.format('%r%, %t/%l, skip:%s, err:%f')
  logger.debug('PROCESS', '-', `(${mes})`)

  return seq
}
