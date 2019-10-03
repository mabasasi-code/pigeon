const express = require('express')
const router = express.Router()

const numberLimit = require('../lib/numberLimit')

// pre processing
router.use(function(req, res, next) {
  // 初期値は新規順に10件
  // TODO: パラメタチェックしたい
  req.query.sort = req.query.sort || 'created_at'
  req.query.order = req.query.order || 'desc'
  req.query.page = req.query.page || 1
  req.query.limit = numberLimit(req.query.limit, 0, 50, 0)
  next()
})

// routing
router.use('/account', require('./account').default)
router.use('/channel', require('./channel').default)
router.use('/video', require('./video').default)

// default route
router.get('/', (req, res) => {
  res.status(200).json({ message: 'ok' })
})

// error handling
router.use((err, req, res, next) => {
  const mes = err.message
  if (mes) {
    res.status(400).send({ error: mes })
  } else {
    console.log(err) // eslint-disable-line no-console
    res.status(500).send({ error: 'Unknown Server Error.' })
  }
})

module.exports = router
