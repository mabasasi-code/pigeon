import { Router } from 'express'
import { wrap } from 'async-middleware'

import { Account } from '../../models'

const router = Router()

router.get(
  '/',
  wrap(async (req, res) => {
    const { sort, order, page, limit, simple } = req.query // ???

    // account
    const q = Account.find().lean()
    q.populate('channels')
    q.sort({ [sort]: order })
    const accounts = await Account.paginate(q, { page, limit })

    res.status(200).json(simple ? accounts.items : accounts)
  })
)

router.get(
  '/:id',
  wrap(async (req, res) => {
    const id = req.params.id // account_id

    // account
    const q = Account.findOne().lean()
    q.populate('channels')
    q.where('_id').equals(id)
    const account = await q.exec()

    res.status(200).json(account)
  })
)

export default router
