import { google } from 'googleapis'

if (!process.env.GOOGLE_API_KEY) {
  throw new Error('Write GOOGLE_API_KEY to ".env"')
}

const youtube = google.youtube({
  version: 'v3',
  auth: process.env.GOOGLE_API_KEY
})

export default youtube
