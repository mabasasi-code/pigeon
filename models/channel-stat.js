import { Schema } from 'mongoose'
import statTemp from './template/channel-stat-template'

export default new Schema({
  channel: {
    type: Schema.Types.ObjectId,
    ref: 'Channel',
    required: [true, 'Channel key is required.']
  },
  ...statTemp
})
