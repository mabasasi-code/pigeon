import { get } from 'object-path'

export default class YoutubePaginator {
  /**
   * Creates an instance.
   * @param {function} closure YouTube API closure
   */
  constructor(closure) {
    this.closure = closure

    this.result = null
    this.nextPageToken = null
    this.prevPageToken = null
    this.totalResults = null
    this.resultsPerPage = null

    this.statusCode = null
  }

  hasNext() {
    return !!this.nextPageToken
  }

  hasPrev() {
    return !!this.nextPageToken
  }

  async exec() {
    const res = await this.closure(this.nextPageToken, this.prevPageToken)
    this.result = res
    this.nextPageToken = get(res, 'data.nextPageToken')
    this.prevPageToken = get(res, 'data.prevPageToken')
    this.totalResults = get(res, 'data.pageInfo.totalResults')
    this.resultsPerPage = get(res, 'data.pageInfo.resultsPerPage')

    this.statusCode = get(res, 'status')

    return get(res, 'data.items') || []
  }
}
