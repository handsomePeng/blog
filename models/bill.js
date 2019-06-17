const Bill = require('../lib/mongo').Bill

module.exports = {
  //创建账单
  create: function create(bill) {
    return Bill.create(bill).exec()
  },
  // 查找个人的账单
  getBillByUserId: function getBillByUserId(userId) {
    const query = {}
    if (userId) {
      query.payer = userId
    }
    return Bill
      .find(query)
      .populate({ path: 'payer', model: 'User'})
      .addCreatedAt()
      .exec()
  },
  // 查询用户尚未支付的账单
  getUserUnPayBill: function getUserUnPayBill(userId) {
    return Bill
      .find({ sharer: { $in: [userId] }, status: false })
      .addCreatedAt()
      .exec()
  },
  /*结算当前未结算的所有账单*/
  changeBillStatus: function changeBillStatus(userId) {
   return Bill
     .updateMany({ 'status': false }, { $set: { 'status': true,'changer': userId  }})
     .exec()
  }
}
