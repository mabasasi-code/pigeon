import { Schema } from 'mongoose'
import statTemp from './template/video-stat-template'

export default new Schema(
  {
    channel: {
      type: Schema.Types.ObjectId,
      ref: 'Channel',
      required: [true, 'Channel key is required.']
    },
    video_id: {
      type: String,
      index: true,
      unique: true,
      required: [true, 'video_id is required.']
    },
    title: {
      // タイトル
      type: String
    },
    text: {
      // 概要文
      type: String
    },
    image: {
      // 通常サムネ
      type: String
    },

    type: {
      // スケジュールの状態
      // upcoming, live, archive, video
      type: String
    },
    status: {
      // 公開状態
      // public, unlisted, private
      type: String
    },
    start_time: {
      // 開始時刻
      type: Date
    },
    end_time: {
      // 終了時刻
      type: Date
    },
    second: {
      // 動画時間 sec
      type: Number,
      validate: (v) => v >= 0,
      message: (props) => `${props.value} must be >= 0.`
    },

    url: {
      // チャンネルURL
      type: String
    },
    published_at: {
      // 開始日時
      type: Date
    },
    stats: {
      // 統計情報
      now: statTemp,
      max: statTemp,
      diff: statTemp
    },

    time: {
      // 時間情報
      actual_start_time: {
        type: Date
      },
      actual_end_time: {
        type: Date
      },
      scheduled_start_time: {
        type: Date
      },
      scheduled_end_time: {
        type: Date
      }
    }
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
  }
)
