<template lang="pug">
  div
    div.display-1 > 配信中
    VideoList(:videos='liveVideos' :imageWidth='200')
    
    v-divider.ma-4

    div.display-1 > 予定
    VideoList(:videos='scheduleVideos' :imageWidth='200')

</template>

<script>
import moment from 'moment'
import stringFilters from '~/mixins/stringFilters'
import VideoList from '~/components/VideoList'

export default {
  components: { VideoList },

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
