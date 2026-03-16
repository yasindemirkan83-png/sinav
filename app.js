let index = 0, dogruS = 0, sure = 165*60, timer, aktifSorular = [], cevapAnahtari = [], ogrenciCevaplari = [];
let tur = 'silahli', mod = 'sureli';

window.onload = () => {
    // Splash
    setTimeout(() => {
        document.getElementById('splash').style.display = 'none';
        document.getElementById('main-header').style.display = 'flex';
        document.getElementById('entry-screen').style.display = 'block';
    }, 5000);

    // Hafızadan Yükle
    const saved = localStorage.getItem('anfa_v5');
    if(saved) {
        const data = JSON.parse(saved);
        cevapAnahtari = data.cevaplar;
    }
};

function setTur(t) { tur = t; toggleClass('opt-silahli', 'opt-silahsiz', t === 'silahli'); }
function setMod(m) { mod = m; toggleClass('opt-sureli', 'opt-suresiz', m === 'sureli'); }
function toggleClass(id1, id2, isFirst) {
    document.getElementById(id1).classList.toggle('active', isFirst);
    document.getElementById(id2).classList.toggle('active', !isFirst);
}

function sinaviBaslat() {
    if(cevapAnahtari.length < 10) return alert("Önce Editörden cevapları girin!");
    aktifSorular = (tur === 'silahli') ? cevapAnahtari : cevapAnahtari.slice(0, 100);
    
    document.getElementById('entry-screen').style.display = 'none';
    document.getElementById('quiz-screen').style.display = 'block';
    
    if(mod === 'sureli') baslatTimer();
    soruGoster();
}

function soruGoster() {
    // Dinamik Resim Yükleme (1.jpg, 2.jpg...)
    document.getElementById('q-img').src = (index + 1) + ".jpg";
    document.getElementById('q-counter').innerText = `Soru: ${index + 1} / ${aktifSorular.length}`;
}

function cevapla(secim, btn) {
    const dogrumu = (secim === aktifSorular[index]);
    const butonlar = document.querySelectorAll('.choice-btn');
    document.getElementById('options-parent').style.pointerEvents = 'none';

    if(dogrumu) {
        btn.classList.add('correct');
        dogruS++;
    } else {
        btn.classList.add('wrong');
        butonlar.forEach(b => { if(b.innerText === aktifSorular[index]) b.classList.add('correct'); });
    }

    setTimeout(() => {
        butonlar.forEach(b => b.classList.remove('correct', 'wrong'));
        document.getElementById('options-parent').style.pointerEvents = 'auto';
        index++;
        if(index < aktifSorular.length) soruGoster(); else sinavBitir();
    }, 1200);
}

function sinavBitir() {
    clearInterval(timer);
    alert(`Sınav Bitti! Doğru Sayınız: ${dogruS}`);
    location.reload();
}

// Admin / Editör Fonksiyonları
function adminGiris() { if(prompt("Şifre:") === "anfa2026") document.getElementById('admin-panel').style.display='flex'; }
function closeAdmin() { document.getElementById('admin-panel').style.display='none'; }
function kaydetAdmin() {
    const vals = document.getElementById('cevap-anahtari-input').value.toUpperCase().replace(/\s/g, '');
    localStorage.setItem('anfa_v5', JSON.stringify({cevaplar: vals.split('')}));
    alert("Sınav Güncellendi!");
    location.reload();
}

function baslatTimer() {
    timer = setInterval(() => {
        sure--;
        let m = Math.floor(sure/60), s = sure%60;
        document.getElementById('timer').innerText = `${m}:${s<10?'0'+s:s}`;
        if(sure<=0) sinavBitir();
    }, 1000);
}

function toggleMenu() { document.getElementById('side-menu').classList.toggle('active'); }
