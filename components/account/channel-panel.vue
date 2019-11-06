<template lang="pug">
  v-hover.ma-2(v-slot:default='{ hover }')
    v-card.mx-auto(:elevation="hover ? 12 : 2")
      v-row(no-gutters)
        v-col
          v-img(:src='channel.image' width='200px' height='200px')
          
        v-col
          v-row(no-gutters)
            v-col
              span ({{ channel.service }}) {{ channel.title }}

          v-row(no-gutters)
            v-col
              v-icon mdi-account
              span {{ channel.stats.now.subscriber | formatNumber }}
            v-col
              v-icon mdi-filmstrip
              span {{ channel.stats.now.video | formatNumber }}
            v-col
              v-icon mdi-play
              span {{ channel.stats.now.view | formatNumber }}
            v-col
              v-icon mdi-comment
              span {{ channel.stats.now.comment | formatNumber }}
</template>

<script>
import stringFilters from '~/mixins/stringFilters'

export default {
  mixins: [stringFilters],

  props: {
    channel: {
      type: Object,
      default: () => {}
    }
  }
}
</script>
