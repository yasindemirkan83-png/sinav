let index = 0, dogruS = 0, yanlisS = 0, sure = 165 * 60, timer;
let aktifSorular = [], tumVeri = [], kullaniciCevaplari = [];
let tur = 'silahli', mod = 'sureli', sira = 'karisik', deferredPrompt;

const JSON_URL = "https://raw.githubusercontent.com/yasindemirkan83-png/sinav/Sw.js/cevaplar.json";

// PWA Servis Kaydı
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js');
}

// Yükleme Butonu
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    const banner = document.getElementById('install-banner');
    if(banner) banner.style.display = 'flex';
    const btn = document.getElementById('pwa-header-btn');
    if(btn) btn.style.display = 'block';
});

function installApp() {
    if (deferredPrompt) {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then(() => {
            document.getElementById('install-banner').style.display = 'none';
            document.getElementById('pwa-header-btn').style.display = 'none';
            deferredPrompt = null;
        });
    }
}

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
    } catch(e) { console.log("Çevrimdışı Mod."); }
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
    if(tumVeri.length === 0) return alert("Soru paketleri yükleniyor...");
    
    let liste = (tur === 'silahli') ? [...tumVeri] : [...tumVeri.slice(0, 100)];
    
    if(sira === 'karisik') {
        aktifSorular = liste.sort(() => Math.random() - 0.5);
    } else {
        aktifSorular = liste;
    }

    index = 0; dogruS = 0; yanlisS = 0; kullaniciCevaplari = [];
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
        btn.innerText = `${h}) ${s[h.toLowerCase()] || '---'}`;
        btn.className = 'choice-btn';
    });
    document.getElementById('q-counter').innerText = `${index + 1} / ${aktifSorular.length}`;
}

function cevapla(secim, btn) {
    const dogru = aktifSorular[index].cevap;
    document.getElementById('options-parent').style.pointerEvents = 'none';
    
    kullaniciCevaplari.push({
        no: index + 1,
        soru: aktifSorular[index].soru,
        verilen: secim,
        dogru: dogru
    });

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
    document.getElementById('result-text').innerHTML = `Doğru: ${dogruS} | Yanlış: ${yanlisS}`;
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

// PDF İNDİRME FONKSİYONLARI (Kritik Kısım)
function sonucPdfIndir() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    doc.text("ANFA AKADEMI SINAV SONUCU", 10, 10);
    doc.text(`Dogru: ${dogruS} - Yanlis: ${yanlisS}`, 10, 20);
    
    let y = 30;
    kullaniciCevaplari.forEach((item, i) => {
        if(y > 280) { doc.addPage(); y = 20; }
        doc.setFontSize(10);
        doc.text(`${item.no}. Verilen: ${item.verilen} | Dogru: ${item.dogru}`, 10, y);
        y += 7;
    });
    doc.save("sinav_sonucu.pdf");
}

function tumSorulariPdfIndir() {
    if(tumVeri.length === 0) return alert("Veri bulunamadı!");
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    doc.text("ANFA AKADEMI EGITIM KITAPCIGI", 10, 10);
    
    let y = 20;
    tumVeri.forEach((s, i) => {
        if(y > 270) { doc.addPage(); y = 20; }
        doc.setFontSize(9);
        doc.text(`${i+1}. ${s.soru.substring(0, 80)}...`, 10, y);
        doc.text(`Cevap: ${s.cevap}`, 10, y + 5);
        y += 15;
    });
    doc.save("egitim_kitapcigi.pdf");
}

function kullaniciCevaplariPdfIndir() {
    const data = JSON.parse(localStorage.getItem('son_sonuc'));
    if(!data) return alert("Henüz kayıtlı bir sınav sonucu yok!");
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    doc.text("SON SINAV KAYDI", 10, 10);
    let y = 20;
    data.forEach(item => {
        if(y > 280) { doc.addPage(); y = 20; }
        doc.text(`${item.no}. Cevabiniz: ${item.verilen} | Dogru: ${item.dogru}`, 10, y);
        y += 7;
    });
    doc.save("gecmis_sonuc.pdf");
}

function toggleMenu() { document.getElementById('side-menu').classList.toggle('active'); }
function istatistikSifirla() { 
    if(confirm("Tüm veriler silinecek?")) {
        localStorage.clear();
        location.reload();
    }
}
