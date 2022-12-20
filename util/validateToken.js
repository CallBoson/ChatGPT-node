var sha1 = require('sha1') // sha1 为第三方加密模块
const { getToken } = require("../util/tokenConfig.js")
const config = require("../util/config")

function validateToken(req) {
    return new Promise((resolve, reject) => {
        // 获取微信服务器发送的数据
        var signature = req.query.signature,
            timestamp = req.query.timestamp,
            nonce = req.query.nonce,
            echostr = req.query.echostr
        
        // token、timestamp、nonce三个参数进行字典序排序
        var arr = [config.token, timestamp, nonce].sort().join('')
        // sha1加密    
        var result = sha1(arr)
        
        if(result === signature){
            resolve(echostr)
        }else{
            reject(false)
        }
    })
}

module.exports = validateToken