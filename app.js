let seciliTur = 'silahli', seciliMod = 'sureli', cevapAnahtari = [], ogrenciCevaplari = [], index = 0, dogruS = 0, sure = 165 * 60, timer;

// Giriş Animasyonu ve Veri Kurtarma
window.onload = () => {
    setTimeout(() => {
        document.getElementById('splash').style.display = 'none';
        document.getElementById('main-header').style.display = 'flex';
        document.getElementById('entry-screen').style.display = 'block';
    }, 5000); // 5 Saniye GIF Süresi

    const savedKeys = localStorage.getItem('anfa_data');
    if(savedKeys) cevapAnahtari = JSON.parse(savedKeys);
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
    if(cevapAnahtari.length < 10) {
        alert("Lütfen önce Admin Panelinden cevap anahtarını girin!");
        return;
    }
    aktifSorular = seciliTur === 'silahli' ? cevapAnahtari : cevapAnahtari.slice(0, 100);
    document.getElementById('entry-screen').style.display = 'none';
    document.getElementById('quiz-screen').style.display = 'block';
    if(seciliMod === 'sureli') baslatTimer();
}

function cevapla(secim, element) {
    const dogruCevap = aktifSorular[index];
    const butonlar = document.querySelectorAll('.opt-btn');
    
    // Tıklamayı geçici olarak engelle
    document.getElementById('options-container').style.pointerEvents = 'none';

    if(secim === dogruCevap) {
        element.classList.add('correct');
        dogruS++;
    } else {
        element.classList.add('wrong');
        // Doğru şıkkı da yak (Kullanıcı öğrensin)
        butonlar.forEach(btn => { if(btn.innerText === dogruCevap) btn.classList.add('correct'); });
    }

    ogrenciCevaplari.push({ s: index+1, m: secim, d: dogruCevap });

    // 1.2 Saniye Bekleme ve Geçiş
    setTimeout(() => {
        butonlar.forEach(btn => btn.classList.remove('correct', 'wrong'));
        document.getElementById('options-container').style.pointerEvents = 'auto';
        index++;
        
        if(index >= aktifSorular.length) {
            sinavBitir();
        } else {
            document.getElementById('q-counter').innerText = "Soru: " + (index + 1);
        }
    }, 1200); 
}

function sinavBitir() {
    clearInterval(timer);
    let sonuc = `ANFA ÖGG SINAV SONUCU\n----------------------\nToplam Soru: ${aktifSorular.length}\nDoğru: ${dogruS}\nYanlış: ${aktifSorular.length - dogruS}\n\n`;
    ogrenciCevaplari.forEach(item => {
        sonuc += `Soru ${item.s}: ${item.m === item.d ? '✅' : '❌'} (Sen: ${item.m}, Doğru: ${item.d})\n`;
    });

    const blob = new Blob([sonuc], {type: 'text/plain'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = "ANFA_Rapor.txt";
    a.click();

    alert("Sınav tamamlandı. Başarı raporun indirildi!");
    location.reload();
}

// PDF AÇMA FONKSİYONU (GARANTİLİ)
function pencereAc() {
    const pdfUrl = 'sorular.pdf';
    const win = window.open(pdfUrl, '_blank');
    if (!win) { // Eğer tarayıcı engellerse direkt sayfada aç
        window.location.href = pdfUrl;
    }
}

function toggleMenu() { document.getElementById('side-menu').classList.toggle('active'); }
function adminGiris() { if(prompt("Yönetici Şifresi:") === "anfa2026") document.getElementById('admin-modal').style.display='flex'; }
function closeAdmin() { document.getElementById('admin-modal').style.display='none'; }
function kaydetAdmin() {
    const raw = document.getElementById('cevap-input').value.toUpperCase().replace(/\s/g, '');
    if(raw.length < 10) return alert("Geçersiz giriş!");
    cevapAnahtari = raw.split('');
    localStorage.setItem('anfa_data', JSON.stringify(cevapAnahtari));
    alert("Cevap anahtarı başarıyla güncellendi!");
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
