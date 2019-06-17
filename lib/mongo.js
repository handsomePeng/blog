const config = require('config-lite')(__dirname)
const Mongolass = require('mongolass')
const mongolass = new Mongolass()
const moment = require('moment')
const objectIdToTimestamp = require('objectid-to-timestamp')

// 根据id生成创建时间created_at
mongolass.plugin('addCreatedAt', {
  afterFind: function (results) {
    results.forEach((item) => {
      item.created_at = moment(objectIdToTimestamp(item._id)).format('YYYY-MM-DD HH:mm')
    })
    return results
  },
  afterFindOne: function (result) {
    if (result) {
      result.created_at = moment(objectIdToTimestamp(result._id)).format('YYYY-MM-DD HH:mm')
    }
    return result
  }
})

mongolass.connect(config.mongodb)

// 用户信息
exports.User = mongolass.model('User', {
  name: { type: 'string', required: true},
  password: { type: 'string', required: true },
  avatar: { type: 'string', required: true },
  gender: { type: 'string', enum: ['m', 'f', 'x'], default: 'x' },
  bio: { type: 'string', required: true }
})
exports.User.index({ name: 1}, { unique: true }).exec()// 根据用户名找到用户，用户名全局唯一

// 文章信息
exports.Post = mongolass.model('Post', {
  author: { type: Mongolass.Types.ObjectId, required: true },
  title: { type: 'string', required: true },
  content: { type: 'string', required: true },
  pv: { type: 'number', default: 0 }
})
exports.Post.index({ author: 1, _id: -1 }).exec() // 按创建时间降序查看用户的文章列表

/*留言信息*/
exports.Comment = mongolass.model('Comment', {
  author: { type: Mongolass.Types.ObjectId, required: true },
  content: { type: 'string', required: true },
  postId: { type: Mongolass.Types.ObjectId, required: true }
})
exports.Comment.index({ postId: 1, _id: 1 }).exec() // 通过文章ID获取该文章下所有留言，按创建时间升序

// 账单信息
exports.Bill = mongolass.model('Bill', {
  payer: { type: Mongolass.Types.ObjectId, required: true },
  changer: { type: Mongolass.Types.ObjectId, required: false },
  num: { type: 'number', required: true },
  average: { type: 'number', required: true },
  remark: { type: 'string', required: false },
  sharer:  [{ type: 'string' }],
  status: { type: 'boolean', required:  true }
})
exports.Bill.index({ payer: 1, _id: -1 }).exec()
