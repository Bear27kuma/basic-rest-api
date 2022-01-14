const express = require('express');
const app = express();

// GETメソッド
app.get('/api/v1/hello', (req, res) => {
    res.json({
        "message": "Hello, World!"
    });
});

// 環境変数に記述されているポート番号を参照し、なければ3000に設定する
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log('Listen on port: ' + port);
});