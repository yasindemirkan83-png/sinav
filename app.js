let seciliTur = 'silahli', seciliMod = 'sureli', cevapAnahtari = [], ogrenciCevaplari = [], index = 0, dogruS = 0, sure = 165 * 60, timer;

// 5 Saniyelik Splash Ekranı
window.onload = () => {
    setTimeout(() => {
        document.getElementById('splash').style.display = 'none';
        document.getElementById('main-header').style.display = 'flex';
        document.getElementById('entry-screen').style.display = 'block';
    }, 5000); // 5 saniye ayarlandı

    // GitHub'dan veya Localden geri yükleme
    const saved = localStorage.getItem('anfa_keys');
    if(saved) cevapAnahtari = JSON.parse(saved);
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
    if(cevapAnahtari.length < 100) return alert("Sistemde soru yok! Admin panelinden cevapları girin.");
    aktifSorular = seciliTur === 'silahli' ? cevapAnahtari : cevapAnahtari.slice(0, 100);
    document.getElementById('entry-screen').style.display = 'none';
    document.getElementById('quiz-screen').style.display = 'block';
    if(seciliMod === 'sureli') baslatTimer();
}

function cevapla(secim, element) {
    const dogruCevap = aktifSorular[index];
    const butonlar = document.querySelectorAll('.opt-btn');
    
    // Tıklamayı kilitle (1.2 saniye boyunca tekrar basılmasın)
    document.getElementById('options-container').style.pointerEvents = 'none';

    if(secim === dogruCevap) {
        element.classList.add('correct');
        dogruS++;
    } else {
        element.classList.add('wrong');
        // Doğru olanı da göster
        butonlar.forEach(btn => { if(btn.innerText === dogruCevap) btn.classList.add('correct'); });
    }

    ogrenciCevaplari.push({ s: index+1, m: secim, d: dogruCevap });

    // 1.2 Saniye Bekle ve Sonraki Soruya Geç
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
    let rapor = `ANFA ÖGG RAPOR\nDoğru: ${dogruS}\nYanlış: ${aktifSorular.length - dogruS}\n\nDetaylar:\n`;
    ogrenciCevaplari.forEach(x => rapor += `Soru ${x.s}: Senin:${x.m} | Doğru:${x.d}\n`);
    
    const blob = new Blob([rapor], {type: 'text/plain'});
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = "Anfa_Basari_Raporu.txt";
    link.click();
    
    alert("Sınav bitti! Rapor indirildi.");
    location.reload();
}

function pencereAc() { window.open('sinav.pdf', '_blank'); }
function toggleMenu() { document.getElementById('side-menu').classList.toggle('active'); }
function adminGiris() { if(prompt("Şifre:") === "anfa2026") document.getElementById('admin-modal').style.display='flex'; }
function closeAdmin() { document.getElementById('admin-modal').style.display='none'; }
function kaydetAdmin() {
    const val = document.getElementById('cevap-input').value.toUpperCase().replace(/\s/g, '');
    localStorage.setItem('anfa_keys', JSON.stringify(val.split('')));
    alert("Cevaplar GitHub/Lokal veritabanına işlendi!");
    location.reload();
}

function baslatTimer() {
    timer = setInterval(() => {
        sure--;
        let dk = Math.floor(sure / 60), sn = sure % 60;
        document.getElementById('timer').innerText = `${dk}:${sn < 10 ? '0'+sn : sn}`;
        if(sure <= 0) sinavBitir();
    }, 1000);
}
