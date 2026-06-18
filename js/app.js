// ============================================
// Chess Training Program - Main Application
// ============================================

(function() {
  'use strict';

  var $ = window.jQuery;
  var game = new Chess();
  var board = null;

  var PIECE_THEME = 'https://cdn.jsdelivr.net/gh/oakmac/chessboardjs@master/website/img/chesspieces/wikipedia/{piece}.png';

  var state = {
    mode: 'openings',
    phase: 'idle',
    playerColor: 'white',
    currentOpening: null,
    currentEndgame: null,
    setupMoves: [],
    playedMoves: [],
    score: { correct: 0, incorrect: 0, streak: 0 },
    bookMoves: null,
    lastMove: null,
    pendingPromotion: null,
    lastAnalysisHtml: '',
    playerMoveCount: 0,
    generation: 0,
    engineMode: false,
    lastFenBefore: null,
    scramble: false,
    sparShowMoves: false,
    openingShowMoves: false
  };

  // ==========================================
  // POSITION SCRAMBLER
  // ==========================================

  function scramblePosition(config) {
    function sqName(f, r) { return String.fromCharCode(97 + f) + (r + 1); }
    function isAdj(f1, r1, f2, r2) { return Math.abs(f1 - f2) <= 1 && Math.abs(r1 - r2) <= 1; }
    function sqColor(f, r) { return (f + r) % 2; }

    for (var attempt = 0; attempt < 300; attempt++) {
      var placed = [];
      var used = {};

      function tryPlace(piece, color, check) {
        for (var t = 0; t < 100; t++) {
          var f = Math.floor(Math.random() * 8);
          var r = Math.floor(Math.random() * 8);
          var key = f + ',' + r;
          if (used[key]) continue;
          if (check && !check(f, r)) continue;
          used[key] = true;
          placed.push({ f: f, r: r, piece: piece, color: color });
          return { f: f, r: r };
        }
        return null;
      }

      var wk = tryPlace('K', 'w');
      if (!wk) continue;

      var bk = tryPlace('K', 'b', function(f, r) {
        return !isAdj(wk.f, wk.r, f, r);
      });
      if (!bk) continue;

      var ok = true;
      var usedBishopColors = {};

      var extras = [];
      config.w.forEach(function(p) { if (p !== 'K') extras.push({ piece: p, color: 'w' }); });
      config.b.forEach(function(p) { if (p !== 'K') extras.push({ piece: p, color: 'b' }); });

      for (var i = 0; i < extras.length; i++) {
        var ep = extras[i];
        var pos = tryPlace(ep.piece, ep.color, (function(ep) {
          return function(f, r) {
            if (ep.piece === 'P' && (r === 0 || r === 7)) return false;
            if (ep.piece === 'B' && config.bishopColors) {
              var sc = ep.color + sqColor(f, r);
              if (usedBishopColors[sc]) return false;
            }
            return true;
          };
        })(ep));
        if (!pos) { ok = false; break; }
        if (ep.piece === 'B' && config.bishopColors) {
          usedBishopColors[ep.color + sqColor(pos.f, pos.r)] = true;
        }
      }
      if (!ok) continue;

      var board = [];
      for (var r = 0; r < 8; r++) {
        board[r] = [];
        for (var f = 0; f < 8; f++) board[r][f] = null;
      }
      placed.forEach(function(p) {
        board[p.r][p.f] = p.color === 'w' ? p.piece.toUpperCase() : p.piece.toLowerCase();
      });

      var fenRows = [];
      for (var r = 7; r >= 0; r--) {
        var row = '', empty = 0;
        for (var f = 0; f < 8; f++) {
          if (board[r][f]) {
            if (empty > 0) { row += empty; empty = 0; }
            row += board[r][f];
          } else { empty++; }
        }
        if (empty > 0) row += empty;
        fenRows.push(row);
      }
      var fen = fenRows.join('/') + ' ' + config.turn + ' - - 0 1';

      var chess = new Chess();
      if (!chess.load(fen)) continue;
      if (chess.game_over()) continue;

      var flipped = config.turn === 'w' ? 'b' : 'w';
      var fFen = fen.replace(' ' + config.turn + ' ', ' ' + flipped + ' ');
      var fChess = new Chess();
      if (fChess.load(fFen) && fChess.in_check()) continue;

      return fen;
    }
    return null;
  }

  // ==========================================
  // INITIALIZATION
  // ==========================================

  function init() {
    board = Chessboard('board', {
      position: 'start',
      draggable: true,
      pieceTheme: PIECE_THEME,
      onDragStart: onDragStart,
      onDrop: onDrop,
      onSnapEnd: onSnapEnd
    });

    renderOpeningBrowser();
    renderEndgameBrowser();
    bindEvents();
    updateStats();

    var evalBar = document.getElementById('eval-bar');
    if (evalBar) evalBar.style.display = 'none';

    $(window).on('resize', function() {
      board.resize();
      clearArrows();
    });

    CT.Engine.onStatus(function(status) {
      var dot = document.querySelector('.status-dot');
      var text = document.querySelector('.status-text');
      if (!dot || !text) return;
      dot.className = 'status-dot';
      if (status === 'ready') {
        dot.classList.add('ready');
        text.textContent = 'Engine ready';
      } else if (status === 'loading') {
        dot.classList.add('loading');
        text.textContent = 'Loading engine...';
      } else {
        text.textContent = 'Engine failed to load';
      }
    });
  }

  function bindEvents() {
    $('.mode-tab').on('click', function() {
      setMode($(this).data('mode'));
    });

    // Opening color toggle
    $('.color-btn:not(.spar-color)').on('click', function() {
      $(this).siblings('.color-btn').removeClass('active');
      $(this).addClass('active');
      refreshOpeningMasteryDots();
      state.playerColor = $(this).data('color');
      if (state.currentOpening) startOpeningTraining(state.currentOpening);
    });

    // Spar color toggle
    $(document).on('click', '.spar-color', function() {
      $('.spar-color').removeClass('active');
      $(this).addClass('active');
    });

    // Time buttons
    $(document).on('click', '.time-btn', function() {
      $('.time-btn').removeClass('active');
      $(this).addClass('active');
    });

    $('#spar-rating').on('input', function() {
      $('#spar-rating-value').text(this.value);
    });

    $('#btn-flip').on('click', function() { board.flip(); clearArrows(); });
    $('#btn-reset').on('click', resetTraining);
    $('#btn-back').on('click', takeBack);
    $('#btn-hint').on('click', showHint);
    $('#btn-next').on('click', nextLine);
    $('#btn-start-spar').on('click', startSpar);

    $('#toggle-opening-moves').on('click', function() {
      state.openingShowMoves = !state.openingShowMoves;
      $(this).text(state.openingShowMoves ? 'ON' : 'OFF')
             .toggleClass('active', state.openingShowMoves)
             .attr('data-active', state.openingShowMoves);
      if (state.openingShowMoves && state.mode === 'openings' && state.phase === 'playing') {
        drawOpeningBookArrows();
      } else if (!state.openingShowMoves) {
        clearArrows();
        if (state.mode === 'openings' && state.phase === 'playing') {
          var colorLabel = state.playerColor === 'white' ? 'White' : 'Black';
          setFeedback('<p class="feedback-prompt">Your turn as ' + colorLabel +
                      '. What is the best continuation?</p>');
        }
      }
    });

    $('#toggle-spar-moves').on('click', function() {
      state.sparShowMoves = !state.sparShowMoves;
      $(this).text(state.sparShowMoves ? 'ON' : 'OFF')
             .toggleClass('active', state.sparShowMoves)
             .attr('data-active', state.sparShowMoves);
      if (state.sparShowMoves && state.mode === 'spar' && state.phase === 'playing') {
        drawSparTopMoves();
      } else if (!state.sparShowMoves) {
        clearArrows();
      }
    });

    // Promotion dialog
    $(document).on('click', '.promo-option', function() {
      var piece = $(this).data('piece');
      if (state.pendingPromotion) handlePromotion(piece);
    });

    $('#opening-search').on('input', function() {
      filterOpenings($(this).val());
    });

    $('#scramble-toggle').on('change', function() {
      state.scramble = this.checked;
      if (state.currentEndgame) startEndgameTraining(state.currentEndgame);
    });
  }

  // ==========================================
  // MODE SWITCHING
  // ==========================================

  function setMode(mode) {
    state.mode = mode;
    state.phase = 'idle';
    state.generation++;

    $('.mode-tab').removeClass('active');
    $('.mode-tab[data-mode="' + mode + '"]').addClass('active');

    $('#opening-browser, #endgame-browser, #spar-settings').addClass('hidden');
    if (mode === 'openings') $('#opening-browser').removeClass('hidden');
    else if (mode === 'endgames') $('#endgame-browser').removeClass('hidden');
    else if (mode === 'spar') $('#spar-settings').removeClass('hidden');

    game.reset();
    board.position('start');
    board.orientation('white');
    clearHighlights();
    updateMoveList();
    updateCapturedPieces();
    $('#spar-opening-display').addClass('hidden');
    setFeedback(getIdleMessage());

    var evalBar = document.getElementById('eval-bar');
    if (evalBar) evalBar.style.display = (mode === 'openings' || mode === 'endgames' || mode === 'spar') ? '' : 'none';
    resetEvalBar();

    if (!CT.Engine.isReady() && !CT.Engine.hasError()) {
      CT.Engine.init().catch(function() {});
    }
  }

  function getIdleMessage() {
    var msgs = {
      openings: 'Select an opening from the left panel to begin training.',
      endgames: 'Select an endgame type to practice.',
      spar: 'Configure your game settings and click Start Game.'
    };
    return '<p class="feedback-prompt">' + (msgs[state.mode] || '') + '</p>';
  }

  // ==========================================
  // OPENING BROWSER
  // ==========================================

  function getOpeningColor() {
    return $('.color-btn:not(.spar-color).active').data('color') || 'white';
  }

  function updateProgressSummary() {
    var color = getOpeningColor();
    var all = CT.Storage.getAllStats();
    var counts = { new: 0, struggling: 0, learning: 0, practiced: 0, mastered: 0 };
    var total = 0;
    CT.openingsData.forEach(function(cat) {
      cat.openings.forEach(function(op) {
        total++;
        var k = CT.Storage.keyFor(op.name, color);
        var level = CT.Storage.masteryLevel(all[k] || null);
        counts[level]++;
      });
    });

    var practiced = counts.learning + counts.practiced + counts.mastered;
    var html = '<div class="progress-bar-strip">';
    ['mastered', 'practiced', 'learning', 'struggling'].forEach(function(lvl) {
      if (counts[lvl] > 0) {
        var pct = (counts[lvl] / total * 100).toFixed(1);
        html += '<div class="progress-bar-seg seg-' + lvl + '" style="width:' + pct + '%" ' +
                'title="' + counts[lvl] + ' ' + CT.Storage.masteryLabel(lvl) + '"></div>';
      }
    });
    html += '</div>';
    html += '<div class="progress-summary-text">';
    html += '<span>' + practiced + ' of ' + total + ' practiced</span>';
    if (counts.mastered > 0) {
      html += '<span class="mastered-count">' + counts.mastered + ' mastered</span>';
    }
    html += '</div>';
    $('#opening-progress-summary').html(html);
  }

  function refreshOpeningMasteryDots() {
    var color = getOpeningColor();
    $('#opening-list .opening-item').each(function() {
      var ci = $(this).data('cat');
      var oi = $(this).data('op');
      var op = CT.openingsData[ci] && CT.openingsData[ci].openings[oi];
      if (!op) return;
      var stats = CT.Storage.getStats(op.name, color);
      var level = CT.Storage.masteryLevel(stats);
      $(this).find('.mastery-dot')
        .attr('class', 'mastery-dot mastery-' + level)
        .attr('title', CT.Storage.masteryLabel(level));
    });
    updateProgressSummary();
  }

  function renderOpeningBrowser() {
    var html = '';
    CT.openingsData.forEach(function(cat, ci) {
      html += '<div class="list-category">';
      html += '<div class="category-header" data-cat="' + ci + '">';
      html += '<span class="category-arrow">&#9654;</span>';
      html += '<span class="category-name">' + cat.category + '</span>';
      html += '</div>';
      html += '<div class="category-items">';
      var color = getOpeningColor();
      cat.openings.forEach(function(op, oi) {
        var stats = CT.Storage.getStats(op.name, color);
        var level = CT.Storage.masteryLevel(stats);
        html += '<div class="opening-item" data-cat="' + ci + '" data-op="' + oi + '">';
        html += '<span class="mastery-dot mastery-' + level + '" title="' + CT.Storage.masteryLabel(level) + '"></span>';
        html += '<span class="item-name">' + op.name + '</span>';
        html += '<span class="item-eco">' + op.eco + '</span>';
        html += '</div>';
      });
      html += '</div></div>';
    });
    $('#opening-list').html(html);
    updateProgressSummary();

    $('#opening-list').on('click', '.category-header', function() {
      $(this).toggleClass('expanded');
    });

    $('#opening-list').on('click', '.opening-item', function() {
      var op = CT.openingsData[$(this).data('cat')].openings[$(this).data('op')];
      $('.opening-item').removeClass('active');
      $(this).addClass('active');
      selectOpening(op);
    });

    $('#opening-list .category-header').first().addClass('expanded');
  }

  function filterOpenings(query) {
    query = query.toLowerCase().trim();
    if (!query) {
      $('.list-category, .opening-item').show();
      return;
    }
    $('.opening-item').each(function() {
      var text = $(this).text().toLowerCase();
      $(this).toggle(text.indexOf(query) !== -1);
    });
    $('.list-category').each(function() {
      var visible = $(this).find('.opening-item:visible').length > 0;
      $(this).toggle(visible);
      if (visible) $(this).find('.category-header').addClass('expanded');
    });
  }

  // ==========================================
  // OPENING TRAINER
  // ==========================================

  function selectOpening(opening) {
    state.currentOpening = opening;
    state.currentEndgame = null;

    var color = getOpeningColor();
    var stats = CT.Storage.getStats(opening.name, color);
    var level = CT.Storage.masteryLevel(stats);

    var masteryHtml = '';
    if (stats && stats.attempts > 0) {
      var acc = stats.total > 0 ? Math.round(stats.correct / stats.total * 100) : 0;
      masteryHtml = '<div class="opening-mastery-row">' +
        '<span class="mastery-dot mastery-' + level + '"></span>' +
        '<span class="mastery-status-text">' +
          CT.Storage.masteryLabel(level) + ' &bull; ' + acc + '% accuracy' +
          ' &bull; ' + stats.attempts + (stats.attempts === 1 ? ' session' : ' sessions') +
        '</span>' +
      '</div>';
    }

    $('#opening-info').removeClass('hidden');
    $('#opening-info-content').html(
      masteryHtml +
      '<span class="info-eco">' + opening.eco + '</span>' +
      '<p>' + opening.description + '</p>'
    );

    startOpeningTraining(opening);
  }

  function startOpeningTraining(opening) {
    game.reset();
    state.phase = 'setup';
    state.setupMoves = opening.moves.slice();
    state.playedMoves = [];
    state.playerMoveCount = 0;
    state.bookMoves = null;
    state.engineMode = false;
    state.lastFenBefore = null;
    state.generation++;
    clearHighlights();
    clearArrows();
    updateMoveList();

    board.orientation(state.playerColor);
    board.position('start', false);

    var colorLabel = state.playerColor === 'white' ? 'White' : 'Black';
    $('#opponent-name').text('Book Moves');
    $('#player-name').text('You (' + colorLabel + ')');

    setFeedback('<p class="feedback-prompt">Playing opening moves...</p>');

    setTimeout(function() {
      playSetupMoves(opening.moves, 0, function() {
        state.phase = 'playing';
        beginQuizTurn();
      });
    }, 300);
  }

  function playSetupMoves(moves, i, callback) {
    if (i >= moves.length) { callback(); return; }

    var move = game.move(moves[i]);
    if (!move) { callback(); return; }

    board.position(game.fen());
    highlightLastMove(move);
    updateMoveList();

    setTimeout(function() { playSetupMoves(moves, i + 1, callback); }, 350);
  }

  function beginQuizTurn() {
    if (game.game_over()) {
      onLineComplete();
      return;
    }

    var turnColor = game.turn() === 'w' ? 'white' : 'black';

    if (turnColor === state.playerColor) {
      fetchAndPromptPlayer();
    } else {
      playOpponentBookMove();
    }
  }

  function fetchAndPromptPlayer() {
    var history = game.history();
    var colorLabel = state.playerColor === 'white' ? 'White' : 'Black';

    // Try local book first
    var localData = CT.lookupBook(history);
    if (localData && localData.moves.length > 0) {
      state.bookMoves = localData.moves;
      state.engineMode = false;
      state.phase = 'playing';
      setFeedback(
        '<p class="feedback-prompt">Your turn as ' + colorLabel +
        '. What is the best continuation?</p>'
      );
      prefetchNext();
      drawOpeningBookArrows();
      return;
    }

    // Fall back to Lichess masters
    setFeedback('<p class="feedback-prompt analysis-spinner">Loading book moves...</p>');
    CT.Lichess.fetchMoves(history, 'masters')
      .then(function(data) {
        if (data.moves && data.moves.length > 0) {
          state.bookMoves = data.moves;
          state.engineMode = false;
          if (data.opening) $('#opponent-name').text(data.opening.name || 'Book Moves');
          state.phase = 'playing';
          setFeedback(
            '<p class="feedback-prompt">Your turn as ' + colorLabel +
            '. What is the best continuation?</p>'
          );
          prefetchNext();
          drawOpeningBookArrows();
          return;
        }

        CT.Lichess.fetchMoves(history, 'lichess')
          .then(function(data2) {
            if (data2.moves && data2.moves.length > 0) {
              state.bookMoves = data2.moves;
              state.engineMode = false;
              state.phase = 'playing';
              setFeedback(
                '<p class="feedback-prompt">Your turn as ' + colorLabel +
                '. What is the best continuation?</p>'
              );
              prefetchNext();
              drawOpeningBookArrows();
              return;
            }
            ensureEngineAndPrompt();
          })
          .catch(function() {
            ensureEngineAndPrompt();
          });
      })
      .catch(function() {
        ensureEngineAndPrompt();
      });
  }

  function ensureEngineAndPrompt() {
    if (CT.Engine.isReady() || CT.Engine.hasError()) {
      promptWithEngine();
      return;
    }
    setFeedback('<p class="feedback-prompt analysis-spinner">Loading engine for deeper analysis...</p>');
    CT.Engine.init()
      .then(function() { promptWithEngine(); })
      .catch(function() { promptWithEngine(); });
  }

  function playOpponentBookMove() {
    state.phase = 'opponent';
    var history = game.history();

    function playMove(moves) {
      var pick = pickWeighted(moves);
      var result = game.move(pick.san);
      if (!result) { onLineComplete(); return; }

      board.position(game.fen());
      highlightLastMove(result);
      state.playedMoves.push({ san: result.san, type: 'book' });
      updateMoveList();
      prefetchNext();
      updateOpeningEval();

      setTimeout(function() {
        state.phase = 'playing';
        beginQuizTurn();
      }, 400);
    }

    // Try local book first
    var localData = CT.lookupBook(history);
    if (localData && localData.moves.length > 0) {
      playMove(localData.moves);
      return;
    }

    // Fall back to Lichess masters
    CT.Lichess.fetchMoves(history, 'masters')
      .then(function(data) {
        if (data.moves && data.moves.length > 0) {
          playMove(data.moves);
          return;
        }

        CT.Lichess.fetchMoves(history, 'lichess')
          .then(function(data2) {
            if (data2.moves && data2.moves.length > 0) {
              playMove(data2.moves);
              return;
            }
            playOpponentEngineMove();
          })
          .catch(function() {
            playOpponentEngineMove();
          });
      })
      .catch(function() {
        playOpponentEngineMove();
      });
  }

  function pickWeighted(moves) {
    var total = 0;
    moves.forEach(function(m) { total += m.games; });
    var r = Math.random() * total;
    var cum = 0;
    for (var i = 0; i < moves.length; i++) {
      cum += moves[i].games;
      if (r <= cum) return moves[i];
    }
    return moves[0];
  }

  function handleOpeningMove(moveSan, fenBefore) {
    if (state.engineMode) {
      handleOpeningEngineMove(moveSan, fenBefore);
      return;
    }

    if (!state.bookMoves) return;

    state.phase = 'checking';
    var found = null;
    for (var i = 0; i < state.bookMoves.length; i++) {
      if (state.bookMoves[i].san === moveSan) {
        found = state.bookMoves[i];
        break;
      }
    }

    if (found) {
      state.score.correct++;
      state.score.streak++;
      state.playerMoveCount++;
      state.playedMoves.push({ san: moveSan, type: 'correct' });
      updateStats();
      updateMoveList();
      showCorrectFeedback(found);
      prefetchNext();
      updateOpeningEval();

      setTimeout(function() { beginQuizTurn(); }, 700);
    } else {
      state.score.incorrect++;
      state.score.streak = 0;
      updateStats();
      showIncorrectFeedback(moveSan);

      game.undo();
      board.position(game.fen());
      state.phase = 'playing';
      drawOpeningBookArrows();
    }
  }

  function handleOpeningEngineMove(moveSan, fenBefore) {
    state.phase = 'analyzing';
    setFeedback('<p class="feedback-prompt analysis-spinner">Analyzing your move...</p>');

    var fenAfter = game.fen();
    var gen = state.generation;

    if (!CT.Engine.isReady()) {
      // Engine not available, accept any legal move
      state.playerMoveCount++;
      state.playedMoves.push({ san: moveSan, type: 'correct' });
      updateMoveList();
      setTimeout(function() { beginQuizTurn(); }, 300);
      return;
    }

    CT.Engine.analyzeMove(fenBefore, fenAfter, moveSan, state.playerColor)
      .then(function(analysis) {
        if (gen !== state.generation) return;

        if (analysis.isBest || analysis.className === 'good') {
          state.score.correct++;
          state.score.streak++;
          state.playerMoveCount++;
          state.playedMoves.push({ san: moveSan, type: analysis.className });
          updateStats();
          updateMoveList();

          var html = '<div class="feedback-correct animate-in">';
          html += '<div class="feedback-title">' + analysis.quality + '</div>';
          html += '<p class="feedback-detail"><strong>' + moveSan + '</strong> is a strong continuation.</p>';
          if (analysis.optimalLine.length > 0) {
            html += '<div class="optimal-line"><strong>Line:</strong> ' + analysis.optimalLine.join(' ') + '</div>';
          }
          html += '</div>';
          setFeedback(html);

          setTimeout(function() { beginQuizTurn(); }, 700);
        } else {
          state.score.incorrect++;
          state.score.streak = 0;
          updateStats();

          var html = '<div class="feedback-incorrect animate-in">';
          html += '<div class="feedback-title">' + analysis.quality + '</div>';
          html += '<p class="feedback-detail">You played <strong>' + moveSan +
                  '</strong>. Best was <strong>' + analysis.bestMove + '</strong>.</p>';
          if (analysis.optimalLine.length > 0) {
            html += '<div class="optimal-line"><strong>Best line:</strong> ' + analysis.optimalLine.join(' ') + '</div>';
          }
          html += '</div>';
          setFeedback(html);

          if (analysis.bestMoveSquares) {
            drawArrow(analysis.bestMoveSquares.from, analysis.bestMoveSquares.to, 'rgba(129,182,76,0.9)', 0.7);
          }

          game.undo();
          board.position(game.fen());
          state.phase = 'playing';
        }
      })
      .catch(function() {
        if (gen !== state.generation) return;
        // Fallback: accept the move
        state.playerMoveCount++;
        state.playedMoves.push({ san: moveSan, type: 'correct' });
        updateMoveList();
        setTimeout(function() { beginQuizTurn(); }, 300);
      });
  }

  function showCorrectFeedback(moveData) {
    var pct = moveData.percentage.toFixed(1);
    var html = '<div class="feedback-correct animate-in">';
    html += '<div class="feedback-title">Correct!</div>';
    html += '<p class="feedback-detail"><strong>' + moveData.san + '</strong> is played in ' +
            pct + '% of master games (' + moveData.games.toLocaleString() + ' games).</p>';

    var others = state.bookMoves.filter(function(m) {
      return m.san !== moveData.san;
    }).slice(0, 4);

    if (others.length > 0) {
      html += '<p class="feedback-detail" style="margin-top:6px">Alternatives:</p>';
      html += '<div class="feedback-moves">';
      others.forEach(function(m) {
        html += '<span class="feedback-move-chip">' + m.san +
                ' <span class="move-pct">' + m.percentage.toFixed(1) + '%</span></span>';
      });
      html += '</div>';
    }
    html += '</div>';
    setFeedback(html);
  }

  function showIncorrectFeedback(playedMove) {
    var top = (state.bookMoves || []).slice(0, 5);
    var html = '<div class="feedback-incorrect animate-in">';
    html += '<div class="feedback-title">Not a book move</div>';
    html += '<p class="feedback-detail"><strong>' + playedMove +
            '</strong> is not commonly played here. Try one of these:</p>';
    html += '<div class="feedback-moves">';
    top.forEach(function(m) {
      html += '<span class="feedback-move-chip">' + m.san +
              ' <span class="move-pct">' + m.percentage.toFixed(1) + '%</span></span>';
    });
    html += '</div>';
    html += '</div>';
    setFeedback(html);

    // Show arrow(s) for top book move(s) — handled after undo in handleOpeningMove
    if (!state.openingShowMoves && top.length > 0) {
      var tmp = new Chess(game.fen());
      var m = tmp.move(top[0].san);
      if (m) drawArrow(m.from, m.to, 'rgba(129,182,76,0.9)', 0.8);
    }
  }

  function onLineComplete() {
    if (state.mode === 'openings' && state.currentOpening) {
      var total = state.score.correct + state.score.incorrect;
      if (total > 0) {
        CT.Storage.recordSession(
          state.currentOpening.name,
          state.playerColor,
          state.score.correct,
          total
        );
        refreshOpeningMasteryDots();
      }
    }

    state.phase = 'complete';
    var depth = state.playedMoves.length;
    setFeedback(
      '<div class="animate-in">' +
      '<div class="feedback-title" style="color:var(--accent-blue)">Line Complete</div>' +
      '<p class="feedback-detail">You\'ve reached the end of the book. ' + depth +
      ' moves deep into theory.</p>' +
      '<p class="feedback-detail" style="margin-top:8px">Click <strong>Next Line</strong> ' +
      'to try another variation.</p></div>'
    );
  }

  // Prefetch book data for upcoming positions to reduce lag
  function prefetchNext() {
    var history = game.history();
    // Prefetch current position from Lichess (if not in local book)
    if (!CT.lookupBook(history)) {
      CT.Lichess.fetchMoves(history, 'masters').catch(function() {});
    }
    // Prefetch one level deeper for the top 3 likely responses
    var data = CT.lookupBook(history);
    if (data && data.moves.length > 0) {
      data.moves.slice(0, 3).forEach(function(m) {
        var nextHist = history.concat(m.san);
        if (!CT.lookupBook(nextHist)) {
          CT.Lichess.fetchMoves(nextHist, 'masters').catch(function() {});
        }
      });
    }
  }

  function promptWithEngine() {
    var colorLabel = state.playerColor === 'white' ? 'White' : 'Black';
    var wasBook = !state.engineMode;
    state.engineMode = true;
    state.phase = 'playing';
    var prefix = '';
    if (wasBook && state.playedMoves.length >= 3) {
      prefix = '<div class="feedback-title" style="color:var(--accent-blue);margin-bottom:8px">Book Complete — Free Play</div>';
    }
    setFeedback(
      prefix + '<p class="feedback-prompt">Your turn as ' + colorLabel +
      '. Find the best continuation.</p>'
    );
  }

  function playOpponentEngineMove() {
    if (game.game_over()) { onLineComplete(); return; }

    var gen = state.generation;
    var ensureEngine = CT.Engine.isReady()
      ? Promise.resolve()
      : CT.Engine.init().catch(function() {});

    ensureEngine.then(function() {
      if (gen !== state.generation) return;
      if (!CT.Engine.isReady()) { onLineComplete(); return; }

      CT.Engine.getBestMove(game.fen(), 2200).then(function(data) {
        if (gen !== state.generation) return;
        var san = CT.Engine.uciToSan(game.fen(), data.bestMoveUci);
        if (!san) { onLineComplete(); return; }

        var move = game.move(san);
        if (!move) { onLineComplete(); return; }

        board.position(game.fen());
        highlightLastMove(move);
        state.playedMoves.push({ san: move.san, type: 'book' });
        updateMoveList();

        setTimeout(function() {
          if (gen !== state.generation) return;
          state.phase = 'playing';
          beginQuizTurn();
        }, 500);
      }).catch(function() { onLineComplete(); });
    });
  }

  function nextLine() {
    if (state.currentOpening) startOpeningTraining(state.currentOpening);
    else if (state.currentEndgame) startEndgameTraining(state.currentEndgame);
  }

  // ==========================================
  // ENDGAME BROWSER
  // ==========================================

  function renderEndgameBrowser() {
    var html = '';
    CT.endgamesData.forEach(function(cat, ci) {
      html += '<div class="list-category">';
      html += '<div class="category-header expanded" data-cat="' + ci + '">';
      html += '<span class="category-arrow">&#9654;</span>';
      html += '<span class="category-name">' + cat.category + '</span>';
      html += '</div>';
      html += '<div class="category-items">';
      cat.positions.forEach(function(eg, ei) {
        html += '<div class="endgame-item" data-cat="' + ci + '" data-eg="' + ei + '">';
        html += '<span class="item-name">' + eg.name + '</span>';
        html += '</div>';
      });
      html += '</div></div>';
    });
    $('#endgame-list').html(html);

    $('#endgame-list').on('click', '.category-header', function() {
      $(this).toggleClass('expanded');
    });

    $('#endgame-list').on('click', '.endgame-item', function() {
      var eg = CT.endgamesData[$(this).data('cat')].positions[$(this).data('eg')];
      $('.endgame-item').removeClass('active');
      $(this).addClass('active');
      selectEndgame(eg);
    });
  }

  // ==========================================
  // ENDGAME TRAINER
  // ==========================================

  function selectEndgame(endgame) {
    state.currentEndgame = endgame;
    state.currentOpening = null;
    var $toggle = $('.scramble-toggle');
    if (endgame.scramble) {
      $toggle.removeClass('scramble-disabled');
      $toggle.attr('title', 'Generate a random starting position each time');
    } else {
      $toggle.addClass('scramble-disabled');
      $toggle.attr('title', 'Randomize positions not available for this endgame');
    }
    if (!CT.Engine.isReady() && !CT.Engine.hasError()) {
      CT.Engine.init().catch(function() {});
    }
    startEndgameTraining(endgame);
  }

  function startEndgameTraining(endgame) {
    var fen = endgame.fen;
    if (state.scramble && endgame.scramble) {
      var scrambled = scramblePosition(endgame.scramble);
      if (scrambled) fen = scrambled;
    }
    game.load(fen);
    state.phase = 'playing';
    state.playedMoves = [];
    state.bookMoves = null;
    state.lastAnalysisHtml = '';
    state.generation++;
    clearHighlights();
    clearArrows();

    state.playerColor = game.turn() === 'w' ? 'white' : 'black';
    board.orientation(state.playerColor);
    board.position(endgame.fen);
    resetEvalBar();

    var goalText = { checkmate: 'Deliver checkmate', promote: 'Promote the pawn',
                     draw: 'Hold the draw' }[endgame.goal] || endgame.goal;

    $('#opponent-name').text('Opponent');
    $('#player-name').text('You (' + (state.playerColor === 'white' ? 'White' : 'Black') + ')');

    var html = '<div class="animate-in">';
    html += '<div class="feedback-title" style="color:var(--accent-blue)">' + endgame.name + '</div>';
    html += '<p class="feedback-detail">' + endgame.description + '</p>';
    html += '<p class="feedback-detail" style="margin-top:8px"><strong>Goal:</strong> ' + goalText;
    if (endgame.maxMoves) html += ' within ' + endgame.maxMoves + ' moves';
    html += '.</p></div>';
    setFeedback(html);

    updateMoveList();

    $('#opening-info').removeClass('hidden');
    var infoHtml = '<p>' + endgame.description + '</p>';
    if (endgame.keyReminder) {
      infoHtml += '<div class="key-reminder"><strong>Key Reminder:</strong> ' + endgame.keyReminder + '</div>';
    }
    $('#opening-info-content').html(infoHtml);
  }

  function hasPromoted() {
    var history = game.history({ verbose: true });
    for (var i = 0; i < history.length; i++) {
      if (history[i].flags.indexOf('p') !== -1) return true;
    }
    return false;
  }

  function playerHasPromoted() {
    var playerColor = state.playerColor === 'white' ? 'w' : 'b';
    var history = game.history({ verbose: true });
    for (var i = 0; i < history.length; i++) {
      if (history[i].flags.indexOf('p') !== -1 && history[i].color === playerColor) return true;
    }
    return false;
  }

  function isEndgameOver() {
    if (game.in_checkmate() || game.in_stalemate() || game.insufficient_material()) return true;
    if (state.currentEndgame && state.currentEndgame.goal === 'promote' && hasPromoted()) return true;
    return false;
  }

  function endgameOpponentMove() {
    if (isEndgameOver()) { checkEndgameResult(); return; }

    var gen = state.generation;

    function applyMove(move) {
      game.move(move.san);
      board.position(game.fen());
      highlightLastMove(move);
      state.playedMoves.push({ san: move.san, type: 'book' });
      updateMoveList();

      setTimeout(function() {
        if (isEndgameOver()) checkEndgameResult();
        else {
          state.phase = 'playing';
          var moveNum = Math.ceil(state.playedMoves.length / 2);
          var limit = state.currentEndgame.maxMoves;
          var text = limit ? 'Move ' + moveNum + ' of ' + limit + '.' : '';
          var prev = state.lastAnalysisHtml || '';
          setFeedback(prev + '<p class="feedback-prompt" style="margin-top:8px">Your move. ' + text + '</p>');
        }
      }, 300);
    }

    function engineFallback() {
      if (CT.Engine.isReady()) {
        CT.Engine.analyze(game.fen()).then(function(data) {
          if (gen !== state.generation) return;
          if (data.scoreType != null) {
            updateEvalBar(data.scoreType, data.score, game.turn());
          }
          var san = CT.Engine.uciToSan(game.fen(), data.bestMoveUci);
          if (san) {
            var moves = game.moves({ verbose: true });
            var move = null;
            for (var i = 0; i < moves.length; i++) {
              if (moves[i].san === san) { move = moves[i]; break; }
            }
            if (move) { applyMove(move); return; }
          }
          endgameOpponentFallback();
        }).catch(function() {
          if (gen === state.generation) endgameOpponentFallback();
        });
      } else {
        endgameOpponentFallback();
      }
    }

    var fen = game.fen();
    if (CT.Tablebase && CT.Tablebase.canProbe(fen)) {
      CT.Tablebase.bestMove(fen).then(function(tbMove) {
        if (gen !== state.generation) return;
        if (tbMove && tbMove.san) {
          var moves = game.moves({ verbose: true });
          var move = null;
          for (var i = 0; i < moves.length; i++) {
            if (moves[i].san === tbMove.san) { move = moves[i]; break; }
          }
          if (move) {
            var cp = CT.Tablebase.categoryToScore(tbMove.category, tbMove.dtz);
            updateEvalBar('cp', -cp, game.turn());
            applyMove(move);
            return;
          }
        }
        engineFallback();
      }).catch(function() {
        if (gen === state.generation) engineFallback();
      });
    } else {
      engineFallback();
    }
  }

  function endgameOpponentFallback() {
    var moves = game.moves({ verbose: true });
    if (moves.length === 0) return;
    var move = isLoneKing() ? pickCentralMove(moves) : pickEndgameMove(moves);

    game.move(move.san);
    board.position(game.fen());
    highlightLastMove(move);
    state.playedMoves.push({ san: move.san, type: 'book' });
    updateMoveList();

    setTimeout(function() {
      if (isEndgameOver()) checkEndgameResult();
      else {
        state.phase = 'playing';
        var moveNum = Math.ceil(state.playedMoves.length / 2);
        var limit = state.currentEndgame.maxMoves;
        var text = limit ? 'Move ' + moveNum + ' of ' + limit + '.' : '';
        var prev = state.lastAnalysisHtml || '';
        setFeedback(prev + '<p class="feedback-prompt" style="margin-top:8px">Your move. ' + text + '</p>');
      }
    }, 300);
  }

  function isLoneKing() {
    var fen = game.fen().split(' ')[0];
    var opp = state.playerColor === 'white' ? 'qrbnp' : 'QRBNP';
    for (var i = 0; i < opp.length; i++) {
      if (fen.indexOf(opp[i]) !== -1) return false;
    }
    return true;
  }

  function pickCentralMove(moves) {
    var captures = moves.filter(function(m) { return m.captured; });
    if (captures.length > 0) {
      var best = captures[0];
      for (var i = 1; i < captures.length; i++) {
        if (PIECE_VALUE[captures[i].captured] > PIECE_VALUE[best.captured]) {
          best = captures[i];
        }
      }
      return best;
    }

    var scores = { d4: 0, d5: 0, e4: 0, e5: 0, c3: 1, c4: 1, c5: 1, c6: 1,
                   d3: 1, d6: 1, e3: 1, e6: 1, f3: 1, f4: 1, f5: 1, f6: 1 };
    var bestMove = moves[0], bestS = 99;
    moves.forEach(function(m) {
      var s = (scores[m.to] !== undefined ? scores[m.to] : 3) + Math.random() * 2;
      if (s < bestS) { bestS = s; bestMove = m; }
    });
    return bestMove;
  }

  function randomMove(moves) {
    return moves[Math.floor(Math.random() * moves.length)];
  }

  var PIECE_VALUE = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 };

  function pickEndgameMove(moves) {
    var scored = moves.map(function(m) {
      var score = 0;

      if (m.captured) {
        score += 10 + PIECE_VALUE[m.captured] * 5;
      }

      game.move(m.san);
      var opponentMoves = game.moves({ verbose: true });

      var recapture = false;
      for (var i = 0; i < opponentMoves.length; i++) {
        if (opponentMoves[i].to === m.to && opponentMoves[i].captured) {
          recapture = true;
          break;
        }
      }
      if (recapture && !m.captured) {
        score -= PIECE_VALUE[m.piece] * 3;
      } else if (recapture && m.captured) {
        score += (PIECE_VALUE[m.captured] - PIECE_VALUE[m.piece]) * 3;
      }

      if (game.in_check()) score += 3;

      game.undo();

      score += Math.random() * 2;

      return { move: m, score: score };
    });

    scored.sort(function(a, b) { return b.score - a.score; });
    return scored[0].move;
  }

  function checkEndgameResult() {
    state.phase = 'complete';
    var totalMoves = Math.ceil(state.playedMoves.length / 2);
    var eg = state.currentEndgame;

    if (game.in_checkmate() && eg.goal === 'checkmate') {
      var withinTarget = !eg.maxMoves || totalMoves <= eg.maxMoves;
      setFeedback(
        '<div class="feedback-correct animate-in">' +
        '<div class="feedback-title">Checkmate!</div>' +
        '<p class="feedback-detail">Delivered in ' + totalMoves + ' moves.' +
        (withinTarget ? ' Within the target!' : ' Try to do it faster next time.') +
        '</p></div>'
      );
    } else if (eg.goal === 'promote' && hasPromoted()) {
      if (playerHasPromoted()) {
        var withinTarget = !eg.maxMoves || totalMoves <= eg.maxMoves;
        setFeedback(
          '<div class="feedback-correct animate-in">' +
          '<div class="feedback-title">Pawn Promoted!</div>' +
          '<p class="feedback-detail">Promoted in ' + totalMoves + ' moves.' +
          (withinTarget ? ' Within the target!' : ' Try to do it faster next time.') +
          '</p></div>'
        );
      } else {
        setFeedback(
          '<div class="feedback-incorrect animate-in">' +
          '<div class="feedback-title">Opponent Promoted First!</div>' +
          '<p class="feedback-detail">Black queened before you could. Use your outside passer to distract the enemy king, then promote your own pawn.</p>' +
          '</div>'
        );
      }
    } else if (game.in_stalemate()) {
      setFeedback(
        '<div class="feedback-incorrect animate-in">' +
        '<div class="feedback-title">Stalemate!</div>' +
        '<p class="feedback-detail">Careful — the enemy king has no legal moves but is not in check.</p></div>'
      );
    } else if (game.insufficient_material() || game.in_threefold_repetition()) {
      if (eg.goal === 'draw') {
        setFeedback(
          '<div class="feedback-correct animate-in">' +
          '<div class="feedback-title">Draw!</div>' +
          '<p class="feedback-detail">You successfully held the draw.</p></div>'
        );
      } else {
        setFeedback(
          '<div class="feedback-incorrect animate-in">' +
          '<div class="feedback-title">Draw</div>' +
          '<p class="feedback-detail">The position is drawn. Try again!</p></div>'
        );
      }
    }
  }

  // ==========================================
  // SPAR MODE
  // ==========================================

  function startSpar() {
    var color = $('.spar-color.active').data('color');
    if (color === 'random') color = Math.random() < 0.5 ? 'white' : 'black';

    state.playerColor = color;
    state.mode = 'spar';
    state.phase = 'playing';
    state.playedMoves = [];
    state.generation++;

    game.reset();
    board.orientation(color);
    board.position('start');
    clearHighlights();
    clearArrows();
    updateMoveList();
    updateCapturedPieces();
    $('#spar-opening-display').addClass('hidden');
    $('#spar-opening-name').text('');

    var rating = $('#spar-rating').val();
    $('#opponent-name').text('Engine (' + rating + ')');
    $('#player-name').text('You (' + (color === 'white' ? 'White' : 'Black') + ')');

    if (!CT.Engine.isReady() && !CT.Engine.hasError()) {
      setFeedback(
        '<div class="animate-in">' +
        '<p class="feedback-prompt analysis-spinner">Loading chess engine...</p></div>'
      );
      CT.Engine.init()
        .then(function() {
          CT.Engine.newGame();
          setFeedback(
            '<div class="animate-in">' +
            '<p class="feedback-prompt">Engine ready. Make your move!</p></div>'
          );
          if (color === 'black') setTimeout(sparBotMove, 500);
        })
        .catch(function() {
          setFeedback(
            '<div class="animate-in">' +
            '<p class="feedback-prompt">Engine failed to load. Bot will play random moves.</p></div>'
          );
          if (color === 'black') setTimeout(sparBotMoveRandom, 500);
        });
    } else if (CT.Engine.isReady()) {
      CT.Engine.newGame();
      setFeedback(
        '<div class="animate-in">' +
        '<p class="feedback-prompt">Make your move!</p></div>'
      );
      if (color === 'black') setTimeout(sparBotMove, 500);
    } else {
      setFeedback(
        '<div class="animate-in">' +
        '<p class="feedback-prompt">Engine unavailable. Bot will play random moves.</p></div>'
      );
      if (color === 'black') setTimeout(sparBotMoveRandom, 500);
    }
  }

  function sparBotMove() {
    if (game.game_over()) return;
    var gen = state.generation;
    var rating = parseInt($('#spar-rating').val()) || 1500;

    if (!CT.Engine.isReady()) {
      sparBotMoveRandom();
      return;
    }

    CT.Engine.getBestMove(game.fen(), rating).then(function(data) {
      if (gen !== state.generation || game.game_over()) return;

      var san = CT.Engine.uciToSan(game.fen(), data.bestMoveUci);
      if (!san) { sparBotMoveRandom(); return; }

      var move = game.move(san);
      if (!move) { sparBotMoveRandom(); return; }

      board.position(game.fen());
      highlightLastMove(move);
      state.playedMoves.push({ san: move.san, type: 'book' });
      updateMoveList();
      updateCapturedPieces();
      detectSparOpening();

      if (game.game_over()) {
        state.phase = 'complete';
        setFeedback('<div class="feedback-incorrect animate-in"><div class="feedback-title">Game Over</div></div>');
      } else {
        drawSparTopMoves();
      }
    }).catch(function() {
      if (gen === state.generation) sparBotMoveRandom();
    });
  }

  function sparBotMoveRandom() {
    var moves = game.moves({ verbose: true });
    if (moves.length === 0) return;
    var move = randomMove(moves);
    game.move(move.san);
    board.position(game.fen());
    highlightLastMove(move);
    state.playedMoves.push({ san: move.san, type: 'book' });
    updateMoveList();
    updateCapturedPieces();
    detectSparOpening();
    if (!game.game_over()) drawSparTopMoves();
  }

  // ==========================================
  // BOARD ARROWS
  // ==========================================

  function getSquareCenter(square) {
    var file = square.charCodeAt(0) - 97;
    var rank = parseInt(square.charAt(1)) - 1;
    var orient = board.orientation();
    var x, y;
    if (orient === 'white') {
      x = file * 100 + 50;
      y = (7 - rank) * 100 + 50;
    } else {
      x = (7 - file) * 100 + 50;
      y = rank * 100 + 50;
    }
    return { x: x, y: y };
  }

  function drawArrow(fromSq, toSq, color, opacity, label) {
    var svg = document.getElementById('board-arrows');
    if (!svg) return;

    var from = getSquareCenter(fromSq);
    var to = getSquareCenter(toSq);

    var dx = to.x - from.x;
    var dy = to.y - from.y;
    var angle = Math.atan2(dy, dx);

    var headLen = 28;
    var lineWidth = 16;
    var headWidth = 24;

    from.x += Math.cos(angle) * 12;
    from.y += Math.sin(angle) * 12;
    to.x -= Math.cos(angle) * 5;
    to.y -= Math.sin(angle) * 5;

    var bodyEnd = {
      x: to.x - Math.cos(angle) * headLen,
      y: to.y - Math.sin(angle) * headLen
    };

    var g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.setAttribute('class', 'board-arrow');

    var line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', from.x);
    line.setAttribute('y1', from.y);
    line.setAttribute('x2', bodyEnd.x);
    line.setAttribute('y2', bodyEnd.y);
    line.setAttribute('stroke', color);
    line.setAttribute('stroke-width', lineWidth);
    line.setAttribute('stroke-opacity', opacity || 0.8);
    line.setAttribute('stroke-linecap', 'round');
    g.appendChild(line);

    var perpX = -Math.sin(angle) * headWidth;
    var perpY = Math.cos(angle) * headWidth;

    var head = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    head.setAttribute('points', [
      to.x + ',' + to.y,
      (bodyEnd.x + perpX) + ',' + (bodyEnd.y + perpY),
      (bodyEnd.x - perpX) + ',' + (bodyEnd.y - perpY)
    ].join(' '));
    head.setAttribute('fill', color);
    head.setAttribute('fill-opacity', opacity || 0.8);
    g.appendChild(head);

    if (label) {
      var midX = (from.x + bodyEnd.x) / 2;
      var midY = (from.y + bodyEnd.y) / 2;
      var badge = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      badge.setAttribute('cx', midX);
      badge.setAttribute('cy', midY);
      badge.setAttribute('r', '11');
      badge.setAttribute('fill', '#fff');
      badge.setAttribute('fill-opacity', '0.93');
      g.appendChild(badge);
      var badgeText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      badgeText.setAttribute('x', midX);
      badgeText.setAttribute('y', midY);
      badgeText.setAttribute('text-anchor', 'middle');
      badgeText.setAttribute('dominant-baseline', 'central');
      badgeText.setAttribute('font-size', '13');
      badgeText.setAttribute('font-weight', '800');
      badgeText.setAttribute('fill', color);
      badgeText.setAttribute('font-family', 'sans-serif');
      badgeText.textContent = label;
      g.appendChild(badgeText);
    }

    svg.appendChild(g);
  }

  function clearArrows() {
    var svg = document.getElementById('board-arrows');
    if (!svg) return;
    while (svg.firstChild) svg.removeChild(svg.firstChild);
  }

  // ==========================================
  // BOARD CALLBACKS
  // ==========================================

  function onDragStart(source, piece) {
    var gameOver = (state.mode === 'endgames') ? isEndgameOver() : game.game_over();
    if (gameOver) return false;
    if (state.phase !== 'playing' || state.pendingPromotion) return false;

    var isWhite = piece.charAt(0) === 'w';
    var myTurn = (game.turn() === 'w' && state.playerColor === 'white') ||
                 (game.turn() === 'b' && state.playerColor === 'black');

    if (!myTurn) return false;
    if (state.playerColor === 'white' && !isWhite) return false;
    if (state.playerColor === 'black' && isWhite) return false;

    clearArrows();
    return true;
  }

  // ---- Promotion detection ----
  function isPromotion(source, target) {
    var piece = game.get(source);
    if (!piece || piece.type !== 'p') return false;
    var rank = target.charAt(1);
    return (piece.color === 'w' && rank === '8') || (piece.color === 'b' && rank === '1');
  }

  function showPromotionDialog(target, color) {
    var pieces = color === 'w'
      ? ['wQ', 'wR', 'wB', 'wN']
      : ['bQ', 'bR', 'bB', 'bN'];
    var promoKeys = ['q', 'r', 'b', 'n'];

    var html = '';
    for (var i = 0; i < pieces.length; i++) {
      var imgUrl = PIECE_THEME.replace('{piece}', pieces[i]);
      html += '<button class="promo-option" data-piece="' + promoKeys[i] + '">';
      html += '<img src="' + imgUrl + '" alt="' + pieces[i] + '">';
      html += '</button>';
    }

    var $dialog = $('#promotion-dialog');
    $dialog.html(html).removeClass('hidden');

    var $board = $('#board');
    var sqSize = $board.width() / 8;
    var file = target.charCodeAt(0) - 97;
    var orientation = board.orientation();
    var leftPx = orientation === 'white' ? file * sqSize : (7 - file) * sqSize;
    var topPx = color === 'w'
      ? (orientation === 'white' ? 0 : sqSize * 4)
      : (orientation === 'white' ? sqSize * 4 : 0);

    $dialog.css({
      left: leftPx + 'px',
      top: topPx + 'px',
      width: sqSize + 'px'
    });
    $dialog.find('.promo-option').css({ width: sqSize + 'px', height: sqSize + 'px' });
    $dialog.find('img').css({ width: sqSize * 0.8 + 'px', height: sqSize * 0.8 + 'px' });
  }

  function hidePromotionDialog() {
    $('#promotion-dialog').addClass('hidden').html('');
  }

  function handlePromotion(piece) {
    hidePromotionDialog();
    game.undo(); // Undo the temp queen promotion

    var pp = state.pendingPromotion;
    var move = game.move({ from: pp.source, to: pp.target, promotion: piece });
    board.position(game.fen());
    state.phase = 'playing';
    state.pendingPromotion = null;

    if (!move) return;
    highlightLastMove(move);
    completeMoveForMode(move, pp.fenBefore);
  }

  // ---- Main drop handler ----
  function onDrop(source, target) {
    clearHighlights();
    var fenBefore = game.fen();

    // Check for promotion
    if (isPromotion(source, target)) {
      var piece = game.get(source);
      var testMove = game.move({ from: source, to: target, promotion: 'q' });
      if (testMove === null) return 'snapback';

      state.pendingPromotion = { source: source, target: target, mode: state.mode, fenBefore: fenBefore };
      state.phase = 'promoting';
      board.position(game.fen());
      showPromotionDialog(target, piece.color);
      return;
    }

    var move = game.move({ from: source, to: target, promotion: 'q' });
    if (move === null) return 'snapback';

    highlightLastMove(move);
    completeMoveForMode(move, fenBefore);
  }

  function completeMoveForMode(move, fenBefore) {
    if (state.mode === 'openings') {
      handleOpeningMove(move.san, fenBefore);
    } else if (state.mode === 'endgames') {
      state.playedMoves.push({ san: move.san, type: 'pending' });
      updateMoveList();

      var fenAfter = game.fen();
      var gen = state.generation;

      function onAnalysisDone(analysis) {
        if (gen !== state.generation) return;

        var eg = state.currentEndgame;
        if (analysis && eg && eg.goal !== 'draw') {
          var isDraw = game.in_stalemate() || game.insufficient_material() || game.in_threefold_repetition();
          if (isDraw) {
            analysis = {
              quality: 'Blunder', className: 'blunder', scoreDiff: 999,
              bestMove: analysis.bestMove, bestMoveSquares: analysis.bestMoveSquares,
              isBest: false, optimalLine: [], alternatives: []
            };
          }
        }

        if (analysis && analysis.engineScoreType != null) {
          updateEvalBar(analysis.engineScoreType, analysis.engineScore, game.turn());
        }

        var last = state.playedMoves[state.playedMoves.length - 1];
        if (last && last.type === 'pending') {
          last.type = analysis ? analysis.className : 'correct';
        }
        updateMoveList();
        showEndgameFeedback(move.san, analysis);

        if (analysis && !analysis.isBest && analysis.bestMoveSquares) {
          drawArrow(analysis.bestMoveSquares.from, analysis.bestMoveSquares.to, 'rgba(129,182,76,0.9)', 0.7);
        }

        if (isEndgameOver()) {
          setTimeout(checkEndgameResult, 1500);
        } else {
          setTimeout(endgameOpponentMove, 1500);
        }
      }

      function fallbackAnalysis() {
        if (CT.Engine.isReady()) {
          state.phase = 'analyzing';
          setFeedback('<p class="feedback-prompt analysis-spinner">Analyzing move...</p>');
          CT.Engine.analyzeMove(fenBefore, fenAfter, move.san, state.playerColor)
            .then(onAnalysisDone)
            .catch(function() {
              if (gen !== state.generation) return;
              var d = CT.Eval.autoDepth(fenBefore);
              onAnalysisDone(CT.Eval.analyzeMove(fenBefore, move.san, state.playerColor, d));
            });
        } else {
          setFeedback('<p class="feedback-prompt analysis-spinner">Analyzing...</p>');
          setTimeout(function() {
            if (gen !== state.generation) return;
            var d = CT.Eval.autoDepth(fenBefore);
            onAnalysisDone(CT.Eval.analyzeMove(fenBefore, move.san, state.playerColor, d));
          }, 50);
        }
      }

      if (CT.Tablebase && CT.Tablebase.canProbe(fenBefore)) {
        state.phase = 'analyzing';
        setFeedback('<p class="feedback-prompt analysis-spinner">Analyzing move...</p>');
        CT.Tablebase.analyzeMove(fenBefore, move.san, state.playerColor)
          .then(function(result) {
            if (gen !== state.generation) return;
            if (result) { onAnalysisDone(result); return; }
            fallbackAnalysis();
          })
          .catch(function() {
            if (gen !== state.generation) return;
            fallbackAnalysis();
          });
      } else {
        fallbackAnalysis();
      }
    } else if (state.mode === 'spar') {
      state.playedMoves.push({ san: move.san, type: 'pending' });
      updateMoveList();
      updateCapturedPieces();
      detectSparOpening();

      if (game.game_over()) {
        state.phase = 'complete';
        var lastMv = state.playedMoves[state.playedMoves.length - 1];
        if (lastMv) lastMv.type = 'correct';
        updateMoveList();
        setFeedback('<div class="feedback-correct animate-in"><div class="feedback-title">Game Over</div></div>');
        return;
      }

      var sparFenAfter = game.fen();
      var sparGen = state.generation;

      function applySparResult(analysis) {
        if (sparGen !== state.generation) return;

        var lastEntry = state.playedMoves[state.playedMoves.length - 1];
        if (lastEntry && lastEntry.type === 'pending') {
          lastEntry.type = analysis ? analysis.className : 'correct';
        }
        updateMoveList();

        var isGood = !analysis || analysis.isBest ||
                     analysis.className === 'best' || analysis.className === 'good';
        if (isGood) {
          state.score.correct++;
          state.score.streak++;
        } else {
          state.score.incorrect++;
          state.score.streak = 0;
        }
        updateStats();

        if (analysis && analysis.engineScoreType != null) {
          updateEvalBar(analysis.engineScoreType, analysis.engineScore, game.turn());
        }

        showEndgameFeedback(move.san, analysis);

        var isBad = analysis &&
                    (analysis.className === 'mistake' || analysis.className === 'blunder');
        var show3 = isBad && state.sparShowMoves;

        if (analysis && !analysis.isBest && analysis.bestMoveSquares && !show3) {
          drawArrow(analysis.bestMoveSquares.from, analysis.bestMoveSquares.to,
                    'rgba(129,182,76,0.9)', 0.7);
        }
        if (show3) {
          drawSparTopMoves(fenBefore, false);
        }

        state.phase = 'playing';
        var delay = isBad ? 1800 : analysis ? 900 : 400;
        setTimeout(function() {
          if (sparGen !== state.generation) return;
          sparBotMove();
        }, delay);
      }

      state.phase = 'analyzing';
      setFeedback('<p class="feedback-prompt analysis-spinner">Analyzing your move...</p>');

      if (CT.Engine.isReady()) {
        CT.Engine.analyzeMove(fenBefore, sparFenAfter, move.san, state.playerColor)
          .then(function(analysis) { applySparResult(analysis); })
          .catch(function() { applySparResult(null); });
      } else {
        applySparResult(null);
      }
    }
  }

  function showEndgameFeedback(moveSan, analysis) {
    if (!analysis) {
      setFeedback('<p class="feedback-prompt">Your move recorded.</p>');
      return;
    }

    var iconSymbols = { best: '!!', good: '!', inaccuracy: '?!', mistake: '?', blunder: '??' };
    var icon = iconSymbols[analysis.className] || '';

    var html = '<div class="animate-in">';
    html += '<div class="feedback-quality quality-' + analysis.className + '">';
    html += '<span class="quality-icon">' + icon + '</span>';
    html += analysis.quality;
    html += '</div>';

    html += '<p class="feedback-detail" style="margin-top:4px">';
    html += 'You played <strong>' + moveSan + '</strong>.';

    if (!analysis.isBest) {
      html += ' Best was <strong>' + analysis.bestMove + '</strong>.';
    }
    html += '</p>';

    if (analysis.optimalLine.length > 0) {
      html += '<div class="optimal-line">';
      html += '<strong>Best line:</strong> ';
      var lineText = [];
      var moveNum = Math.ceil((state.playedMoves.length + state.setupMoves.length) / 2);
      var isWhiteTurn = state.playerColor === 'white';
      for (var i = 0; i < analysis.optimalLine.length; i++) {
        if (i === 0 || (isWhiteTurn && i % 2 === 0) || (!isWhiteTurn && i % 2 === 1)) {
          var num = moveNum + Math.floor(i / 2);
          lineText.push(num + '.' + ((!isWhiteTurn && i === 0) ? '..' : ''));
        }
        lineText.push(analysis.optimalLine[i]);
      }
      html += lineText.join(' ');
      html += '</div>';
    }

    if (analysis.alternatives && analysis.alternatives.length > 1) {
      html += '<p class="feedback-detail" style="margin-top:6px;font-size:11px;color:var(--text-muted)">';
      html += 'Top moves: ' + analysis.alternatives.join(', ');
      html += '</p>';
    }

    html += '</div>';
    state.lastAnalysisHtml = html;
    setFeedback(html);
  }

  function onSnapEnd() {
    board.position(game.fen());
  }

  // ==========================================
  // UI HELPERS
  // ==========================================

  function setFeedback(html) {
    $('#feedback-message').html(html);
  }

  function updateEvalBar(scoreType, score, sideToMove) {
    var fill = document.getElementById('eval-fill');
    var label = document.getElementById('eval-label');
    if (!fill || !label) return;

    var whitePct, displayText;

    if (scoreType === 'mate') {
      var mateFor = (score > 0) === (sideToMove === 'w') ? 'w' : 'b';
      whitePct = mateFor === 'w' ? 100 : 0;
      displayText = 'M' + Math.abs(score);
    } else {
      var cpWhite = sideToMove === 'w' ? score : -score;
      whitePct = 50 + Math.max(-50, Math.min(50, cpWhite / 10));
      var absEval = Math.abs(cpWhite / 100);
      displayText = absEval >= 10 ? absEval.toFixed(0) : absEval.toFixed(1);
      if (cpWhite === 0) displayText = '0.0';
    }

    fill.style.height = whitePct + '%';
    label.textContent = displayText;
    label.className = 'eval-label ' + (whitePct >= 50 ? 'eval-white' : 'eval-black');
  }

  function resetEvalBar() {
    var fill = document.getElementById('eval-fill');
    var label = document.getElementById('eval-label');
    if (!fill || !label) return;
    fill.style.height = '50%';
    label.textContent = '0.0';
    label.className = 'eval-label eval-white';
  }

  function detectSparOpening() {
    var history = game.history();
    if (history.length === 0) return;
    CT.Lichess.fetchMoves(history, 'masters')
      .then(function(data) {
        if (data.opening && data.opening.name && state.mode === 'spar') {
          $('#spar-opening-name').text(data.opening.name);
          $('#spar-opening-display').removeClass('hidden');
        }
      })
      .catch(function() {});
  }

  var SPAR_ARROW_COLORS = [
    'rgba(129, 182, 76, 0.90)',
    'rgba(70,  150, 220, 0.75)',
    'rgba(220, 155,  50, 0.60)'
  ];

  var SPAR_RANK_LABELS = ['Best', '2nd', '3rd'];
  var SPAR_DOT_COLORS  = ['#81b64c', '#4696dc', '#dc9b32'];

  function drawSparTopMoves(fen, checkFen) {
    if (!state.sparShowMoves || !CT.Engine.isReady()) return;
    var targetFen = fen || game.fen();
    var duringThinking = (checkFen !== false);
    CT.Engine.getTopMoves(targetFen, 3, { movetime: 500 }).then(function(moves) {
      if (state.mode !== 'spar' || !moves.length) return;
      if (duringThinking && game.fen() !== targetFen) return;

      clearArrows();
      moves.forEach(function(mv, i) {
        var sqs = CT.Engine.uciToSquares(mv.uci);
        if (sqs) drawArrow(sqs.from, sqs.to, SPAR_ARROW_COLORS[i] || SPAR_ARROW_COLORS[2], 1, String(i + 1));
      });

      if (duringThinking && state.phase === 'playing') {
        var colorLabel = state.playerColor === 'white' ? 'White' : 'Black';
        var html = '<p class="feedback-prompt">Your turn as ' + colorLabel + '.</p>';
        html += '<div class="spar-top-moves-list">';
        moves.forEach(function(mv, i) {
          var san = CT.Engine.uciToSan(targetFen, mv.uci);
          if (!san) return;
          html += '<div class="spar-top-move-item">';
          html += '<span class="spar-rank-badge" style="background:' + SPAR_DOT_COLORS[i] + '">' + (i + 1) + '</span>';
          html += '<span class="spar-rank-label">' + SPAR_RANK_LABELS[i] + '</span>';
          html += '<span class="spar-rank-san">' + san + '</span>';
          html += '</div>';
        });
        html += '</div>';
        setFeedback('<div class="animate-in">' + html + '</div>');
      }
    }).catch(function() {});
  }

  function drawOpeningBookArrows() {
    if (!state.openingShowMoves || state.mode !== 'openings') return;
    if (!state.bookMoves || state.bookMoves.length === 0) return;
    clearArrows();
    var fen = game.fen();
    var top3 = state.bookMoves.slice(0, 3);
    top3.forEach(function(mv, i) {
      var tmp = new Chess(fen);
      var m = tmp.move(mv.san);
      if (!m) return;
      drawArrow(m.from, m.to, SPAR_ARROW_COLORS[i] || SPAR_ARROW_COLORS[2], 1, String(i + 1));
    });

    var colorLabel = state.playerColor === 'white' ? 'White' : 'Black';
    var html = '<p class="feedback-prompt">Your turn as ' + colorLabel + '. What is the best continuation?</p>';
    html += '<div class="spar-top-moves-list">';
    top3.forEach(function(mv, i) {
      html += '<div class="spar-top-move-item">';
      html += '<span class="spar-rank-badge" style="background:' + SPAR_DOT_COLORS[i] + '">' + (i + 1) + '</span>';
      html += '<span class="spar-rank-label">' + SPAR_RANK_LABELS[i] + '</span>';
      html += '<span class="spar-rank-san">' + mv.san + '</span>';
      html += '<span class="spar-rank-pct">' + mv.percentage.toFixed(1) + '%</span>';
      html += '</div>';
    });
    html += '</div>';
    setFeedback('<div class="animate-in">' + html + '</div>');
  }

  function updateOpeningEval() {
    if (state.mode !== 'openings' || !CT.Engine.isReady()) return;
    var fen = game.fen();
    var gen = state.generation;
    CT.Engine.go(fen, { movetime: 600 }).then(function(data) {
      if (gen !== state.generation || state.mode !== 'openings') return;
      if (data.scoreType != null) updateEvalBar(data.scoreType, data.score, game.turn());
    }).catch(function() {});
  }

  function updateMoveList() {
    var history = game.history();
    if (history.length === 0) {
      $('#move-list').html('<span style="color:var(--text-muted);font-size:12px">No moves yet</span>');
      return;
    }

    var html = '';
    for (var i = 0; i < history.length; i += 2) {
      var num = Math.floor(i / 2) + 1;
      var wClass = getMoveClass(i);
      var bClass = getMoveClass(i + 1);
      html += '<div class="move-pair">';
      html += '<span class="move-number">' + num + '.</span>';
      html += '<span class="move-white ' + wClass + '">' + history[i] + '</span>';
      if (history[i + 1]) {
        html += '<span class="move-black ' + bClass + '">' + history[i + 1] + '</span>';
      }
      html += '</div>';
    }
    $('#move-list').html(html);
    var el = document.getElementById('move-list');
    el.scrollTop = el.scrollHeight;
  }

  function updateCapturedPieces() {
    if (state.mode !== 'spar') {
      $('#captured-by-player').empty();
      $('#captured-by-opponent').empty();
      return;
    }

    var SYMBOLS = { p: '♟', n: '♞', b: '♝', r: '♜', q: '♛' };
    var ORDER = ['q', 'r', 'b', 'n', 'p'];

    var capturedByWhite = [];
    var capturedByBlack = [];
    game.history({ verbose: true }).forEach(function(m) {
      if (!m.captured) return;
      (m.color === 'w' ? capturedByWhite : capturedByBlack).push(m.captured);
    });

    function sortAndRender(pieces, capturedFrom) {
      pieces.sort(function(a, b) { return ORDER.indexOf(a) - ORDER.indexOf(b); });
      var cls = capturedFrom === 'w' ? 'cap-light' : 'cap-dark';
      return pieces.map(function(p) {
        return '<span class="cap-piece ' + cls + '">' + (SYMBOLS[p] || '') + '</span>';
      }).join('');
    }

    // pieces near a player = pieces they captured (opponent's pieces)
    if (state.playerColor === 'white') {
      $('#captured-by-player').html(sortAndRender(capturedByWhite, 'b'));
      $('#captured-by-opponent').html(sortAndRender(capturedByBlack, 'w'));
    } else {
      $('#captured-by-player').html(sortAndRender(capturedByBlack, 'w'));
      $('#captured-by-opponent').html(sortAndRender(capturedByWhite, 'b'));
    }
  }

  function getMoveClass(idx) {
    var setupLen = state.setupMoves ? state.setupMoves.length : 0;
    if (idx < setupLen) return 'move-book';
    var pi = idx - setupLen;
    if (pi >= 0 && pi < state.playedMoves.length) {
      var t = state.playedMoves[pi].type;
      if (t === 'correct' || t === 'best' || t === 'good') return 'move-correct';
      if (t === 'incorrect' || t === 'blunder' || t === 'mistake') return 'move-incorrect';
      if (t === 'inaccuracy') return 'move-inaccuracy';
      if (t === 'pending') return 'move-pending';
      return 'move-book';
    }
    return '';
  }

  function updateStats() {
    var s = state.score;
    var total = s.correct + s.incorrect;
    var acc = total > 0 ? Math.round(s.correct / total * 100) + '%' : '-';
    $('#stat-correct').text(s.correct);
    $('#stat-incorrect').text(s.incorrect);
    $('#stat-accuracy').text(acc);
    $('#stat-streak').text(s.streak);
  }

  function highlightLastMove(move) {
    clearHighlights();
    if (!move) return;
    state.lastMove = move;
    var from = document.querySelector('#board [data-square="' + move.from + '"]');
    var to = document.querySelector('#board [data-square="' + move.to + '"]');
    if (from) from.classList.add('highlight-white');
    if (to) to.classList.add('highlight-white');
  }

  function clearHighlights() {
    var sel = '#board .highlight-white, #board .highlight-black, #board .square-hint';
    document.querySelectorAll(sel).forEach(function(el) {
      el.classList.remove('highlight-white', 'highlight-black', 'square-hint');
    });
    clearArrows();
  }

  function showHint() {
    if (state.mode === 'openings' && state.bookMoves && state.bookMoves.length > 0) {
      var top = state.bookMoves[0];
      var tmp = new Chess(game.fen());
      var m = tmp.move(top.san);
      if (m) {
        clearArrows();
        drawArrow(m.from, m.to, 'rgba(129,182,76,0.9)', 0.8);
        var sq = document.querySelector('#board [data-square="' + m.from + '"]');
        if (sq) sq.classList.add('square-hint');
        setFeedback(
          '<div class="animate-in"><p class="feedback-detail">Hint: Look at the piece on <strong>' +
          m.from + '</strong>. The most popular move here is played in ' +
          top.percentage.toFixed(1) + '% of master games.</p></div>'
        );
      }
    } else if (state.mode === 'endgames' && state.currentEndgame) {
      var hints = state.currentEndgame.hints || [];
      var hi = Math.min(Math.floor(state.playedMoves.length / 2), hints.length - 1);
      if (hi >= 0 && hints[hi]) {
        setFeedback(
          '<div class="animate-in"><p class="feedback-detail"><strong>Hint:</strong> ' +
          hints[hi] + '</p></div>'
        );
      }
      // Show engine arrow for best move
      if (CT.Engine.isReady()) {
        CT.Engine.analyze(game.fen(), 12).then(function(data) {
          if (data.bestMoveUci) {
            var sqs = CT.Engine.uciToSquares(data.bestMoveUci);
            if (sqs) {
              clearArrows();
              drawArrow(sqs.from, sqs.to, 'rgba(129,182,76,0.9)', 0.8);
            }
          }
        });
      }
    }
  }

  function resetTraining() {
    state.score = { correct: 0, incorrect: 0, streak: 0 };
    state.generation++;
    updateStats();
    clearArrows();
    if (state.currentOpening) startOpeningTraining(state.currentOpening);
    else if (state.currentEndgame) startEndgameTraining(state.currentEndgame);
    else {
      game.reset();
      board.position('start');
      state.phase = 'idle';
      state.playedMoves = [];
      clearHighlights();
      updateMoveList();
      setFeedback(getIdleMessage());
    }
  }

  function takeBack() {
    if (state.playedMoves.length === 0) return;

    state.generation++;
    game.undo();
    state.playedMoves.pop();

    // Also undo the preceding opponent move if it exists
    if (state.playedMoves.length > 0 && state.playedMoves[state.playedMoves.length - 1].type === 'book') {
      game.undo();
      state.playedMoves.pop();
    }

    board.position(game.fen());
    clearHighlights();
    updateMoveList();

    if (state.mode === 'openings') {
      state.phase = 'playing';
      beginQuizTurn();
    } else {
      state.phase = 'playing';
    }
  }

  // ==========================================
  // START
  // ==========================================

  $(document).ready(init);

})();
