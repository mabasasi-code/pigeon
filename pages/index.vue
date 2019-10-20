<template lang="pug">
  div
    v-subheader
      v-row(no-gutters)
        v-col(cols='auto')
          span {{ timestamp | datetimeFormat }} 

        v-spacer
        v-col(cols='auto')
          v-btn-toggle(v-model='listMode' mandatory color='primary')
            v-btn(small)
              v-icon(small) mdi-view-grid
            v-btn(small)
              v-icon(small) mdi-view-list

    div
      span.display-1 > 配信中
      span (5 分おきに更新)
    VideoList(:videos='liveVideos' :showGrid='listMode === 0' :imageWidth='200')
    
    v-divider.ma-4

    div
      span.display-1 > 配信予定
      span (5,20,35,50 分に更新)
    VideoList(:videos='scheduleVideos' :showGrid='listMode === 0' :imageWidth='200')

</template>

<script>
import stringFilters from '~/mixins/stringFilters'
import VideoList from '~/components/VideoList'

export default {
  components: { VideoList },

  mixins: [stringFilters],

  data() {
    return {
      listMode: 0, // 0: grid, 1:list
      liveVideos: [],
      scheduleVideos: [],
      timestamp: null, // 処理日時
      requestTime: 0 // 実処理時間
    }
  },

  async mounted() {
    await this.getDataFromApi()
  },

  methods: {
    onSearch() {
      this.getDataFromApi()
    },
    async getDataFromApi() {
      // 取得時刻を格納
      const ts = new Date()

      // 配信中のものを同接順で
      const { items: lives } = await this.$axios.$get('/video', {
        params: {
          type: 'live',
          status: 'public,unlisted',
          sort: 'stats.now.current',
          order: 'desc',
          limit: 100
        }
      })
      this.liveVideos = lives || []

      // 配信予定のものを直近のもの順で
      const { items: schedules } = await this.$axios.$get('/video', {
        params: {
          type: 'upcoming',
          status: 'public,unlisted',
          sort: 'start_time',
          order: 'asc',
          limit: 100
        }
      })
      this.scheduleVideos = schedules || []

      // 統計保存
      this.timestamp = ts
      this.requestTime = new Date() - ts
    }
  }
}
</script>
