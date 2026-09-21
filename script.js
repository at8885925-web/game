const $ = (s) => document.querySelector(s);
const audio = $('#audio'), fileInput = $('#fileInput'), trackList = $('#trackList');
let tracks = [], current = -1, shuffled = false, repeat = false, settings = { autoplay: true, visualizer: true };
const formatTime = (seconds) => { if (!Number.isFinite(seconds)) return '0:00'; return `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2,'0')}`; };
function toast(message) { const el = $('#toast'); el.textContent = message; el.classList.add('show'); setTimeout(() => el.classList.remove('show'), 2400); }
function renderTracks() {
  trackList.innerHTML = tracks.map((t, i) => `<div class="track-row ${i === current ? 'current' : ''}" data-index="${i}"><span>${String(i+1).padStart(2,'0')}</span><div><div class="track-title">${escapeHtml(t.title)}</div><div class="track-file">${escapeHtml(t.file.name)}</div></div><span class="track-file">ملفات الجهاز</span><span class="track-duration">${formatTime(t.duration)}</span><button class="row-play" aria-label="تشغيل ${escapeHtml(t.title)}">${i === current && !audio.paused ? '❚❚' : '▶'}</button></div>`).join('');
  $('#songCount').textContent = String(tracks.length).padStart(2,'0');
  $('#emptyLibrary').classList.toggle('hidden', tracks.length > 0); $('#trackTable').classList.toggle('hidden', tracks.length === 0);
}
function escapeHtml(text) { const d = document.createElement('div'); d.textContent = text; return d.innerHTML; }
function loadTrack(index, play = true) { if (!tracks[index]) return; current = index; const t = tracks[index]; audio.src = t.url; $('#nowTitle').textContent = t.title; $('#nowArtist').textContent = 'ملف محلي • ' + t.file.name; $('#recentTitle').textContent = t.title; $('#recentMeta').textContent = 'من مكتبتك المحلية'; $('#miniCover').textContent = ['♫','♪','♬'][index % 3]; if (play) audio.play().catch(() => toast('اضغط تشغيل للاستماع للأغنية')); renderTracks(); }
function togglePlay() { if (current < 0 && tracks.length) loadTrack(0); else if (current < 0) toast('أضف أغاني من جهازك أولاً'); else audio.paused ? audio.play() : audio.pause(); }
function nextTrack() { if (!tracks.length) return; let n = shuffled ? Math.floor(Math.random()*tracks.length) : (current + 1) % tracks.length; loadTrack(n); }
function previousTrack() { if (!tracks.length) return; loadTrack((current - 1 + tracks.length) % tracks.length); }
function addFiles(files) { const audioFiles = [...files].filter(f => f.type.startsWith('audio/')); if (!audioFiles.length) return toast('اختر ملفات صوتية صالحة'); audioFiles.forEach(file => { const title = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g,' '); const item = { file, title, url: URL.createObjectURL(file), duration: 0 }; tracks.push(item); const temp = document.createElement('audio'); temp.src = item.url; temp.addEventListener('loadedmetadata', () => { item.duration=temp.duration; renderTracks(); }, {once:true}); }); renderTracks(); toast(`تمت إضافة ${audioFiles.length} أغنية لمكتبتك`); if (current < 0) loadTrack(0, false); }
$('#chooseFiles').onclick = () => fileInput.click(); $('#emptyAdd').onclick = () => fileInput.click(); fileInput.onchange = e => addFiles(e.target.files);
$('#playBtn').onclick = togglePlay; $('#recentPlay').onclick = togglePlay; $('#nextBtn').onclick = nextTrack; $('#prevBtn').onclick = previousTrack;
trackList.onclick = e => { const row = e.target.closest('.track-row'); if (!row) return; const i = +row.dataset.index; if (i === current) togglePlay(); else loadTrack(i); };
audio.onplay = () => { $('#playBtn').textContent = '❚❚'; $('#visualizerBtn').classList.toggle('playing', settings.visualizer); renderTracks(); };
audio.onpause = () => { $('#playBtn').textContent = '▶'; $('#visualizerBtn').classList.remove('playing'); renderTracks(); };
audio.ontimeupdate = () => { $('#elapsed').textContent = formatTime(audio.currentTime); $('#progress').value = audio.duration ? audio.currentTime/audio.duration*100 : 0; };
audio.onloadedmetadata = () => { $('#duration').textContent = formatTime(audio.duration); if (tracks[current]) { tracks[current].duration = audio.duration; renderTracks(); } };
audio.onended = () => repeat ? (audio.currentTime=0,audio.play()) : settings.autoplay && nextTrack();
$('#progress').oninput = e => { if (audio.duration) audio.currentTime = audio.duration * e.target.value / 100; }; $('#volume').oninput = e => audio.volume = e.target.value/100; audio.volume=.75;
$('#shuffleBtn').onclick = $('#shuffleControl').onclick = () => { shuffled=!shuffled; $('#shuffleBtn').classList.toggle('active',shuffled); $('#shuffleControl').classList.toggle('active',shuffled); toast(shuffled?'تم تفعيل التشغيل العشوائي':'تم إيقاف التشغيل العشوائي'); };
$('#repeatBtn').onclick = () => { repeat=!repeat; $('#repeatBtn').classList.toggle('active',repeat); toast(repeat?'تكرار الأغنية مفعّل':'تم إيقاف التكرار'); };
$('#heartBtn').onclick = e => { e.currentTarget.classList.toggle('liked'); $('#favoriteCount').textContent = e.currentTarget.classList.contains('liked') ? '01' : '00'; };
function setSettings(open) { $('#settingsPanel').classList.toggle('open',open); $('#overlay').classList.toggle('visible',open); $('#settingsPanel').setAttribute('aria-hidden',!open); }
$('#settingsBtn').onclick=()=>setSettings(true); $('#closeSettings').onclick=()=>setSettings(false); $('#overlay').onclick=()=>setSettings(false);
document.querySelectorAll('.switch').forEach(btn => btn.onclick = () => { const key=btn.dataset.setting; settings[key]=!settings[key]; btn.classList.toggle('on',settings[key]); if(key==='visualizer') $('#visualizerBtn').classList.toggle('playing',settings[key]&&!audio.paused); });
document.querySelectorAll('.theme-choice').forEach(btn => btn.onclick = () => { document.querySelectorAll('.theme-choice').forEach(x=>x.classList.remove('selected')); btn.classList.add('selected'); document.body.classList.toggle('sand',btn.dataset.theme==='sand'); });
document.querySelectorAll('.speed-options button').forEach(btn => btn.onclick = () => { document.querySelectorAll('.speed-options button').forEach(x=>x.classList.remove('selected')); btn.classList.add('selected'); audio.playbackRate=parseFloat(btn.textContent); });
$('#sortBtn').onclick=()=>{ tracks.reverse(); current = current < 0 ? -1 : tracks.length-1-current; renderTracks(); toast('تم ترتيب المكتبة'); };
$('#mobileMenu').onclick=()=>$('.sidebar').classList.toggle('open'); $('#newPlaylist').onclick=()=>toast('قائمة جديدة جاهزة للتخصيص قريباً'); $('#searchBtn').onclick=()=>toast('ابحث داخل مكتبتك بعد إضافة الأغاني'); $('#queueBtn').onclick=()=>toast(`قائمة الانتظار تحتوي على ${tracks.length} أغنية`); $('#aboutBtn').onclick=()=>toast('نغمة — مشغل موسيقى محلي بطابع سوداني');
