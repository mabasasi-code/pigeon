import { Router } from 'express'
import { wrap } from 'async-middleware'

import throwIf from '../lib/throwIf'
import { Video, VideoStat } from '../../models/'

const router = Router()

router.get(
  '/',
  wrap(async (req, res) => {
    const { sort, order, page, limit, simple } = req.query // 統計系
    const channel = req.query.channel // チャンネルHash xx,yy,zz
    const type = req.query.type // 種別
    const status = req.query.status // 状態
    const text = req.query.text // 検索文字列

    // video
    const q = Video.find().lean()
    if (channel) q.in('channel', channel.split(','))
    if (type) q.in('type', type.split(','))
    if (status) q.in('status', status.split(','))

    if (text) {
      q.or([{ title: { $regex: new RegExp(text, 'i') } }])
    }
    q.sort({ [sort]: order })
    const videos = await Video.paginate(q, { page, limit })

    res.status(200).json(simple ? videos.items : videos)
  })
)

router.get(
  '/:id',
  wrap(async (req, res) => {
    const id = req.params.id // video_id

    // video
    const q = Video.findOne().lean()
    q.or([{ _id: id }, { video_id: id }])
    q.populate('channel')
    const video = await q.exec()

    throwIf(!video, new Error('Data not founds.'))

    // video-stat (最新10件を降順に)
    const sq = VideoStat.find().lean()
    sq.where('video').equals(video._id)
    sq.sort({ timestamp: -1 })
    sq.limit(10)
    const stats = await sq.exec()

    // return object
    const json = video
    json.records = stats || []

    // records を反転させる(降順 -> 昇順)
    json.records.sort((a, b) => a.timestamp - b.timestamp)

    res.status(200).json(json)
  })
)

router.get(
  '/:id/record',
  wrap(async (req, res) => {
    const id = req.params.id // video_id
    const { sort, order, page, limit, simple } = req.query // 統計系

    // video-stat
    const q = VideoStat.find().lean()
    q.where('video').equals(id)
    q.sort({ [sort || 'timestamp']: order || '1' })
    const stats = await VideoStat.paginate(q, { page, limit })

    res.status(200).json(simple ? stats.items : stats)
  })
)

export default router
