<template lang="pug">
  v-row
    v-col(v-for='(video, key) in videos' :key='key')
      v-hover.ma-2(v-slot:default='{ hover }')
        v-card.mx-auto(:elevation="hover ? 12 : 2" max-width='400px')
          v-img(:src='video.image' height='200px')

          v-card-title
            div {{ video.title }}
</template>

<script>
export default {
  props: {
    videos: {
      type: Array,
      default: () => []
    }
  }
}
</script>
