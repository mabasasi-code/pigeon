import { get } from 'object-path'
import feedParser from 'feedparser-promised'

import { batch as logger } from '../../logger'
import throwIf from '../lib/throwIf'

export default async (channelId, options = {}) => {
  // もし idが空なら例外
  throwIf(!channelId, new Error('Parameter error of ID.'))

  logger.info('START', '-', '<collect feed>', `(channelID: ${channelId})`)

  // URL を叩く
  const items = await fetchFeed(channelId)

  // ★ response code は 200 固定 (取得方法が分からないため)
  const mes2 = `(res:200, next:false)`
  logger.debug('FETCH', '-', `${items.length} items.`, mes2)

  // マッピング
  const videoIds = items.map((e) => get(e, 'yt:videoid.#')).filter((e) => e)

  // 結果表示
  const mes = `(len: ${videoIds.length}, id:'${channelId}')`
  logger.info('FINISH', '-', '<collect feed>', mes)

  return videoIds
}

/// //////////////////////////////////////////////////////////////////////

const fetchFeed = async (channelId) => {
  const parse = await feedParser
    .parse(
      {
        url: `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`
      },
      {
        normalize: true,
        addmeta: false
      }
    )
    .then((result) => result)

  return parse || []
}
