//=====================================
// グローバル設定
//=====================================
const display = document.getElementById('display');
const SECRET_CODE = '777*0.07=';
const GEAR_KEY = 'shadow_note_gear';
const PERSON_KEY = 'shadow_note_person';
const OPERATION_DROP_KEY = 'shadow_note_missions'; // 新しい指令キー
const FAKE_PASSWORD = '1234'; 
let selfDestructTimer = null; // タイマーIDを保持

//=====================================
// カモフラージュ（電卓）ロジック
// (機能 1, 4, 5 に対応)
//=====================================
if (display) {
    // === 機能 4: トラップ機能（緊急終了） ===
    function killswitch() {
        if (confirm("全てのローカルデータとセッション履歴を即座に破棄し、システムを終了しますか？")) {
            localStorage.clear(); 
            window.location.href = 'about:blank';
        }
    }

    function appendToDisplay(value) {
        if (display.value === '0' || display.value === 'Error') {
            display.value = value;
        } else {
            display.value += value;
        }
    }

    function calculate() {
        const fullInput = display.value + '=';
        
        if (fullInput === SECRET_CODE) {
            // === 機能 1: 二重カモフラージュ ===
            displayFakeErrorScreen();
            return;
        }

        if (display.value === FAKE_PASSWORD) {
            alert('認証に失敗しました。電卓を再起動します。');
            clearDisplay();
            return;
        }
        
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
        document.querySelector('.buttons').style.display = 'none'; 
        display.value = 'SYSTEM ERROR 0x80070002. UPDATE REQUIRED. TAP ERROR CODE.';
        display.onclick = initiateProtocol;
    }

    function initiateProtocol() {
        display.onclick = null; 
        document.body.classList.remove('error-mode');
        document.body.classList.add('protocol-initiated');
        display.value = 'ACCESS PROTOCOL INITIATED...';
        document.querySelector('.calculator').style.backgroundColor = '#0a0a0a'; 

        setTimeout(() => {
            window.location.href = 'spy.html';
        }, 3000);
    }

    // グローバルスコープに関数を公開
    window.appendToDisplay = appendToDisplay;
    window.calculate = calculate;
    window.clearDisplay = clearDisplay;
    window.killswitch = killswitch; 
}


