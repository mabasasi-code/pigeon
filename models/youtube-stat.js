import { Schema } from 'mongoose'
import statTemp from './template/youtube-stat-template'

export default new Schema({
  youtube: {
    type: Schema.Types.ObjectId,
    ref: 'Youtube',
    required: [true, 'Youtube key is required.']
  },
  ...statTemp
})
