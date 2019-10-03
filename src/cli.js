import consola from 'consola'
import { cac } from 'cac'
import database, { Channel } from '../models'
import throwIf from './lib/throwIf'
import api from './lib/youtubeAPI'

import updateChannel from './task/updateChannel'
import updateVideo from './task/updateVideo'
import collectPlaylistVideos from './task/collectPlaylistVideos'

// ログレベルを設定
consola.level = process.env.APP_DEBUG === true ? 'trace' : 'info'

// 簡易 wrapper
const wrap = async (callback) => {
  try {
    await callback()
    process.exit(0)
  } catch (err) {
    consola.error(err)
    process.exit(1)
  }
}

/// ////////////////////////////////////////////////////////////

const cli = cac()
cli
  .command('channel [...channel IDs]', 'Add or Update channels.')
  .option('-f, --force', 'Force Update.')
  .action(async (items, options) => {
    const doChain = options.force // 連鎖取得

    await wrap(async () => {
      await database()
      await updateChannel(api, items, { doChain })
    })
  })

cli
  .command('video [...video IDs]', 'Add or Update videos.')
  .option('-f, --force', 'Force Update.')
  .action(async (items, options) => {
    const doChain = options.force // 未実装

    await wrap(async () => {
      await database()
      await updateVideo(api, items, { doChain })
    })
  })

cli
  .command('playlist [...channel IDs]', 'Add or Update videos from playlist.')
  .option('-a, --all', 'Get all videos.')
  .option('-f, --force', 'Force Update.')
  .action(async (items, options) => {
    const getAll = options.all // 全て取得
    const doChain = options.force // 未実装

    // TODO: IDの存在可否をチェックしていません
    await wrap(async () => {
      await database()

      const q = Channel.find()
      q.in('channel_id', items)
      const channels = await q.exec()
      const pids = channels.map((e) => e.playlist).filter((e) => e)

      const vids = await collectPlaylistVideos(api, pids, { getAll })
      await updateVideo(api, vids, { doChain })
    })
  })

/// ////////////////////////////////////////////////////////////

cli
  .command('clear', '!!! Reset database. --yes option required. !!!')
  .option('-y, --yes', 'Required')
  .action(async (options) => {
    const yes = options.yes // 許可

    await wrap(async () => {
      throwIf(!yes, new Error('--yes option required.'))

      const conn = await database()
      const res = await conn.connection.db.dropDatabase()
      consola.info(res)
    })
  })

cli.help()
cli.version()

cli.parse()
