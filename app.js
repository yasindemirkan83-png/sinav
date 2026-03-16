let index = 0, dogruS = 0, yanlisS = 0, sure = 165 * 60, timer;
let aktifSorular = [], tumVeri = [], kullaniciCevaplari = [];
let tur = 'silahli', mod = 'sureli';

window.onload = async () => {
    setTimeout(() => {
        document.getElementById('splash').style.display = 'none';
        document.getElementById('main-header').style.display = 'flex';
        document.getElementById('entry-screen').style.display = 'block';
    }, 3000);

    try {
        // GitHub URL'nize göre fetch
        const response = await fetch('sorular.json');
        tumVeri = await response.json();
    } catch (err) {
        alert("Sorular yüklenemedi! sorular.json dosyasını kontrol et.");
    }
};

function setTur(t) { 
    tur = t; 
    document.getElementById('opt-silahli').className = t === 'silahli' ? 'opt active' : 'opt';
    document.getElementById('opt-silahsiz').className = t === 'silahsiz' ? 'opt active' : 'opt';
}

function sinaviBaslat() {
    aktifSorular = (tur === 'silahli') ? [...tumVeri] : [...tumVeri.slice(0, 100)];
    aktifSorular = aktifSorular.sort(() => Math.random() - 0.5);
    
    document.getElementById('entry-screen').style.display = 'none';
    document.getElementById('quiz-screen').style.display = 'block';
    if(mod === 'sureli') startTimer();
    soruGoster();
}

function soruGoster() {
    const s = aktifSorular[index];
    document.getElementById('q-text').innerText = `${index + 1}. ${s.soru}`;
    ['A','B','C','D','E'].forEach(opt => {
        document.getElementById('btn-'+opt).innerText = `${opt}) ${s[opt.toLowerCase()]}`;
        document.getElementById('btn-'+opt).className = 'choice-btn';
    });
    document.getElementById('q-counter').innerText = `Soru: ${index + 1} / ${aktifSorular.length}`;
}

function cevapla(secim, btn) {
    const dogru = aktifSorular[index].cevap;
    document.getElementById('options-parent').style.pointerEvents = 'none';
    
    kullaniciCevaplari.push({
        soru: aktifSorular[index].soru,
        verilen: secim,
        dogru: dogru
    });

    if(secim === dogru) {
        btn.classList.add('correct');
        dogruS++;
    } else {
        btn.classList.add('wrong');
        document.getElementById('btn-'+dogru).classList.add('correct');
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
    document.getElementById('quiz-screen').style.display = 'none';
    document.getElementById('result-screen').style.display = 'block';
    document.getElementById('result-text').innerHTML = `
        <b>Doğru:</b> ${dogruS} <br>
        <b>Yanlış:</b> ${yanlisS} <br>
        <b>Başarı:</b> %${((dogruS/aktifSorular.length)*100).toFixed(1)}
    `;
}

function pdfIndir() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("ANFA AKADEMI SINAV SONUCLARI", 10, 10);
    doc.setFontSize(12);
    
    let y = 20;
    kullaniciCevaplari.forEach((item, i) => {
        if (y > 280) { doc.addPage(); y = 20; }
        const durum = item.verilen === item.dogru ? "DOGRU" : "YANLIS";
        doc.text(`${i+1}. Soru: ${durum} (Sen: ${item.verilen}, Cevap: ${item.dogru})`, 10, y);
        y += 10;
    });
    doc.save("sinav_sonucu.pdf");
}

function startTimer() {
    timer = setInterval(() => {
        sure--;
        let m = Math.floor(sure/60), s = sure%60;
        document.getElementById('timer').innerHTML = `<i class="fas fa-clock"></i> ${m}:${s<10?'0'+s:s}`;
        if(sure<=0) bitir();
    }, 1000);
}
