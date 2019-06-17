const express = require('express')
const router = express.Router()
const userModel = require('../models/users')
const billModel = require('../models/bill')
const checkLogin = require('../middlewares/check').checkLogin

router.get('/', checkLogin,(req, res, next) => {
  const userId = req.session.user._id
  const user = req.session.user
  Promise.all([
    userModel.getUserList(),
    billModel.getBillByUserId(),
    billModel.getBillByUserId(userId),
    billModel.getUserUnPayBill(userId)
  ]).then(result => {
    const userList = result[0]
    const AllBills = result[1]
    const userBills = result[2]
    const userUnPayBills = result[3]

    console.log(userList)
    console.log(AllBills)
    console.log(userBills)
    console.log(userUnPayBills)

    /* 筛选出已结算 */
    let sumCloseData = AllBills.filter((item, index) => {
      return item.status === true
    })

    let sumClose =  sumCloseData.reduce((total, item, index, arr) => {
      return total + (+item.num)
    },0) || 0
    /* 筛选出未结算总数 */
    let unCloseData = AllBills.filter((item, index) => {
      return item.status !== true
    })
    let unClose = unCloseData.reduce((total, item, index, arr) => {
      return total + (+item.num)
    },0) || 0




    /*累计已支出*/
    let sumPay = userBills.reduce((total, item, index, arr) => {
      return total + (+item.num)
    },0)
    /*未结算支出*/
    let unClosePayData = userBills.filter((item, index) => {
      return item.status === false
    })
    let unClosePay = unClosePayData.reduce((total, item, index, arr) => {
      return total + (+item.num)
    },0)
    let userUnPay = userUnPayBills.reduce((total, item, index, arr) => {
      return total + (+item.average)
    },0)

    let userShouldPay = userUnPay - unClosePay
    console.log(userShouldPay)

    res.render('userCenter', {
      data: {
        sumClose: sumClose,
        unClose: unClose,
        sumPay: sumPay,
        unClosePay: unClosePay,
        userShouldPay: userShouldPay
      },
      userList: userList,
      user: user
    })

  })

})

router.post('/add', checkLogin ,(req, res, next) => {
  const payer = req.session.user._id
  const num = +req.fields.num
  const remark = req.fields.remark
  const sharer = req.fields.sharer.split(',')
  const status = false

  console.log(num)
  console.log(typeof(num))

  // 校验参数
  try {
    if (!num) {
      throw new Error('请输入金额')
    }
    if (typeof(num) != 'number') {
      throw new Error('金额必须为数字')
    }
    if (sharer.length == 0) {
      throw new Error('请至少选择一个账单承担者')
    }
  } catch (e) {
    req.flash('error', e.message)
    return res.send(400)
  }
  const sharerNum = sharer.length
  const average = num / sharerNum

  let bill = {
    payer: payer,
    num: num,
    remark: remark,
    sharer: sharer,
    status: status,
    average: average,
    changer: null
  }
  console.log(bill)

  billModel.create(bill)
    .then(result => {
      console.log(result)
      bill = result.ops[0]
      req.flash('success', '发表成功')
      res.send(200)
      //res.redirect('/bill')
    })
    .catch(next)


})

router.post('/changeStatus', checkLogin, (req, res, next) => {
  const changer = req.session.user._id
  billModel.changeBillStatus(changer)
    .then(result => {
      res.redirect('/bill')
    })
    .catch(next)

})

module.exports = router
