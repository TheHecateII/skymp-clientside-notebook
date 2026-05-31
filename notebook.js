const sp = skyrimPlatform;
const { Game, on, Input, Debug } = sp;

// ===== Config =====
const KEY_BOOK = 0x41;   // F7 : ouvrir/fermer le carnet
const KEY_PREV = 0xCB;   // fleche gauche : page precedente
const KEY_NEXT = 0xCD;   // fleche droite : page suivante
const OPEN_ANIM_EVENT = "";
// ==================

let started = false;
let bookOpen = false, bookShown = false, bookTick = 0, reinject = false;
const keyState = {};

function justPressed(code) {
  const down = Input.isKeyPressed(code);
  const was = keyState[code] || false;
  keyState[code] = down;
  return down && !was;
}

on("browserMessage", (e) => {
  const m = e && e.arguments && e.arguments[0];
  if (!m || typeof m !== "object") return;
  if (m.type === "backup") { sp.storage.rpBookNotes = String(m.json || ""); }
  else if (m.type === "close") { bookOpen = false; }
});

function rpApp(backup) {
  var docEl = document.documentElement;
  if (!docEl) return;
  var KEY = 'rpBookNotes_v1';

  if (!document.getElementById('__rpStyle')) {
    var st = document.createElement('style');
    st.id = '__rpStyle';
    st.textContent = ''
      + '#__rpRoot{position:fixed;inset:0;z-index:2147483600;display:none;align-items:center;justify-content:center;'
      + 'background:radial-gradient(circle at 50% 50%,rgba(10,8,5,0.45),rgba(5,4,2,0.75));}'
      + '#__rpRoot *{box-sizing:border-box;font-family:"Palatino Linotype","Book Antiqua",Georgia,"Times New Roman",serif;}'
      + '#__rpBook{display:flex;width:920px;max-width:94vw;height:620px;max-height:88vh;padding:20px;'
      + 'background:linear-gradient(135deg,#4a2f1a,#36210f);border:2px solid #241406;border-radius:12px;'
      + 'box-shadow:0 24px 70px rgba(0,0,0,0.75),inset 0 0 40px rgba(0,0,0,0.55);gap:0;}'
      + '.__rpPage{flex:1;position:relative;overflow:auto;padding:26px 30px;color:#3b2c19;'
      + 'background:radial-gradient(circle at 28% 18%,rgba(0,0,0,0.05),transparent 55%),'
      + 'radial-gradient(circle at 75% 82%,rgba(0,0,0,0.06),transparent 55%),'
      + 'linear-gradient(150deg,#f1e7cd,#e6d6b0);}'
      + '.__rpLeft{border-radius:6px 0 0 6px;box-shadow:inset -16px 0 24px -14px rgba(60,40,15,0.55);}'
      + '.__rpRight{border-radius:0 6px 6px 0;box-shadow:inset 16px 0 24px -14px rgba(60,40,15,0.55);}'
      + '.__rpSpine{width:14px;flex:none;background:linear-gradient(90deg,rgba(40,25,10,0.55),rgba(20,12,4,0.85),rgba(40,25,10,0.55));}'
      + '.__rpH{font-variant:small-caps;letter-spacing:2px;font-size:22px;font-weight:700;color:#5a3d1c;'
      + 'border-bottom:1px solid rgba(90,61,28,0.4);padding-bottom:8px;margin:0 0 14px;}'
      + '.__rpItem{padding:7px 10px;border-radius:5px;cursor:pointer;font-size:15px;color:#4a3720;'
      + 'border:1px solid transparent;}'
      + '.__rpItem:hover{background:rgba(120,85,40,0.12);}'
      + '.__rpItem.cur{background:rgba(120,85,40,0.20);border-color:rgba(90,61,28,0.35);font-weight:700;}'
      + '.__rpItem .d{font-size:11px;color:#8a6c44;}'
      + '.__rpBtn{font-variant:small-caps;letter-spacing:1px;margin-top:10px;padding:8px 12px;border-radius:6px;'
      + 'border:1px solid #6b4a22;background:rgba(120,85,40,0.15);color:#5a3d1c;cursor:pointer;font-size:14px;}'
      + '.__rpBtn:hover{background:rgba(120,85,40,0.28);}'
      + '.__rpTitle{width:100%;background:transparent;border:none;outline:none;color:#3b2c19;'
      + 'font-size:24px;font-weight:700;font-variant:small-caps;letter-spacing:1px;'
      + 'border-bottom:1px solid rgba(90,61,28,0.35);padding:2px 0 8px;margin-bottom:14px;}'
      + '.__rpBody{width:100%;height:calc(100% - 132px);background:transparent;border:none;outline:none;resize:none;'
      + 'color:#3b2c19;font-size:16px;line-height:28px;'
      + 'background-image:repeating-linear-gradient(transparent,transparent 27px,rgba(90,61,28,0.12) 28px);}'
      + '.__rpFoot{position:absolute;left:30px;right:30px;bottom:18px;display:flex;align-items:center;'
      + 'justify-content:space-between;gap:12px;font-size:12px;color:#8a6c44;}'
      + '.__rpNav{display:flex;align-items:center;gap:10px;}'
      + '.__rpMeta{display:flex;align-items:center;gap:12px;}'
      + '.__rpTurn{width:30px;height:30px;border-radius:50%;cursor:pointer;display:flex;align-items:center;justify-content:center;padding:0;'
      + 'border:1px solid #6b4a22;background:rgba(120,85,40,0.15);color:#5a3d1c;font-size:18px;}'
      + '.__rpTurn:hover{background:rgba(120,85,40,0.30);}'
      + '.__rpDel{padding:5px 10px;border-radius:5px;border:1px solid #7a3b2a;background:rgba(120,40,30,0.12);'
      + 'color:#7a3320;cursor:pointer;font-size:12px;}'
      + '.__rpDel:hover{background:rgba(120,40,30,0.25);}'
      + '.__rpClose{position:absolute;top:14px;right:18px;cursor:pointer;color:#5a3d1c;font-size:20px;'
      + 'background:transparent;border:none;}'
      + '.__rpHint{font-size:11px;color:#8a6c44;margin-top:14px;line-height:1.5;}';
    (document.head || docEl).appendChild(st);
  }

  function load() { try { var s = localStorage.getItem(KEY); if (s) return JSON.parse(s); } catch (e) {} return null; }
  var notes = load();
  if ((!notes || !notes.length) && backup) { try { var b = JSON.parse(backup); if (b && b.length) notes = b; } catch (e) {} }
  if (!notes) notes = [];
  if (!notes.length) notes.push({ id: Date.now(), title: 'Premiere page', body: '', ts: Date.now() });

  if (window.__rpInit && document.getElementById('__rpRoot')) return;
  window.__rpInit = true;
  var cur = 0;

  var actx = null;
  function ac() { if (!actx) { try { actx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) {} } if (actx && actx.state === 'suspended') { try { actx.resume(); } catch (e) {} } return actx; }
  function swish(dur, freq, q, gain) {
    var c = ac(); if (!c) return;
    var sr = c.sampleRate, len = Math.floor(sr * dur), buf = c.createBuffer(1, len, sr), dt = buf.getChannelData(0);
    for (var i = 0; i < len; i++) dt[i] = (Math.random() * 2 - 1) * (1 - i / len);
    var s = c.createBufferSource(); s.buffer = buf;
    var bp = c.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = freq; bp.Q.value = q;
    var g = c.createGain(); var t = c.currentTime;
    g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(gain, t + 0.012); g.gain.exponentialRampToValueAtTime(0.0008, t + dur);
    s.connect(bp); bp.connect(g); g.connect(c.destination); s.start(); s.stop(t + dur);
  }
  function playTurn() { swish(0.17, 2600, 0.8, 0.22); }

  var root = document.createElement('div');
  root.id = '__rpRoot';
  root.innerHTML =
    '<div id="__rpBook">'
    + '<div class="__rpPage __rpLeft">'
    + '<div class="__rpH">Carnet</div>'
    + '<div id="__rpList"></div>'
    + '<button class="__rpBtn" data-rp="new">+ Nouvelle page</button>'
    + '<div class="__rpHint">Fleches Gauche/Droite : tourner les pages.<br>Entree : curseur pour ecrire, Echap pour relacher.<br>F7 : fermer.</div>'
    + '</div>'
    + '<div class="__rpSpine"></div>'
    + '<div class="__rpPage __rpRight">'
    + '<button class="__rpClose" data-rp="close" title="Fermer">&#10005;</button>'
    + '<input class="__rpTitle" id="__rpTitle" placeholder="Titre de la page">'
    + '<textarea class="__rpBody" id="__rpBody" placeholder="Ecris ici..."></textarea>'
    + '<div class="__rpFoot">'
    + '<div class="__rpNav"><button class="__rpTurn" data-rp="prev">&#8249;</button>'
    + '<span id="__rpPageNo"></span><button class="__rpTurn" data-rp="next">&#8250;</button></div>'
    + '<div class="__rpMeta"><span id="__rpDate"></span><button class="__rpDel" data-rp="del">Arracher la page</button></div>'
    + '</div>'
    + '</div>'
    + '</div>';
  docEl.appendChild(root);

  var listEl = root.querySelector('#__rpList');
  var titleEl = root.querySelector('#__rpTitle');
  var bodyEl = root.querySelector('#__rpBody');
  var pageNoEl = root.querySelector('#__rpPageNo');
  var dateEl = root.querySelector('#__rpDate');

  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function fmt(ts) {
    var d = new Date(ts);
    if (isNaN(d.getTime())) return '';
    var p = function (n) { return (n < 10 ? '0' : '') + n; };
    return p(d.getDate()) + '/' + p(d.getMonth() + 1) + '/' + d.getFullYear();
  }
  function persist() {
    try { localStorage.setItem(KEY, JSON.stringify(notes)); } catch (e) {}
    try { window.skyrimPlatform.sendMessage({ type: 'backup', json: JSON.stringify(notes) }); } catch (e) {}
  }
  function refreshIndex() {
    var h = '';
    for (var i = 0; i < notes.length; i++) {
      h += '<div class="__rpItem' + (i === cur ? ' cur' : '') + '" data-rp="sel" data-i="' + i + '">'
        + esc(notes[i].title || 'Sans titre') + '<div class="d">' + fmt(notes[i].ts) + '</div></div>';
    }
    listEl.innerHTML = h;
  }
  function showCurrent() {
    var n = notes[cur];
    titleEl.value = n.title || '';
    bodyEl.value = n.body || '';
    pageNoEl.textContent = 'Page ' + (cur + 1) + ' / ' + notes.length;
    dateEl.textContent = fmt(n.ts);
  }
  function select(i, sound) {
    if (i < 0) i = 0; if (i >= notes.length) i = notes.length - 1;
    cur = i; showCurrent(); refreshIndex();
    if (sound) playTurn();
  }
  function turn(d) { var ni = cur + d; if (ni < 0) ni = 0; if (ni > notes.length - 1) ni = notes.length - 1; if (ni !== cur) select(ni, true); }
  function addNote() { notes.push({ id: Date.now(), title: 'Nouvelle page', body: '', ts: Date.now() }); persist(); select(notes.length - 1, true); }
  function delNote() {
    notes.splice(cur, 1);
    if (!notes.length) notes.push({ id: Date.now(), title: 'Premiere page', body: '', ts: Date.now() });
    persist(); if (cur >= notes.length) cur = notes.length - 1; select(cur, true);
  }

  root.addEventListener('click', function (e) {
    var el = e.target && e.target.closest ? e.target.closest('[data-rp]') : null;
    if (!el) return;
    var act = el.getAttribute('data-rp');
    if (act === 'sel') select(parseInt(el.getAttribute('data-i'), 10), true);
    else if (act === 'new') addNote();
    else if (act === 'del') delNote();
    else if (act === 'prev') turn(-1);
    else if (act === 'next') turn(1);
    else if (act === 'close') { window.__rpShow(false); try { window.skyrimPlatform.sendMessage({ type: 'close' }); } catch (e2) {} }
  });
  titleEl.addEventListener('input', function () { notes[cur].title = titleEl.value; notes[cur].ts = notes[cur].ts || Date.now(); persist(); refreshIndex(); });
  bodyEl.addEventListener('input', function () { notes[cur].body = bodyEl.value; persist(); });

  window.__rpShow = function (v) { root.style.display = v ? 'flex' : 'none'; };
  window.__rpTurn = function (d) { turn(d); };

  select(0, false);
}

