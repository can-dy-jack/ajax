import express from 'express';

const app = new express();

app.get('/', (req, res) => {
    // 设置响应头 设置允许跨域
    res.setHeader('Access-Control-Allow-Origin', '*');

    // console.log(req, res)

    res.send("AJAX")
})

app.listen(8080, () => {
    console.log('服务已启动：localhost:8080')
})
