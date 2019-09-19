export default class ResultCounter {
  constructor(len = 0) {
    this.len = len
    this.t = 0
    this.f = 0
  }

  success() {
    this.t++
  }

  skip() {
    this.f++
  }

  rate() {
    const r = this.t / this.len
    return r.toFixed(2) * 100
  }
}
