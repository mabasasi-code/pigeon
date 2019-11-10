<template lang="pug">
  div
    VideoPanel(:video='video' imageWidth='285')

    v-row
      v-col
        TextPanel(:video='video')

      v-col
        v-row.flex-column(no-gutters)
          v-col.mb-4
            DetailPanel(:video='video')

          v-col
            RecordPanel(:video='video')

    //- code {{ video }}
</template>

<script>
import stringFilters from '~/mixins/stringFilters'

import VideoPanel from '~/components/VideoPanel'
import DetailPanel from '~/components/video/DetailPanel'
import RecordPanel from '~/components/video/RecordPanel'
import TextPanel from '~/components/video/TextPanel'

export default {
  components: { VideoPanel, DetailPanel, RecordPanel, TextPanel },

  mixins: [stringFilters],

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
