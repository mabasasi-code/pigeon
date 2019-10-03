import { Router } from 'express'
import { wrap } from 'async-middleware'

import { Account } from '../../models'

const router = Router()

router.get(
  '/',
  wrap(async (req, res) => {
    const { sort, order, page, limit, simple } = req.query // 統計系

    // account
    const a = Account.find()
    a.populate('channels')
    a.sort({ [sort]: order })
    const accounts = await Account.paginate(a, { page, limit })

    res.status(200).json(simple ? simple.items : accounts)
  })
)

router.get(
  '/:id',
  wrap(async (req, res) => {
    const id = req.params.id // account_id

    // account
    const a = Account.findOne()
    a.populate('channels')
    a.where('_id').equals(id)
    const account = await a.exec()

    res.status(200).json(account)
  })
)

export default router
