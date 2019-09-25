export default class ItemSequencer {
  constructor(items = []) {
    this._items = items
    this._length = items.length
    this._cursor = 0

    this._results = []
    this._success = 0
    this._error = 0
  }

  next() {
    if (this._cursor > this._length) {
      return undefined
    }

    const item = this._items[this._cursor]
    this._cursor++

    return item
  }

  success(obj = undefined) {
    this._success++

    if (obj) this._results.push(obj)
  }

  error() {
    this._error++
  }

  /// ////////////////////////////////////////////////////////////

  merge(sequencer) {
    this._length += sequencer._length
    this._success += sequencer._success
    this._error += sequencer._error

    this._items.push(...sequencer._items)
    this._results.push(...sequencer._results)
  }

  /// ////////////////////////////////////////////////////////////

  getResult() {
    return this._results
  }

  rate() {
    const r = this._success / this._length
    return r.toFixed(2) * 100
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
