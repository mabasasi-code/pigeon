import { cac } from 'cac'
import { forEachSeries } from 'p-iteration'

import { cli as logger } from '../logger'
import database, { Channel } from '../models'
import throwIf from './lib/throwIf'
import api from './lib/youtubeAPI'

import updateVideo from './task/updateVideo'
import collectPlaylistVideos from './task/collectPlaylistVideos'
import cron from './cron'

import {
  channelUpdate,
  videoUpdate,
  upcomingVideoUpdate,
  liveVideoUpdate,
  feedVideoUpdate
} from './job'

// 簡易 wrapper
const wrap = async (callback) => {
  try {
    const conn = await database()
    await callback(conn)
    process.exit(0)
  } catch (err) {
    logger.error(err)
    process.exit(1)
  }
}

/// ////////////////////////////////////////////////////////////

const cli = cac()
cli
  .command('channel [...channel IDs]', 'Add or Update channels.')
  .option('-s, --skip', 'Skip when exist.')
  .option('-f, --force', 'Force Update.')
  .action(async (items, options) => {
    const skipExist = options.skip // 存在する時スキップする
    const doChain = options.force // 連鎖取得

    await wrap(async () => {
      // Job に転送
      await channelUpdate(api, items, { doChain, skipExist })
    })
  })

cli
  .command('video [...video IDs]', 'Add or Update videos.')
  .option('-s, --skip', 'Skip when exist.')
  .option('-a, --all', 'All video update.')
  // .option('-f, --force', 'Force Update.')
  .action(async (items, options) => {
    const skipExist = options.skip // 存在する時スキップする
    const all = options.all // 全ての video を対象とする
    // const doChain = options.force // 未実装

    await wrap(async () => {
      // Job に転送
      await videoUpdate(api, items, { skipExist, all })
    })
  })

cli
  .command('playlist [...channel IDs]', 'Add or Update videos from playlist.')
  .option('-a, --all', 'Get all videos.')
  .option('-s, --skip', 'Skip when exist.')
  .option('-f, --force', 'Force Update.')
  .action(async (items, options) => {
    // TODO: log 未最適化

    const getAll = options.all // 全て取得
    const skipExist = options.skip // 存在する時スキップする
    const doChain = options.force // 未実装

    // TODO: IDの存在可否をチェックしていません
    await wrap(async () => {
      const q = Channel.find()
      q.in('channel_id', items)
      const channels = await q.exec()
      const pids = channels.map((e) => e.playlist).filter((e) => e)

      await forEachSeries(pids, async (pid) => {
        const vids = await collectPlaylistVideos(api, pid, { getAll })
        await updateVideo(api, vids, { doChain, skipExist })
      })
    })
  })

cli
  .command('feed [...channel IDs]', 'Add or Update videos from feed.')
  .option('-s, --skip', 'Skip when exist.')
  .option('-d [time], --delay [time]', 'Delay milliseconds.')
  // .option('-f, --force', 'Force Update.')
  .action(async (items, options) => {
    const skipExist = options.skip // 存在する時スキップする (前処理)
    // const doChain = options.force // 未実装
    const delayTime = options.time

    await wrap(async () => {
      // Job に転送
      await feedVideoUpdate(api, items, { skipExist, delayTime })
    })
  })

/// ////////////////////////////////////////////////////////////

cli
  .command('upcoming', 'Update upcoming videos.')
  .option('-s, --skip', 'Skip when exist.')
  .option('-k, --keep', 'Skip when no change in type.')
  .action(async (options) => {
    const skipExist = options.skip // 存在する時スキップする
    const skipUpcoming = options.keep // 種別が変わらない時、スキップする

    await wrap(async () => {
      // Job に転送
      await upcomingVideoUpdate(api, { skipExist, skipUpcoming })
    })
  })

cli
  .command('live', 'Update live videos.')
  .option('-s, --skip', 'Skip when exist.')
  // .option('-k, --keep', 'Skip when no change in type.')
  .action(async (options) => {
    const skipExist = options.skip // 存在する時スキップする
    // const skipUpcoming = options.keep // 種別が変わらない時、スキップする

    await wrap(async () => {
      // Job に転送
      await liveVideoUpdate(api, { skipExist })
    })
  })

/// ////////////////////////////////////////////////////////////

cli
  .command('clear', '!!! Reset database. --yes option required. !!!')
  .option('-y, --yes', 'Required')
  .action(async (options) => {
    const yes = options.yes // 許可

    await wrap(async (conn) => {
      throwIf(!yes, new Error('--yes option required.'))

      logger.info('RUN', '-', 'Reset all data.')
      const res = await conn.connection.db.dropDatabase()
      logger.info(res)
    })
  })

/// ////////////////////////////////////////////////////////////

cli
  .command('cron', 'Run cron. --yes option required.')
  .option('-y, --yes', 'Required')
  .action(async (options) => {
    const yes = options.yes // 許可

    await wrap(async () => {
      throwIf(!yes, new Error('--yes option required.'))

      // cron を実行
      logger.info('RUN', '-', 'Crom mode.')
      logger.info('> Recommended to use with "RUN_BATCH=true" setting of .env')
      logger.info('> Press Ctrl+C to exit.')
      await cron()
    })
  })

// cli.command('[...args]', 'Run cron.').action(async (args, options) => {
//   // cron を実行
//   logger.info('RUN', '-', 'Crom mode.')
//   logger.info('> Press Ctrl+C to exit.')
//   await cron()
// })

cli.help()
cli.version()

cli.parse()
