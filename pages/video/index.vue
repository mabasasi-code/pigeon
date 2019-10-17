<template lang="pug">
  div
    div
      v-text-field(label='search' v-model='searchText' @change='onSearch')

    v-subheader
      | {{ totalItems | numberFormat }}件 {{ requestTime / 1000 | numberFixed(2) }}秒

    v-row.fill-height(no-gutters)
      template(v-for='(video, key) in videos' :keys='key')
        v-col.flex-grow-1.ma-2
          VideoPanel.fill-height(:video='video', :breakPoint='674')

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
      videos: [],
      requestTime: 0,
      totalItems: 0
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
