<template lang="pug">
  v-row(wrap)
    v-col(v-for='(link, key) in links' :key='key' sm='8' offset-sm='2')
      v-hover(v-slot:default='{ hover }')
        v-card.mx-auto(
          :elevation="hover ? 12 : 2"
          :href='link.href'
          target='_blank'
          )
          
          v-list-item
            v-list-item-avatar(:color='link.color')
            v-list-item-content
              v-list-item-title.headline {{ link.title }}
              v-list-item-subtitle https:{{ link.href }}

</template>

<script>
export default {
  data() {
    return {
      links: [
        {
          href: '//ja.nuxtjs.org/guide/',
          title: 'Nuxt',
          color: 'green'
        },

        {
          href: '//expressjs.com/en/4x/api.html',
          title: 'Express',
          color: 'blue-grey lighten-3'
        },

        {
          href: '//vuetifyjs.com/en/components/api-explorer',
          title: 'Vuetify',
          color: 'blue'
        },
        {
          href: '//vuetifyjs.com/en/styles/colors',
          title: 'Vuetify #Colors',
          color: 'blue'
        },
        {
          href: '//vuetifyjs.com/en/components/grids',
          title: 'Vuetify #Grids',
          color: 'blue'
        },

        {
          href: '//materialdesignicons.com',
          title: 'Material Desigh Icon',
          color: 'indigo'
        }
      ]
    }
  }
}
</script>
