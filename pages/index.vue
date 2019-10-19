<template lang="pug">
  div
    div.display-1 > 配信中
    v-row.fill-height(no-gutters)
      template(v-for='(video, key) in liveVideos' :keys='key')
        v-col.flex-grow-1.ma-2(cols='12')
          VideoPanel.fill-height(:video='video' :imageWidth='320')
    
    v-divider.ma-4

    div.display-1 > 予定
    v-row.fill-height(no-gutters)
      template(v-for='(video, key) in scheduleVideos' :keys='key')
        v-col.flex-grow-1.ma-2(cols='12')
          VideoPanel.fill-height(:video='video' :imageWidth='200')

</template>

<script>
import moment from 'moment'
import VideoPanel from '~/components/VideoPanel'

import stringFilters from '~/mixins/stringFilters'

export default {
  components: { VideoPanel },

  mixins: [stringFilters],

  data() {
    return {
      nowTime: {},
      liveVideos: [],
      scheduleVideos: []
    }
  },

  async mounted() {
    await this.getDataFromApi()
    this.nowTime = moment()
  },

  methods: {
    onSearch() {
      this.getDataFromApi()
    },
    async getDataFromApi() {
      const { items } = await this.$axios.$get('/video', {
        params: {
          type: 'live',
          limit: 100,
          sort: 'stats.now.current',
          order: 'desc'
        }
      })
      this.liveVideos = items || []

      const { items: items2 } = await this.$axios.$get('/video', {
        params: {
          type: 'upcoming',
          limit: 100,
          sort: 'start_time',
          order: 'asc'
        }
      })
      this.scheduleVideos = items2 || []
    }
  }
}
</script>
