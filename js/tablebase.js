window.CT = window.CT || {};

CT.Tablebase = (function() {
  'use strict';

  var API = 'https://tablebase.lichess.ovh/standard';
  var cache = {};

  function pieceCount(fen) {
    return fen.split(' ')[0].replace(/[^a-zA-Z]/g, '').length;
  }

  function canProbe(fen) {
    return pieceCount(fen) <= 7;
  }

  function probe(fen) {
    var key = fen.split(' ').slice(0, 4).join(' ');
    if (cache[key]) return Promise.resolve(cache[key]);

    return fetch(API + '?fen=' + encodeURIComponent(fen))
      .then(function(r) {
        if (!r.ok) throw new Error(r.status);
        return r.json();
      })
      .then(function(data) {
        cache[key] = data;
        return data;
      });
  }

  var CAT_RANK = { 'loss': 0, 'blessed-loss': 1, 'draw': 2, 'cursed-win': 3, 'win': 4, 'maybe-win': 4, 'maybe-loss': 0 };

  function bestMoveFromData(data) {
    if (!data || !data.moves || data.moves.length === 0) return null;

    var ranked = data.moves.slice().sort(function(a, b) {
      var ar = CAT_RANK[a.category] != null ? CAT_RANK[a.category] : 2;
      var br = CAT_RANK[b.category] != null ? CAT_RANK[b.category] : 2;
      if (ar !== br) return ar - br;
      if (a.category === 'loss' && b.category === 'loss') {
        return Math.abs(a.dtz) - Math.abs(b.dtz);
      }
      return 0;
    });

    return ranked[0];
  }

  function bestMove(fen) {
    return probe(fen).then(bestMoveFromData);
  }

  function categoryToScore(cat, dtz) {
    if (cat === 'win') return Math.max(300, 1000 - Math.abs(dtz || 0) * 10);
    if (cat === 'cursed-win' || cat === 'maybe-win') return 150;
    if (cat === 'draw') return 0;
    if (cat === 'blessed-loss' || cat === 'maybe-loss') return -150;
    if (cat === 'loss') return -Math.max(300, 1000 - Math.abs(dtz || 0) * 10);
    return 0;
  }

  function analyzeMove(fenBefore, playerMoveSan, playerColor) {
    return probe(fenBefore).then(function(data) {
      if (!data || !data.moves) return null;

      var best = bestMoveFromData(data);
      if (!best) return null;

      var played = null;
      for (var i = 0; i < data.moves.length; i++) {
        if (data.moves[i].san === playerMoveSan) {
          played = data.moves[i];
          break;
        }
      }
      if (!played) return null;

      var bestCat = CAT_RANK[best.category] != null ? CAT_RANK[best.category] : 2;
      var playedCat = CAT_RANK[played.category] != null ? CAT_RANK[played.category] : 2;

      var isBest = played.san === best.san || playedCat === bestCat;

      var quality, className;
      if (isBest) {
        quality = 'Best move!'; className = 'best';
      } else if (playedCat === bestCat + 1) {
        quality = 'Good move'; className = 'good';
      } else if (playedCat <= bestCat + 2) {
        quality = 'Inaccuracy'; className = 'inaccuracy';
      } else {
        quality = 'Blunder'; className = 'blunder';
      }

      if (!isBest && bestCat <= 1 && playedCat >= 2) {
        quality = 'Blunder'; className = 'blunder';
      }

      var afterCp = categoryToScore(played.category, played.dtz);

      return {
        quality: quality,
        className: className,
        scoreDiff: Math.abs(categoryToScore(best.category, best.dtz) - categoryToScore(played.category, played.dtz)),
        bestMove: best.san,
        bestMoveSquares: best.uci ? { from: best.uci.substring(0, 2), to: best.uci.substring(2, 4) } : null,
        isBest: isBest,
        optimalLine: isBest ? [] : [best.san],
        alternatives: [],
        engineScore: afterCp,
        engineScoreType: 'cp',
        tbCategory: played.category,
        tbPositionCategory: data.category
      };
    });
  }

  return {
    canProbe: canProbe,
    probe: probe,
    bestMove: bestMove,
    analyzeMove: analyzeMove,
    categoryToScore: categoryToScore
  };
})();
