let index = 0, dogruS = 0, sure = 165 * 60, timer, aktifSorular = [], tumVeri = [];
let tur = 'silahli', mod = 'sureli';

window.onload = async () => {
    setTimeout(() => {
        document.getElementById('splash').style.display = 'none';
        document.getElementById('main-header').style.display = 'flex';
        document.getElementById('entry-screen').style.display = 'block';
    }, 5000);

    try {
        const response = await fetch('sorular.json');
        if (!response.ok) throw new Error("JSON bulunamadı");
        tumVeri = await response.json();
    } catch (err) {
        console.error("HATA:", err);
    }
};

function setTur(t) { 
    tur = t; 
    document.getElementById('opt-silahli').classList.toggle('active', t === 'silahli');
    document.getElementById('opt-silahsiz').classList.toggle('active', t === 'silahsiz');
}

function setMod(m) { 
    mod = m; 
    document.getElementById('opt-sureli').classList.toggle('active', m === 'sureli');
    document.getElementById('opt-suresiz').classList.toggle('active', m === 'suresiz');
}

function sinaviBaslat() {
    if(!tumVeri || tumVeri.length === 0) return alert("Sorular yükleniyor, lütfen bekle.");
    
    // Soruları kopyala ve karıştır
    let tempSorular = (tur === 'silahli') ? [...tumVeri] : [...tumVeri.slice(0, 100)];
    aktifSorular = tempSorular.sort(() => Math.random() - 0.5);
    
    index = 0; dogruS = 0;
    document.getElementById('entry-screen').style.display = 'none';
    document.getElementById('quiz-screen').style.display = 'block';
    
    if(mod === 'sureli') baslatTimer();
    soruGoster();
}

function soruGoster() {
    window.scrollTo(0, 0);
    const s = aktifSorular[index];
    const butonlar = document.querySelectorAll('.choice-btn');
    butonlar.forEach(b => b.classList.remove('correct', 'wrong'));

    document.getElementById('q-text').innerText = (index + 1) + ". " + s.soru;
    document.getElementById('btn-A').innerText = "A) " + s.a;
    document.getElementById('btn-B').innerText = "B) " + s.b;
    document.getElementById('btn-C').innerText = "C) " + s.c;
    document.getElementById('btn-D').innerText = "D) " + s.d;
    document.getElementById('btn-E').innerText = "E) " + s.e;
    document.getElementById('q-counter').innerText = `Soru: ${index + 1} / ${aktifSorular.length}`;
}

function cevapla(secim, btn) {
    const dogruCevap = aktifSorular[index].cevap;
    document.getElementById('options-parent').style.pointerEvents = 'none';

    if(secim === dogruCevap) {
        btn.classList.add('correct');
        dogruS++;
    } else {
        btn.classList.add('wrong');
        document.getElementById('btn-' + dogruCevap).classList.add('correct');
    }

    setTimeout(() => {
        document.getElementById('options-parent').style.pointerEvents = 'auto';
        index++;
        if(index < aktifSorular.length) soruGoster(); else sinavBitir();
    }, 1200);
}

function sinavBitir() {
    clearInterval(timer);
    alert(`Sınav Bitti! Skor: ${dogruS} Doğru / ${aktifSorular.length} Soru.`);
    location.reload();
}

function baslatTimer() {
    timer = setInterval(() => {
        sure--;
        let m = Math.floor(sure/60), s = sure%60;
        document.getElementById('timer').innerHTML = `<i class="fas fa-clock"></i> ${m}:${s<10?'0'+s:s}`;
        if(sure<=0) sinavBitir();
    }, 1000);
}

function toggleMenu() {
    alert("ANFA Akademi - Sürüm 1.0");
}
