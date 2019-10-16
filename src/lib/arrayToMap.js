/**
 * マッピング処理 ({ id: item ... })
 * 同keyは上書きされます.
 * @param {array} items 対象の配列
 * @param {Function} mapping item から key を取得する関数
 * @param {array|[]} keys キーにする配列
 * @return {Map} KVマップ
 */
const arrayToMap = (items, mapping, keys = []) => {
  const map = new Map()

  // keys を undefined として map に追加していく
  for (const key of keys) {
    map.set(key, undefined)
  }

  // item から key を抽出して map に代入していく
  for (const item of items) {
    const key = mapping(item) // get(item, 'id')
    map.set(key, item)
  }

  return map
}

export default arrayToMap