//=====================================
// スパイモード（localStorage）ロジック
//=====================================
if (document.body.classList.contains('spy-mode')) {
    
    document.addEventListener('DOMContentLoaded', () => {
        loadData();

        // ギア/人物/指令フォームの処理
        const gearForm = document.getElementById('gear-form');
        if (gearForm) {
            gearForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const name = document.getElementById('gear-name').value;
                const hint = document.getElementById('gear-hint').value;
                const level = document.getElementById('gear-level').value; 
                saveGear(name, hint, level);
                gearForm.reset();
            });
        }

        const personForm = document.getElementById('person-form');
        if (personForm) {
            personForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const name = document.getElementById('person-name').value;
                const relation = document.getElementById('person-relation').value;
                const note = document.getElementById('person-note').value;
                const level = document.getElementById('person-level').value; 
                savePerson(name, relation, note, level);
                personForm.reset();
            });
        }
        
        // --- 指令フォームの処理 ---
        const missionForm = document.getElementById('mission-form');
        if (missionForm) {
            missionForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const title = document.getElementById('mission-title').value;
                const content = document.getElementById('mission-content').value;
                const ttl = parseInt(document.getElementById('mission-ttl').value);
                saveMission(title, content, ttl);
                missionForm.reset();
            });
        }
    });

    // === 機能 19: ブラウザ履歴のクリーニング警告 ===
    window.addEventListener('beforeunload', function (e) {
        const message = '機密セッションがアクティブです。履歴とキャッシュのクリアを忘れないでください。';
        e.returnValue = message; 
        return message; 
    });
    
    // --- 指令機能のロジック ---
    
    function saveMission(title, content, ttl) {
        const missionList = JSON.parse(localStorage.getItem(OPERATION_DROP_KEY) || '[]');
        const id = Date.now();
        missionList.push({ id, title, content, ttl, timestamp: new Date().toLocaleString() });
        localStorage.setItem(OPERATION_DROP_KEY, JSON.stringify(missionList));
        loadMission();
    }
    
    function loadMission() {
        const missionList = JSON.parse(localStorage.getItem(OPERATION_DROP_KEY) || '[]');
        const listElement = document.getElementById('mission-list');
        if (!listElement) return;

        listElement.innerHTML = ''; 
        missionList.forEach(mission => {
            const item = document.createElement('li');
            item.innerHTML = `<a href="#" onclick="startSelfDestruct(${mission.id}, ${mission.ttl}, '${mission.title}', '${btoa(mission.content)}'); return false;">[ACCESS] ${mission.title} (${mission.timestamp})</a>`;
            listElement.appendChild(item);
        });
    }
    
    function deleteMission(id) {
        let missionList = JSON.parse(localStorage.getItem(OPERATION_DROP_KEY) || '[]');
        missionList = missionList.filter(mission => mission.id !== id);
        localStorage.setItem(OPERATION_DROP_KEY, JSON.stringify(missionList));
        loadMission();
    }
    
    function startSelfDestruct(id, ttl, title, encodedContent) {
        if (selfDestructTimer) {
            alert('他の指令が既にアクティブです。');
            return;
        }
        if (!confirm(`機密指令 ${title} を開始します。自爆タイマー: ${ttl}秒。よろしいですか？`)) {
            return;
        }

        const missionListElement = document.getElementById('mission-list');
        const viewer = document.getElementById('mission-viewer');
        const timerDisplay = document.getElementById('mission-timer');
        const content = atob(encodedContent); // Base64デコード

        // 指令表示エリアの準備
        missionListElement.style.display = 'none'; // リストを隠す
        viewer.style.display = 'block';
        document.getElementById('viewer-title').textContent = title;
        document.getElementById('viewer-content').textContent = content;
        
        // タイマー開始
        let timeLeft = ttl;
        timerDisplay.textContent = `!!! ACTIVATED: ${timeLeft} SECONDS !!!`;
        
        selfDestructTimer = setInterval(() => {
            timeLeft--;
            if (timeLeft <= 0) {
                clearInterval(selfDestructTimer);
                initiateSelfDestructSequence(id);
                return;
            }
            
            // 警告演出
            if (timeLeft <= 5) {
                 timerDisplay.style.color = 'yellow';
                 viewer.style.boxShadow = `0 0 10px red`;
            }

            timerDisplay.textContent = `!!! ACTIVATED: ${timeLeft} SECONDS !!!`;
        }, 1000);
    }
    
    function initiateSelfDestructSequence(id) {
        const viewer = document.getElementById('mission-viewer');
        const timerDisplay = document.getElementById('mission-timer');
        const missionListElement = document.getElementById('mission-list');

        // 自爆演出
        viewer.style.display = 'block';
        viewer.classList.add('self-destruct-glitch');
        timerDisplay.textContent = '!!! SELF-DESTRUCT INITIATED !!!';
        
        setTimeout(() => {
            // データ削除
            deleteMission(id);
            selfDestructTimer = null;
            
            // UIリセット
            viewer.style.display = 'none';
            viewer.classList.remove('self-destruct-glitch');
            timerDisplay.textContent = '';
            viewer.style.boxShadow = 'none';
            missionListElement.style.display = 'block';
            
            alert('指令ファイルは消滅しました。オペレーション完了。');
        }, 1500);
    }
    
    window.startSelfDestruct = startSelfDestruct; // HTMLから呼び出せるようにグローバル公開
    
    // --- 既存のギア/人物ロジック（変更なし） ---

    function saveGear(name, hint, level, lat = 'N/A', lon = 'N/A') {
        const gearList = JSON.parse(localStorage.getItem(GEAR_KEY) || '[]');
        gearList.push({ name, hint, level, lat, lon, timestamp: new Date().toLocaleString() });
        localStorage.setItem(GEAR_KEY, JSON.stringify(gearList));
        loadGear();
    }

    function savePerson(name, relation, note, level) {
        const personList = JSON.parse(localStorage.getItem(PERSON_KEY) || '[]');
        personList.push({ name, relation, note, level, timestamp: new Date().toLocaleString() });
        localStorage.setItem(PERSON_KEY, JSON.stringify(personList));
        loadPerson();
    }

    function loadGear() {
        const gearList = JSON.parse(localStorage.getItem(GEAR_KEY) || '[]');
        const listElement = document.getElementById('gear-list');
        if (!listElement) return;

        listElement.innerHTML = ''; 
        gearList.forEach(gear => {
            const item = document.createElement('li');
            const color = getLevelColor(gear.level); 
            item.innerHTML = `<span style="color:${color};">[${gear.level}]</span> **${gear.name}** (${gear.timestamp})<br> ヒント: ${gear.hint} | GPS: ${gear.lat}, ${gear.lon}`;
            listElement.appendChild(item);
        });
    }

    function loadPerson() {
        const personList = JSON.parse(localStorage.getItem(PERSON_KEY) || '[]');
        const listElement = document.getElementById('person-list');
        if (!listElement) return;
        
        listElement.innerHTML = ''; 
        personList.forEach(person => {
            const item = document.createElement('li');
            const color = getLevelColor(person.level);
            item.innerHTML = `<span style="color:${color};">[${person.level}]</span> **${person.name}** - ${person.relation} (${person.timestamp})<br> <span style="color:#ff0000;">極秘メモ:</span> ${person.note}`;
            listElement.appendChild(item);
        });
    }

    function getLevelColor(level) {
        switch (level) {
            case 'TOP_SECRET': return '#ff0000'; 
            case 'SECRET': return '#ff9900';   
            case 'CONFIDENTIAL': return '#00ff00'; 
            default: return '#00ff00';
        }
    }
    
    // --- 機能 5: 環境要因チェック演出 ---
    function loadCurrentLocation() {
        const status = document.getElementById('location-status');
        if (!status) return;
        
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
        loadMission();
    }
    
    window.loadCurrentLocation = loadCurrentLocation;
}
