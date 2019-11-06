<template lang="pug">
  div
    v-simple-table(dense)
      template(v-slot:default)
        thead
          tr
            th.text-left timestamp
            th.text-left 再生数
            th.text-left 高評価
            th.text-left 低評価
            th.text-left お気に入り数
            th.text-left コメント数
            th.text-left 同時接続数
        tbody
          tr(v-for='(stat, key) of (stats)' :keys='key')
            td {{ stat.timestamp | formatDatetime }}
            td {{ stat.view | formatNumber }}
            td {{ stat.like | formatNumber }}
            td {{ stat.bad | formatNumber }}
            td {{ stat.fav | formatNumber }}
            td {{ stat.comment | formatNumber }}
            td {{ stat.current | formatNumber }}

    v-btn(small block @click='onAllRecord') 全て表示


</template>

<script>
import stringFilters from '~/mixins/stringFilters'

export default {
  mixins: [stringFilters],

  props: {
    video: {
      type: Object,
      default: () => {}
    }
  },

  data() {
    return {
      showAll: false,
      records: []
    }
  },

  computed: {
    stats() {
      return this.showAll ? this.records : this.video.records
    }
  },

  methods: {
    async onAllRecord() {
      this.showAll = true
      await this.getDataFromApi()
    },
    async getDataFromApi() {
      const id = this.$nuxt.$route.params.id // video hash

      // fetch video
      const { items } = await this.$axios.$get(`/video/${id}/record`, {
        params: {
          limit: 100
        }
      })
      this.records = items
    }
  }
}
</script>
