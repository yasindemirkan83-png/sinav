let index = 0, dogruS = 0, yanlisS = 0, sure = 165 * 60, timer;
let aktifSorular = [], tumVeri = [], kullaniciCevaplari = [];
let tur = 'silahli', mod = 'sureli', sira = 'karisik', deferredPrompt;

const JSON_URL = "https://raw.githubusercontent.com/yasindemirkan83-png/sinav/Sw.js/cevaplar.json";

// 1. PWA Servis Kaydı ve Yükleme Mantığı
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js')
        .then(() => console.log("Service Worker Kayıt Başarılı"))
        .catch(err => console.log("SW Kayıt Hatası:", err));
}

// Otomatik Yükleme Butonu Yakalayıcı (Tarayıcı hazır olduğunda tetiklenir)
window.addEventListener('beforeinstallprompt', (e) => {
    // Tarayıcının varsayılan yükleme penceresini engelle
    e.preventDefault();
    // Olayı sakla ki butonla tetikleyebilelim
    deferredPrompt = e;
    
    // index.html içindeki banner ve header butonlarını görünür yap
    const installBanner = document.getElementById('install-banner');
    const headerInstallBtn = document.getElementById('pwa-header-btn');
    
    if (installBanner) installBanner.style.display = 'flex';
    if (headerInstallBtn) headerInstallBtn.style.display = 'block';
});

// Yükle Butonuna Basıldığında Çalışacak Fonksiyon
async function installApp() {
    if (!deferredPrompt) return;

    // Yükleme istemini göster
    deferredPrompt.prompt();

    // Kullanıcının yanıtını bekle
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`Kullanıcı yükleme kararı: ${outcome}`);

    // Karar verildikten sonra istemi temizle
    deferredPrompt = null;

    // Butonları tekrar gizle
    const installBanner = document.getElementById('install-banner');
    const headerInstallBtn = document.getElementById('pwa-header-btn');
    
    if (installBanner) installBanner.style.display = 'none';
    if (headerInstallBtn) headerInstallBtn.style.display = 'none';
}

// 2. Başlangıç ve Veri Çekme
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
    } catch(e) { 
        console.log("Çevrimdışı Mod: Yerel veriler kullanılıyor."); 
    }
}

// 3. Seçim ve Sınav Fonksiyonları
function setTur(t) { 
    tur = t; 
    document.querySelectorAll('#opt-silahli, #opt-silahsiz').forEach(el => el.classList.remove('active'));
    document.getElementById('opt-' + t).classList.add('active');
}

function setMod(m) { 
    mod = m; 
    document.querySelectorAll('#opt-sureli, #opt-suresiz').forEach(el => el.classList.remove('active'));
    document.getElementById('opt-' + m).classList.add('active');
}

function sinaviBaslat() {
    if(tumVeri.length === 0) return alert("Soru paketleri yükleniyor, lütfen bekleyin.");
    
    let liste = (tur === 'silahli') ? [...tumVeri] : [...tumVeri.slice(0, 100)];
    
    // Karışık veya Sıralı mantığı (Varsayılan karışık)
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
    const buttons = document.querySelectorAll('.choice-btn');
    
    // Tıklamayı geçici olarak engelle
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
        if(index < aktifSorular.length) {
            soruGoster();
        } else {
            bitir();
        }
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

// 4. Menü ve PDF İşlemleri
function toggleMenu() { document.getElementById('side-menu').classList.toggle('active'); }

function istatistikSifirla() {
    if(confirm("Tüm kayıtlar silinecektir. Emin misiniz?")) {
        localStorage.clear();
        location.reload();
    }
}

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

function adminGirisKontrol() {
    document.getElementById('admin-modal').style.display = 'block';
}

function adminPanelKapat() {
    document.getElementById('admin-modal').style.display = 'none';
}
