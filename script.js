//=====================================
// グローバル設定
//=====================================
const display = document.getElementById('display');
const SECRET_CODE = '777*0.07=';
const GEAR_KEY = 'shadow_note_gear';
const PERSON_KEY = 'shadow_note_person';
const FAKE_PASSWORD = '1234'; // フェイクパスワード

//=====================================
// カモフラージュ（電卓）ロジック
// (機能 1, 4, 5 に対応)
//=====================================
if (display) {
    // === 機能 4: トラップ機能（緊急終了） ===
    function killswitch() {
        if (confirm("全てのローカルデータとセッション履歴を即座に破棄し、システムを終了しますか？")) {
            localStorage.clear(); // 全データ破棄
            window.close(); // ブラウザタブを閉じる (多くのブラウザでユーザー操作なしには動作しないが、試みる)
            window.location.href = 'about:blank'; // ブランクページへリダイレクト
        }
    }
    // 隠しコマンド実行時にパスワード入力画面の代わりにこの関数を呼び出す設定も可能

    function appendToDisplay(value) {
        if (display.value === '0' || display.value === 'Error') {
            display.value = value;
        } else {
            display.value += value;
        }
    }

    function calculate() {
        const fullInput = display.value + '=';
        
        // 隠しコマンドをチェック
        if (fullInput === SECRET_CODE) {
            // === 機能 1: 二重カモフラージュ ===
            // 認証の前に、偽のエラー画面を呼び出す
            displayFakeErrorScreen();
            return;
        }

        // === 機能 4: トラップ機能（トラップコード） ===
        if (display.value === FAKE_PASSWORD) {
            alert('認証に失敗しました。電卓を再起動します。');
            clearDisplay();
            return;
        }
        
        // 通常の計算ロジック
        try {
            display.value = eval(display.value.replace(/×/g, '*').replace(/÷/g, '/'));
        } catch (e) {
            display.value = 'Error';
        }
    }

    function clearDisplay() {
        display.value = '0';
    }

    // === 機能 1: 偽のエラー画面表示 ===
    function displayFakeErrorScreen() {
        document.body.classList.add('error-mode');
        // 全ボタンを非表示
        document.querySelector('.buttons').style.display = 'none'; 
        display.value = 'SYSTEM ERROR 0x80070002. UPDATE REQUIRED. TAP ERROR CODE.';
        
        // エラーコードをタップ（クリック）すると、本物の認証プロトコルを開始
        display.onclick = initiateProtocol;
    }

    function initiateProtocol() {
        // エラー画面クリック後の処理を元に戻す
        display.onclick = null; 
        
        document.body.classList.remove('error-mode');
        document.body.classList.add('protocol-initiated');

        display.value = 'ACCESS PROTOCOL INITIATED...';

        // 3秒後にスパイページへ遷移
        setTimeout(() => {
            window.location.href = 'spy.html';
        }, 3000);
    }

    // グローバルスコープに関数を公開
    window.appendToDisplay = appendToDisplay;
    window.calculate = calculate;
    window.clearDisplay = clearDisplay;
    window.killswitch = killswitch; // 緊急終了ボタンを呼び出せるように公開
}


