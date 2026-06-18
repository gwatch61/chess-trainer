// ============================================
// Chess Training Program - Endgame Evaluation Engine
// ============================================

CT.Eval = (function() {
  'use strict';

  var PIECE_VAL = { p: 100, n: 320, b: 330, r: 500, q: 900, k: 20000 };

  // Chebyshev distance from board center
  function centerDist(sq) {
    var f = sq.charCodeAt(0) - 97;
    var r = parseInt(sq.charAt(1)) - 1;
    return Math.max(Math.abs(f - 3.5), Math.abs(r - 3.5));
  }

  // Manhattan distance between two squares
  function manhattanDist(sq1, sq2) {
    var f1 = sq1.charCodeAt(0) - 97, r1 = parseInt(sq1.charAt(1)) - 1;
    var f2 = sq2.charCodeAt(0) - 97, r2 = parseInt(sq2.charAt(1)) - 1;
    return Math.abs(f1 - f2) + Math.abs(r1 - r2);
  }

  // How close to the edge (0 = center, 3 = edge/corner)
  function edgeDist(sq) {
    var f = sq.charCodeAt(0) - 97;
    var r = parseInt(sq.charAt(1)) - 1;
    return 3 - Math.min(Math.min(f, 7 - f), Math.min(r, 7 - r));
  }

  // Evaluate position from White's perspective
  function evaluate(chess) {
    if (chess.in_checkmate()) {
      return chess.turn() === 'w' ? -99999 : 99999;
    }
    if (chess.in_stalemate() || chess.insufficient_material()) return 0;

    var board = chess.board();
    var score = 0;
    var wKing = null, bKing = null;
    var wMat = 0, bMat = 0;

    for (var r = 0; r < 8; r++) {
      for (var f = 0; f < 8; f++) {
        var p = board[r][f];
        if (!p) continue;
        var sq = String.fromCharCode(97 + f) + (8 - r);
        var val = PIECE_VAL[p.type];

        if (p.color === 'w') {
          score += val;
          wMat += (p.type !== 'k') ? val : 0;
          if (p.type === 'k') wKing = sq;
          if (p.type === 'p') {
            var rank = 8 - r;
            score += (rank - 1) * 20;
            if (rank >= 6) score += 50;
            if (rank === 7) score += 200;
          }
        } else {
          score -= val;
          bMat += (p.type !== 'k') ? val : 0;
          if (p.type === 'k') bKing = sq;
          if (p.type === 'p') {
            var rank = 8 - r;
            score -= (8 - rank) * 20;
            if (rank <= 3) score -= 50;
            if (rank === 2) score -= 200;
          }
        }
      }
    }

    if (wKing && bKing) {
      var kDist = manhattanDist(wKing, bKing);

      // Side with material advantage: drive opponent king to corner
      if (wMat > bMat + 200) {
        score += edgeDist(bKing) * 15;
        score += centerDist(bKing) * 10;
        score += (14 - kDist) * 8;
      } else if (bMat > wMat + 200) {
        score -= edgeDist(wKing) * 15;
        score -= centerDist(wKing) * 10;
        score -= (14 - kDist) * 8;
      }
    }

    // Mobility
    var mobility = chess.moves().length;
    score += (chess.turn() === 'w' ? 1 : -1) * mobility * 3;

    if (chess.in_check()) {
      score += chess.turn() === 'w' ? -15 : 15;
    }

    return score;
  }

  // Alpha-beta minimax search
  function minimax(chess, depth, alpha, beta, isMax) {
    if (depth === 0 || chess.in_checkmate() || chess.in_stalemate() || chess.insufficient_material()) {
      return evaluate(chess);
    }

    var moves = chess.moves();
    // Move ordering: captures and checks first for better pruning
    moves.sort(function(a, b) {
      var aVal = (a.indexOf('x') !== -1 ? 2 : 0) + (a.indexOf('+') !== -1 ? 1 : 0);
      var bVal = (b.indexOf('x') !== -1 ? 2 : 0) + (b.indexOf('+') !== -1 ? 1 : 0);
      return bVal - aVal;
    });

    var i, ev;
    if (isMax) {
      var best = -Infinity;
      for (i = 0; i < moves.length; i++) {
        chess.move(moves[i]);
        ev = minimax(chess, depth - 1, alpha, beta, false);
        chess.undo();
        if (ev > best) best = ev;
        if (ev > alpha) alpha = ev;
        if (beta <= alpha) break;
      }
      return best;
    } else {
      var best = Infinity;
      for (i = 0; i < moves.length; i++) {
        chess.move(moves[i]);
        ev = minimax(chess, depth - 1, alpha, beta, true);
        chess.undo();
        if (ev < best) best = ev;
        if (ev < beta) beta = ev;
        if (beta <= alpha) break;
      }
      return best;
    }
  }

  // Find the best move and score every legal move
  function findBestMove(chess, depth) {
    var moves = chess.moves({ verbose: true });
    if (moves.length === 0) return null;

    var isWhite = chess.turn() === 'w';
    var bestMove = null;
    var bestScore = isWhite ? -Infinity : Infinity;
    var allScored = [];

    for (var i = 0; i < moves.length; i++) {
      chess.move(moves[i].san);
      var score = minimax(chess, depth - 1, -Infinity, Infinity, !isWhite);
      chess.undo();

      allScored.push({ move: moves[i], score: score });

      if ((isWhite && score > bestScore) || (!isWhite && score < bestScore)) {
        bestScore = score;
        bestMove = moves[i];
      }
    }

    allScored.sort(function(a, b) {
      return isWhite ? b.score - a.score : a.score - b.score;
    });

    return { move: bestMove, score: bestScore, allMoves: allScored };
  }

  // Analyze a player's move and return quality assessment
  function analyzeMove(fen, playerMoveSan, playerColor, depth) {
    depth = depth || 3;
    var chess = new Chess(fen);

    var analysis = findBestMove(chess, depth);
    if (!analysis) return null;

    var bestMove = analysis.move;
    var bestScore = analysis.score;

    // Find the player's move in the scored list
    var playerScore = null;
    for (var i = 0; i < analysis.allMoves.length; i++) {
      if (analysis.allMoves[i].move.san === playerMoveSan) {
        playerScore = analysis.allMoves[i].score;
        break;
      }
    }
    if (playerScore === null) return null;

    // Score difference from player's perspective
    var diff = playerColor === 'white'
      ? bestScore - playerScore
      : playerScore - bestScore;

    var quality, className;
    if (diff < 15)       { quality = 'Best move!';  className = 'best'; }
    else if (diff < 60)  { quality = 'Good move';   className = 'good'; }
    else if (diff < 150) { quality = 'Inaccuracy';  className = 'inaccuracy'; }
    else if (diff < 400) { quality = 'Mistake';     className = 'mistake'; }
    else                 { quality = 'Blunder';      className = 'blunder'; }

    // Build the optimal continuation (up to 3 moves)
    var optimalLine = [];
    if (bestMove.san !== playerMoveSan) {
      var temp = new Chess(fen);
      temp.move(bestMove.san);
      optimalLine.push(bestMove.san);

      for (var d = 0; d < 2; d++) {
        var next = findBestMove(temp, Math.max(depth - 1 - d, 1));
        if (next && next.move) {
          temp.move(next.move.san);
          optimalLine.push(next.move.san);
        } else break;
      }
    }

    // Top 3 alternatives
    var alternatives = analysis.allMoves.slice(0, 3).map(function(m) {
      return m.move.san;
    });

    return {
      quality: quality,
      className: className,
      scoreDiff: Math.round(diff),
      bestMove: bestMove.san,
      isBest: diff < 15,
      optimalLine: optimalLine,
      alternatives: alternatives
    };
  }

  // Auto-select depth based on piece count
  function autoDepth(fen) {
    var pieces = fen.split(' ')[0].replace(/[^a-zA-Z]/g, '').length;
    if (pieces <= 4) return 5;
    if (pieces <= 6) return 4;
    return 3;
  }

  return {
    evaluate: evaluate,
    findBestMove: findBestMove,
    analyzeMove: analyzeMove,
    autoDepth: autoDepth
  };
})();
