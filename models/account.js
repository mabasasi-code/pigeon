import { Schema } from 'mongoose'

export default new Schema(
  {
    name: {
      type: String,
      required: [true, 'name is required.']
    },
    channels: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Channel',
        required: [true, 'Channel key is required.']
      }
    ]
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
  }
)
