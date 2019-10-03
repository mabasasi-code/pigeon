import mongoose from 'mongoose'
import mongoosePaginate from 'mongoose-paginate-v2'

import account from './account'
import channel from './channel'
import channelStat from './channel-stat'
import video from './video'
import videoStat from './video-stat'

let conn = null

const paginateOptions = {
  page: 1,
  limit: 3,
  customLabels: {
    totalDocs: 'totalItems',
    docs: 'items',
    limit: 'limit',
    page: 'currentPage',
    nextPage: 'nextPage',
    prevPage: 'prevPage',
    totalPages: 'totalPages',
    pagingCounter: 'pagingCounter',
    meta: 'paginator'
  }
}

/// ////////////////////////////////////////////////////////////

mongoosePaginate.paginate.options = paginateOptions
mongoose.plugin(mongoosePaginate)

export const Account = mongoose.model('Account', account)
export const Channel = mongoose.model('Channel', channel)
export const ChannelStat = mongoose.model('ChannelStat', channelStat)
export const Video = mongoose.model('Video', video)
export const VideoStat = mongoose.model('VideoStat', videoStat)

/// ////////////////////////////////////////////////////////////

// singlton
export default async () => {
  if (conn) {
    return
  }

  if (!process.env.MONGO_URL) {
    throw new Error('Write MONGO_URL to ".env"')
  }

  if (process.env.MONGO_DEBUG === 'true') {
    mongoose.set('debug', true)
  }

  mongoose.set('useFindAndModify', false) // warning suppression

  conn = await mongoose.connect(process.env.MONGO_URL, {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true // path deprecation
  })

  return conn
}
