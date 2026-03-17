let index = 0, dogruS = 0, yanlisS = 0, sure = 165 * 60, timer;
let aktifSorular = [], tumVeri = [], kullaniciCevaplari = [];
let tur = 'silahli', mod = 'sureli';

window.onload = () => {
    tumVeri = JSON.parse(localStorage.getItem('anfa_sorular')) || [];
    setTimeout(() => {
        document.getElementById('splash').style.display = 'none';
        document.getElementById('main-header').style.display = 'flex';
        document.getElementById('entry-screen').style.display = 'block';
        checkPWA();
    }, 4000);
};

// --- ŞİFRELİ ADMİN GİRİŞİ ---
function adminGirisKontrol() {
    const sifre = prompt("Admin Şifresini Girin:");
    if (sifre === "anfa2026") {
        document.getElementById('admin-modal').style.display = 'flex';
        toggleMenu();
    } else {
        alert("Hatalı Şifre!");
    }
}

function adminPanelKapat() { document.getElementById('admin-modal').style.display = 'none'; }

function jsonCihazaKaydet(event) {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const data = JSON.parse(e.target.result);
            localStorage.setItem('anfa_sorular', JSON.stringify(data));
            alert("Sorular başarıyla yüklendi!");
            location.reload();
        } catch(err) { alert("Dosya formatı hatalı!"); }
    };
    reader.readAsText(file);
}

// --- SINAV FONKSİYONLARI ---
function setTur(t) { tur = t; document.getElementById('opt-silahli').className = t==='silahli'?'opt active':'opt'; document.getElementById('opt-silahsiz').className = t==='silahsiz'?'opt active':'opt'; }
function setMod(m) { mod = m; document.getElementById('opt-sureli').className = m==='sureli'?'opt active':'opt'; document.getElementById('opt-suresiz').className = m==='suresiz'?'opt active':'opt'; }

function sinaviBaslat() {
    if(tumVeri.length === 0) return alert("Soru bulunamadı. Lütfen Ayarlar -> Admin kısmından soru yükleyin.");
    let liste = (tur === 'silahli') ? [...tumVeri] : [...tumVeri.slice(0, 100)];
    aktifSorular = liste.sort(() => Math.random() - 0.5);
    index = 0; dogruS = 0; yanlisS = 0;
    document.getElementById('entry-screen').style.display = 'none';
    document.getElementById('quiz-screen').style.display = 'block';
    if(mod === 'sureli') startTimer();
    soruGoster();
}

function soruGoster() {
    const s = aktifSorular[index];
    document.getElementById('q-text').innerText = `${index + 1}. ${s.soru}`;
    ['A','B','C','D','E'].forEach(h => {
        const btn = document.getElementById('btn-' + h);
        btn.innerText = `${h}) ${s[h.toLowerCase()]}`;
        btn.className = 'choice-btn';
    });
    document.getElementById('q-counter').innerText = `${index + 1} / ${aktifSorular.length}`;
}

function cevapla(secim, btn) {
    const dogru = aktifSorular[index].cevap;
    const parent = document.getElementById('options-parent');
    parent.style.pointerEvents = 'none';

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
        parent.style.pointerEvents = 'auto';
        index++;
        if(index < aktifSorular.length) soruGoster(); else bitir();
    }, 1200);
}

function bitir() {
    clearInterval(timer);
    localStorage.setItem('son_cevaplar', JSON.stringify(kullaniciCevaplari));
    document.getElementById('quiz-screen').style.display = 'none';
    document.getElementById('result-screen').style.display = 'block';
    document.getElementById('result-text').innerHTML = `Doğru: ${dogruS} | Yanlış: ${yanlisS}`;
}

// --- PDF & DİĞER ---
function toggleMenu() { document.getElementById('side-menu').classList.toggle('active'); }

function sonucPdfIndir() { pdfYap(kullaniciCevaplari, "Sonuc.pdf"); }
function tumSorulariPdfIndir() { pdfYap(tumVeri, "Egitim_Sorulari.pdf", true); }
function kullaniciCevaplariPdfIndir() {
    const data = JSON.parse(localStorage.getItem('son_cevaplar'));
    if(!data) return alert("Geçmiş bulunamadı.");
    pdfYap(data, "Gecmis.pdf");
}

function pdfYap(data, isim, isEgitim=false) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    let y = 20;
    data.forEach((item, i) => {
        if(y > 280) { doc.addPage(); y = 20; }
        let text = isEgitim ? `${i+1}. ${item.soru} [Cevap: ${item.cevap}]` : `${i+1}. ${item.c === item.d ? 'DOGRU' : 'YANLIS'} (Sen: ${item.c}, Dogru: ${item.d})`;
        let split = doc.splitTextToSize(text, 180);
        doc.text(split, 10, y);
        y += (split.length * 6);
    });
    doc.save(isim);
}

function startTimer() {
    timer = setInterval(() => {
        sure--;
        let m = Math.floor(sure/60), s = sure%60;
        document.getElementById('timer').innerHTML = `<i class="fas fa-clock"></i> ${m}:${s<10?'0'+s:s}`;
        if(sure<=0) bitir();
    }, 1000);
}

function istatistikSifirla() { if(confirm("Tüm veriler temizlensin mi?")) { localStorage.clear(); location.reload(); } }
