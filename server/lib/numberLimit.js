module.exports = (num, min, max, defaultValue = 0) => {
  if (num) {
    if (num >= max) num = max
    if (num < min) num = min
  } else {
    num = defaultValue
  }

  return num
}
