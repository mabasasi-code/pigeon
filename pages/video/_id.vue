<template lang="pug">
  div
    v-card
      v-list-item
        //- v-list-item-avatar(tile size='80' color='grey')
        //- v-list-item-avatar
        //-   v-img(:src='video.image' width='300' :aspect-ratio='16/9+0.001')
        div
          v-img(:src='video.image' width='300' :aspect-ratio='16/9+0.001')
        v-list-item-content
          div.overline.mb-4 OVERLINE
          v-list-item-title.headline.mb-1 {{ video.title }}
          v-list-item-subtitle Greyhound divisely hello coldly fonwderfully

    v-row
      v-col
        v-card
          v-card-text
            div info
            DetailPanel(:video='video')
      v-col
        v-card
          v-card-text
            div description
            p.text--primary.mt-2(style='white-space: pre') {{ video.text }}
      
    code {{ video }}
</template>

<script>
import DetailPanel from '~/components/video/detail-panel.vue'

export default {
  components: { DetailPanel },

  data() {
    return {
      tab: null,
      video: {}
    }
  },

  async mounted() {
    await this.getDataFromApi()
  },

  methods: {
    async getDataFromApi() {
      const id = this.$nuxt.$route.params.id // video hash

      // fetch video
      const video = await this.$axios.$get(`/video/${id}`)
      this.video = video
    }
  }
}
</script>
