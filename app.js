let seciliTur = 'silahli', seciliMod = 'sureli', cevapAnahtari = [], ogrenciCevaplari = [], index = 0, dogruS = 0, sure = 165 * 60, timer;

window.onload = () => {
    setTimeout(() => {
        document.getElementById('splash').style.display = 'none';
        document.getElementById('main-header').style.display = 'flex';
        document.getElementById('entry-screen').style.display = 'block';
    }, 5000);

    const saved = localStorage.getItem('anfa_keys_v4');
    if(saved) cevapAnahtari = JSON.parse(saved);
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
    if(cevapAnahtari.length < 10) return alert("Cevap anahtarı boş!");
    aktifSorular = seciliTur === 'silahli' ? cevapAnahtari : cevapAnahtari.slice(0, 100);
    document.getElementById('entry-screen').style.display = 'none';
    document.getElementById('quiz-screen').style.display = 'block';
    if(seciliMod === 'sureli') baslatTimer();
    soruYukle();
}

function soruYukle() {
    // Önemli: Soruların resimlerini "1.jpg", "2.jpg" şeklinde GitHub'a atman lazım.
    document.getElementById('question-image').src = (index + 1) + ".jpg";
    document.getElementById('q-counter').innerText = "Soru: " + (index + 1);
}

function cevapla(secim, element) {
    const dogruCevap = aktifSorular[index];
    const butonlar = document.querySelectorAll('.opt-btn');
    document.getElementById('options-container').style.pointerEvents = 'none';

    if(secim === dogruCevap) {
        element.classList.add('correct');
        dogruS++;
    } else {
        element.classList.add('wrong');
        butonlar.forEach(btn => { if(btn.innerText === dogruCevap) btn.classList.add('correct'); });
    }

    ogrenciCevaplari.push({ s: index+1, m: secim, d: dogruCevap });

    setTimeout(() => {
        butonlar.forEach(btn => btn.classList.remove('correct', 'wrong'));
        document.getElementById('options-container').style.pointerEvents = 'auto';
        index++;
        if(index >= aktifSorular.length) sinavBitir();
        else soruYukle();
    }, 1200);
}

function sinavBitir() {
    clearInterval(timer);
    // Sonuçları TXT olarak indir
    let rapor = `ANFA SONUÇ\nDoğru: ${dogruS}\nYanlış: ${aktifSorular.length - dogruS}\n`;
    const blob = new Blob([rapor], {type: 'text/plain'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = "Anfa_Sonuc.txt";
    a.click();
    location.reload();
}

function toggleMenu() { document.getElementById('side-menu').classList.toggle('active'); }
function adminGiris() { if(prompt("Şifre:") === "anfa2026") document.getElementById('admin-modal').style.display='flex'; }
function kaydetAdmin() {
    const val = document.getElementById('cevap-input').value.toUpperCase().replace(/\s/g, '');
    localStorage.setItem('anfa_keys_v4', JSON.stringify(val.split('')));
    alert("Kaydedildi!");
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
