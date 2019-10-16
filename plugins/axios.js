export default function({ $axios }) {
  if (!(process.env.NODE_ENV === 'production')) {
    $axios.onRequest((config) => {
      // eslint-disable-next-line no-console
      console.log(
        `[AXIOS] ${config.url} params: ${JSON.stringify(config.params || {})}`
      )
    })
  }
}
