import mongoose from 'mongoose'
import account from './account'
import youtube from './youtube'
import youtubeStat from './youtube-stat'
import video from './video'
import videoStat from './video-stat'

let conn = null

// singlton
export default async () => {
  if (conn) {
    return
  }

  if (!process.env.MONGO_URL) {
    throw new Error('Write MONGO_URL to ".env"')
  }

  // mongoose.set('debug', true)
  mongoose.set('useFindAndModify', false)

  conn = await mongoose.connect(process.env.MONGO_URL, {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true // path deprecation
  })

  return conn
}

export const Account = mongoose.model('Account', account)
export const Youtube = mongoose.model('Youtube', youtube)
export const YoutubeStat = mongoose.model('YoutubeStat', youtubeStat)
export const Video = mongoose.model('Video', video)
export const VideoStat = mongoose.model('VideoStat', videoStat)
