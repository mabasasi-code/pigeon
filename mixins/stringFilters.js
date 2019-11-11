import moment from 'moment'
import roundTo from 'round-to'

const formatNumberDigit = function(val) {
  if (val === 0) {
    return 0
  }
  if (val) {
    return val.toLocaleString()
  }
  return '-'
}
const formatNumberFixed = function(val, digit = 0) {
  if (val) {
    return roundTo(val, digit)
  }
  return '-'
}
const formatNumber = function(val, digit = 0) {
  const fx = formatNumberFixed(val, digit)
  const dg = formatNumberDigit(fx)
  return dg
}

const formatDatetime = function(val) {
  if (val && moment(val).isValid()) {
    return moment(val).format('YYYY-MM-DD(dd) HH:mm:ss')
  }
  return '-'
}
const formatHumanize = function(val) {
  if (val && moment(val).isValid()) {
    const sec = moment(val).diff(moment(), 'seconds')
    return moment.duration(sec, 'seconds').humanize(true)
  }
}
const formatDatetimeHumanize = function(val) {
  const dt = formatDatetime(val)
  const hn = formatHumanize(val)
  return `${dt} (${hn})`
}

const formatDuration = function(val) {
  if (val && moment.duration(val).isValid()) {
    // TODO: moment duration format を使うのも検討
    // mixin で $moment が使える前提
    const mom = moment.duration(val, 'seconds')
    const hh = mom.hours()
    const mm = mom.minutes()
    const ss = mom.seconds()

    // const th = ('' + hh).padStart(2, '0')
    const tm = ('' + mm).padStart(2, '0')
    const ts = ('' + ss).padStart(2, '0')

    return hh ? `${hh}:${tm}:${ts}` : `${mm}:${ts}`
  }
  return '-'
}

const funcs = {
  formatNumberDigit,
  formatNumberFixed,
  formatNumber,
  formatDatetime,
  formatHumanize,
  formatDatetimeHumanize,
  formatDuration
}

export default {
  filters: funcs,
  methods: funcs
}
