// 必要パッケージのインポート
const express = require('express');
const app = express();
const sqlite3 = require('sqlite3');
const path = require('path');
const bodyParser = require('body-parser');

const dbPath = 'app/db/database.sqlite3'

// リクエストのbodyをパースする設定
app.use(bodyParser.urlencoded({extended: true}));
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
        if (!row) {
            res.status(404).send({error: "Not Found!"})
        } else {
            res.status(200).json(row);
        }
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

// DBクエリ実行用の共通関数
const run = async (sql, db) => {
    // Promiseを返す = resolve()かreject()まで完了を待つ
    return new Promise((resolve, reject) => {
        db.run(sql, (err) => {
            if (err) {
                return reject(err);
            } else {
                return resolve();
            }
        });
    });
}

// POSTメソッド（Create a new user）
app.post('/api/v1/users', async (req, res) => {
    if (!req.body.name || req.body.name === "") {
        res.status(400).send({error: "ユーザー名が指定されていません。"});
    } else {
        const db = new sqlite3.Database(dbPath);

        // bodyの中の各値を取得する
        const name = req.body.name;
        const profile = req.body.profile ? req.body.profile : "";
        const dataOfBirth = req.body.date_of_birth ? req.body.date_of_birth : "";

        // 例外処理を実行するための構文
        try {
            // DBクエリを実行する
            await run(`INSERT INTO users (name, profile, date_of_birth) VALUES ("${name}", "${profile}", "${dataOfBirth}")`, db);
            res.status(201).send({message: "新規ユーザーを作成しました。"})
        } catch (e) {
            res.status(500).send({error: e})
        }

        db.close();
    }
});

// PUTメソッド（Update user data）
app.put('/api/v1/users/:id', async (req, res) => {
    if (!req.body.name || req.body.name === "") {
        res.status(400).send({error: "ユーザー名が指定されていません。"});
    } else {
        const db = new sqlite3.Database(dbPath);
        const id = req.params.id;

        // 現在のユーザー情報を取得する → 更新する値がなければ元の値をそのまま保持する
        db.get(`SELECT * FROM users WHERE id = ${id}`, async (err, row) => {
            // idが存在しなかった場合のエラーハンドリング
            if (!row) {
                res.status(404).send({error: "指定されたユーザーが見つかりません。"});
            } else {
                const name = req.body.name ? req.body.name : row.name;
                const profile = req.body.profile ? req.body.profile : row.profile;
                const dataOfBirth = req.body.date_of_birth ? req.body.date_of_birth : row.date_of_birth;

                try {
                    // DBクエリを実行する
                    await run(`UPDATE users SET name="${name}", profile="${profile}", date_of_birth="${dataOfBirth}" WHERE id=${id}`, db);
                    res.status(200).send({message: "ユーザー情報を更新しました。"});
                } catch (e) {
                    res.status(500).send({error: e});
                }
            }
        });

        db.close();
    }
});

// DELETEメソッド（Delete a user）
app.delete('/api/v1/users/:id', async (req, res) => {
    const db = new sqlite3.Database(dbPath);
    const id = req.params.id;

    // 現在のユーザー情報を取得する → 削除対象のユーザーがいるかどうか確認する
    db.get(`SELECT * FROM users WHERE id = ${id}`, async (err, row) => {
        // idが存在しなかった場合のエラーハンドリング
        if (!row) {
            res.status(404).send({error: "指定されたユーザーが見つかりません。"});
        } else {
            try {
                // DBクエリを実行する
                await run(`DELETE FROM users WHERE id=${id}`, db);
                res.status(200).send({message: "ユーザーを削除しました。"});
            } catch (e) {
                res.status(500).send({error: e});
            }
        }
    });

    db.close();
});

// 環境変数に記述されているポート番号を参照し、なければ3000に設定する
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log('Listen on port: ' + port);
});