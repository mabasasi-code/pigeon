<template lang="pug">
  v-layout(wrap)
    template(v-for='item in items')
      v-hover.ma-2(v-slot:default='{ hover }')
        v-card.mx-auto(:elevation="hover ? 12 : 2" max-width='400px' @click="$router.push({ name: 'account-id', params: { id: item._id }})")
          v-img(:src='item.channels[0].image' height='200px')

          v-card-title
            div {{ item.name }}
            span.grey--text.subtitle-1 ({{ item.channels.length }})
</template>

<script>
export default {
  data() {
    return {
      items: []
    }
  },

  async mounted() {
    await this.getDataFromApi()
  },

  methods: {
    async getDataFromApi() {
      const items = await this.$axios.$get('/account')
      this.items = items || []
    }
  }
}
</script>
