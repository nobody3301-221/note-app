//=====================================
// カモフラージュ（電卓）ロジック
//=====================================
const display = document.getElementById('display');
const SECRET_CODE = '777*0.07=';

if (display) {
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
            initiateProtocol();
            return;
        }
        
        // 通常の計算ロジック
        try {
            // eval()はセキュリティ上のリスクがあるため、本番環境では使用しないでください。
            // プロトタイプ作成用として使用します。
            display.value = eval(display.value.replace(/×/g, '*').replace(/÷/g, '/'));
        } catch (e) {
            display.value = 'Error';
        }
    }

    function clearDisplay() {
        display.value = '0';
    }

    function initiateProtocol() {
        document.body.classList.add('protocol-initiated');
        // 全ボタンを非表示にする（演出）
        document.querySelector('.buttons').style.display = 'none';
        display.value = 'ACCESS PROTOCOL INITIATED...';

        // 3秒後にスパイページへ遷移
        setTimeout(() => {
            window.location.href = 'spy.html';
        }, 3000);
    }

    // グローバルスコープに関数を公開 (index.htmlから呼び出せるように)
    window.appendToDisplay = appendToDisplay;
    window.calculate = calculate;
    window.clearDisplay = clearDisplay;
}


//=====================================
// スパイモード（localStorage）ロジック
//=====================================
const GEAR_KEY = 'shadow_note_gear';
const PERSON_KEY = 'shadow_note_person';

if (document.body.classList.contains('spy-mode')) {
    document.addEventListener('DOMContentLoaded', () => {
        loadData();

        // ギア登録フォームの処理
        const gearForm = document.getElementById('gear-form');
        gearForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('gear-name').value;
            const hint = document.getElementById('gear-hint').value;
            saveGear(name, hint);
            gearForm.reset();
        });

        // 人物登録フォームの処理
        const personForm = document.getElementById('person-form');
        personForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('person-name').value;
            const relation = document.getElementById('person-relation').value;
            const note = document.getElementById('person-note').value;
            savePerson(name, relation, note);
            personForm.reset();
        });
    });

    // ギアをローカルストレージに保存
    function saveGear(name, hint, lat = 'N/A', lon = 'N/A') {
        const gearList = JSON.parse(localStorage.getItem(GEAR_KEY) || '[]');
        gearList.push({ name, hint, lat, lon, timestamp: new Date().toLocaleString() });
        localStorage.setItem(GEAR_KEY, JSON.stringify(gearList));
        loadGear(); // リストを再表示
    }

    // 人物をローカルストレージに保存
    function savePerson(name, relation, note) {
        const personList = JSON.parse(localStorage.getItem(PERSON_KEY) || '[]');
        personList.push({ name, relation, note, timestamp: new Date().toLocaleString() });
        localStorage.setItem(PERSON_KEY, JSON.stringify(personList));
        loadPerson(); // リストを再表示
    }

    // ギアのデータを読み込み表示
    function loadGear() {
        const gearList = JSON.parse(localStorage.getItem(GEAR_KEY) || '[]');
        const listElement = document.getElementById('gear-list');
        listElement.innerHTML = ''; 

        gearList.forEach(gear => {
            const item = document.createElement('li');
            item.innerHTML = `**${gear.name}** (${gear.timestamp})<br> ヒント: ${gear.hint} | GPS: ${gear.lat}, ${gear.lon}`;
            listElement.appendChild(item);
        });
    }

    // 人物データを読み込み表示
    function loadPerson() {
        const personList = JSON.parse(localStorage.getItem(PERSON_KEY) || '[]');
        const listElement = document.getElementById('person-list');
        listElement.innerHTML = ''; 

        personList.forEach(person => {
            const item = document.createElement('li');
            item.innerHTML = `**${person.name}** - ${person.relation} (${person.timestamp})<br> <span style="color:#ff0000;">極秘メモ:</span> ${person.note}`;
            listElement.appendChild(item);
        });
    }
    
    // 現在地取得（GPS連携）
    function loadCurrentLocation() {
        const status = document.getElementById('location-status');
        status.textContent = 'LOCATION PROTOCOL INITIATED...';

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

    // 全データの読み込み
    function loadData() {
        loadGear();
        loadPerson();
    }
    
    window.loadCurrentLocation = loadCurrentLocation;
}
