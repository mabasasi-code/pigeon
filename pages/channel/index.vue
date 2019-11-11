<template lang="pug">
  div
    div
      v-text-field(label='search' v-model='searchText' @change='onSearch')

    v-subheader
      v-row(no-gutters)
        v-col(cols='auto')
          span {{ totalItems | formatNumber }}件 {{ requestTime / 1000 | formatNumber(2) }}秒
        v-spacer
        v-col(cols='auto')
          v-btn-toggle(v-model='listMode' mandatory color='primary')
            v-btn(small)
              v-icon(small) mdi-view-grid
            v-btn(small)
              v-icon(small) mdi-view-list

    ChannelList(:channels='channels' :showGrid='listMode === 0' :imageWidth='320')

</template>

<script>
import stringFilters from '~/mixins/stringFilters'
import ChannelList from '~/components/ChannelList'

export default {
  components: { ChannelList },

  mixins: [stringFilters],

  data() {
    return {
      searchText: '',
      listMode: 0, // 0: grid, 1:list
      channels: [],
      requestTime: 0, // 実処理時間
      totalItems: 0 // 全件数
    }
  },

  async mounted() {
    await this.getDataFromApi()
    // this.callResize()
  },

  methods: {
    onSearch() {
      this.getDataFromApi()
    },
    async getDataFromApi() {
      const ts = new Date()

      // 全てのチャンネルを直近のもの順で
      const { items: channels, paginator } = await this.$axios.$get(
        '/channel',
        {
          params: {
            text: this.searchText,
            limit: 24,
            sort: 'published_at',
            order: 'asc'
          }
        }
      )
      this.channels = channels || []

      // 統計保存
      this.requestTime = new Date() - ts
      this.totalItems = paginator.totalItems
    }
  }
}
</script>
