let seciliTur = 'silahli'; // varsayılan
let seciliMod = 'sureli';
let cevapAnahtari = [];
let aktifSorular = [];
let atlananlar = [];
let index = 0;
let dogruS = 0, yanlisS = 0;
let sureSaniye = 165 * 60;
let timer;
let ogrenciCevaplari = [];

// Başlangıç
window.onload = () => {
    setTimeout(() => {
        document.getElementById('splash').style.display = 'none';
        document.getElementById('main-header').style.display = 'flex';
        document.getElementById('entry-screen').style.display = 'block';
    }, 3000);
    
    const localData = localStorage.getItem('anfa_cevaplar');
    if(localData) cevapAnahtari = JSON.parse(localData);
};

// Mod ve Tür Seçimi
function setTur(t) {
    seciliTur = t;
    document.getElementById('btn-silahli').classList.toggle('active', t === 'silahli');
    document.getElementById('btn-silahsiz').classList.toggle('active', t === 'silahsiz');
}

function setMod(m) {
    seciliMod = m;
    document.getElementById('btn-sureli').classList.toggle('active', m === 'sureli');
    document.getElementById('btn-suresiz').classList.toggle('active', m === 'suresiz');
}

// Menü Kontrolü
function toggleMenu() {
    document.getElementById('side-menu').classList.toggle('active');
}

function sinaviBaslat() {
    if(cevapAnahtari.length === 0) return alert("Sistemde yüklü sınav yok!");
    
    aktifSorular = seciliTur === 'silahli' ? cevapAnahtari : cevapAnahtari.slice(0, 100);
    document.getElementById('entry-screen').style.display = 'none';
    document.getElementById('quiz-screen').style.display = 'block';
    
    if(seciliMod === 'sureli') baslatTimer();
    else document.getElementById('timer').innerText = "Süresiz Mod";
    
    soruGoster();
}

function soruGoster() {
    if(index < aktifSorular.length) {
        document.getElementById('q-counter').innerText = `Soru: ${index + 1} / ${aktifSorular.length}`;
    } else if(atlananlar.length > 0) {
        alert("Atlanan sorulara geçiliyor...");
        aktifSorular = [...atlananlar];
        atlananlar = [];
        index = 0;
        soruGoster();
    } else {
        sinavBitir();
    }
}

function cevapla(secim) {
    ogrenciCevaplari.push({ soru: index + 1, secim: secim, dogru: aktifSorular[index] });
    if(secim === aktifSorular[index]) dogruS++; else yanlisS++;
    
    index++;
    soruGoster();
}

function atla() {
    atlananlar.push({ qIndex: index, ans: aktifSorular[index] });
    index++;
    soruGoster();
}

function sinavBitir() {
    clearInterval(timer);
    alert(`Sınav Tamamlandı!\nDoğru: ${dogruS}\nYanlış: ${yanlisS}`);
    toggleMenu(); // Menüyü aç ki sonucu indirsin
}

// PDF Olarak Sonuç İndir (Basit Metin Dosyası Mantığı)
function sonucIndir() {
    let icerik = "ANFA ÖGG SINAV SONUÇLARI\n\n";
    icerik += `Tür: ${seciliTur.toUpperCase()} | Mod: ${seciliMod.toUpperCase()}\n`;
    icerik += `Doğru: ${dogruS} | Yanlış: ${yanlisS}\n\n`;
    icerik += "SORU - SENİN CEVABIN - DOĞRU CEVAP\n";
    ogrenciCevaplari.forEach(c => {
        icerik += `${c.soru}. Soru: ${c.secim} [${c.secim === c.dogru ? 'DOGRU' : 'YANLIS'}] - (Dogru: ${c.dogru})\n`;
    });
    
    const blob = new Blob([icerik], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = "Sinav_Sonucum.txt";
    a.click();
}

// Admin İşlemleri
function adminGiris() {
    const sifre = prompt("Admin Şifresi:");
    if(sifre === "anfa2026") {
        document.getElementById('admin-panel').style.display = 'flex';
    } else alert("Yetkisiz Giriş!");
}

function closeAdmin() { document.getElementById('admin-panel').style.display = 'none'; }

function kaydetAdmin() {
    const txt = document.getElementById('cevap-input').value.toUpperCase().replace(/\s/g, '');
    if(txt.length < 100) return alert("En az 100 soru girmelisiniz!");
    localStorage.setItem('anfa_cevaplar', JSON.stringify(txt.split('')));
    alert("Sınav Sisteme Yüklendi!");
    location.reload();
}

function baslatTimer() {
    timer = setInterval(() => {
        sureSaniye--;
        let dk = Math.floor(sureSaniye / 60);
        let sn = sureSaniye % 60;
        document.getElementById('timer').innerText = `${dk}:${sn < 10 ? '0'+sn : sn}`;
        if(sureSaniye <= 0) sinavBitir();
    }, 1000);
}

