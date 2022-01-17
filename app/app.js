// 必要パッケージのインポート
const express = require('express');
const app = express();
const sqlite3 = require('sqlite3');
const path = require('path');
const bodyParser = require('body-parser');

const dbPath = 'app/db/database.sqlite3'

// リクエストのbodyをパースする設定
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// 静的ファイルのルートディレクトリを設定
app.use(express.static(path.join(__dirname, 'public')));

// GETメソッド（Get all users）
app.get('/api/v1/users', (req, res) => {
    // データベースに接続する
    const db = new sqlite3.Database(dbPath);

    db.all('SELECT * FROM users', (err, rows) => {
        res.json(rows);
    });

    db.close();
});

// GETメソッド（Get a user）
app.get('/api/v1/users/:id', (req, res) => {
    const db = new sqlite3.Database(dbPath);
    const id = req.params.id;

    db.get(`SELECT * FROM users WHERE id = ${id}`, (err, row) => {
        res.json(row);
    });

    db.close();
});

// GETメソッド（Search users with matching keyword）
app.get('/api/v1/search', (req, res) => {
    const db = new sqlite3.Database(dbPath);
    const keyword = req.query.q;

    db.all(`SELECT * FROM users WHERE name LIKE "%${keyword}%"`, (err, rows) => {
        res.json(rows);
    });

    db.close();
});

// POSTメソッド（Create a new user）
app.post('/api/v1/users', async (req, res) => {
    const db = new sqlite3.Database(dbPath);

    // bodyの中の各値を取得する
    const name = req.body.name;
    const profile = req.body.profile ? req.body.profile : "";
    const dataOfBirth = req.body.date_of_birth ? req.body.date_of_birth : "";

    // DBクエリ実行用の関数
    const run = async (sql) => {
        // Promiseを返す = resolve()かreject()まで完了を待つ
        return new Promise((resolve, reject) => {
            db.run(sql, (err) => {
                if (err) {
                    // SQL実行失敗 → サーバーエラー
                    res.status(500).send(err);
                    return reject();
                } else {
                    res.json({ message: "新規ユーザーを作成しました！" });
                    return resolve();
                }
            });
        });
    }

    // DBクエリを実行する
    await run(`INSERT INTO users (name, profile, date_of_birth) VALUES ("${name}", "${profile}", "${dataOfBirth}")`);
    db.close();
});

// 環境変数に記述されているポート番号を参照し、なければ3000に設定する
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log('Listen on port: ' + port);
});