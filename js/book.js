// ============================================
// Chess Training Program - Local Opening Book
// Key: space-separated SAN moves from game start
// Value: array of {san, pct, games} sorted by popularity
// ============================================

window.CT = window.CT || {};

CT.book = {
  // ================================================
  // SICILIAN DEFENSE - Open Sicilian entry
  // ================================================
  "e4 c5": [
    { san: "Nf3", pct: 62, games: 250000 },
    { san: "Nc3", pct: 14, games: 56000 },
    { san: "c3", pct: 10, games: 40000 },
    { san: "d4", pct: 5, games: 20000 },
    { san: "f4", pct: 3, games: 12000 }
  ],
  "e4 c5 Nf3": [
    { san: "d6", pct: 38, games: 95000 },
    { san: "Nc6", pct: 30, games: 75000 },
    { san: "e6", pct: 22, games: 55000 },
    { san: "g6", pct: 5, games: 12500 }
  ],
  "e4 c5 Nf3 d6": [
    { san: "d4", pct: 82, games: 78000 },
    { san: "Bb5+", pct: 10, games: 9500 },
    { san: "c3", pct: 4, games: 3800 }
  ],
  "e4 c5 Nf3 d6 d4": [
    { san: "cxd4", pct: 95, games: 74000 },
    { san: "Nf6", pct: 3, games: 2300 }
  ],
  "e4 c5 Nf3 d6 d4 cxd4": [
    { san: "Nxd4", pct: 98, games: 72500 },
    { san: "Qxd4", pct: 1, games: 740 }
  ],
  "e4 c5 Nf3 d6 d4 cxd4 Nxd4": [
    { san: "Nf6", pct: 80, games: 58000 },
    { san: "g6", pct: 8, games: 5800 },
    { san: "Nc6", pct: 6, games: 4300 },
    { san: "e5", pct: 3, games: 2200 }
  ],
  "e4 c5 Nf3 d6 d4 cxd4 Nxd4 Nf6": [
    { san: "Nc3", pct: 90, games: 52000 },
    { san: "f3", pct: 5, games: 2900 },
    { san: "Bd3", pct: 2, games: 1200 }
  ],

  // ================================================
  // NAJDORF VARIATION (after 5...a6)
  // ================================================
  "e4 c5 Nf3 d6 d4 cxd4 Nxd4 Nf6 Nc3": [
    { san: "a6", pct: 40, games: 20800 },
    { san: "g6", pct: 18, games: 9400 },
    { san: "Nc6", pct: 16, games: 8300 },
    { san: "e6", pct: 14, games: 7300 },
    { san: "e5", pct: 8, games: 4200 }
  ],
  "e4 c5 Nf3 d6 d4 cxd4 Nxd4 Nf6 Nc3 a6": [
    { san: "Be2", pct: 22, games: 4600 },
    { san: "Bg5", pct: 18, games: 3700 },
    { san: "Be3", pct: 17, games: 3500 },
    { san: "f3", pct: 15, games: 3100 },
    { san: "Bc4", pct: 10, games: 2100 },
    { san: "g3", pct: 6, games: 1200 },
    { san: "f4", pct: 5, games: 1000 }
  ],
  // 6.Be2 (Classical Najdorf)
  "e4 c5 Nf3 d6 d4 cxd4 Nxd4 Nf6 Nc3 a6 Be2": [
    { san: "e5", pct: 50, games: 2300 },
    { san: "e6", pct: 25, games: 1150 },
    { san: "g6", pct: 12, games: 550 },
    { san: "b5", pct: 8, games: 370 }
  ],
  "e4 c5 Nf3 d6 d4 cxd4 Nxd4 Nf6 Nc3 a6 Be2 e5": [
    { san: "Nb3", pct: 60, games: 1380 },
    { san: "Nf3", pct: 25, games: 575 },
    { san: "Nde2", pct: 10, games: 230 }
  ],
  "e4 c5 Nf3 d6 d4 cxd4 Nxd4 Nf6 Nc3 a6 Be2 e5 Nb3": [
    { san: "Be7", pct: 50, games: 690 },
    { san: "Be6", pct: 25, games: 345 },
    { san: "Nc6", pct: 15, games: 207 }
  ],
  // 6.Bg5 (Classical/Perenyi Attack)
  "e4 c5 Nf3 d6 d4 cxd4 Nxd4 Nf6 Nc3 a6 Bg5": [
    { san: "e6", pct: 55, games: 2035 },
    { san: "Nbd7", pct: 20, games: 740 },
    { san: "b5", pct: 10, games: 370 }
  ],
  "e4 c5 Nf3 d6 d4 cxd4 Nxd4 Nf6 Nc3 a6 Bg5 e6": [
    { san: "f4", pct: 50, games: 1018 },
    { san: "Qd2", pct: 20, games: 407 },
    { san: "Qf3", pct: 15, games: 305 }
  ],
  // 6.Be3 (English Attack)
  "e4 c5 Nf3 d6 d4 cxd4 Nxd4 Nf6 Nc3 a6 Be3": [
    { san: "e5", pct: 35, games: 1225 },
    { san: "e6", pct: 30, games: 1050 },
    { san: "Ng4", pct: 15, games: 525 },
    { san: "b5", pct: 10, games: 350 }
  ],
  // 6.f3 (English Attack / Bg5 lines)
  "e4 c5 Nf3 d6 d4 cxd4 Nxd4 Nf6 Nc3 a6 f3": [
    { san: "e5", pct: 40, games: 1240 },
    { san: "e6", pct: 30, games: 930 },
    { san: "b5", pct: 15, games: 465 },
    { san: "Qb6", pct: 8, games: 248 }
  ],

  // ================================================
  // DRAGON VARIATION (after 5...g6)
  // ================================================
  "e4 c5 Nf3 d6 d4 cxd4 Nxd4 Nf6 Nc3 g6": [
    { san: "Be3", pct: 40, games: 3760 },
    { san: "Be2", pct: 25, games: 2350 },
    { san: "f3", pct: 15, games: 1410 },
    { san: "Bc4", pct: 10, games: 940 }
  ],
  "e4 c5 Nf3 d6 d4 cxd4 Nxd4 Nf6 Nc3 g6 Be3": [
    { san: "Bg7", pct: 90, games: 3384 },
    { san: "a6", pct: 5, games: 188 }
  ],
  "e4 c5 Nf3 d6 d4 cxd4 Nxd4 Nf6 Nc3 g6 Be3 Bg7": [
    { san: "f3", pct: 45, games: 1523 },
    { san: "Qd2", pct: 30, games: 1015 },
    { san: "Be2", pct: 15, games: 508 }
  ],
  // Yugoslav Attack
  "e4 c5 Nf3 d6 d4 cxd4 Nxd4 Nf6 Nc3 g6 Be3 Bg7 f3": [
    { san: "O-O", pct: 55, games: 838 },
    { san: "Nc6", pct: 30, games: 457 },
    { san: "a6", pct: 8, games: 122 }
  ],
  "e4 c5 Nf3 d6 d4 cxd4 Nxd4 Nf6 Nc3 g6 Be3 Bg7 f3 O-O": [
    { san: "Qd2", pct: 70, games: 587 },
    { san: "Bc4", pct: 20, games: 168 }
  ],
  "e4 c5 Nf3 d6 d4 cxd4 Nxd4 Nf6 Nc3 g6 Be3 Bg7 f3 O-O Qd2": [
    { san: "Nc6", pct: 60, games: 352 },
    { san: "d5", pct: 15, games: 88 },
    { san: "a6", pct: 12, games: 70 }
  ],

  // ================================================
  // CLASSICAL SICILIAN (after 5...Nc6)
  // ================================================
  "e4 c5 Nf3 d6 d4 cxd4 Nxd4 Nf6 Nc3 Nc6": [
    { san: "Bg5", pct: 30, games: 2490 },
    { san: "Be2", pct: 25, games: 2075 },
    { san: "Bc4", pct: 20, games: 1660 },
    { san: "Be3", pct: 12, games: 996 },
    { san: "f3", pct: 8, games: 664 }
  ],

  // ================================================
  // OPEN SICILIAN (after 4.Nxd4)
  // ================================================
  "e4 c5 Nf3 Nc6 d4": [
    { san: "cxd4", pct: 95, games: 71000 }
  ],
  "e4 c5 Nf3 Nc6 d4 cxd4": [
    { san: "Nxd4", pct: 98, games: 69500 }
  ],
  "e4 c5 Nf3 Nc6 d4 cxd4 Nxd4": [
    { san: "Nf6", pct: 40, games: 27800 },
    { san: "g6", pct: 20, games: 13900 },
    { san: "e6", pct: 18, games: 12500 },
    { san: "e5", pct: 12, games: 8300 },
    { san: "d6", pct: 5, games: 3500 }
  ],

  // ================================================
  // ALAPIN SICILIAN (2.c3)
  // ================================================
  "e4 c5 c3": [
    { san: "Nf6", pct: 35, games: 14000 },
    { san: "d5", pct: 35, games: 14000 },
    { san: "d6", pct: 10, games: 4000 },
    { san: "e6", pct: 8, games: 3200 }
  ],
  "e4 c5 c3 d5": [
    { san: "exd5", pct: 80, games: 11200 },
    { san: "e5", pct: 15, games: 2100 }
  ],
  "e4 c5 c3 Nf6": [
    { san: "e5", pct: 75, games: 10500 },
    { san: "d3", pct: 10, games: 1400 }
  ],

  // ================================================
  // ITALIAN GAME
  // ================================================
  "e4 e5": [
    { san: "Nf3", pct: 70, games: 350000 },
    { san: "Nc3", pct: 8, games: 40000 },
    { san: "f4", pct: 7, games: 35000 },
    { san: "Bc4", pct: 5, games: 25000 },
    { san: "d4", pct: 4, games: 20000 }
  ],
  "e4 e5 Nf3": [
    { san: "Nc6", pct: 72, games: 252000 },
    { san: "Nf6", pct: 15, games: 52500 },
    { san: "d6", pct: 8, games: 28000 }
  ],
  "e4 e5 Nf3 Nc6": [
    { san: "Bb5", pct: 40, games: 100800 },
    { san: "Bc4", pct: 35, games: 88200 },
    { san: "d4", pct: 12, games: 30240 },
    { san: "Nc3", pct: 5, games: 12600 }
  ],
  "e4 e5 Nf3 Nc6 Bc4": [
    { san: "Nf6", pct: 40, games: 35280 },
    { san: "Bc5", pct: 38, games: 33516 },
    { san: "Be7", pct: 10, games: 8820 },
    { san: "d6", pct: 5, games: 4410 }
  ],
  // Giuoco Piano
  "e4 e5 Nf3 Nc6 Bc4 Bc5": [
    { san: "c3", pct: 45, games: 15082 },
    { san: "b4", pct: 15, games: 5027 },
    { san: "d3", pct: 20, games: 6703 },
    { san: "O-O", pct: 12, games: 4022 }
  ],
  "e4 e5 Nf3 Nc6 Bc4 Bc5 c3": [
    { san: "Nf6", pct: 55, games: 8295 },
    { san: "d6", pct: 20, games: 3016 },
    { san: "Qe7", pct: 10, games: 1508 }
  ],
  "e4 e5 Nf3 Nc6 Bc4 Bc5 c3 Nf6": [
    { san: "d4", pct: 60, games: 4977 },
    { san: "d3", pct: 25, games: 2074 },
    { san: "b4", pct: 8, games: 664 }
  ],
  // Two Knights Defense
  "e4 e5 Nf3 Nc6 Bc4 Nf6": [
    { san: "d3", pct: 35, games: 12348 },
    { san: "Ng5", pct: 30, games: 10584 },
    { san: "d4", pct: 20, games: 7056 },
    { san: "O-O", pct: 10, games: 3528 }
  ],
  "e4 e5 Nf3 Nc6 Bc4 Nf6 Ng5": [
    { san: "d5", pct: 85, games: 8996 },
    { san: "Bc5", pct: 10, games: 1058 }
  ],
  "e4 e5 Nf3 Nc6 Bc4 Nf6 Ng5 d5": [
    { san: "exd5", pct: 90, games: 8096 }
  ],
  // Evans Gambit
  "e4 e5 Nf3 Nc6 Bc4 Bc5 b4": [
    { san: "Bxb4", pct: 80, games: 4022 },
    { san: "Bb6", pct: 15, games: 754 }
  ],
  "e4 e5 Nf3 Nc6 Bc4 Bc5 b4 Bxb4": [
    { san: "c3", pct: 90, games: 3620 }
  ],
  "e4 e5 Nf3 Nc6 Bc4 Bc5 b4 Bxb4 c3": [
    { san: "Be7", pct: 30, games: 1086 },
    { san: "Ba5", pct: 25, games: 905 },
    { san: "Bc5", pct: 20, games: 724 },
    { san: "Bd6", pct: 15, games: 543 }
  ],

  // ================================================
  // RUY LOPEZ
  // ================================================
  "e4 e5 Nf3 Nc6 Bb5": [
    { san: "a6", pct: 55, games: 55440 },
    { san: "Nf6", pct: 25, games: 25200 },
    { san: "f5", pct: 5, games: 5040 },
    { san: "d6", pct: 5, games: 5040 }
  ],
  // Morphy Defense
  "e4 e5 Nf3 Nc6 Bb5 a6": [
    { san: "Ba4", pct: 65, games: 36036 },
    { san: "Bxc6", pct: 25, games: 13860 },
    { san: "Be2", pct: 5, games: 2772 }
  ],
  "e4 e5 Nf3 Nc6 Bb5 a6 Ba4": [
    { san: "Nf6", pct: 70, games: 25225 },
    { san: "d6", pct: 12, games: 4324 },
    { san: "b5", pct: 8, games: 2883 }
  ],
  "e4 e5 Nf3 Nc6 Bb5 a6 Ba4 Nf6": [
    { san: "O-O", pct: 80, games: 20180 },
    { san: "d3", pct: 8, games: 2018 },
    { san: "Qe2", pct: 5, games: 1261 }
  ],
  "e4 e5 Nf3 Nc6 Bb5 a6 Ba4 Nf6 O-O": [
    { san: "Be7", pct: 45, games: 9081 },
    { san: "Nxe4", pct: 20, games: 4036 },
    { san: "b5", pct: 15, games: 3027 },
    { san: "Bc5", pct: 10, games: 2018 }
  ],
  "e4 e5 Nf3 Nc6 Bb5 a6 Ba4 Nf6 O-O Be7": [
    { san: "Re1", pct: 65, games: 5903 },
    { san: "d3", pct: 15, games: 1362 },
    { san: "Bxc6", pct: 8, games: 726 }
  ],
  "e4 e5 Nf3 Nc6 Bb5 a6 Ba4 Nf6 O-O Be7 Re1": [
    { san: "b5", pct: 55, games: 3247 },
    { san: "O-O", pct: 30, games: 1771 },
    { san: "d6", pct: 8, games: 472 }
  ],
  "e4 e5 Nf3 Nc6 Bb5 a6 Ba4 Nf6 O-O Be7 Re1 b5": [
    { san: "Bb3", pct: 90, games: 2922 }
  ],
  "e4 e5 Nf3 Nc6 Bb5 a6 Ba4 Nf6 O-O Be7 Re1 b5 Bb3": [
    { san: "O-O", pct: 60, games: 1753 },
    { san: "d6", pct: 25, games: 731 }
  ],
  "e4 e5 Nf3 Nc6 Bb5 a6 Ba4 Nf6 O-O Be7 Re1 b5 Bb3 O-O": [
    { san: "c3", pct: 60, games: 1052 },
    { san: "d3", pct: 15, games: 263 },
    { san: "a4", pct: 10, games: 175 }
  ],
  // Berlin Defense
  "e4 e5 Nf3 Nc6 Bb5 Nf6": [
    { san: "O-O", pct: 65, games: 16380 },
    { san: "d3", pct: 20, games: 5040 }
  ],
  "e4 e5 Nf3 Nc6 Bb5 Nf6 O-O": [
    { san: "Nxe4", pct: 60, games: 9828 },
    { san: "Bc5", pct: 15, games: 2457 },
    { san: "Be7", pct: 12, games: 1966 }
  ],

  // ================================================
  // QUEEN'S GAMBIT DECLINED
  // ================================================
  "d4 d5": [
    { san: "c4", pct: 60, games: 180000 },
    { san: "Nf3", pct: 18, games: 54000 },
    { san: "Bf4", pct: 10, games: 30000 },
    { san: "e3", pct: 5, games: 15000 }
  ],
  "d4 d5 c4": [
    { san: "e6", pct: 40, games: 72000 },
    { san: "c6", pct: 28, games: 50400 },
    { san: "dxc4", pct: 15, games: 27000 },
    { san: "Nf6", pct: 8, games: 14400 }
  ],
  "d4 d5 c4 e6": [
    { san: "Nc3", pct: 45, games: 32400 },
    { san: "Nf3", pct: 35, games: 25200 },
    { san: "cxd5", pct: 8, games: 5760 }
  ],
  "d4 d5 c4 e6 Nc3": [
    { san: "Nf6", pct: 55, games: 17820 },
    { san: "Be7", pct: 20, games: 6480 },
    { san: "c6", pct: 10, games: 3240 }
  ],
  "d4 d5 c4 e6 Nc3 Nf6": [
    { san: "Bg5", pct: 35, games: 6237 },
    { san: "Nf3", pct: 30, games: 5346 },
    { san: "cxd5", pct: 15, games: 2673 },
    { san: "Bf4", pct: 10, games: 1782 }
  ],
  "d4 d5 c4 e6 Nc3 Nf6 Bg5": [
    { san: "Be7", pct: 50, games: 3119 },
    { san: "Nbd7", pct: 20, games: 1247 },
    { san: "h6", pct: 15, games: 936 }
  ],
  "d4 d5 c4 e6 Nf3": [
    { san: "Nf6", pct: 60, games: 15120 },
    { san: "c6", pct: 15, games: 3780 },
    { san: "a6", pct: 8, games: 2016 }
  ],
  "d4 d5 c4 e6 Nf3 Nf6": [
    { san: "Nc3", pct: 40, games: 6048 },
    { san: "g3", pct: 30, games: 4536 },
    { san: "Bg5", pct: 15, games: 2268 }
  ],

  // ================================================
  // SLAV DEFENSE
  // ================================================
  "d4 d5 c4 c6": [
    { san: "Nf3", pct: 45, games: 22680 },
    { san: "Nc3", pct: 35, games: 17640 },
    { san: "e3", pct: 8, games: 4032 },
    { san: "cxd5", pct: 5, games: 2520 }
  ],
  "d4 d5 c4 c6 Nf3": [
    { san: "Nf6", pct: 65, games: 14742 },
    { san: "e6", pct: 15, games: 3402 },
    { san: "dxc4", pct: 10, games: 2268 }
  ],
  "d4 d5 c4 c6 Nf3 Nf6": [
    { san: "Nc3", pct: 45, games: 6634 },
    { san: "e3", pct: 25, games: 3686 },
    { san: "Qc2", pct: 12, games: 1769 }
  ],
  // Semi-Slav
  "d4 d5 c4 c6 Nf3 Nf6 Nc3 e6": [
    { san: "e3", pct: 35, games: 2322 },
    { san: "Bg5", pct: 30, games: 1990 },
    { san: "g3", pct: 15, games: 995 },
    { san: "Qc2", pct: 10, games: 663 }
  ],

  // ================================================
  // QUEEN'S GAMBIT ACCEPTED
  // ================================================
  "d4 d5 c4 dxc4": [
    { san: "Nf3", pct: 40, games: 10800 },
    { san: "e3", pct: 30, games: 8100 },
    { san: "e4", pct: 20, games: 5400 }
  ],
  "d4 d5 c4 dxc4 Nf3": [
    { san: "Nf6", pct: 45, games: 4860 },
    { san: "a6", pct: 20, games: 2160 },
    { san: "e6", pct: 18, games: 1944 }
  ],

  // ================================================
  // KING'S INDIAN DEFENSE
  // ================================================
  "d4 Nf6": [
    { san: "c4", pct: 55, games: 165000 },
    { san: "Nf3", pct: 20, games: 60000 },
    { san: "Bf4", pct: 10, games: 30000 },
    { san: "Bg5", pct: 5, games: 15000 }
  ],
  "d4 Nf6 c4": [
    { san: "g6", pct: 30, games: 49500 },
    { san: "e6", pct: 35, games: 57750 },
    { san: "c5", pct: 10, games: 16500 },
    { san: "e5", pct: 5, games: 8250 }
  ],
  "d4 Nf6 c4 g6": [
    { san: "Nc3", pct: 60, games: 29700 },
    { san: "Nf3", pct: 20, games: 9900 },
    { san: "g3", pct: 10, games: 4950 }
  ],
  "d4 Nf6 c4 g6 Nc3": [
    { san: "Bg7", pct: 75, games: 22275 },
    { san: "d5", pct: 15, games: 4455 }
  ],
  "d4 Nf6 c4 g6 Nc3 Bg7": [
    { san: "e4", pct: 65, games: 14479 },
    { san: "Nf3", pct: 15, games: 3341 },
    { san: "g3", pct: 10, games: 2228 }
  ],
  "d4 Nf6 c4 g6 Nc3 Bg7 e4": [
    { san: "d6", pct: 80, games: 11583 },
    { san: "O-O", pct: 10, games: 1448 }
  ],
  "d4 Nf6 c4 g6 Nc3 Bg7 e4 d6": [
    { san: "Nf3", pct: 40, games: 4633 },
    { san: "Be2", pct: 25, games: 2896 },
    { san: "f3", pct: 18, games: 2085 },
    { san: "f4", pct: 8, games: 927 }
  ],
  // Classical KID
  "d4 Nf6 c4 g6 Nc3 Bg7 e4 d6 Nf3": [
    { san: "O-O", pct: 70, games: 3243 },
    { san: "Bg4", pct: 10, games: 463 },
    { san: "Nbd7", pct: 8, games: 371 }
  ],
  "d4 Nf6 c4 g6 Nc3 Bg7 e4 d6 Nf3 O-O": [
    { san: "Be2", pct: 50, games: 1622 },
    { san: "h3", pct: 15, games: 486 },
    { san: "Be3", pct: 12, games: 389 }
  ],
  "d4 Nf6 c4 g6 Nc3 Bg7 e4 d6 Nf3 O-O Be2": [
    { san: "e5", pct: 55, games: 892 },
    { san: "Na6", pct: 15, games: 243 },
    { san: "Bg4", pct: 12, games: 195 },
    { san: "c5", pct: 8, games: 130 }
  ],

  // ================================================
  // FRENCH DEFENSE
  // ================================================
  "e4 e6": [
    { san: "d4", pct: 80, games: 120000 },
    { san: "d3", pct: 8, games: 12000 },
    { san: "Nf3", pct: 5, games: 7500 }
  ],
  "e4 e6 d4": [
    { san: "d5", pct: 90, games: 108000 },
    { san: "b6", pct: 3, games: 3600 }
  ],
  "e4 e6 d4 d5": [
    { san: "Nc3", pct: 35, games: 37800 },
    { san: "Nd2", pct: 25, games: 27000 },
    { san: "e5", pct: 25, games: 27000 },
    { san: "exd5", pct: 10, games: 10800 }
  ],
  // Winawer
  "e4 e6 d4 d5 Nc3": [
    { san: "Bb4", pct: 40, games: 15120 },
    { san: "Nf6", pct: 35, games: 13230 },
    { san: "dxe4", pct: 15, games: 5670 }
  ],
  "e4 e6 d4 d5 Nc3 Bb4": [
    { san: "e5", pct: 65, games: 9828 },
    { san: "exd5", pct: 15, games: 2268 },
    { san: "Bd2", pct: 8, games: 1210 }
  ],
  // Advance
  "e4 e6 d4 d5 e5": [
    { san: "c5", pct: 75, games: 20250 },
    { san: "b6", pct: 8, games: 2160 },
    { san: "Bd7", pct: 5, games: 1350 }
  ],
  "e4 e6 d4 d5 e5 c5": [
    { san: "c3", pct: 60, games: 12150 },
    { san: "Nf3", pct: 25, games: 5063 }
  ],
  // Tarrasch
  "e4 e6 d4 d5 Nd2": [
    { san: "Nf6", pct: 35, games: 9450 },
    { san: "c5", pct: 30, games: 8100 },
    { san: "a6", pct: 10, games: 2700 }
  ],

  // ================================================
  // CARO-KANN DEFENSE
  // ================================================
  "e4 c6": [
    { san: "d4", pct: 65, games: 78000 },
    { san: "Nf3", pct: 12, games: 14400 },
    { san: "Nc3", pct: 8, games: 9600 },
    { san: "c4", pct: 5, games: 6000 }
  ],
  "e4 c6 d4": [
    { san: "d5", pct: 90, games: 70200 },
    { san: "g6", pct: 3, games: 2340 }
  ],
  "e4 c6 d4 d5": [
    { san: "Nc3", pct: 30, games: 21060 },
    { san: "e5", pct: 25, games: 17550 },
    { san: "Nd2", pct: 18, games: 12636 },
    { san: "exd5", pct: 15, games: 10530 },
    { san: "f3", pct: 5, games: 3510 }
  ],
  // Advance
  "e4 c6 d4 d5 e5": [
    { san: "Bf5", pct: 60, games: 10530 },
    { san: "c5", pct: 20, games: 3510 },
    { san: "Na6", pct: 8, games: 1404 }
  ],
  // Classical
  "e4 c6 d4 d5 Nc3": [
    { san: "dxe4", pct: 70, games: 14742 },
    { san: "g6", pct: 10, games: 2106 }
  ],
  "e4 c6 d4 d5 Nc3 dxe4": [
    { san: "Nxe4", pct: 95, games: 14005 }
  ],
  "e4 c6 d4 d5 Nc3 dxe4 Nxe4": [
    { san: "Bf5", pct: 55, games: 7703 },
    { san: "Nd7", pct: 25, games: 3501 },
    { san: "Nf6", pct: 10, games: 1401 }
  ],

  // ================================================
  // LONDON SYSTEM
  // ================================================
  "d4 d5 Bf4": [
    { san: "Nf6", pct: 40, games: 12000 },
    { san: "c5", pct: 20, games: 6000 },
    { san: "e6", pct: 18, games: 5400 },
    { san: "c6", pct: 10, games: 3000 }
  ],
  "d4 d5 Bf4 Nf6": [
    { san: "e3", pct: 50, games: 6000 },
    { san: "Nf3", pct: 30, games: 3600 },
    { san: "c3", pct: 10, games: 1200 }
  ],
  "d4 d5 Bf4 Nf6 e3": [
    { san: "c5", pct: 30, games: 1800 },
    { san: "e6", pct: 30, games: 1800 },
    { san: "Bf5", pct: 15, games: 900 },
    { san: "c6", pct: 12, games: 720 }
  ],

  // ================================================
  // ENGLISH OPENING
  // ================================================
  "c4": [
    { san: "e5", pct: 25, games: 37500 },
    { san: "Nf6", pct: 25, games: 37500 },
    { san: "c5", pct: 18, games: 27000 },
    { san: "e6", pct: 12, games: 18000 },
    { san: "g6", pct: 8, games: 12000 }
  ],
  "c4 e5": [
    { san: "Nc3", pct: 50, games: 18750 },
    { san: "g3", pct: 25, games: 9375 },
    { san: "Nf3", pct: 15, games: 5625 }
  ],
  "c4 c5": [
    { san: "Nf3", pct: 45, games: 12150 },
    { san: "Nc3", pct: 30, games: 8100 },
    { san: "g3", pct: 15, games: 4050 }
  ],

  // ================================================
  // NIMZO-INDIAN
  // ================================================
  "d4 Nf6 c4 e6": [
    { san: "Nc3", pct: 40, games: 23100 },
    { san: "Nf3", pct: 30, games: 17325 },
    { san: "g3", pct: 20, games: 11550 }
  ],
  "d4 Nf6 c4 e6 Nc3": [
    { san: "Bb4", pct: 50, games: 11550 },
    { san: "d5", pct: 25, games: 5775 },
    { san: "Be7", pct: 10, games: 2310 }
  ],
  "d4 Nf6 c4 e6 Nc3 Bb4": [
    { san: "e3", pct: 30, games: 3465 },
    { san: "Qc2", pct: 25, games: 2888 },
    { san: "Nf3", pct: 15, games: 1733 },
    { san: "f3", pct: 12, games: 1386 },
    { san: "Bd2", pct: 8, games: 924 }
  ],

  // ================================================
  // CATALAN
  // ================================================
  "d4 Nf6 c4 e6 g3": [
    { san: "d5", pct: 60, games: 6930 },
    { san: "Bb4+", pct: 15, games: 1733 },
    { san: "c5", pct: 10, games: 1155 }
  ],
  "d4 Nf6 c4 e6 g3 d5": [
    { san: "Bg2", pct: 85, games: 5891 },
    { san: "Nf3", pct: 10, games: 693 }
  ],
  "d4 Nf6 c4 e6 g3 d5 Bg2": [
    { san: "Be7", pct: 35, games: 2062 },
    { san: "dxc4", pct: 30, games: 1767 },
    { san: "c6", pct: 15, games: 884 }
  ],

  // ================================================
  // GRUNFELD DEFENSE
  // ================================================
  "d4 Nf6 c4 g6 Nc3 d5": [
    { san: "cxd5", pct: 45, games: 2005 },
    { san: "Nf3", pct: 25, games: 1114 },
    { san: "Bf4", pct: 12, games: 535 },
    { san: "Qb3", pct: 10, games: 446 }
  ],
  "d4 Nf6 c4 g6 Nc3 d5 cxd5": [
    { san: "Nxd5", pct: 90, games: 1805 }
  ],
  "d4 Nf6 c4 g6 Nc3 d5 cxd5 Nxd5": [
    { san: "e4", pct: 70, games: 1264 },
    { san: "Bd2", pct: 10, games: 181 }
  ],
  "d4 Nf6 c4 g6 Nc3 d5 cxd5 Nxd5 e4": [
    { san: "Nxc3", pct: 85, games: 1074 }
  ],
  "d4 Nf6 c4 g6 Nc3 d5 cxd5 Nxd5 e4 Nxc3": [
    { san: "bxc3", pct: 90, games: 967 }
  ],
  "d4 Nf6 c4 g6 Nc3 d5 cxd5 Nxd5 e4 Nxc3 bxc3": [
    { san: "Bg7", pct: 75, games: 725 },
    { san: "c5", pct: 15, games: 145 }
  ],
  "d4 Nf6 c4 g6 Nc3 d5 cxd5 Nxd5 e4 Nxc3 bxc3 Bg7": [
    { san: "Nf3", pct: 30, games: 218 },
    { san: "Bc4", pct: 25, games: 181 },
    { san: "Be3", pct: 20, games: 145 }
  ]
};

CT.lookupBook = function(movesArray) {
  var key = movesArray.join(' ');
  var entry = CT.book[key];
  if (!entry) return null;

  var totalGames = 0;
  entry.forEach(function(m) { totalGames += m.games; });

  return {
    moves: entry.map(function(m) {
      return {
        san: m.san,
        games: m.games,
        percentage: m.pct,
        winRate: 50
      };
    }),
    totalGames: totalGames,
    opening: null
  };
};
