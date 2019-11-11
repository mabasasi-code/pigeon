<template lang="pug">
  v-hover(v-slot:default='{ hover }' v-resize='onResize')
    v-card.mx-auto(
      :class="{ 'fill-height': isCollapse }"
      :elevation="hover ? 12 : 2"
      :to="{ name: 'account-id', params: { id: channel.account }}"
      ref='card'
    )
      v-row(no-gutters)
          v-col(v-bind='imageCols')
            v-row.black(no-gutters :class="{ 'fill-height': !isCollapse }" align='center' justify='center')
              v-img(:src='channel.image' :aspect-ratio='imageAspectRecio' :width='imageWidth' :max-width='imageWidth')

          v-col.my-2(v-bind='contentCols')
            div
              //- v-chip.mx-2(label small v-bind='tagBindObjects(video.status)') {{ video.status | localeStatus }}
              //- v-chip.mx-2(label small v-bind='tagBindObjects(video.type)') {{ video.type | localeType }}
              
              div.ma-2.title.text--primary {{ channel.title }}
          
              v-row.mx-2.align-end(v-if='channel.stats')
                v-col.mx-1.pa-0.one-line
                  v-icon mdi-account
                  span.ml-1.body-2 {{ channel.stats.now.subscriber | formatNumber }}
                v-col.mx-1.pa-0.one-line
                  v-icon mdi-play
                  span.ml-1.body-2 {{ channel.stats.now.view | formatNumber }}
                v-col.mx-1.pa-0.one-line
                  v-icon mdi-filmstrip
                  span.ml-1.body-2 {{ channel.stats.now.video | formatNumber }}
                //- v-col.mx-1.pa-0.one-line
                //-   v-icon mdi-comment
                //-   span.ml-1.body-2 {{ channel.stats.now.comment | numberFormat }}
            
</template>

<script>
// import moment from 'moment'
import stringFilters from '~/mixins/stringFilters'

export default {
  mixins: [stringFilters],

  props: {
    channel: {
      type: Object,
      default: () => {}
    },
    breakPoint: {
      type: Number,
      default: () => 640
    },
    imageWidth: {
      type: Number,
      default: () => 320
    },
    imageAspectRecio: {
      type: Number,
      default: () => 16 / 9
    }
  },

  data() {
    return {
      width: 0
      // height: 0
    }
  },

  computed: {
    isCollapse() {
      // true で縦長表示
      return this.width < this.breakPoint
    },

    imageCols() {
      // - v-col.flex-grow-0.flex-xs-grow-1.flex-shrink-0(cols='12' sm='auto')
      if (this.isCollapse) {
        // 縦長表示
        return { cols: '12', class: ['flex-grow-1', 'flex-shrink-0'] }
      } else {
        // 横長表示
        return { cols: 'auto', class: ['flex-grow-0', 'flex-shrink-0'] }
      }
    },
    contentCols() {
      // - v-col.flex-grow-1.flex-shrink-1(cols='12' sm='1' style='max-width: 100%;')
      if (this.isCollapse) {
        // 縦長表示
        return { cols: 'auto', class: ['flex-grow-1', 'flex-shrink-1'] }
      } else {
        // 横長表示
        return {
          cols: '1',
          class: ['flex-grow-1', 'flex-shrink-1'],
          style: { 'max-width': '100%' }
        }
      }
    }
  },

  async mounted() {
    await this.onResize()
  },

  methods: {
    resetOnResize() {
      // 外部から実行する際はリセットを噛ます
      this.width = 0
      this.height = 0

      this.$nextTick(() => {
        this.onResize()
      })
    },

    onResize() {
      // 自身のサイズを指定
      const dom = this.$el
      this.width = parseInt(dom.clientWidth)
      // this.height = parseInt(dom.height)
    }
  }
}
</script>
