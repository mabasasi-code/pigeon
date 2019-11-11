<template lang="pug">
  div
    div
      v-text-field(label='search' v-model='searchText' @change='onSearch')

    //- header
    v-row.mx-2(no-gutters align='center' justify='center')
      v-col(cols='auto')
        span.body-2.grey--text.text--darken-1 {{ totalItems | formatNumber }}件 {{ requestTime / 1000 | formatNumber(2) }}秒

      v-spacer

      v-col(cols='auto')
        v-pagination(v-model='page' :length='totalPages' total-visible='7' @input='onSearch')

      v-col(cols='auto')
        //- 色合いが微妙なので css で弄る (v-item--active)
        v-btn-toggle.custom(v-model='listMode' mandatory dense color='primary')
          v-btn(elevation='2')
            v-icon(small) mdi-view-grid
          v-btn(elevation='2')
            v-icon(small) mdi-view-list

    //- main
    VideoList(:videos='videos' :showGrid='listMode === 0' :imageWidth='320')

    //- footer
    v-row.mx-2(no-gutters align='center' justify='center')
      v-col(cols='auto')
        v-pagination(v-model='page' :length='totalPages' total-visible='7')

    Loading(:show='showLoading')

</template>

<script>
import stringFilters from '~/mixins/stringFilters'

import Loading from '~/components/parts/Loading'
import VideoList from '~/components/VideoList'

export default {
  components: { Loading, VideoList },

  mixins: [stringFilters],

  data() {
    return {
      showLoading: true, // ローディング flag(開始時はtrue)
      searchText: '',
      listMode: 0, // 0: grid, 1:list
      page: 1, // 表示しているページ番号
      videos: [],
      requestTime: 0, // 実処理時間
      totalItems: 0, // 全件数
      totalPages: 0 // 全ページ数
    }
  },

  async mounted() {
    await this.getDataFromApi()
  },

  methods: {
    onSearch() {
      this.getDataFromApi()
    },

    async getDataFromApi() {
      this.showLoading = true
      const ts = new Date()

      try {
        // 全てのビデオを直近のもの順で
        const { items: videos, paginator } = await this.$axios.$get('/video', {
          params: {
            text: this.searchText,
            limit: 24,
            page: this.page,
            sort: 'start_time',
            order: 'desc'
          }
        })
        this.videos = videos || []

        // 統計保存
        this.totalItems = paginator.totalItems
        this.totalPages = paginator.totalPages
        this.requestTime = new Date() - ts

        this.$scrollTo('#app')
      } catch (err) {
        this.$toast.error(err)
      }

      this.showLoading = false
    }
  }
}
</script>
