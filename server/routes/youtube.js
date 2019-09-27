import { Router } from 'express'
import { wrap } from 'async-middleware'

import throwIf from '../lib/throwIf'
import { Youtube, YoutubeStat } from '../../models/'

const router = Router()

router.get(
  '/',
  wrap(async (req, res) => {
    // youtube
    const y = Youtube.find()
    y.sort({ created_at: 1 })
    y.limit(10)
    const youtubes = await y.exec()

    res.status(200).json(youtubes)
  })
)

router.get(
  '/:id',
  wrap(async (req, res) => {
    const id = req.params.id // YoutubeID

    // youtube
    const y = Youtube.findOne()
    y.where('channel_id').equals(id)
    y.populate('account')
    const youtube = await y.exec()

    throwIf(!youtube, new Error('Data not founds.'))

    // youtube statistics (最新10件を降順に)
    const s = YoutubeStat.find()
    s.where('youtube').equals(youtube._id)
    s.sort({ timestamp: -1 })
    s.limit(10)
    const stats = await s.exec()

    // return object
    const json = youtube.toObject()
    json.records = stats || []

    // records を反転させる(降順 -> 昇順)
    json.records.sort((a, b) => a.timestamp - b.timestamp)

    res.status(200).json(json)
  })
)

export default router
