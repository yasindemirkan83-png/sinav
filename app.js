let index = 0, dogruS = 0, yanlisS = 0, sure = 165 * 60, timer;
let aktifSorular = [], tumVeri = [], kullaniciCevaplari = [];
let tur = 'silahli', mod = 'sureli', deferredPrompt;

const JSON_URL = "https://raw.githubusercontent.com/yasindemirkan83-png/sinav/Sw.js/cevaplar.json";

// Service Worker Kaydı
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js');
}

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    document.getElementById('install-banner').style.display = 'flex';
    document.getElementById('pwa-header-btn').style.display = 'block';
});

window.onload = async () => {
    tumVeri = JSON.parse(localStorage.getItem('anfa_sorular')) || [];
    setTimeout(() => {
        document.getElementById('splash').style.display = 'none';
        document.getElementById('main-header').style.display = 'flex';
        document.getElementById('entry-screen').style.display = 'block';
        fetchFreshData();
    }, 4000);
};

async function fetchFreshData() {
    try {
        const response = await fetch(JSON_URL + "?v=" + new Date().getTime());
        if(response.ok) {
            const data = await response.json();
            tumVeri = data;
            localStorage.setItem('anfa_sorular', JSON.stringify(data));
        }
    } catch(err) { console.log("Çevrimdışı mod."); }
}

function installApp() {
    if (deferredPrompt) {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then((choice) => {
            if (choice.outcome === 'accepted') {
                document.getElementById('install-banner').style.display = 'none';
            }
            deferredPrompt = null;
        });
    }
}

function setTur(t) { 
    tur = t; 
    document.getElementById('opt-silahli').className = t==='silahli'?'opt active':'opt'; 
    document.getElementById('opt-silahsiz').className = t==='silahsiz'?'opt active':'opt'; 
}

function setMod(m) { 
    mod = m; 
    document.getElementById('opt-sureli').className = m==='sureli'?'opt active':'opt'; 
    document.getElementById('opt-suresiz').className = m==='suresiz'?'opt active':'opt'; 
}

function sinaviBaslat() {
    if(tumVeri.length === 0) return alert("Veriler yüklenemedi.");
    let liste = (tur === 'silahli') ? [...tumVeri] : [...tumVeri.slice(0, 100)];
    aktifSorular = liste.sort(() => Math.random() - 0.5);
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
        <img src="${resimUrl}" onerror="this.style.display='none'" style="width:100%; border-radius:15px; margin-bottom:15px;">
        <div style="font-size:1.1rem; line-height:1.5;">${index + 1}. ${s.soru}</div>
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

    if(secim === dogru) { btn.classList.add('correct'); dogruS++; }
    else { 
        btn.classList.add('wrong'); 
        document.getElementById('btn-' + dogru).classList.add('correct');
        yanlisS++;
    }

    setTimeout(() => {
        document.getElementById('options-parent').style.pointerEvents = 'auto';
        index++;
        if(index < aktifSorular.length) soruGoster(); else bitir();
    }, 1200);
}

function bitir() {
    clearInterval(timer);
    localStorage.setItem('son_cevaplar', JSON.stringify(kullaniciCevaplari));
    document.getElementById('quiz-screen').style.display = 'none';
    document.getElementById('result-screen').style.display = 'block';
    document.getElementById('result-text').innerHTML = `<b>Doğru:</b> ${dogruS} <br> <b>Yanlış:</b> ${yanlisS}`;
}

// --- PDF OLUŞTURMA SİSTEMİ ---
function pdfYap(data, isim, isEgitim=false) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    doc.setFontSize(10);
    let y = 20;
    data.forEach((item, i) => {
        if(y > 270) { doc.addPage(); y = 20; }
        let metin = isEgitim ? `${i+1}. ${item.soru} [Cevap: ${item.cevap}]` : `${i+1}. ${item.s.substring(0,50)}... (Sen: ${item.c}, Dogru: ${item.d})`;
        let lines = doc.splitTextToSize(metin, 180);
        doc.text(lines, 10, y);
        y += (lines.length * 7);
    });
    doc.save(isim);
}

function sonucPdfIndir() { pdfYap(kullaniciCevaplari, "Sinav_Sonucu.pdf"); }
function tumSorulariPdfIndir() { pdfYap(tumVeri, "Egitim_Kitapcigi.pdf", true); }
function kullaniciCevaplariPdfIndir() {
    const data = JSON.parse(localStorage.getItem('son_cevaplar'));
    if(!data) return alert("Geçmiş sınav bulunamadı.");
    pdfYap(data, "Gecmis_Sonuc.pdf");
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

function adminGirisKontrol() {
    if (prompt("Admin Şifresi:") === "anfa2026") {
        document.getElementById('admin-modal').style.display = 'flex';
        toggleMenu();
    } else alert("Yetkisiz Giriş!");
}

function adminPanelKapat() { 
    document.getElementById('admin-modal').style.display = 'none'; 
    location.reload(); 
}

function toggleMenu() { document.getElementById('side-menu').classList.toggle('active'); }
function istatistikSifirla() { if(confirm("Tüm veriler silinsin mi?")) { localStorage.clear(); location.reload(); } }
