window.CT = window.CT || {};

CT.Engine = (function() {
  'use strict';

  var worker = null;
  var ready = false;
  var loadError = false;
  var pendingResolve = null;
  var pendingData = {};
  var readyResolve = null;
  var statusListeners = [];
  var pendingTopMovesResolve = null;
  var pendingTopMoves = {};
  var pendingMultiPVCount = 1;

  function init() {
    if (worker) {
      if (ready) return Promise.resolve();
      if (loadError) return Promise.reject(new Error('Engine load failed'));
      return new Promise(function(resolve) {
        readyResolve = resolve;
      });
    }
    return new Promise(function(resolve, reject) {
      try {
        notifyStatus('loading');
        worker = new Worker('js/stockfish-worker.js');
        worker.onerror = function() {
          loadError = true;
          notifyStatus('error');
          reject(new Error('Engine load failed'));
        };
        worker.onmessage = handleMessage;
        readyResolve = resolve;
        send('uci');
      } catch (e) {
        loadError = true;
        notifyStatus('error');
        reject(e);
      }
    });
  }

  function send(cmd) {
    if (worker) worker.postMessage(cmd);
  }

  function handleMessage(e) {
    var line = typeof e.data === 'string' ? e.data : '';
    if (!line) return;

    if (line === 'uciok') {
      send('setoption name Skill Level value 20');
      send('isready');
      return;
    }

    if (line === 'readyok') {
      if (!ready) {
        ready = true;
        notifyStatus('ready');
        if (readyResolve) { readyResolve(); readyResolve = null; }
      }
      return;
    }

    if (line.indexOf('info ') === 0 && line.indexOf(' pv ') !== -1) {
      if (pendingTopMovesResolve) {
        parseMultiPVInfoLine(line);
      } else {
        parseInfoLine(line);
      }
      return;
    }

    if (line.indexOf('bestmove') === 0) {
      if (pendingTopMovesResolve) {
        var rTop = pendingTopMovesResolve;
        pendingTopMovesResolve = null;
        var topResults = [];
        for (var ti = 1; ti <= pendingMultiPVCount; ti++) {
          if (pendingTopMoves[ti]) topResults.push(pendingTopMoves[ti]);
        }
        pendingTopMoves = {};
        send('setoption name MultiPV value 1');
        rTop(topResults);
        return;
      }
      pendingData.bestMoveUci = line.split(' ')[1];
      if (pendingResolve) {
        var r = pendingResolve;
        var d = {};
        for (var k in pendingData) if (pendingData.hasOwnProperty(k)) d[k] = pendingData[k];
        pendingResolve = null;
        pendingData = {};
        r(d);
      }
      return;
    }
  }

  function parseMultiPVInfoLine(line) {
    var mpv = line.match(/ multipv (\d+)/);
    var idx = mpv ? parseInt(mpv[1]) : 1;
    var pv = line.match(/ pv (\S+)/);
    var score = line.match(/score (cp|mate) (-?\d+)/);
    var depth = line.match(/ depth (\d+)/);
    if (pv) {
      pendingTopMoves[idx] = {
        uci: pv[1],
        scoreType: score ? score[1] : 'cp',
        score: score ? parseInt(score[2]) : 0,
        depth: depth ? parseInt(depth[1]) : 0
      };
    }
  }

  function parseInfoLine(line) {
    var m = line.match(/score (cp|mate) (-?\d+)/);
    if (m) { pendingData.scoreType = m[1]; pendingData.score = parseInt(m[2]); }
    m = line.match(/ depth (\d+)/);
    if (m) pendingData.depth = parseInt(m[1]);
    m = line.match(/ pv (.+)/);
    if (m) pendingData.pv = m[1].trim().split(' ');
  }

  function getTopMoves(fen, n, opts) {
    if (!ready) return Promise.resolve([]);
    if (pendingTopMovesResolve) {
      var old = pendingTopMovesResolve;
      pendingTopMovesResolve = null;
      pendingTopMoves = {};
      old([]);
    }
    var count = Math.max(1, Math.min(n || 3, 5));
    return new Promise(function(resolve) {
      pendingTopMovesResolve = resolve;
      pendingTopMoves = {};
      pendingMultiPVCount = count;
      send('setoption name MultiPV value ' + count);
      send('position fen ' + fen);
      var cmd = 'go movetime ' + ((opts && opts.movetime) || 500);
      send(cmd);
    });
  }

  function go(fen, opts) {
    if (pendingTopMovesResolve) {
      var rAbort = pendingTopMovesResolve;
      pendingTopMovesResolve = null;
      pendingTopMoves = {};
      send('setoption name MultiPV value 1');
      rAbort([]);
    }
    return new Promise(function(resolve) {
      pendingResolve = resolve;
      pendingData = {};
      send('position fen ' + fen);
      var cmd = 'go';
      if (opts && opts.depth) cmd += ' depth ' + opts.depth;
      if (opts && opts.movetime) cmd += ' movetime ' + opts.movetime;
      send(cmd);
    });
  }

  function setSkillLevel(level) {
    send('setoption name Skill Level value ' + Math.max(0, Math.min(20, level)));
  }

  function getBestMove(fen, rating) {
    var skill = Math.max(0, Math.min(20, Math.round((rating - 800) / 100)));
    var movetime = rating < 1000 ? 200 : rating < 1400 ? 400 : rating < 1800 ? 700 : rating < 2200 ? 1200 : 2000;
    setSkillLevel(skill);
    return go(fen, { movetime: movetime });
  }

  function pieceCount(fen) {
    return fen.split(' ')[0].replace(/[^a-zA-Z]/g, '').length;
  }

  function depthForFen(fen) {
    var pieces = pieceCount(fen);
    if (pieces <= 5) return 26;
    if (pieces <= 8) return 20;
    return 14;
  }

  function analyze(fen, depth) {
    setSkillLevel(20);
    return go(fen, { depth: depth || depthForFen(fen) });
  }

  function analyzeMove(fenBefore, fenAfter, playerMoveSan, playerColor) {
    var depth = depthForFen(fenBefore);
    return analyze(fenBefore, depth).then(function(bd) {
      var bestSan = uciToSan(fenBefore, bd.bestMoveUci);
      var bestSq = uciToSquares(bd.bestMoveUci);
      if (!bestSan) return makeResult(0, null, null, true, [], bd);

      if (bestSan === playerMoveSan) {
        var flipped = { score: -(bd.score || 0), scoreType: bd.scoreType };
        if (flipped.scoreType === 'mate' && bd.score) flipped.score = -bd.score;
        return makeResult(0, bestSan, bestSq, true, pvToSan(fenBefore, bd.pv), flipped);
      }

      return analyze(fenAfter, depth).then(function(ad) {
        var cpLoss = 0;
        if (bd.scoreType === 'mate' && ad.scoreType === 'mate') {
          cpLoss = Math.max(0, (Math.abs(ad.score) - Math.abs(bd.score)) * 50);
        } else if (bd.scoreType === 'mate' && ad.scoreType === 'cp') {
          cpLoss = 500;
        } else if (bd.scoreType === 'cp' && ad.scoreType === 'mate') {
          cpLoss = ad.score > 0 ? 900 : 0;
        } else {
          cpLoss = Math.max(0, bd.score + ad.score);
        }
        return makeResult(cpLoss, bestSan, bestSq, false, pvToSan(fenBefore, bd.pv), ad);
      });
    });
  }

  function makeResult(cpLoss, bestSan, bestSq, isBest, optLine, engineData) {
    var q, c;
    if (cpLoss < 15) { q = 'Best move!'; c = 'best'; }
    else if (cpLoss < 50) { q = 'Good move'; c = 'good'; }
    else if (cpLoss < 150) { q = 'Inaccuracy'; c = 'inaccuracy'; }
    else if (cpLoss < 350) { q = 'Mistake'; c = 'mistake'; }
    else { q = 'Blunder'; c = 'blunder'; }
    return {
      quality: q, className: c, scoreDiff: Math.round(cpLoss),
      bestMove: bestSan, bestMoveSquares: bestSq,
      isBest: isBest, optimalLine: optLine || [], alternatives: [],
      engineScore: engineData ? engineData.score : null,
      engineScoreType: engineData ? engineData.scoreType : null
    };
  }

  function uciToSan(fen, uci) {
    if (!uci || uci.length < 4) return null;
    var c = new Chess(fen);
    var mv = c.move({
      from: uci.substring(0, 2),
      to: uci.substring(2, 4),
      promotion: uci.length > 4 ? uci.charAt(4) : undefined
    });
    return mv ? mv.san : null;
  }

  function uciToSquares(uci) {
    return uci && uci.length >= 4
      ? { from: uci.substring(0, 2), to: uci.substring(2, 4) }
      : null;
  }

  function pvToSan(fen, pv) {
    if (!pv || !pv.length) return [];
    var c = new Chess(fen), result = [];
    for (var i = 0; i < Math.min(pv.length, 5); i++) {
      var san = uciToSan(c.fen(), pv[i]);
      if (!san) break;
      c.move(san);
      result.push(san);
    }
    return result;
  }

  function newGame() { send('ucinewgame'); }
  function stop() { send('stop'); }
  function isReady() { return ready; }
  function hasError() { return loadError; }
  function onStatus(cb) { statusListeners.push(cb); }
  function notifyStatus(s) { statusListeners.forEach(function(cb) { cb(s); }); }

  return {
    init: init, go: go, getBestMove: getBestMove, getTopMoves: getTopMoves,
    analyze: analyze, analyzeMove: analyzeMove, setSkillLevel: setSkillLevel,
    stop: stop, newGame: newGame, isReady: isReady, hasError: hasError,
    uciToSan: uciToSan, uciToSquares: uciToSquares, pvToSan: pvToSan,
    onStatus: onStatus
  };
})();
