// ============================================
// Chess Training Program - Persistent Progress Storage
// ============================================

window.CT = window.CT || {};

CT.Storage = (function() {
  'use strict';

  var OPENING_KEY = 'chess_trainer_openings_v1';

  // --- Local helpers ---

  function sanitize(str) {
    return String(str).replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '');
  }

  function keyFor(name, color) {
    return sanitize(name) + '__' + color;
  }

  function loadLocal() {
    try { return JSON.parse(localStorage.getItem(OPENING_KEY) || '{}'); }
    catch (e) { return {}; }
  }

  function persistLocal(data) {
    try { localStorage.setItem(OPENING_KEY, JSON.stringify(data)); }
    catch (e) {}
  }

  // --- Supabase sync ---

  async function syncFromSupabase() {
    if (!CT.currentUser) return;
    var res = await window.sb
      .from('user_progress')
      .select('*')
      .eq('user_id', CT.currentUser.id);
    if (res.error || !res.data) return;

    var merged = loadLocal();
    res.data.forEach(function(row) {
      merged[row.opening_key] = {
        attempts: row.attempts,
        correct: row.correct,
        total: row.total,
        lastPracticed: row.last_practiced
      };
    });
    persistLocal(merged);
  }

  async function upsertToSupabase(openingKey, stats) {
    if (!CT.currentUser) return;
    await window.sb.from('user_progress').upsert({
      user_id: CT.currentUser.id,
      opening_key: openingKey,
      attempts: stats.attempts,
      correct: stats.correct,
      total: stats.total,
      last_practiced: stats.lastPracticed,
      updated_at: new Date().toISOString()
    }, { onConflict: 'user_id,opening_key' });
  }

  // --- Public API ---

  function getStats(name, color) {
    return loadLocal()[keyFor(name, color)] || null;
  }

  function recordSession(name, color, correct, total) {
    if (total === 0) return null;
    var all = loadLocal();
    var k = keyFor(name, color);
    var s = all[k] || { attempts: 0, correct: 0, total: 0 };
    s.attempts++;
    s.correct += correct;
    s.total += total;
    s.lastPracticed = new Date().toISOString().slice(0, 10);
    all[k] = s;
    persistLocal(all);
    upsertToSupabase(k, s);
    return s;
  }

  function masteryLevel(stats) {
    if (!stats || !stats.attempts || !stats.total) return 'new';
    var acc = stats.correct / stats.total;
    if (acc >= 0.90 && stats.attempts >= 3) return 'mastered';
    if (acc >= 0.80) return 'practiced';
    if (acc >= 0.60) return 'learning';
    return 'struggling';
  }

  var LABELS = {
    new: 'New', struggling: 'Struggling',
    learning: 'Learning', practiced: 'Practiced', mastered: 'Mastered'
  };

  function masteryLabel(level) {
    return LABELS[level] || level;
  }

  function getAllStats() {
    return loadLocal();
  }

  return {
    keyFor: keyFor,
    getStats: getStats,
    recordSession: recordSession,
    masteryLevel: masteryLevel,
    masteryLabel: masteryLabel,
    getAllStats: getAllStats,
    syncFromSupabase: syncFromSupabase
  };
})();
