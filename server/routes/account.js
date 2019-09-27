import { Router } from 'express'
import { wrap } from 'async-middleware'

import { Account } from '../../models'

const router = Router()

router.get(
  '/',
  wrap(async (req, res) => {
    // account
    const a = Account.find()
    a.populate('channels')
    a.sort({ created_at: 1 })
    a.limit(10)
    const accounts = await a.exec()

    res.status(200).json(accounts)
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
