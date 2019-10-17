import moment from 'moment'

export default {
  filters: {
    numberFormat(val) {
      if (val) {
        return val.toLocaleString()
      }
      return '-'
    },
    numberFixed(val, digit) {
      if (val) {
        return val.toFixed(digit)
      }
      return '-'
    },

    datetimeFormat(val) {
      if (val && moment(val).isValid()) {
        return moment(val).format('YYYY-MM-DD(dd) HH:mm:ss')
      }
      return '-'
    },
    datetimeHumanize(val) {
      if (val && moment(val).isValid()) {
        const sec = moment(val).diff(moment(), 'seconds')
        return moment.duration(sec, 'seconds').humanize(true)
      }
    },
    durationFormat(val) {
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
  }
}
