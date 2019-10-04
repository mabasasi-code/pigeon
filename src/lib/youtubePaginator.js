import { get } from 'object-path'
import arrayChunk from 'array-chunk'

export default class YoutubePaginator {
  /**
   * Creates an instance.
   * @param {string[]|string} items values
   * @param {function} closure YouTube API closure
   * @param {number|50} maxChunkSize 一度に送信する最大値
   */
  constructor(items, closure, maxChunkSize = 50) {
    this.items = Array.isArray(items) ? items : [items]
    this.closure = closure
    this.maxChunkSize = maxChunkSize

    this._chunks = arrayChunk(this.items, maxChunkSize)
    this._counter = 0 // 実行回数
    this._cursor = 0 // 参照している chunk

    this.result = null
    this.useChunk = []

    this.statusCode = null
    this.nextPageToken = null
    this.prevPageToken = null
    this.totalResults = null
    this.resultsPerPage = null
  }

  hasNext() {
    return this.nextPageToken || this._cursor < this._chunks.length
  }

  async exec() {
    const chunk = this._chunks[this._cursor]

    // chunk, meta
    const res = await this.closure(chunk, {
      next: this.nextPageToken,
      prev: this.prevPageToken,
      maxChunkSize: this.maxChunkSize,
      counter: this._counter,
      cursor: this._cursor,
      items: this.items,
      chunks: this._chunks
    })

    this.result = res
    this.useChunk = chunk

    this.statusCode = get(res, 'status')
    this.nextPageToken = get(res, 'data.nextPageToken')
    this.prevPageToken = get(res, 'data.prevPageToken')
    this.totalResults = get(res, 'data.pageInfo.totalResults')
    this.resultsPerPage = get(res, 'data.pageInfo.resultsPerPage')

    this._counter++
    if (!this.nextPageToken) {
      this._cursor++
    }

    return get(res, 'data.items') || undefined
  }
}
