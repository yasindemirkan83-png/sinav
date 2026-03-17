let index = 0, dogruS = 0, yanlisS = 0, sure = 165 * 60, timer;
let aktifSorular = [], tumVeri = [], kullaniciCevaplari = [];
let tur = 'silahli', mod = 'sureli', sira = 'karisik', deferredPrompt;

const JSON_URL = "https://raw.githubusercontent.com/yasindemirkan83-png/sinav/Sw.js/cevaplar.json";

// PWA Servis Kaydı
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js');
}

// Otomatik Yükleme Butonu Yakalayıcı
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    document.getElementById('pwa-install-banner').style.display = 'flex';
});

window.onload = async () => {
    tumVeri = JSON.parse(localStorage.getItem('anfa_sorular')) || [];
    setTimeout(() => {
        document.getElementById('splash').style.display = 'none';
        document.getElementById('main-header').style.display = 'flex';
        document.getElementById('entry-screen').style.display = 'block';
        fetchData();
    }, 3000);
};

async function fetchData() {
    try {
        const res = await fetch(JSON_URL + "?v=" + Date.now());
        if(res.ok) {
            tumVeri = await res.json();
            localStorage.setItem('anfa_sorular', JSON.stringify(tumVeri));
        }
    } catch(e) { console.log("Çevrimdışı Mod Aktif."); }
}

function installApp() {
    if (deferredPrompt) {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then(() => {
            document.getElementById('pwa-install-banner').style.display = 'none';
            deferredPrompt = null;
        });
    }
}

// Seçim Fonksiyonları
function setTur(t) { 
    tur = t; 
    document.querySelectorAll('#opt-silahli, #opt-silahsiz').forEach(el => el.classList.remove('active'));
    document.getElementById('opt-' + t).classList.add('active');
}

function setSira(s) { 
    sira = s; 
    document.querySelectorAll('#opt-karisik, #opt-sirali').forEach(el => el.classList.remove('active'));
    document.getElementById('opt-' + s).classList.add('active');
}

function setMod(m) { 
    mod = m; 
    document.querySelectorAll('#opt-sureli, #opt-suresiz').forEach(el => el.classList.remove('active'));
    document.getElementById('opt-' + m).classList.add('active');
}

function sinaviBaslat() {
    if(tumVeri.length === 0) return alert("Soru paketleri yükleniyor, lütfen bekleyin.");
    
    let liste = (tur === 'silahli') ? [...tumVeri] : [...tumVeri.slice(0, 100)];
    
    if(sira === 'karisik') {
        aktifSorular = liste.sort(() => Math.random() - 0.5);
    } else {
        aktifSorular = liste; // Sıralı
    }

    index = 0; dogruS = 0; yanlisS = 0;
    document.getElementById('entry-screen').style.display = 'none';
    document.getElementById('quiz-screen').style.display = 'block';
    if(mod === 'sureli') startTimer();
    soruGoster();
}

function soruGoster() {
    const s = aktifSorular[index];
    const qArea = document.getElementById('q-area');
    const resimUrl = `https://raw.githubusercontent.com/yasindemirkan83-png/sinav/Sw.js/images/${s.id}.jpg`;

    qArea.innerHTML = `
        <img src="${resimUrl}" onerror="this.style.display='none'" class="q-img">
        <div class="q-text">${index + 1}. ${s.soru}</div>
    `;

    ['A','B','C','D','E'].forEach(h => {
        const btn = document.getElementById('btn-' + h);
        btn.innerText = `${h}) ${s[h.toLowerCase()]}`;
        btn.className = 'choice-btn';
    });
    document.getElementById('q-counter').innerText = `${index + 1} / ${aktifSorular.length}`;
}

function cevapla(secim, btn) {
    const dogru = aktifSorular[index].cevap;
    document.getElementById('options-parent').style.pointerEvents = 'none';
    
    kullaniciCevaplari.push({s: aktifSorular[index].soru, c: secim, d: dogru});

    if(secim === dogru) {
        btn.classList.add('correct');
        dogruS++;
    } else {
        btn.classList.add('wrong');
        document.getElementById('btn-' + dogru).classList.add('correct');
        yanlisS++;
    }

    setTimeout(() => {
        document.getElementById('options-parent').style.pointerEvents = 'auto';
        index++;
        if(index < aktifSorular.length) soruGoster(); else bitir();
    }, 1000);
}

function bitir() {
    clearInterval(timer);
    localStorage.setItem('son_sonuc', JSON.stringify(kullaniciCevaplari));
    document.getElementById('quiz-screen').style.display = 'none';
    document.getElementById('result-screen').style.display = 'block';
    document.getElementById('result-text').innerHTML = `
        <p style="color:#10b981">Doğru Sayısı: ${dogruS}</p>
        <p style="color:#ef4444">Yanlış Sayısı: ${yanlisS}</p>
    `;
}

function startTimer() {
    sure = 165 * 60;
    timer = setInterval(() => {
        sure--;
        let m = Math.floor(sure/60), s = sure%60;
        document.getElementById('timer').innerHTML = `<i class="fas fa-clock"></i> ${m}:${s<10?'0'+s:s}`;
        if(sure<=0) bitir();
    }, 1000);
}

function toggleMenu() { document.getElementById('side-menu').classList.toggle('active'); }

function istatistikSifirla() {
    if(confirm("Tüm kayıtlar silinecektir. Emin misiniz?")) {
        localStorage.clear();
        location.reload();
    }
}

// PDF Sistemleri
function pdfYap(data, isim) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    doc.text("ANFA AKADEMI SINAV RAPORU", 10, 10);
    let y = 20;
    data.forEach((item, i) => {
        if(y > 280) { doc.addPage(); y = 10; }
        doc.setFontSize(8);
        doc.text(`${i+1}. ${item.s.substring(0,80)}... Cevap: ${item.c} / Dogru: ${item.d}`, 10, y);
        y += 7;
    });
    doc.save(isim);
}

function sonucPdfIndir() { pdfYap(kullaniciCevaplari, "Sinav_Sonucu.pdf"); }
function kullaniciCevaplariPdfIndir() {
    const old = JSON.parse(localStorage.getItem('son_sonuc'));
    if(!old) return alert("Henüz kayıtlı bir sınavınız yok.");
    pdfYap(old, "Gecmis_Sonuc.pdf");
}
