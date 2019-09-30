<template lang="pug">
  div(v-if='account._id')
    v-card
      v-card-title {{ account.name }}
      v-card-text asd

    template(v-for='channel in account.channels')
      v-card
        v-layout(wrap)
          v-img(:src='channel.image' width='200px' height='200px')
          
          v-flex
            div {{ channel.service }}
            div {{ channel.title }}

            v-flex
              v-icon mdi-account
              span {{ channel.stats.now.subscriber | numberFormat }}
            v-flex
              v-icon mdi-filmstrip
              span {{ channel.stats.now.video | numberFormat }}
            v-flex
              v-icon mdi-play
              span {{ channel.stats.now.view | numberFormat }}
            v-flex
              v-icon mdi-comment
              span {{ channel.stats.now.comment | numberFormat}}

            v-btn(:href='channel.url' target='_blank') page
            div {{ channel.stats.now }}
      //- v-card
      //-   v-card-title {{ channel.service }}
      //-   v-card-text
      //-     v-layout
      //-       v-btn asd
      //-       v-spacer
      //-       v-btn qwe

    

  //- v-layout(wrap)
  //-   code {{ account }}
  //-   code {{ videos }}
</template>

<script>
export default {
  filters: {
    numberFormat(val) {
      return val.toLocaleString()
    }
  },
  data() {
    return {
      account: {},
      videos: []
    }
  },

  async mounted() {
    await this.getDataFromApi()
  },

  methods: {
    async getDataFromApi() {
      const id = this.$nuxt.$route.params.id // account hash

      const account = await this.$axios.$get(`/account/${id}`)
      this.account = account

      const channels = account.channels.map((e) => e._id)
      const videos = await this.$axios.$get(`/video`, {
        params: { channel: channels.join(',') }
      })
      this.videos = videos || []
    }
  }
}
</script>
