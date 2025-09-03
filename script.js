```javascript
// Firebase konfiguratsiyasi (sizning loyiha ma'lumotlaringizni qo‘shing)
const firebaseConfig = {
    apiKey: "AIzaSyAYbHeM6nDZgIdYBbxtxQvx4S0npE8lRwk",
    authDomain: "requered.firebaseapp.com",
    databaseURL: "https://requered-default-rtdb.firebaseio.com",
    projectId: "requered",
    storageBucket: "requered.firebasestorage.app",
    messagingSenderId: "190052300320",
    appId: "1:190052300320:web:c81b8280922d86e9312e45",
    measurementId: "G-8HMEKXL9G3"
};

// Firebase'ni ishga tushirish
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// Ma'lumotlar bazasi uchun global ob'ekt
const db = {
    codes: {},
    adminKeys: new Set(['lamborghini1']),
    ownerPassword: 'lamborghini1'
};

// Firebase'dan ma'lumotlarni yuklash
function loadDb() {
    return database.ref('/').once('value').then(snapshot => {
        const data = snapshot.val();
        if (data) {
            db.codes = data.codes || {};
            db.adminKeys = new Set(data.adminKeys || ['lamborghini1']);
        }
    }).catch(error => {
        console.error('Ma\'lumotlarni yuklashda xato:', error);
    });
}

// Firebase'ga ma'lumotlarni saqlash
function saveDb() {
    database.ref('/').set({
        codes: db.codes,
        adminKeys: Array.from(db.adminKeys)
    }).catch(error => {
        console.error('Ma\'lumotlarni saqlashda xato:', error);
    });
}

// Dastlabki yuklash
document.addEventListener('DOMContentLoaded', () => {
    loadDb().then(() => {
        let userName = '';
        let currentCode = null;
        let userAnswers = [];
        let isOwner = false;
        let answerInputs = [];

        // DOM elementlari
        const userInfoSection = document.getElementById('user-info-section');
        const firstName = document.getElementById('first-name');
        const lastName = document.getElementById('last-name');
        const submitUserInfo = document.getElementById('submit-user-info');
        const mainSection = document.getElementById('main-section');
        const codeInput = document.getElementById('code-input');
        const submitCode = document.getElementById('submit-code');
        const errorMsg = document.getElementById('error-msg');
        const testSection = document.getElementById('test-section');
        const userAnswersList = document.getElementById('user-answers-list');
        const submitAnswers = document.getElementById('submit-answers');
        const resultSection = document.getElementById('result-section');
        const developerBtn = document.getElementById('developer-btn');
        const developerModal = document.getElementById('developer-modal');
        const devCodeInput = document.getElementById('dev-code-input');
        const submitDevCode = document.getElementById('submit-dev-code');
        const devErrorMsg = document.getElementById('dev-error-msg');
        const ownerSection = document.getElementById('owner-section');
        const adminSection = document.getElementById('admin-section');
        const addCodeBtn = document.getElementById('add-code-btn');
        const addAdminBtn = document.getElementById('add-admin-btn');
        const myCodesBtn = document.getElementById('my-codes-btn');
        const addCodeSection = document.getElementById('add-code-section');
        const newCode = document.getElementById('new-code');
        const answersList = document.getElementById('answers-list');
        const addAnswerTemplate = document.getElementById('add-answer-template');
        const saveCode = document.getElementById('save-code');
        const addAdminSection = document.getElementById('add-admin-section');
        const newAdminKey = document.getElementById('new-admin-key');
        const saveAdmin = document.getElementById('save-admin');
        const addCodeBtnAdmin = document.getElementById('add-code-btn-admin');
        const myCodesSection = document.getElementById('my-codes-section');
        const codesList = document.getElementById('codes-list');
        const backToOwner = document.getElementById('back-to-owner');
        const statsSection = document.getElementById('stats-section');
        const statsContent = document.getElementById('stats-content');
        const backToCodes = document.getElementById('back-to-codes');

        // Foydalanuvchi ma'lumotlari
        submitUserInfo.addEventListener('click', () => {
            const fn = firstName.value.trim();
            const ln = lastName.value.trim();
            if (fn && ln) {
                userName = `${fn} ${ln}`;
                userInfoSection.classList.add('hidden');
                mainSection.classList.remove('hidden');
            } else {
                alert('Ism va Familiya kiritish majburiy!');
            }
        });

        // Kodni tekshirish
        submitCode.addEventListener('click', () => {
            const code = codeInput.value.trim();
            if (db.codes[code]) {
                currentCode = code;
                errorMsg.classList.add('hidden');
                testSection.classList.remove('hidden');
                renderUserAnswerTemplates(db.codes[code].answers.length);
            } else {
                errorMsg.textContent = 'Xato kod kiritdingiz!';
                errorMsg.classList.remove('hidden');
            }
        });

        function renderUserAnswerTemplates(numQuestions) {
            userAnswersList.innerHTML = '';
            userAnswers = [];
            for (let i = 1; i <= numQuestions; i++) {
                const input = document.createElement('input');
                input.type = 'text';
                input.placeholder = `Savol ${i}`;
                input.classList.add('template-input');
                input.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter') {
                        const nextInput = input.nextElementSibling;
                        if (nextInput) nextInput.focus();
                    }
                });
                userAnswersList.appendChild(input);
                userAnswers.push(input);
            }
        }

        submitAnswers.addEventListener('click', () => {
            const correctAnswers = db.codes[currentCode].answers;
            const userInputs = userAnswers.map(input => input.value.trim().toLowerCase());
            let correctCount = 0;
            let resultList = [];
            let incorrectList = [];

            userInputs.forEach((ans, idx) => {
                if (ans === correctAnswers[idx]) {
                    correctCount++;
                    resultList.push(`<li class="correct">Savol ${idx + 1}: To'g'ri - ${correctAnswers[idx]}</li>`);
                } else {
                    resultList.push(`<li class="error">Savol ${idx + 1}: Xato - Sizning javobingiz: ${ans || 'bo\'sh'}</li>`);
                    incorrectList.push(`<li>Savol ${idx + 1}: Sizning javobingiz: ${ans || 'bo\'sh'}, <span class="correct-answer">To'g'ri javob: ${correctAnswers[idx]}</span></li>`);
                }
            });

            if (!db.codes[currentCode].usage) db.codes[currentCode].usage = [];
            db.codes[currentCode].usage.push({ user: userName, correct: correctCount, total: userInputs.length, date: new Date().toLocaleString() });
            saveDb();

            resultSection.innerHTML = `
                <h3 class="neon-text">Natija</h3>
                <p>Jami savollar: ${userInputs.length}</p>
                <p>To'g'ri javoblar: ${correctCount}</p>
                <p>Xato javoblar: ${userInputs.length - correctCount}</p>
                <h4>Barcha Natijalar:</h4>
                <ul>${resultList.join('')}</ul>
                ${incorrectList.length > 0 ? `
                    <h4 class="error">Noto'g'ri Javoblar:</h4>
                    <div id="incorrect-answers">
                        <ul>${incorrectList.join('')}</ul>
                    </div>
                ` : ''}
                <button id="back-to-test">Qayta Sinash</button>
            `;
            resultSection.classList.remove('hidden');
            userAnswersList.classList.add('hidden');
            submitAnswers.classList.add('hidden');
            testSection.querySelector('h2').classList.add('hidden');

            const backToTest = document.getElementById('back-to-test');
            backToTest.addEventListener('click', () => {
                resultSection.classList.add('hidden');
                userAnswersList.classList.remove('hidden');
                submitAnswers.classList.remove('hidden');
                testSection.querySelector('h2').classList.remove('hidden');
                renderUserAnswerTemplates(db.codes[currentCode].answers.length);
            });
        });

        // Developer bo'limi
        developerBtn.addEventListener('click', () => {
            developerModal.classList.remove('hidden');
        });

        submitDevCode.addEventListener('click', () => {
            const devCode = devCodeInput.value.trim();
            if (devCode === db.ownerPassword) {
                isOwner = true;
                showOwnerSection();
            } else if (db.adminKeys.has(devCode)) {
                isOwner = false;
                showAdminSection();
            } else {
                devErrorMsg.textContent = 'Xato parol kiritdingiz!';
                devErrorMsg.classList.remove('hidden');
            }
            devCodeInput.value = '';
        });

        function showOwnerSection() {
            devErrorMsg.classList.add('hidden');
            ownerSection.classList.remove('hidden');
            devCodeInput.parentElement.querySelector('h1').classList.add('hidden');
            devCodeInput.classList.add('hidden');
            submitDevCode.classList.add('hidden');
        }

        function showAdminSection() {
            devErrorMsg.classList.add('hidden');
            adminSection.classList.remove('hidden');
            devCodeInput.parentElement.querySelector('h1').classList.add('hidden');
            devCodeInput.classList.add('hidden');
            submitDevCode.classList.add('hidden');
        }

        addCodeBtn.addEventListener('click', showAddCodeSection);
        addCodeBtnAdmin.addEventListener('click', showAddCodeSection);

        function showAddCodeSection() {
            addCodeSection.classList.remove('hidden');
            if (isOwner) ownerSection.classList.add('hidden');
            else adminSection.classList.add('hidden');
            renderAnswerTemplates();
        }

        function renderAnswerTemplates() {
            answersList.innerHTML = '';
            answerInputs = [];
            addAnswerTemplate.click(); // Avtomatik birinchi inputni ochish
        }

        addAnswerTemplate.addEventListener('click', () => {
            const qNum = answerInputs.length + 1;
            const input = document.createElement('input');
            input.type = 'text';
            input.placeholder = `Savol ${qNum}`;
            input.classList.add('template-input');
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') addAnswerTemplate.click();
            });
            answersList.appendChild(input);
            answerInputs.push(input);
            input.focus();
        });

        saveCode.addEventListener('click', () => {
            const code = newCode.value.trim();
            if (code && answerInputs.length > 0) {
                const answers = answerInputs.map(input => input.value.trim().toLowerCase());
                if (answers.every(ans => ans)) {
                    db.codes[code] = { answers, usage: [] };
                    saveDb();
                    alert('Kod muvaffaqiyatli qo\'shildi!');
                    resetToDevMode();
                } else {
                    alert('Barcha javoblarni kiriting!');
                }
            } else {
                alert('Kod va kamida bitta javob kerak!');
            }
        });

        addAdminBtn.addEventListener('click', () => {
            if (isOwner) {
                addAdminSection.classList.remove('hidden');
                ownerSection.classList.add('hidden');
            }
        });

        saveAdmin.addEventListener('click', () => {
            const key = newAdminKey.value.trim();
            if (key) {
                db.adminKeys.add(key);
                saveDb();
                alert('Admin kaliti muvaffaqiyatli qo\'shildi!');
                resetToDevMode();
            } else {
                alert('Kalitni kiriting!');
            }
        });

        myCodesBtn.addEventListener('click', () => {
            ownerSection.classList.add('hidden');
            myCodesSection.classList.remove('hidden');
            renderCodesList();
        });

        function renderCodesList() {
            codesList.innerHTML = '';
            Object.keys(db.codes).forEach(code => {
                const btn = document.createElement('button');
                btn.textContent = code;
                btn.addEventListener('click', () => showStats(code));
                codesList.appendChild(btn);
            });
        }

        backToOwner.addEventListener('click', () => {
            myCodesSection.classList.add('hidden');
            ownerSection.classList.remove('hidden');
        });

        function showStats(code) {
            myCodesSection.classList.add('hidden');
            statsSection.classList.remove('hidden');
            const usage = db.codes[code].usage || [];
            let totalUsers = usage.length;
            let totalCorrect = usage.reduce((sum, u) => sum + (u.correct || 0), 0);
            let details = usage.map(u => `<li>${u.user}: ${u.correct || 0} / ${u.total || 0} (${u.date})</li>`).join('');

            statsContent.innerHTML = `
                <p>Foydalanuvchilar soni: ${totalUsers}</p>
                <p>Jami to'g'ri javoblar: ${totalCorrect}</p>
                <ul>${details}</ul>
            `;
        }

        backToCodes.addEventListener('click', () => {
            statsSection.classList.add('hidden');
            myCodesSection.classList.remove('hidden');
        });

        function resetToDevMode() {
            addCodeSection.classList.add('hidden');
            addAdminSection.classList.add('hidden');
            newCode.value = '';
            newAdminKey.value = '';
            answerInputs.forEach(input => input.remove());
            answerInputs = [];
            if (isOwner) ownerSection.classList.remove('hidden');
            else adminSection.classList.remove('hidden');
        }

        // Modalni yopish
        window.addEventListener('click', (e) => {
            if (e.target === developerModal) {
                developerModal.classList.add('hidden');
                resetToDevMode();
                devCodeInput.value = '';
                devErrorMsg.classList.add('hidden');
                devCodeInput.parentElement.querySelector('h1').classList.remove('hidden');
                devCodeInput.classList.remove('hidden');
                submitDevCode.classList.remove('hidden');
            }
        });
    });
});
