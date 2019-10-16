import { get } from 'object-path'
import { forEachSeries } from 'p-iteration'

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
   * @param {Function} callback return と throw 成功失敗を判定
   */
  async forEach(callback) {
    const entries = this._map.entries()

    await forEachSeries(Array.from(entries), async (entry) => {
      const key = get(entry, 0)
      const value = get(entry, 1)

      try {
        const res = await callback(value, key, this)
        this.success(res)
        this.onSuccess(value, key, res)
      } catch (err) {
        this.error()
        this.onError(value, key, err)
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
    this._skip += sequencer._skip
    this._results.push(...sequencer._results)

    // map のマージ
    sequencer._map.forEach((v, k) => {
      if (this._map.has(k)) {
        console.error('sequence error!')
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

  format(format = '%r%, %t/%l, skip:%f') {
    return format
      .replace(/%t/g, '' + this._success)
      .replace(/%f/g, '' + this._error)
      .replace(/%r/g, '' + this.rate())
      .replace(/%l/g, '' + this._length)
      .replace(/%%/g, '%')
  }
}
