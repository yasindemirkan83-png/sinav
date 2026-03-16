let seciliTur = 'silahli';
let seciliMod = 'sureli';
let cevapAnahtari = [];
let aktifSorular = [];
let ogrenciCevaplari = [];
let index = 0;
let dogruS = 0;
let sure = 165 * 60;
let timer;

// Menü ve Seçimler
function toggleMenu() { document.getElementById('side-menu').classList.toggle('active'); }
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

// Sınavı Başlat
function sinaviBaslat() {
    const data = localStorage.getItem('anfa_keys');
    if(!data) return alert("Admin panelinden cevapları girin!");
    cevapAnahtari = JSON.parse(data);
    
    aktifSorular = seciliTur === 'silahli' ? cevapAnahtari : cevapAnahtari.slice(0, 100);
    
    document.getElementById('entry-screen').style.display = 'none';
    document.getElementById('quiz-screen').style.display = 'flex';
    
    if(seciliMod === 'sureli') {
        timer = setInterval(() => {
            sure--;
            let dk = Math.floor(sure / 60);
            let sn = sure % 60;
            document.getElementById('timer').innerText = `${dk}:${sn < 10 ? '0'+sn : sn}`;
            if(sure <= 0) sinavBitir();
        }, 1000);
    }
}

function cevapla(secim) {
    let dogruCevap = aktifSorular[index];
    if(secim === dogruCevap) dogruS++;
    ogrenciCevaplari.push({ s: index+1, m: secim, d: dogruCevap });
    
    index++;
    if(index >= aktifSorular.length) sinavBitir();
    else document.getElementById('q-counter').innerText = "Soru: " + (index + 1);
}

function sinavBitir() {
    clearInterval(timer);
    let sonuc = `ANFA SINAV SONUCU\nDoğru: ${dogruS}\nYanlış: ${aktifSorular.length - dogruS}\n\nDetaylar:\n`;
    ogrenciCevaplari.forEach(item => {
        sonuc += `Soru ${item.s}: Senin: ${item.m} | Doğru: ${item.d} [${item.m===item.d ? 'OK' : 'X'}]\n`;
    });
    
    const blob = new Blob([sonuc], {type: 'text/plain'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = "Anfa_Sonuc.txt";
    a.click();
    
    alert("Sınav bitti! Sonuç raporu indirildi.");
    location.reload();
}

// Admin
function adminGiris() {
    if(prompt("Şifre:") === "anfa2026") document.getElementById('admin-modal').style.display='flex';
}
function closeAdmin() { document.getElementById('admin-modal').style.display='none'; }
function kaydetAdmin() {
    const val = document.getElementById('cevap-input').value.toUpperCase().replace(/\s/g, '');
    localStorage.setItem('anfa_keys', JSON.stringify(val.split('')));
    alert("Kaydedildi!");
    location.reload();
}
function indirSoruBankasi() { window.open('sinav.pdf'); }
