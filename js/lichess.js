// ============================================
// Chess Training Program - Lichess Opening Explorer API
// ============================================

window.CT = window.CT || {};

CT.Lichess = (function() {
  'use strict';

  var cache = {};
  var MASTERS_URL = 'https://explorer.lichess.ovh/masters';
  var LICHESS_URL = 'https://explorer.lichess.ovh/lichess';

  // Rate limiting: queue requests to avoid 429 errors
  var requestQueue = [];
  var lastRequestTime = 0;
  var MIN_REQUEST_GAP = 200; // ms between requests
  var processingQueue = false;

  function enqueueRequest(fn) {
    return new Promise(function(resolve, reject) {
      requestQueue.push({ fn: fn, resolve: resolve, reject: reject });
      if (!processingQueue) processQueue();
    });
  }

  function processQueue() {
    if (requestQueue.length === 0) { processingQueue = false; return; }
    processingQueue = true;
    var now = Date.now();
    var wait = Math.max(0, MIN_REQUEST_GAP - (now - lastRequestTime));
    setTimeout(function() {
      var item = requestQueue.shift();
      if (!item) { processingQueue = false; return; }
      lastRequestTime = Date.now();
      item.fn().then(item.resolve, item.reject).then(processQueue, processQueue);
    }, wait);
  }

  function cacheKey(moves, source) {
    return source + ':' + moves.join(',');
  }

  function movesToUCI(sanMoves, startFen) {
    var tempGame = new Chess(startFen);
    var uciMoves = [];
    for (var i = 0; i < sanMoves.length; i++) {
      var move = tempGame.move(sanMoves[i]);
      if (!move) break;
      uciMoves.push(move.from + move.to + (move.promotion || ''));
    }
    return uciMoves;
  }

  var FETCH_TIMEOUT = 8000;

  function fetchWithTimeout(url) {
    return new Promise(function(resolve, reject) {
      var timer = setTimeout(function() { reject(new Error('Request timed out')); }, FETCH_TIMEOUT);
      fetch(url).then(function(r) { clearTimeout(timer); resolve(r); },
                      function(e) { clearTimeout(timer); reject(e); });
    });
  }

  function fetchFromExplorer(url, uciMoves) {
    var params = new URLSearchParams();
    if (uciMoves.length > 0) {
      params.set('play', uciMoves.join(','));
    }
    params.set('moves', '12');
    params.set('topGames', '0');
    params.set('recentGames', '0');

    return fetchWithTimeout(url + '?' + params.toString())
      .then(function(response) {
        if (!response.ok) throw new Error('API error: ' + response.status);
        return response.json();
      });
  }

  function fetchMasters(sanMoves) {
    var key = cacheKey(sanMoves, 'masters');
    if (cache[key]) return Promise.resolve(cache[key]);

    var uciMoves = movesToUCI(sanMoves);
    return enqueueRequest(function() {
      return fetchFromExplorer(MASTERS_URL, uciMoves);
    }).then(function(data) {
      var result = processResponse(data);
      cache[key] = result;
      return result;
    });
  }

  function fetchLichess(sanMoves, ratings, speeds) {
    var key = cacheKey(sanMoves, 'lichess');
    if (cache[key]) return Promise.resolve(cache[key]);

    var uciMoves = movesToUCI(sanMoves);
    var params = new URLSearchParams();
    if (uciMoves.length > 0) {
      params.set('play', uciMoves.join(','));
    }
    params.set('moves', '12');
    params.set('topGames', '0');
    params.set('recentGames', '0');

    var ratingGroups = ratings || [1600, 1800, 2000, 2200, 2500];
    ratingGroups.forEach(function(r) {
      params.append('ratings[]', r);
    });

    var speedGroups = speeds || ['rapid', 'classical', 'blitz'];
    speedGroups.forEach(function(s) {
      params.append('speeds[]', s);
    });

    return enqueueRequest(function() {
      return fetchWithTimeout(LICHESS_URL + '?' + params.toString())
        .then(function(response) {
          if (!response.ok) throw new Error('API error: ' + response.status);
          return response.json();
        });
    }).then(function(data) {
      var result = processResponse(data);
      cache[key] = result;
      return result;
    });
  }

  function processResponse(data) {
    if (!data.moves || data.moves.length === 0) {
      return { moves: [], totalGames: 0, opening: data.opening || null };
    }

    var totalGames = 0;
    data.moves.forEach(function(m) {
      totalGames += m.white + m.draws + m.black;
    });

    var moves = data.moves.map(function(m) {
      var games = m.white + m.draws + m.black;
      var winRate = games > 0 ? ((m.white + m.draws * 0.5) / games * 100) : 50;
      return {
        san: m.san,
        uci: m.uci,
        games: games,
        percentage: totalGames > 0 ? (games / totalGames * 100) : 0,
        whiteWins: m.white,
        draws: m.draws,
        blackWins: m.black,
        winRate: winRate
      };
    });

    moves.sort(function(a, b) { return b.games - a.games; });

    return {
      moves: moves,
      totalGames: totalGames,
      opening: data.opening || null
    };
  }

  function fetchMoves(sanMoves, source) {
    if (source === 'masters') {
      return fetchMasters(sanMoves);
    }
    return fetchLichess(sanMoves);
  }

  function getTopMoves(sanMoves, n, source) {
    return fetchMoves(sanMoves, source || 'masters').then(function(data) {
      return data.moves.slice(0, n || 5);
    });
  }

  function isBookMove(sanMoves, move, threshold) {
    return fetchMoves(sanMoves, 'masters').then(function(data) {
      var minPct = threshold || 1;
      for (var i = 0; i < data.moves.length; i++) {
        if (data.moves[i].san === move && data.moves[i].percentage >= minPct) {
          return { isBook: true, move: data.moves[i], allMoves: data.moves };
        }
      }
      return { isBook: false, move: null, allMoves: data.moves };
    });
  }

  function clearCache() {
    cache = {};
  }

  return {
    fetchMoves: fetchMoves,
    fetchMasters: fetchMasters,
    fetchLichess: fetchLichess,
    getTopMoves: getTopMoves,
    isBookMove: isBookMove,
    clearCache: clearCache
  };
})();
