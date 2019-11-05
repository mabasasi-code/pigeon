<template lang="pug">
  v-hover(v-slot:default='{ hover }' v-resize='onResize')
    v-card.mx-auto(
      :class="{ 'fill-height': isCollapse }"
      :elevation='hasLink && hover ? 12 : 2'
      :to='to'
      :href='href'
      :target='target'
      v-resize='onResize'
      ref='card'
    )
      v-row(no-gutters)
        v-col(v-bind='imageCols')
          v-hover(v-slot:default='{ hover: inHover }')
            v-row.black(no-gutters :class="{ 'fill-height': !isCollapse }" align='center' justify='center')
              v-card(
                @click.stop.self
                :elevation='inHover ? 12 : 0'
                :href='video.url'
                target='_blank'
                tile
              )
                v-img(:src='video.image' :aspect-ratio='imageAspectRecio' :width='imageWidth' :max-width='imageWidth')

        v-col.ma-2(v-bind='contentCols')
          v-row(no-gutters)
            v-col.mb-2(cols=12)
              v-chip.mr-3(label small v-bind='tagBindObjects(video.status)') {{ video.status | localeStatus }}
              v-chip.mr-3(label small v-bind='tagBindObjects(video.type)') {{ video.type | localeType }}

            v-col(cols=12).title.text--primary {{ video.title }}

            v-col(cols=12)
              Media(:image='channel.image' :text='channel.title'
                :to="{ name: 'account-id', params: { id: channel.account }}")

            v-col(cols=12 v-if='video.stats')
              v-row(no-gutters)
                //- second がない場合は start と現在時刻を対比させる
                v-col.mx-1.pa-0.one-line
                  v-icon mdi-movie
                  span.ml-1.body-2(v-if='video.second')  {{ video.second | durationFormat }}
                  span.ml-1.body-2(v-else)  {{ video.start_time | timeToNow }}

                v-col.mx-1.pa-0.one-line
                  v-icon mdi-play
                  span.ml-1.body-2 {{ video.stats.now.view | numberFormat }}
                v-col.mx-1.pa-0.one-line
                  v-icon mdi-account-group
                  span.ml-1.body-2 {{ video.stats.now.current | numberFormat }}
            //- v-col
            //-   v-icon mdi-thumb-up
            //-   span {{ video.stats.now.like | numberFormat }}
            //- v-col
            //-   v-icon mdi-thumb-down
            //-   span {{ video.stats.now.bad | numberFormat }}
            //- v-col
            //-   v-icon mdi-star
            //-   span {{ video.stats.now.fav | numberFormat }}
            //- v-col
            //-   v-icon mdi-message-reply
            //-   span {{ video.stats.now.comment | numberFormat }}

</template>

<script>
import moment from 'moment'
import linkable from '~/mixins/linkable'
import stringFilters from '~/mixins/stringFilters'

import Media from '~/components/parts/Media'

export default {
  components: {
    Media
  },

  filters: {
    localeStatus(val) {
      switch (val) {
        case 'public':
          return '公開'
        case 'unlisted':
          return '限定公開'
        case 'delete':
          return '非公開'
        default:
          return val
      }
    },
    localeType(val) {
      switch (val) {
        case 'upcoming':
          return '予定'
        case 'live':
          return '配信中'
        case 'archive':
          return 'アーカイブ'
        case 'video':
          return '動画'
      }
    },

    timeToNow(val) {
      return moment(val).fromNow()
    }
  },

  mixins: [linkable, stringFilters],

  props: {
    video: {
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
    channel() {
      return this.video.channel || {}
    },

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
    tagBindObjects(val) {
      switch (val) {
        case 'public':
          return { color: 'blue', textColor: 'white' }
        case 'unlisted':
          return { color: 'red', textColor: 'white' }
        case 'delete':
          return { color: 'black', textColor: 'white' }

        case 'upcoming':
          return { color: 'orange', textColor: 'white' }
        case 'live':
          return { color: 'red', textColor: 'white' }
        case 'archive':
          return { color: 'green', textColor: 'white' }
        case 'video':
          return { color: 'indigo', textColor: 'white' }
      }
    },

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
