<template lang="pug">
  div
    div
      v-text-field(label='search' v-model='searchText' @change='onSearch')
    v-layout(wrap)
      template(v-for='video in videos')
        v-hover.ma-2(v-slot:default='{ hover }')
          v-card.mx-auto(:elevation="hover ? 12 : 2" max-width='400px' :href='video.url' target='_blank')
            v-img(:src='video.image' height='200px')

            v-card-title
              div {{ video.title }}
              //- span.grey--text.subtitle-1 ({{ .length }})
</template>

<script>
export default {
  data() {
    return {
      searchText: '',
      videos: []
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
      console.log('api', this.searchText)
      const { items } = await this.$axios.$get('/video', {
        params: {
          text: this.searchText,
          limit: 24,
          sort: 'start_time',
          order: 'desc'
        }
      })
      this.videos = items || []
    }
  }
}
</script>
