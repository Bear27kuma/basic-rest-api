// 即時関数でモジュール化
const usersModule = (() => {
    const BASE_URL = 'http://localhost:3000/api/v1/users';

    // ヘッダーの設定
    const headers = new Headers();
    headers.set("Content-Type", "application/json");

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

            const resJson = await res.json();

            // レスポンスが完了したらalertでメッセージを表示する
            alert(resJson.message);
            window.location.href = '/';
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

            const resJson = await res.json();

            alert(resJson.message);
            window.location.href = '/';
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

                const resJson = await res.json();
                alert(resJson.message);
                window.location.href = '/';
            }
        }
    }
})();