import { Schema } from 'mongoose'
import statTemp from './template/video-stat-template'

export default new Schema({
  video: {
    type: Schema.Types.ObjectId,
    ref: 'Video',
    required: [true, 'Video key is required.']
  },
  ...statTemp
})
