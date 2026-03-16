let seciliTur = 'silahli', seciliMod = 'sureli', cevapAnahtari = [], ogrenciCevaplari = [], index = 0, dogruS = 0, sure = 165 * 60, timer;

// 5 Saniye GIF Bekletme ve Veri Yükleme
window.onload = () => {
    setTimeout(() => {
        document.getElementById('splash').style.fadeOut = "slow"; // Görsel geçiş efekti
        document.getElementById('splash').style.display = 'none';
        document.getElementById('main-header').style.display = 'flex';
        document.getElementById('entry-screen').style.display = 'block';
        document.body.style.overflow = 'auto'; // Kaydırmayı aç
    }, 5000); // TAM 5 SANİYE

    const data = localStorage.getItem('anfa_v3');
    if(data) cevapAnahtari = JSON.parse(data);
};

function setTur(t) { 
    seciliTur = t; 
    document.getElementById('opt-silahli').classList.toggle('active', t==='silahli');
    document.getElementById('opt-silahsiz').classList.toggle('active', t==='silahsiz');
}

function setMod(m) { 
    seciliMod = m; 
    document.getElementById('opt-sureli').classList.toggle('active', m==='sureli');
    document.getElementById('opt-suresiz').classList.toggle('active', m==='suresiz');
}

function sinaviBaslat() {
    if(cevapAnahtari.length < 10) return alert("Admin panelinden cevapları girin (Şifre: anfa2026)");
    aktifSorular = seciliTur === 'silahli' ? cevapAnahtari : cevapAnahtari.slice(0, 100);
    document.getElementById('entry-screen').style.display = 'none';
    document.getElementById('quiz-screen').style.display = 'block';
    if(seciliMod === 'sureli') baslatTimer();
}

function cevapla(secim, element) {
    const dogruCevap = aktifSorular[index];
    const butonlar = document.querySelectorAll('.opt-btn');
    document.getElementById('options-container').style.pointerEvents = 'none';

    if(secim === dogruCevap) {
        element.classList.add('correct');
        dogruS++;
    } else {
        element.classList.add('wrong');
        butonlar.forEach(btn => { if(btn.innerText === dogruCevap) btn.classList.add('correct'); });
    }

    ogrenciCevaplari.push({ s: index+1, m: secim, d: dogruCevap });

    // 1.2 SANİYE SONRA DİĞER SORUYA GEÇ
    setTimeout(() => {
        butonlar.forEach(btn => btn.classList.remove('correct', 'wrong'));
        document.getElementById('options-container').style.pointerEvents = 'auto';
        index++;
        if(index >= aktifSorular.length) sinavBitir();
        else document.getElementById('q-counter').innerText = "Soru: " + (index + 1);
    }, 1200);
}

function sinavBitir() {
    clearInterval(timer);
    alert(`Sınav Bitti! Doğru: ${dogruS}`);
    location.reload();
}

function pencereAc() {
    window.open('sorular.pdf', '_blank'); // Klasör yolu kaldırıldı
}

function toggleMenu() { document.getElementById('side-menu').classList.toggle('active'); }
function adminGiris() { if(prompt("Şifre:") === "anfa2026") document.getElementById('admin-modal').style.display='flex'; }
function closeAdmin() { document.getElementById('admin-modal').style.display='none'; }
function kaydetAdmin() {
    const val = document.getElementById('cevap-input').value.toUpperCase().replace(/\s/g, '');
    localStorage.setItem('anfa_v3', JSON.stringify(val.split('')));
    alert("Kaydedildi!");
    location.reload();
}

function baslatTimer() {
    timer = setInterval(() => {
        sure--;
        let m = Math.floor(sure / 60), s = sure % 60;
        document.getElementById('timer').innerText = `${m}:${s < 10 ? '0'+s : s}`;
        if(sure <= 0) sinavBitir();
    }, 1000);
}
