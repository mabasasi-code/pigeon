<template lang="pug">
  v-card
    v-card-text
      div DESCRIPTION

      p.black--text(v-html='text')

</template>

<script>
export default {
  props: {
    video: {
      type: Object,
      default: () => {}
    }
  },

  computed: {
    text() {
      // 末尾 (). は除外
      const URLPattern = /(http(s)?:\/\/[a-zA-Z0-9-_.!'()*;/?:@&=+$,%#]+[a-zA-Z0-9-_.!'*;/?:@&=+$,%#])/gi
      let text = this.video.text || ''

      text = text.replace(/\r?\n/g, '<br/>')
      text = text.replace(URLPattern, "<a href='$1' target='_blank'>$1</a>")

      return text
    }
  }
}
</script>
