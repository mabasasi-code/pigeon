import consola from 'consola'
import { get } from 'object-path'
import feedParser from 'feedparser-promised'
import throwIf from '../lib/throwIf'
import arrayToMap from '../lib/arrayToMap'

export default async (channelId, options = {}) => {
  consola.info(`[Collect feed] run '${channelId}' ...`)

  // もし idが空なら例外
  throwIf(!channelId, new Error('Parameter error of ID.'))

  // URL を叩く
  const items = await fetchFeed(channelId)

  consola.debug(`[Collect feed] Fetch ${items.length} items`)

  // マッピング
  const videoIds = items.map((e) => get(e, 'yt:videoid.#')).filter((e) => e)

  // 結果表示
  consola.info(`[Collect feed] Finish! Get ${videoIds.length} items.`)

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