on("update", () => {
  const player = Game.getPlayer();
  if (!player) return;
  sp.browser.setVisible(true);
  started = true;

  if (justPressed(KEY_BOOK)) {
    bookOpen = !bookOpen;
    if (bookOpen && OPEN_ANIM_EVENT) { try { Debug.sendAnimationEvent(player, OPEN_ANIM_EVENT); } catch (e) {} }
  }

  if (bookOpen) {
    if (!bookShown) { bookShown = true; reinject = true; bookTick = 0; }
    bookTick++;
    if (reinject || bookTick >= 15) {
      const backup = JSON.stringify(sp.storage.rpBookNotes || "");
      let js = "(" + rpApp.toString() + ")(" + backup + ");";
      if (reinject) js += "window.__rpShow&&window.__rpShow(true);";
      sp.browser.executeJavaScript(js);
      reinject = false; bookTick = 0;
    }
    if (justPressed(KEY_PREV)) sp.browser.executeJavaScript("window.__rpTurn&&window.__rpTurn(-1);");
    if (justPressed(KEY_NEXT)) sp.browser.executeJavaScript("window.__rpTurn&&window.__rpTurn(1);");
  } else if (bookShown) {
    sp.browser.executeJavaScript("window.__rpShow&&window.__rpShow(false);");
    try { sp.browser.setFocused(false); } catch (e) {}
    bookShown = false;
  }
});
