export default {
  timestamp: {
    // 日時 必須にしたいけど無理
    type: Date
  },
  view: {
    // 再生数
    type: Number
  },
  like: {
    // 高評価数
    type: Number
  },
  bad: {
    // 低評価数
    type: Number
  },
  fav: {
    // お気に入り数？
    type: Number
  },
  comment: {
    // コメント数
    type: Number
  },

  second: {
    // live 中の経過時間 nullable
    type: Number
  },
  current: {
    // live 中の同時接続 nullable
    type: Number
  }
}
