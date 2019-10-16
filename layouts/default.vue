<template lang="pug">
  v-app(dark)
    //- サイドメニュー部
    v-navigation-drawer(
      v-model='drawer'
      :mini-variant='miniVariant'
      :clipped='clipped'
      mobile-break-point='960'
      fixed
      app)
      v-list
        v-list-item(v-for='(route, key) in routes' :key='key' :to='route.to' router)
          v-list-item-action
            v-icon {{ route.icon }}
          v-list-item-content
            v-list-item-title(v-text='route.title')

    //- ヘッダメニュー部
    v-app-bar(:clipped-left='clipped' fixed app)
      v-app-bar-nav-icon(@click.stop='drawer = !drawer')
      v-btn(icon @click.stop='miniVariant = !miniVariant')
        v-icon mdi-{{ `chevron-${miniVariant ? 'right' : 'left'}` }}
      v-toolbar-title(v-text='title')

    //- メイン
    v-content
      v-container(fluid)
        nuxt

</template>

<script>
export default {
  data() {
    return {
      drawer: true, // サイドメニューの表示表示
      clipped: true, // 画面にはめ込むか, true 固定
      miniVariant: true, // サイドメニューの幅
      title: 'Pigeon', // ヘッダ
      routes: [
        {
          icon: 'mdi-apps',
          title: 'Welcome',
          to: '/'
        },
        {
          icon: 'mdi-chart-bubble',
          title: 'Inspire',
          to: '/inspire'
        },
        {
          icon: 'mdi-account-group',
          title: 'VTuber',
          to: '/account'
        },
        {
          icon: 'mdi-library-movie',
          title: 'Video',
          to: '/video'
        },
        {
          icon: 'mdi-dev-to',
          title: 'Develop',
          to: '/dev'
        }
      ]
    }
  }
}
</script>
