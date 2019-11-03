<template lang="pug">
  v-hover(v-slot:default='{ hover }')
    v-card(
      @click.stop.self
      :elevation="Boolean(to || href) && hover ? 12 : 0"
      :to='to'
      :href='href'
    )
      v-list-item
        v-list-item-avatar
          v-img(:src='image')
        v-list-item-content
          v-list-item-title {{ text }}

</template>

<script>
export default {
  props: {
    image: {
      type: String,
      default: () => ''
    },
    text: {
      type: String,
      default: () => ''
    },
    to: {
      type: [String, Object],
      default: undefined
    },
    href: {
      type: [String, Object],
      default: undefined
    }
  }
}
</script>
