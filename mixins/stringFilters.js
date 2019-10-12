export default {
  filters: {
    numberFormat(val) {
      return val.toLocaleString()
    },
    numberFixed(val, digit) {
      return val.toFixed(digit)
    }
  }
}
