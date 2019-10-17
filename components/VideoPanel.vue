<template lang="pug">
  v-hover.ma-2(v-slot:default='{ hover }')
    v-card.mx-auto(
      :elevation="hover ? 12 : 2"
      :to="{ name: 'video-id', params: { id: video._id }}"
    )
      v-row(no-gutters)
        v-col.flex-grow-0.flex-xs-grow-1.flex-shrink-0(cols='12' sm='auto')
          v-row.fill-height.black(no-gutters align='center' justify='center')
            v-img(:src='video.image' :aspect-ratio='16/9+0.004' width='300' max-width='300')

        v-col.flex-grow-1.flex-shrink-1(cols='12' sm='1' style='max-width: 100%;')
          div.my-2
            v-chip.mx-2(label small v-bind='tagBindObjects(video.status)') {{ video.status | localeStatus }}
            v-chip.mx-2(label small v-bind='tagBindObjects(video.type)') {{ video.type | localeType }}
          
            div.ma-2.title.text--primary {{ video.title }}

            v-row.mx-2(v-if='video.stats')
              //- second がない場合は start と現在時刻を対比させる
              v-col.mx-1.pa-0
                v-icon mdi-movie
                span.ml-1(v-if='video.second')  {{ video.second | durationFormat }}
                span.ml-1(v-else)  {{ video.start_time | timeToNow }}

              v-col.mx-1.pa-0
                v-icon mdi-play
                span.ml-1 {{ video.stats.now.view | numberFormat }}
              v-col.mx-1.pa-0
                v-icon mdi-account-group
                span.ml-1 {{ video.stats.now.current | numberFormat }}
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
import stringFilters from '~/mixins/stringFilters'

export default {
  filters: {
    localeStatus(val) {
      switch (val) {
        case 'public':
          return '公開'
        case 'unlisted':
          return '限定公開'
        case 'private':
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

  mixins: [stringFilters],

  props: {
    video: {
      type: Object,
      default: () => {}
    }
  },

  methods: {
    tagBindObjects(val) {
      switch (val) {
        case 'public':
          return { color: 'blue', textColor: 'white' }
        case 'unlisted':
          return { color: 'red', textColor: 'white' }
        case 'private':
          return { color: 'black', textColor: 'white' }

        case 'upcoming':
          return { color: 'orange', textColor: 'white' }
        case 'live':
          return { color: 'red', textColor: 'white' }
        case 'archive':
          return { color: 'green', textColor: 'white' }
        case 'video':
          return { color: 'blue', textColor: 'white' }
      }
    }
  }
}
</script>
