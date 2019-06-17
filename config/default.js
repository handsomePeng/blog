module.exports = {
  port: 3000,
  session: {
    secret: 'bill',
    key: 'bill',
    maxAge: 2592000000,
  },
  //mongodb: 'mongodb://localhost:27017/bill'
  mongodb: 'mongodb://127.0.0.1:27017/?gssapiServiceName=mongodb'
}
