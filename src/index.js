import consola from 'consola'
import { google } from 'googleapis'
import database from '../models'
import updateYoutube from './task/updateYoutube'
import collectPlaylistVideos from './task/collectPlaylistVideos'

const boot = async () => {
  // ログレベルを trace に
  consola.level = 'trace'

  // DB アクティブ化
  // eslint-disable-next-line no-unused-vars
  const conn = await database()
  // await conn.connection.db.dropDatabase()

  // google 認証
  const youtube = google.youtube({
    version: 'v3',
    auth: process.env.GOOGLE_API_KEY
  })

  // なとり：'UC1519-d1jzGiL1MPTxEdtSA', 'UU1519-d1jzGiL1MPTxEdtSA
  // ちえり：'UCP9ZgeIJ3Ri9En69R0kJc9Q', 'UUP9ZgeIJ3Ri9En69R0kJc9Q
  // たね  ：'UCSNhwwbITYlFC0M0v8vgtjA', 'UUSNhwwbITYlFC0M0v8vgtjA'
  // await updateYoutube(
  //   youtube,
  //   [
  //     'UC1519-d1jzGiL1MPTxEdtSA',
  //     'UCP9ZgeIJ3Ri9En69R0kJc9Q',
  //     'UCSNhwwbITYlFC0M0v8vgtjA'
  //   ],
  //   true
  // )

  const videoIds = await collectPlaylistVideos(youtube, [
    'UUSNhwwbITYlFC0M0v8vgtjA'
  ])

  console.log(videoIds)
}

boot()
  .catch((err) => {
    consola.error(err)
  })
  .finally(() => {
    consola.info('finish!')
    process.exit(0)
  })