//=====================================
// スパイモード（localStorage）ロジック
// (機能 9, 19 に対応)
//=====================================
if (document.body.classList.contains('spy-mode')) {
    
    document.addEventListener('DOMContentLoaded', () => {
        loadData();

        // ギア登録フォームの処理
        const gearForm = document.getElementById('gear-form');
        if (gearForm) {
            gearForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const name = document.getElementById('gear-name').value;
                const hint = document.getElementById('gear-hint').value;
                const level = document.getElementById('gear-level').value; // 機能 9: 機密レベル取得
                saveGear(name, hint, level);
                gearForm.reset();
            });
        }

        // 人物登録フォームの処理（省略：ギア登録と類似）
        const personForm = document.getElementById('person-form');
        if (personForm) {
            personForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const name = document.getElementById('person-name').value;
                const relation = document.getElementById('person-relation').value;
                const note = document.getElementById('person-note').value;
                const level = document.getElementById('person-level').value; // 機能 9: 機密レベル取得
                savePerson(name, relation, note, level);
                personForm.reset();
            });
        }
    });

    // === 機能 19: ブラウザ履歴のクリーニング警告 ===
    // ログアウトまたはタブを閉じようとしたときに警告
    window.addEventListener('beforeunload', function (e) {
        const message = '機密セッションがアクティブです。履歴とキャッシュのクリアを忘れないでください。';
        e.returnValue = message; 
        return message; 
    });

    // === 機能 9: 機密レベル付きでギアを保存 ===
    function saveGear(name, hint, level, lat = 'N/A', lon = 'N/A') {
        const gearList = JSON.parse(localStorage.getItem(GEAR_KEY) || '[]');
        gearList.push({ name, hint, level, lat, lon, timestamp: new Date().toLocaleString() });
        localStorage.setItem(GEAR_KEY, JSON.stringify(gearList));
        loadGear();
    }

    // === 機能 9: 機密レベル付きで人物を保存 ===
    function savePerson(name, relation, note, level) {
        const personList = JSON.parse(localStorage.getItem(PERSON_KEY) || '[]');
        personList.push({ name, relation, note, level, timestamp: new Date().toLocaleString() });
        localStorage.setItem(PERSON_KEY, JSON.stringify(personList));
        loadPerson();
    }

    // ギアのデータを読み込み表示
    function loadGear() {
        const gearList = JSON.parse(localStorage.getItem(GEAR_KEY) || '[]');
        const listElement = document.getElementById('gear-list');
        if (!listElement) return;

        listElement.innerHTML = ''; 
        gearList.forEach(gear => {
            const item = document.createElement('li');
            const color = getLevelColor(gear.level); // 機能 9: 色取得
            item.innerHTML = `<span style="color:${color};">[${gear.level}]</span> **${gear.name}** (${gear.timestamp})<br> ヒント: ${gear.hint} | GPS: ${gear.lat}, ${gear.lon}`;
            listElement.appendChild(item);
        });
    }

    // 人物データを読み込み表示
    function loadPerson() {
        const personList = JSON.parse(localStorage.getItem(PERSON_KEY) || '[]');
        const listElement = document.getElementById('person-list');
        if (!listElement) return;
        
        listElement.innerHTML = ''; 
        personList.forEach(person => {
            const item = document.createElement('li');
            const color = getLevelColor(person.level); // 機能 9: 色取得
            item.innerHTML = `<span style="color:${color};">[${person.level}]</span> **${person.name}** - ${person.relation} (${person.timestamp})<br> <span style="color:#ff0000;">極秘メモ:</span> ${person.note}`;
            listElement.appendChild(item);
        });
    }

    // === 機能 9: 機密レベルに応じた色の決定 ===
    function getLevelColor(level) {
        switch (level) {
            case 'TOP_SECRET': return '#ff0000'; // 赤
            case 'SECRET': return '#ff9900';   // オレンジ
            case 'CONFIDENTIAL': return '#00ff00'; // 緑
            default: return '#00ff00';
        }
    }
    
    // 現在地取得（GPS連携）
    function loadCurrentLocation() {
        const status = document.getElementById('location-status');
        if (!status) return;
        
        // === 機能 5: 環境要因チェック演出 ===
        // ダミーの環境チェック演出
        status.innerHTML = 'ANALYZING AMBIENT NOISE...';
        setTimeout(() => {
            status.innerHTML = 'LIGHT EXPOSURE: LOW. ACCESS GRANTED.';
            getRealGeolocation(status);
        }, 1500); 
    }
    
    function getRealGeolocation(status) {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const lat = position.coords.latitude.toFixed(6);
                    const lon = position.coords.longitude.toFixed(6);
                    status.innerHTML = `<span style="color:#00cc00;">GPS ACQUIRED:</span> LAT ${lat}, LON ${lon}`;
                },
                (error) => {
                    status.innerHTML = `<span style="color:#ff0000;">GPS FAILED:</span> ${error.message}`;
                },
                { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
            );
        } else {
            status.innerHTML = '<span style="color:#ff0000;">GPS UNAVAILABLE</span>';
        }
    }

    function loadData() {
        loadGear();
        loadPerson();
    }
    
    window.loadCurrentLocation = loadCurrentLocation;
}
