import { Schema } from 'mongoose'

export default new Schema(
  {
    account: {
      type: Schema.Types.ObjectId,
      ref: 'Account',
      required: [true, 'Account key is required.']
    },
    channel_id: {
      type: String,
      index: true,
      unique: true,
      required: [true, 'channel_id is required.'],
      validate: {
        validator: (v) => /^UC.+/.test(v),
        message: (props) => `${props.value} is not a valid channel id.`
      }
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
    url: {
      // チャンネルURL
      type: String
    },
    published_at: {
      // 開始日時
      type: Date
    }
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
  }
)
