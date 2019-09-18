import consola from 'consola'
import { google } from 'googleapis'

const boot = async () => {
  // google 認証
  const youtube = await google.youtube({
    version: 'v3',
    auth: process.env.GOOGLE_API_KEY
  })

  // 試しのAPI叩き
  const res = await youtube.channels.list({
    id: 'UC1519-d1jzGiL1MPTxEdtSA',
    part: 'id, snippet, contentDetails, statistics',
    maxResults: 50
  })

  console.dir(res.data.items[0])
}

boot()
  .catch((err) => {
    consola.error(err)
  })
  .finally(() => {
    consola.info('finish!')
    process.exit(0)
  })
