import { Router } from 'express'
import { wrap } from 'async-middleware'

import throwIf from '../lib/throwIf'
import { Channel, ChannelStat } from '../../models'

const router = Router()

router.get(
  '/',
  wrap(async (req, res) => {
    const { sort, order, page, limit, simple } = req.query // 統計系
    const text = req.query.text // 検索文字列

    // channel
    const q = Channel.find().lean()
    if (text) {
      // 文字列抽出
      q.or([{ title: { $regex: new RegExp(text, 'i') } }])
    }
    q.sort({ [sort]: order })
    const channels = await Channel.paginate(q, { page, limit })

    res.status(200).json(simple ? channels.items : channels)
  })
)

router.get(
  '/:id',
  wrap(async (req, res) => {
    const id = req.params.id // channel_id

    // channel
    const q = Channel.findOne().lean()
    q.or([{ _id: id }, { channel_id: id }])
    const channel = await q.exec()

    throwIf(!channel, new Error('Data not founds.'))

    // channel-stat (最新10件を降順に)
    const sq = ChannelStat.find().lean()
    sq.where('channel').equals(channel._id)
    sq.sort({ timestamp: -1 })
    sq.limit(10)
    const stats = await sq.exec()

    // return object
    const json = channel
    json.records = stats || []

    // records を反転させる(降順 -> 昇順)
    json.records.sort((a, b) => a.timestamp - b.timestamp)

    res.status(200).json(json)
  })
)

export default router
