// 即時関数でモジュール化
const usersModule = (() => {
    const BASE_URL = 'http://localhost:3000/api/v1/users';

    // ヘッダーの設定
    const headers = new Headers();
    headers.set("Content-Type", "application/json");

    const handleError = async (res) => {
        const resJson = await res.json();

        // レスポンスのステータスによって処理を振り分ける
        switch (res.status) {
            case 200:
                alert(resJson.message);
                window.location.href = '/';
                break;
            case 201:
                alert(resJson.message);
                window.location.href = '/';
                break;
            case 400:
                // リクエストのパラメータ間違い
                alert(resJson.error);
                break;
            case 404:
                // 指定したリソースが見つからない
                alert(resJson.error);
                break;
            case 500:
                // サーバー内部エラー
                alert(resJson.error);
                break;
            default:
                alert('何らかのエラーが発生しました。');
                break;
        }
    }

    return {
        // ユーザーを全件取得してテーブル列で返す
        fetchAllUsers: async () => {
            const res = await fetch(BASE_URL);
            const users = await res.json();

            // ユーザー情報の配列をループ処理で取り出す
            for (let i=0; i < users.length; i++) {
                const user = users[i];
                const body = `<tr>
                                <td>${user.id}</td>
                                <td>${user.name}</td>
                                <td>${user.profile}</td>
                                <td>${user.date_of_birth}</td>
                                <td>${user.created_at}</td>
                                <td>${user.updated_at}</td>
                                <td><a href="edit.html?uid=${user.id}">編集</a></td>
                              </tr>`;

                document.getElementById('users-list').insertAdjacentHTML('beforeend', body);
            }
        },

        // フォームの入力値からユーザーを作成する
        createUser: async () => {
            const name = document.getElementById('name').value;
            const profile = document.getElementById('profile').value;
            const dateOfBirth = document.getElementById('date-of-birth').value;

            // リクエストのbody
            const body = {
                name: name,
                profile: profile,
                date_of_birth: dateOfBirth
            }

            // メソッドをPOSTにしてfetchメソッドを実行する
            const res = await fetch(BASE_URL, {
                method: "POST",
                headers: headers,
                // bodyをJavaScriptオブジェクトからJSONオブジェクトに変換する
                body: JSON.stringify(body)
            });

            return handleError(res);
        },

        // 既存のユーザー情報をセットする
        setExistingValue: async (uid) => {
            const res = await fetch(BASE_URL + '/' + uid);
            const resJson = await res.json();

            // 各値をinputタグにセットする
            document.getElementById('name').value = resJson.name;
            document.getElementById('profile').value = resJson.profile;
            document.getElementById('date-of-birth').value = resJson.date_of_birth;
        },

        // フォームの入力値からユーザー情報を編集する
        saveUser: async (uid) => {
            const name = document.getElementById('name').value;
            const profile = document.getElementById('profile').value;
            const dateOfBirth = document.getElementById('date-of-birth').value;

            const body = {
                name: name,
                profile: profile,
                date_of_birth: dateOfBirth
            }

            // メソッドをPUTにしてfetchメソッドを実行する
            const res = await fetch(BASE_URL + '/' + uid, {
                method: "PUT",
                headers: headers,
                body: JSON.stringify(body)
            });

            return handleError(res);
        },

        // ユーザーを削除する
        deleteUser: async (uid) => {
            const confirm = window.confirm('このユーザーを削除しますか？');

            if (!confirm) {
                return false
            } else {
                // メソッドをDELETEにしてfetchメソッドを実行する
                const res = await fetch(BASE_URL + '/' + uid, {
                    method: "DELETE",
                    headers: headers,
                });

                return handleError(res);
            }
        }
    }
})();