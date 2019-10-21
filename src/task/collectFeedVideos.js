import consola from 'consola'
import { get } from 'object-path'
import feedParser from 'feedparser-promised'
import throwIf from '../lib/throwIf'

export default async (channelId, options = {}) => {
  // もし idが空なら例外
  throwIf(!channelId, new Error('Parameter error of ID.'))

  consola.debug(`[Collect feed] run '${channelId}'.`)

  // URL を叩く
  const items = await fetchFeed(channelId)

  consola.debug(`[Collect feed] Fetch ${items.length} items`)

  // マッピング
  const videoIds = items.map((e) => get(e, 'yt:videoid.#')).filter((e) => e)

  // 結果表示
  // TODO: response code は 200 固定 (取得方法が分からないため)
  consola.info(
    `[Collect feed] Finish! Get ${videoIds.length} items. (res: 200, id:'${channelId}')`
  )

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
