const http = require("axios");

// 调用openai接口获取回答
function getReply(text) {
    return new Promise((resolve, reject) => {
        http.post("https://api.openai.com/v1/completions", {
            "model": "text-davinci-003", // 机器人模型，不同型号有不同功能
            "prompt": text, // 问题
            "max_tokens": 2048 // 最大字符为2048个
        }, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer YOUR_API_KEY" // 密钥
            }
        }).then(res => {
			const reply = res.data.choices[0].text.replace(/^\n.*/g, '')
            console.log(`Q:${text}\nA:${reply}`)
            resolve(reply)
        }).catch(err => {
            console.error(err)
            resolve('提问出现了点问题，请重新问一遍吧！')
        })
    })
}

module.exports = {
    getReply
}