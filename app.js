let index = 0, dogruS = 0, yanlisS = 0, sure = 165 * 60, timer;
let aktifSorular = [], tumVeri = [], kullaniciCevaplari = [];
let tur = 'silahli', mod = 'sureli';

// PWA Yükleme Barı İçin
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
});

window.onload = () => {
    // Hafızadan soruları al
    tumVeri = JSON.parse(localStorage.getItem('anfa_sorular')) || [];

    // Splash Ekranı Geçişi
    setTimeout(() => {
        document.getElementById('splash').style.display = 'none';
        document.getElementById('main-header').style.display = 'flex';
        document.getElementById('entry-screen').style.display = 'block';
        
        // Uygulama yüklü değilse Yükle barını göster
        if (deferredPrompt) {
            document.getElementById('install-banner').style.display = 'flex';
        }
    }, 4000);
};

// --- PWA KURULUMU ---
function installApp() {
    document.getElementById('install-banner').style.display = 'none';
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then((choice) => { deferredPrompt = null; });
}

// --- ADMİN DOSYA YÜKLEME ---
function adminPanelAc() { document.getElementById('admin-modal').style.display = 'flex'; toggleMenu(); }
function adminPanelKapat() { document.getElementById('admin-modal').style.display = 'none'; }

function jsonCihazaKaydet(event) {
    const file = event.target.files[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const parsedData = JSON.parse(e.target.result);
            localStorage.setItem('anfa_sorular', JSON.stringify(parsedData));
            alert("Sorular cihaza kaydedildi! İnternetsiz çalışacak kanki.");
            location.reload();
        } catch(err) {
            alert("Hatalı JSON dosyası! Lütfen dosyayı kontrol et.");
        }
    };
    reader.readAsText(file);
}

// --- MENÜ VE AYARLAR ---
function toggleMenu() { document.getElementById('side-menu').classList.toggle('active'); }

function istatistikSifirla() {
    if(confirm("Tüm sorular ve geçmiş silinecek. Emin misin?")) {
        localStorage.clear();
        location.reload();
    }
}

// --- SINAV MANTIĞI ---
function setTur(t) { tur = t; document.getElementById('opt-silahli').className = t === 'silahli' ? 'opt active' : 'opt'; document.getElementById('opt-silahsiz').className = t === 'silahsiz' ? 'opt active' : 'opt'; }
function setMod(m) { mod = m; document.getElementById('opt-sureli').className = m === 'sureli' ? 'opt active' : 'opt'; document.getElementById('opt-suresiz').className = m === 'suresiz' ? 'opt active' : 'opt'; }

function sinaviBaslat() {
    if(tumVeri.length === 0) {
        alert("Sistemde soru yok! Lütfen Ayarlar > Soru Yükle menüsünden JSON dosyanı seç.");
        return adminPanelAc();
    }
    let liste = (tur === 'silahli') ? [...tumVeri] : [...tumVeri.slice(0, 100)];
    aktifSorular = liste.sort(() => Math.random() - 0.5);
    
    index = 0; dogruS = 0; yanlisS = 0; kullaniciCevaplari = [];
    document.getElementById('entry-screen').style.display = 'none';
    document.getElementById('quiz-screen').style.display = 'block';
    if(mod === 'sureli') startTimer(); else document.getElementById('timer').style.display = 'none';
    soruGoster();
}

function soruGoster() {
    window.scrollTo(0,0);
    const s = aktifSorular[index];
    document.getElementById('q-text').innerText = `${index + 1}. ${s.soru}`;
    ['A','B','C','D','E'].forEach(h => {
        const btn = document.getElementById('btn-' + h);
        btn.innerText = `${h}) ${s[h.toLowerCase()]}`;
        btn.className = 'choice-btn'; // Eski renkleri sil
    });
    document.getElementById('q-counter').innerText = `Soru: ${index + 1} / ${aktifSorular.length}`;
}

function cevapla(secim, btn) {
    const dogruCevap = aktifSorular[index].cevap;
    const butonlar = document.getElementById('options-parent');
    butonlar.style.pointerEvents = 'none'; // Kitle

    kullaniciCevaplari.push({soru: aktifSorular[index].soru, secim: secim, dogru: dogruCevap});
    localStorage.setItem('son_sinav_cevaplari', JSON.stringify(kullaniciCevaplari)); // Cevapları da kaydet

    if(secim === dogruCevap) {
        btn.classList.add('correct');
        dogruS++;
    } else {
        btn.classList.add('wrong');
        document.getElementById('btn-' + dogruCevap).classList.add('correct');
        yanlisS++;
    }

    setTimeout(() => {
        butonlar.style.pointerEvents = 'auto'; // Kilidi aç
        index++;
        if(index < aktifSorular.length) soruGoster(); else bitir();
    }, 1200);
}

function bitir() {
    clearInterval(timer);
    document.getElementById('quiz-screen').style.display = 'none';
    document.getElementById('result-screen').style.display = 'block';
    document.getElementById('result-text').innerHTML = `<span style="color:#27ae60">Doğru: ${dogruS}</span> <br><span style="color:#e74c3c">Yanlış: ${yanlisS}</span>`;
}

// --- PDF İŞLEMLERİ ---
function sonucPdfIndir() { pdfOlustur(kullaniciCevaplari, "sinav_sonucu.pdf", "SINAV SONUCUN"); }
function kullaniciCevaplariPdfIndir() {
    const sonCevaplar = JSON.parse(localStorage.getItem('son_sinav_cevaplari'));
    if(!sonCevaplar) return alert("Henüz kayıtlı bir sınav geçmişin yok.");
    pdfOlustur(sonCevaplar, "gecmis_cevaplarim.pdf", "SON SINAV CEVAPLARI");
}
function tumSorulariPdfIndir() {
    if(tumVeri.length === 0) return alert("Sistemde yüklü soru yok.");
    pdfOlustur(tumVeri, "egitim_sorulari.pdf", "TUM EGITIM SORULARI", true);
}

function pdfOlustur(data, dosyaAdi, baslik, isEgitim = false) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    doc.text(baslik, 10, 15);
    let y = 30;
    data.forEach((item, i) => {
        if(y > 280) { doc.addPage(); y = 15; }
        let metin = isEgitim ? `${i+1}. Soru: ${item.soru} | CEVAP: ${item.cevap}` : `${i+1}. Soru: ${item.secim === item.dogru ? 'DOGRU' : `YANLIS (Sen: ${item.secim}, Cevap: ${item.dogru})`}`;
        let splitText = doc.splitTextToSize(metin, 180);
        doc.text(splitText, 10, y);
        y += (splitText.length * 5) + 3;
    });
    doc.save(dosyaAdi);
}

function startTimer() {
    timer = setInterval(() => { sure--; let m = Math.floor(sure/60), s = sure%60; document.getElementById('timer').innerHTML = `<i class="fas fa-clock"></i> ${m}:${s<10?'0'+s:s}`; if(sure<=0) bitir(); }, 1000);
}
