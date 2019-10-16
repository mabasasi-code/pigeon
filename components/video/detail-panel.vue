<template lang="pug">
  v-simple-table
    template(v-slot:default)
      thead
        tr
          th.text-left key
          th.text-left value
      tbody
        tr
          td Video ID
          td {{ video.video_id }}
        tr
          td 状態
          td {{ video.status | localeStatus }}
        tr
          td 種類
          td {{ video.type | localeType }}
        tr
          td 開始時刻
          td {{ video.start_time | datetimeFormat }}
        tr
          td 終了時刻
          td {{ video.end_time | datetimeFormat }}
        tr
          td 長さ
          td {{ video.second | durationFormat }}
        tr
          td URL
          td {{ video.url }}
        template(v-if='video.time')
          tr
            td 配信開始時刻
            td {{ video.time.actual_start_time | datetimeFormat }}
          tr
            td 配信終了時刻
            td {{ video.time.actual_end_time | datetimeFormat }}
          tr
            td 予定開始時刻
            td {{ video.time.scheduled_start_time | datetimeFormat }}
          tr
            td 予定終了時刻
            td {{ video.time.scheduled_end_time | datetimeFormat }}
        tr
          td 公開日時
          td {{ video.published_at | datetimeFormat }}
        tr
          td 作成日時
          td {{ video.created_at | datetimeFormat }} ({{ video.created_at | datetimeHumanize }})
        tr
          td 最終更新日時
          td {{ video.updated_at | datetimeFormat }} ({{ video.updated_at | datetimeHumanize }})
        tr
          td 管理キー
          td {{ video._id }}
</template>

<script>
import stringFilters from '~/mixins/stringFilters'

export default {
  filters: {
    localeStatus(val) {
      switch (val) {
        case 'public':
          return '公開'
        case 'unlisted':
          return '限定公開'
        case 'private':
          return '非公開'
        default:
          return val
      }
    },
    localeType(val) {
      switch (val) {
        case 'upcoming':
          return '予定'
        case 'live':
          return '配信中'
        case 'archive':
          return 'アーカイブ'
        case 'video':
          return '動画'
      }
    }
  },

  mixins: [stringFilters],

  props: {
    video: {
      type: Object,
      default: () => {}
    }
  }
}
</script>
