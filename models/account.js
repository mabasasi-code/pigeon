import { Schema } from 'mongoose'

export default new Schema(
  {
    name: {
      type: String,
      required: [true, 'name is required.']
    },
    youtube: {
      type: [Schema.Types.ObjectId],
      ref: 'Youtube',
      required: [true, 'YouTube key is required.']
    }
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
  }
)
