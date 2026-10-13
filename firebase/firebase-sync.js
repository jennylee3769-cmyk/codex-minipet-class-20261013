/* 제공된 Firebase 동기화 예제 기반. 경로: decks/{DECK_ID}/state. */
import { initializeApp, getApps } from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js';
import { getDatabase, ref, get, set, update, onValue, serverTimestamp } from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-database.js';
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js';

export function createSync(cfg, deckId, options = {}) {
  if (!/^[A-Za-z0-9-]+$/.test(deckId)) throw new Error('invalid-deck');
  const name = 'minipet-' + deckId;
  const app = getApps().find(a => a.name === name) || initializeApp(cfg, name);
  const db = getDatabase(app), auth = getAuth(app);
  const stateRef = ref(db, 'decks/' + deckId + '/state');
  const total = options.total || 18;
  let admin = false, user = null, revision = 0;
  const listeners = new Set();
  function notify(error = null) { listeners.forEach(cb => cb(admin, user, error)); }
  onAuthStateChanged(auth, async u => {
    const token = ++revision;
    user = u; admin = false; notify();
    if (!u) return;
    try {
      const allowed = (await get(ref(db, 'admins/' + u.uid))).val() === true;
      if (token !== revision) return;
      admin = allowed;
      if (admin && options.adminMode) {
        const current = await get(stateRef);
        if (token !== revision) return;
        if (!current.exists()) await set(stateRef, { slide: 0, locked: true, pdf: true, updatedAt: serverTimestamp() });
      }
      if (token === revision) notify();
    } catch (error) { if (token === revision) { admin = false; notify(error); } }
  });
  function patch(values) {
    if (!admin || !options.adminMode) return Promise.reject(new Error('not-admin'));
    return update(stateRef, { ...values, updatedAt: serverTimestamp() });
  }
  return {
    onState(cb) {
      return onValue(stateRef, snapshot => {
        const value = snapshot.val();
        if (value === null) { cb(null); return; }
        if (!Number.isInteger(value.slide) || value.slide < 0 || value.slide >= total || typeof value.locked !== 'boolean' || typeof value.pdf !== 'boolean') { cb(null, new Error('invalid-state')); return; }
        cb(value);
      }, error => cb(null, error));
    },
    onConnection(cb) { return onValue(ref(db, '.info/connected'), s => cb(s.val() === true)); },
    onAdmin(cb) { listeners.add(cb); cb(admin, user); return () => listeners.delete(cb); },
    login(email, password) { return signInWithEmailAndPassword(auth, email, password); },
    logout() { return signOut(auth); },
    setSlide(n) { return patch({ slide: Math.max(0, Math.min(total - 1, Math.trunc(n))) }); },
    setLock(value) { return patch({ locked: !!value }); },
    setPdf(value) { return patch({ pdf: !!value }); }
  };
}
