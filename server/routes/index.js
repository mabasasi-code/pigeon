const express = require('express')
const router = express.Router()

router.use('/youtube', require('./youtube').default)
router.use('/video', require('./video').default)

router.get('/', (req, res) => {
  res.status(200).json({ message: 'ok' })
})

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
