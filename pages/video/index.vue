<template lang="pug">
  div
    div
      v-text-field(label='search' v-model='searchText' @change='onSearch')
    v-subheader
      | {{ totalItems | numberFormat }}件 {{ requestTime / 1000 | numberFixed(2) }}秒
    v-layout(wrap)
      template(v-for='video in videos')
        v-hover.ma-2(v-slot:default='{ hover }')
          v-card.mx-auto(:elevation="hover ? 12 : 2" max-width='400px' :href='video.url' target='_blank')
            v-img(:src='video.image' height='200px')

            v-card-title
              div {{ video.title }}

</template>

<script>
import stringFilters from '~/mixins/stringFilters'

export default {
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
