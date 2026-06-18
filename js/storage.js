// ============================================
// Chess Training Program - Persistent Progress Storage
// ============================================

window.CT = window.CT || {};

CT.Storage = (function() {
  'use strict';

  var OPENING_KEY = 'chess_trainer_openings_v1';

  function sanitize(str) {
    return String(str).replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '');
  }

  function keyFor(name, color) {
    return sanitize(name) + '__' + color;
  }

  function load() {
    try { return JSON.parse(localStorage.getItem(OPENING_KEY) || '{}'); }
    catch (e) { return {}; }
  }

  function persist(data) {
    try { localStorage.setItem(OPENING_KEY, JSON.stringify(data)); }
    catch (e) {}
  }

  function getStats(name, color) {
    return load()[keyFor(name, color)] || null;
  }

  function recordSession(name, color, correct, total) {
    if (total === 0) return null;
    var all = load();
    var k = keyFor(name, color);
    var s = all[k] || { attempts: 0, correct: 0, total: 0 };
    s.attempts++;
    s.correct += correct;
    s.total += total;
    s.lastPracticed = new Date().toISOString().slice(0, 10);
    all[k] = s;
    persist(all);
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
    return load();
  }

  return {
    keyFor: keyFor,
    getStats: getStats,
    recordSession: recordSession,
    masteryLevel: masteryLevel,
    masteryLabel: masteryLabel,
    getAllStats: getAllStats
  };
})();
