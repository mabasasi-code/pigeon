<template lang="pug">
  v-row(no-gutters)
    template(v-for='(channel, key) in channels' :keys='key')
      v-col.ma-2(:cols='showGrid ? 0 : 12')
        ChannelPanel(ref='card' :channel='channel' :imageWidth='imageWidth')

</template>

<script>
import ChannelPanel from '~/components/ChannelPanel'

export default {
  components: { ChannelPanel },

  props: {
    channels: {
      type: Array,
      default: () => []
    },
    showGrid: {
      type: Boolean,
      default: () => false
    },
    imageWidth: {
      type: Number,
      default: () => 320
    }
  },

  watch: {
    showGrid() {
      this.callResize()
    }
  },

  methods: {
    callResize() {
      // TODO: できれば component 内部で resize 検知をしたい
      const cards = this.$refs.card
      if (Array.isArray(cards)) {
        for (const card of cards) {
          card.resetOnResize()
        }
      }
    }
  }
}
</script>
