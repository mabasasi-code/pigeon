import { get } from 'object-path'
import { forEachSeries } from 'p-iteration'

import { plane as logger } from '../../logger'

export default class ItemSequencer {
  /**
   * Constructor.
   * @param {Map} map KVマップ
   */
  constructor(map) {
    if (!map) map = new Map()

    this._map = map
    this._length = map.size

    this._results = []
    this._success = 0
    this._error = 0

    this.onSuccess = (vaule, key, result) => {}
    this.onError = (value, key, error) => {
      throw error
    }
  }

  /**
   * 逐次処理.
   * - 内部で error catch しています
   * - onSuccess(), onError() でのハンドリング推奨
   * @param {Function} callback return と throw で成功失敗を判定、null でスキップ要素
   */
  async forEach(callback) {
    const entries = this._map.entries()
    const ary = Array.from(entries)
    const length = ary.length

    await forEachSeries(ary, async (entry, index) => {
      const key = get(entry, 0)
      const value = get(entry, 1)

      try {
        // return true で成功、 return null でスキップ
        const meta = { key, value, index, length, sequencer: this }
        const response = await callback(meta)
        const isSkip = response == null
        this.success(response)
        this.onSuccess({
          key, // map のキー
          value, // map の値
          response, // 処理結果
          index, // map のインデックス
          length, // map の長さ
          isSkip, // 処理が skip されたか
          sequencer: this
        })
      } catch (error) {
        this.error()
        this.onError({
          key, // map のキー
          value, // map の値
          error, // 発生した Error
          index, // map のインデックス
          length, // map の長さ
          sequencer: this
        })
      }
    })
  }

  success(item = undefined) {
    this._success++
    if (item != null) this._results.push(item)
  }

  error(item = undefined) {
    this._error++
    if (item != null) this._results.push(item)
  }

  /// ////////////////////////////////////////////////////////////

  /**
   *
   * @param {ItemSequencer} sequencer
   */
  merge(sequencer) {
    this._success += sequencer._success
    this._error += sequencer._error
    this._results.push(...sequencer._results)

    // map のマージ
    sequencer._map.forEach((v, k) => {
      if (this._map.has(k)) {
        // TODO: 例外を吐くほどではないため検討中
        logger.warn('Duplicated key!')
      } else {
        this._map.set(k, v)
      }
    })
    this._length = this._map.size
  }

  /// ////////////////////////////////////////////////////////////

  getResult() {
    return this._results
  }

  rate() {
    const r = this._success / this._length
    return r.toFixed(3) * 100
  }

  format(format = '%r%, %t/%l, err:%f') {
    const resLen = this._results.length
    return format
      .replace(/%t/g, '' + this._success) // ok + skip
      .replace(/%f/g, '' + this._error) // error
      .replace(/%c/g, '' + resLen) // ok
      .replace(/%s/g, '' + (this._success - resLen)) // skip
      .replace(/%r/g, '' + this.rate())
      .replace(/%l/g, '' + this._length)
      .replace(/%%/g, '%')
  }
}
