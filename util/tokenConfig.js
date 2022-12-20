const fs = require("fs");
const path = require("path");
const http = require("axios");
const config = require("../util/config")
const fileUrl = path.resolve(__dirname, "../public/token.json");
let INTERTIME = (7200 - 60) * 1000; // 设置一个默认的定期获取token的时间

// 保存token
function settoken() {
  return new Promise((resolve, reject) => {
    http
      .get(
        `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${config.appID}&secret=${config.appsecret}`
      )
      .then((res) => {
        // 若拿不到数据，则抛出错误
        if (!res.data.access_token || !res.data.expires_in) {
            console.error('ACCESS_TOKEN为空', res.data)
            return reject()
        }
        console.log("ACCESS_TOKEN", res.data.access_token)
        // 更新token的过期时间，每隔这个时间重新获取一次token
        INTERTIME = (res.data.expires_in - 60) * 1000;
        // 获取到token后保存到json文件中
        fs.writeFile(
          fileUrl,
          JSON.stringify({
            token: res.data.access_token,
          }),
          (err) => {
              if (err) {
                  console.log('写入access_token失败',err)
                  reject(err)
              }
            // 通知外界token获取成功
            resolve();
          }
        );
      })
  });
}

// 定时获取token
function timingSettoken() {
  // 定时刷新token
  setInterval(() => {
    settoken();
  }, INTERTIME);
}

// 获取token
function gettoken() {
  return new Promise((resolve, reject) => {
    // 从json中读取保存的token
    fs.readFile(fileUrl, (err, data) => {
      // 返回获取到的token
      resolve(JSON.parse(data).token);
    });
  });
}

// 导出封装好的方法
module.exports = {
  settoken, // 更新token
  gettoken, // 返回获取到的token
  timingSettoken, // 定时更新token
};