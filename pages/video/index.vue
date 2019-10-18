<template lang="pug">
  div
    div
      v-text-field(label='search' v-model='searchText' @change='onSearch')

    v-subheader
      v-row(no-gutters)
        v-col(cols='auto')
          span {{ totalItems | numberFormat }}件 {{ requestTime / 1000 | numberFixed(2) }}秒
        v-spacer
        v-col(cols='auto')
          v-btn-toggle(v-model='listMode' color='green' mandatory @change='callResize')
            v-btn(small)
              v-icon(small) mdi-view-grid
            v-btn(small)
              v-icon(small) mdi-view-list

    v-row.fill-height(no-gutters)
      template(v-for='(video, key) in videos' :keys='key')
        v-col.flex-grow-1.ma-2(:cols='listMode === 1 ? 12 : 0')
          VideoPanel.fill-height(ref='videoPanel' :video='video')

</template>

<script>
import VideoPanel from '~/components/VideoPanel'

import stringFilters from '~/mixins/stringFilters'

export default {
  components: { VideoPanel },

  mixins: [stringFilters],

  data() {
    return {
      searchText: '',
      listMode: 0, // 0: grid, 1:list
      videos: [],
      requestTime: 0,
      totalItems: 0
    }
  },

  async mounted() {
    await this.getDataFromApi()
    this.callResize()
  },

  methods: {
    onSearch() {
      this.getDataFromApi()
    },
    async getDataFromApi() {
      const ts = new Date()
      const { items, paginator } = await this.$axios.$get('/video', {
        params: {
          text: this.searchText,
          limit: 24,
          sort: 'start_time',
          order: 'desc'
        }
      })
      this.requestTime = new Date() - ts
      this.totalItems = paginator.totalItems

      this.videos = items || []
    },

    callResize() {
      // TODO: できれば component 内部で resize 検知をしたい
      const panels = this.$refs.videoPanel
      for (const panel of panels) {
        panel.resetOnResize()
      }
    }
  }
}
</script>
