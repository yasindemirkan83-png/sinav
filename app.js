let index = 0, dogruS = 0, yanlisS = 0, sure = 165 * 60, timer;
let aktifSorular = [], tumVeri = [], kullaniciCevaplari = [];
let tur = 'silahli', mod = 'sureli';

window.onload = async () => {
    setTimeout(() => {
        document.getElementById('splash').style.display = 'none';
        document.getElementById('main-header').style.display = 'flex';
        document.getElementById('entry-screen').style.display = 'block';
    }, 4000);

    try {
        // GITHUB CACHE SORUNUNU ÇÖZEN SATIR (Sonuna timestamp eklendi)
        const response = await fetch('./sorular.json?v=' + new Date().getTime());
        if (!response.ok) throw new Error("Dosya bulunamadı");
        tumVeri = await response.json();
    } catch (err) {
        alert("Bağlantı sorunu! Sorular yüklenemedi. Lütfen internetini kontrol et veya sayfayı yenile.");
    }
};

function toggleMenu() {
    document.getElementById('side-menu').classList.toggle('active');
}

function istatistikSifirla() {
    if(confirm("Tüm sınav geçmişi ve ayarlar sıfırlansın mı?")) {
        localStorage.clear();
        location.reload();
    }
}

function setTur(t) { 
    tur = t; 
    document.getElementById('opt-silahli').className = t === 'silahli' ? 'opt active' : 'opt';
    document.getElementById('opt-silahsiz').className = t === 'silahsiz' ? 'opt active' : 'opt';
}

function setMod(m) { 
    mod = m; 
    document.getElementById('opt-sureli').className = m === 'sureli' ? 'opt active' : 'opt';
    document.getElementById('opt-suresiz').className = m === 'suresiz' ? 'opt active' : 'opt';
}

function sinaviBaslat() {
    if(!tumVeri || tumVeri.length === 0) return alert("Sorular hala yükleniyor, lütfen 1-2 saniye bekle.");
    
    let liste = (tur === 'silahli') ? [...tumVeri] : [...tumVeri.slice(0, 100)];
    aktifSorular = liste.sort(() => Math.random() - 0.5); // Soruları karıştır
    
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
        btn.className = 'choice-btn'; // Eski renkleri temizle
    });
    document.getElementById('q-counter').innerText = `Soru: ${index + 1} / ${aktifSorular.length}`;
}

function cevapla(secim, btn) {
    const dogruCevap = aktifSorular[index].cevap;
    const butonlar = document.getElementById('options-parent');
    butonlar.style.pointerEvents = 'none'; // Çift tıklamayı engelle

    kullaniciCevaplari.push({soru: aktifSorular[index].soru, secim: secim, dogru: dogruCevap});

    if(secim === dogruCevap) {
        btn.classList.add('correct'); // YEŞİL YANAR
        dogruS++;
    } else {
        btn.classList.add('wrong'); // KIRMIZI YANAR
        document.getElementById('btn-' + dogruCevap).classList.add('correct'); // Doğruyu yeşil göster
        yanlisS++;
    }

    // TAM 1.2 SANİYE BEKLE VE GEÇ
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
    document.getElementById('result-text').innerHTML = `
        <span style="color:#27ae60">Doğru: ${dogruS}</span> <br>
        <span style="color:#e74c3c">Yanlış: ${yanlisS}</span> <br>
        Başarı Oranı: %${((dogruS/aktifSorular.length)*100).toFixed(1)}
    `;
}

// 1. PDF: KULLANICININ VERDİĞİ CEVAPLAR (Sınav Sonu İndirilir)
function sonucPdfIndir() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text("ANFA AKADEMI - KENDI CEVAPLARIN", 10, 15);
    doc.setFontSize(10);
    let y = 30;
    kullaniciCevaplari.forEach((item, i) => {
        if(y > 280) { doc.addPage(); y = 15; }
        let durumText = item.secim === item.dogru ? "DOGRU" : `YANLIS (Sen: ${item.secim}, Cevap: ${item.dogru})`;
        doc.text(`${i+1}. Soru: ${durumText}`, 10, y);
        y += 7;
    });
    doc.save("benim_cevaplarim.pdf");
}

// 2. PDF: TÜM EĞİTİM SORULARI (Ayarlar Menüsünden İndirilir)
function tumSorulariPdfIndir() {
    if(!tumVeri || tumVeri.length === 0) return alert("Sorular henüz yüklenmedi!");
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text("ANFA AKADEMI - EGITIM SORULARI VE CEVAPLARI", 10, 15);
    doc.setFontSize(9);
    let y = 30;
    tumVeri.forEach((item, i) => {
        if(y > 280) { doc.addPage(); y = 15; }
        let metin = `${i+1}. Soru: ${item.soru} | CEVAP: ${item.cevap}`;
        // Çok uzun soruları bölmek için
        let splitText = doc.splitTextToSize(metin, 180);
        doc.text(splitText, 10, y);
        y += (splitText.length * 5) + 3;
    });
    doc.save("tum_egitim_sorulari.pdf");
}

function startTimer() {
    timer = setInterval(() => {
        sure--;
        let m = Math.floor(sure/60), s = sure%60;
        document.getElementById('timer').innerHTML = `<i class="fas fa-clock"></i> ${m}:${s<10?'0'+s:s}`;
        if(sure<=0) bitir();
    }, 1000);
}
