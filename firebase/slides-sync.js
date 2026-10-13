/* 기존 슬라이드의 공개 연결 지점에 Firebase 상태 연결. 설정 전 SDK 로드 없음. */
const $ = id => document.getElementById(id);
const params = new URLSearchParams(location.search);
const wantAdmin = params.has('admin');
document.documentElement.classList.toggle('fb-admin', wantAdmin);
const api = window.MINIPET_SLIDES;
let sync = null, state = null, admin = false, online = false, authPending = false;
const cfg = window.FIREBASE_CONFIG;
const required = ['apiKey','authDomain','databaseURL','projectId','appId'];
const configured = cfg && required.every(k => typeof cfg[k] === 'string' && cfg[k].trim() && !cfg[k].includes('[')) && /^https:\/\/[^/]+\.(firebaseio\.com|firebasedatabase\.app)\/?$/.test(cfg.databaseURL);
function message(text) { $('fbBanner').textContent = text; $('fbBanner').hidden = false; }
function render() {
  const active = !!state;
  api.configure({ active, admin, locked: active && state.locked, pdf: !active || state.pdf });
  $('fbLoginBtn').hidden = !wantAdmin || admin || !sync;
  $('fbLockBtn').hidden = $('fbPdfBtn').hidden = $('fbLogoutBtn').hidden = !admin;
  $('fbLockBtn').textContent = '잠금 ' + (state && state.locked ? 'ON' : 'OFF');
  $('fbLockBtn').setAttribute('aria-pressed', String(!!(state && state.locked)));
  $('fbPdfBtn').textContent = 'PDF ' + (!state || state.pdf ? 'ON' : 'OFF');
  $('fbPdfBtn').setAttribute('aria-pressed', String(!state || state.pdf));
  const text = !sync ? '자유 열람' : !online ? '연결 대기' : admin ? '강사 제어' : active && state.locked ? '강사 따라가기' : '자유 이동';
  $('fbStatus').textContent = text;
}
function openLogin() { $('fbLogin').hidden = false; $('fbEmail').focus(); }
function closeLogin() { $('fbLogin').hidden = true; $('fbPassword').value = ''; $('fbLoginBtn').focus(); }
$('fbLoginBtn').addEventListener('click', openLogin);
$('fbClose').addEventListener('click', closeLogin);
document.addEventListener('keydown', e => { if (e.key === 'Escape' && !$('fbLogin').hidden) closeLogin(); });
$('fbForm').addEventListener('submit', async e => {
  e.preventDefault(); if (!sync) return;
  $('fbError').textContent = ''; $('fbSubmit').disabled = true; authPending = true;
  try { await sync.login($('fbEmail').value.trim(), $('fbPassword').value); }
  catch (error) { authPending = false; $('fbError').textContent = '로그인 실패 · 이메일·비밀번호·Authentication 설정 확인'; }
  finally { $('fbPassword').value = ''; $('fbSubmit').disabled = false; }
});
async function write(action) {
  try { await action(); }
  catch (error) { message('저장 실패 · 연결·규칙·admins 권한 확인'); if (state) api.goRemote(state.slide); }
}
$('fbLockBtn').addEventListener('click', () => { if (admin && state) write(() => sync.setLock(!state.locked)); });
$('fbPdfBtn').addEventListener('click', () => { if (admin && state) write(() => sync.setPdf(!state.pdf)); });
$('fbLogoutBtn').addEventListener('click', () => { if (sync) write(() => sync.logout()); });
api.onNavigate(n => { if (admin && sync) write(() => sync.setSlide(n)); });
render();
if (!configured) {
  message('Firebase 설정 전 · 자유 열람');
} else {
  message('Firebase 연결 대기 · 수업 상태 확인');
  try {
    const { createSync } = await import('./firebase-sync.js');
    sync = createSync(cfg, window.DECK_ID, { total: api.total, adminMode: wantAdmin });
    sync.onState((next, error) => {
      if (error) { message('상태 읽기 실패 · Firebase 규칙 확인'); return; }
      state = next; render();
      if (state && (admin || state.locked)) api.goRemote(state.slide);
      if (online) { if (state) $('fbBanner').hidden = true; else message('강사 시작 전 · 자유 열람'); }
    });
    sync.onConnection(value => {
      online = value; render();
      if (!value) message('연결 끊김 · 마지막 수업 상태 유지 · 재연결 대기');
      else if (state) $('fbBanner').hidden = true;
      else message('강사 시작 전 · 자유 열람');
    });
    sync.onAdmin((allowed, user, error) => {
      admin = wantAdmin && allowed; render();
      if (admin) { $('fbLogin').hidden = true; $('fbPassword').value = ''; authPending = false; if (state) api.goRemote(state.slide); }
      else if (wantAdmin && user && (authPending || error)) { $('fbError').textContent = error ? '강사 권한 확인 실패 · Firebase 규칙 확인' : '강사 목록(admins)에 없는 계정'; }
    });
    if (wantAdmin) openLogin();
    render();
  } catch (error) {
    sync = null; state = null; admin = false; render();
    message('Firebase 연결 실패 · 자유 열람 · 설정과 인터넷 확인');
  }
}
