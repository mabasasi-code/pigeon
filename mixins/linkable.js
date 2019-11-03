export default {
  props: {
    to: {
      type: [String, Object],
      default: undefined
    },
    href: {
      type: [String, Object],
      default: undefined
    },
    target: {
      type: String,
      default: undefined
    }
  },

  computed: {
    hasLink() {
      return Boolean(this.to || this.href)
    }
  }
}
