const express = require("express");
const router = express.Router(); // 配置路由模块
const validateToken = require("../util/validateToken.js");
const { settoken, timingSettoken, gettoken } = require("../util/tokenConfig.js");
const template = require("../util/template")
const { getReply } = require("../util/openai")
const http = require('axios')
const mcache = require('memory-cache') // 缓存中间件

// get请求验证token有效性
router.get("/", (req, res) => {
  validateToken(req).then((t) => {
    res.send(t);
  }).catch(() => {
    res.send("请求不是来自微信服务器，通讯失败")
  })
});

// post请求处理微信发送过来的消息
router.post("/", (req, res) => {
  let xml = req.body.xml;
  let msgtype = xml.msgtype[0];
  switch (msgtype) {
    case "text":
		let key = '__express__' + xml.msgid[0]
		let cachedReply = mcache.get(key)
		
		if (!cachedReply) {
			mcache.put(key, 1, 20000)
		} else if (typeof cachedReply === 'number') {
			mcache.put(key, cachedReply+1, 20000)
		}
		
		// 第一次请求
		if (!cachedReply) {
			getReply(xml.content[0]).then(reply => {
				let message = {
					FromUserName: xml.fromusername[0],
					ToUserName: xml.tousername[0],
					reply,
				};
				mcache.put(key, template.textMessage(message), 20000)
				res.send(template.textMessage(message));
			})
		}
		
		// 轮询答案
		if (cachedReply && typeof cachedReply === 'number') {
			let times = 0
			let cache
			const clock = setInterval(() => {
				cache = mcache.get(key)
				if (cache && typeof cache !== 'number') {
					clearInterval(clock)
					res.send(cache)
				}
				if (times >= 10) {
					if (mcache.get(key) >= 3) {
						let message = {
							FromUserName: xml.fromusername[0],
							ToUserName: xml.tousername[0],
							reply: '答案太长，超时了，请重新问一遍呗',
						};
						res.send(template.textMessage(message));
					}
					clearInterval(clock)
				}
				times++
			}, 420)
		}
		
      break;
    
    case "event":
      if (xml.event[0] === 'subscribe') {
        let message = {
          FromUserName: xml.fromusername[0],
          ToUserName: xml.tousername[0],
          reply: "欢迎关注，可直接向我(OpenAI)提问，若对话5秒内无回复可等待20秒后尝试再次输入相同的内容以重试, 免费额度有限, 请大家节省使用",
        };
        res.send(template.textMessage(message));
      }
      break;
    default:
      res.send(""); // 不是文本消息是默认响应一个空
      break;
  } 
});

// 导出 router
module.exports = router;

// 项目启动后自动执行获取access_token的方法
// settoken().then(() => {
//   // token 获取成功后开始定时刷新token操作
//   timingSettoken();
// });

// 发送客服消息
// async function sendKefu(touser, content) {
//   http.post('https://api.weixin.qq.com/cgi-bin/message/custom/send?access_token=' + await gettoken(), {
//     "touser":touser,
//     "msgtype":"text",
//     "text":
//     {
//       "content":content
//     }
//   })
// }
