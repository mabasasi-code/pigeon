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
    const c = Channel.find()
    if (text) {
      // 文字列抽出
      c.or([{ title: { $regex: new RegExp(text, 'i') } }])
    }
    c.sort({ [sort]: order })
    const channels = await Channel.paginate(c, { page, limit })

    res.status(200).json(simple ? channels.items : channels)
  })
)

router.get(
  '/:id',
  wrap(async (req, res) => {
    const id = req.params.id // channel_id

    // channel
    const c = Channel.findOne()
    c.or([{ _id: id }, { channel_id: id }])
    const channel = await c.exec()

    throwIf(!channel, new Error('Data not founds.'))

    // channel-stat (最新10件を降順に)
    const s = ChannelStat.find()
    s.where('channel').equals(channel._id)
    s.sort({ timestamp: -1 })
    s.limit(10)
    const stats = await s.exec()

    // return object
    const json = channel.toObject()
    json.records = stats || []

    // records を反転させる(降順 -> 昇順)
    json.records.sort((a, b) => a.timestamp - b.timestamp)

    res.status(200).json(json)
  })
)

export default router
