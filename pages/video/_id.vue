<template lang="pug">
  div
    VideoPanel(:video='video')

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
import VideoPanel from '~/components/VideoPanel.vue'
import DetailPanel from '~/components/video/detail-panel.vue'

export default {
  components: { VideoPanel, DetailPanel },

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
