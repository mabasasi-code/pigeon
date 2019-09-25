/**
 * 条件によって例外を投げる.
 * @param {boolean} bool 真偽値
 * @param {Error} error 投げる例外
 */
const throwIf = (bool, error) => {
  if (bool) {
    throw error
  }
}

export default throwIf
