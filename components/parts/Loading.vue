<template lang="pug">
  v-overlay(:value='show' absolute)
    div.text-center
      v-progress-circular(
        indeterminate
        size=70
        width=7
        color='light-blue'
      )

</template>

<script>
export default {
  props: {
    show: {
      type: Boolean,
      default: false
    }
  }
}
</script>
