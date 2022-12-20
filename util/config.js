var env = 1 // 0正式 1测试
var config = {}
if (env === 0) {
    // 正式
    config = {
        'appID': 'wx3efd9b8dbc70b306',
        'appsecret': '',
        'token': ''   
    }
} else {
    // 测试
    config = {
        'appID': 'wxa7c94fcb9e4174e8',
        'appsecret': '',
        'token': '' // 与access_token不一样，这个是固定的
    }
}

module.exports = config