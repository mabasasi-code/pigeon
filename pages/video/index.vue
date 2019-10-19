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
          v-btn-toggle(v-model='listMode' color='green' mandatory)
            v-btn(small)
              v-icon(small) mdi-view-grid
            v-btn(small)
              v-icon(small) mdi-view-list

    VideoList(:videos='videos' :showGrid='listMode === 0' :imageWidth='320')

</template>

<script>
import stringFilters from '~/mixins/stringFilters'
import VideoList from '~/components/VideoList'

export default {
  components: { VideoList },

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
    // this.callResize()
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
    }
  }
}
</script>
