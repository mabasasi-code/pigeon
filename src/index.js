import consola from 'consola'
import { google } from 'googleapis'
import database from '../models'
import updateYoutube from './task/updateYoutube'

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

  await updateYoutube(
    youtube,
    ['UC1519-d1jzGiL1MPTxEdtSA', 'UCP9ZgeIJ3Ri9En69R0kJc9Q'],
    true
  )
}

boot()
  .catch((err) => {
    consola.error(err)
  })
  .finally(() => {
    consola.info('finish!')
    process.exit(0)
  })
