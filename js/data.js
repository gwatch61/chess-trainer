// ============================================
// Chess Training Program - Opening & Endgame Data
// ============================================

window.CT = window.CT || {};

CT.openingsData = [
  {
    category: "Sicilian Defense (1.e4 c5)",
    openings: [
      {
        name: "Open Sicilian",
        eco: "B32",
        moves: ["e4", "c5", "Nf3", "Nc6", "d4", "cxd4", "Nxd4"],
        description: "The Open Sicilian is White's most ambitious response. After 3.d4 cxd4 4.Nxd4, White has a central pawn majority while Black has a semi-open c-file."
      },
      {
        name: "Najdorf Variation",
        eco: "B90",
        moves: ["e4", "c5", "Nf3", "d6", "d4", "cxd4", "Nxd4", "Nf6", "Nc3", "a6"],
        description: "The Najdorf is the most popular and theoretically rich Sicilian. 5...a6 prepares ...e5 or ...b5 while keeping options flexible."
      },
      {
        name: "Dragon Variation",
        eco: "B70",
        moves: ["e4", "c5", "Nf3", "d6", "d4", "cxd4", "Nxd4", "Nf6", "Nc3", "g6"],
        description: "The Dragon features a fianchettoed bishop on g7. Sharp and double-edged, especially in the Yugoslav Attack."
      },
      {
        name: "Classical Sicilian",
        eco: "B56",
        moves: ["e4", "c5", "Nf3", "d6", "d4", "cxd4", "Nxd4", "Nf6", "Nc3", "Nc6"],
        description: "The Classical Sicilian develops the knight to its natural square. A solid choice that leads to rich middlegame positions."
      },
      {
        name: "Scheveningen Variation",
        eco: "B80",
        moves: ["e4", "c5", "Nf3", "d6", "d4", "cxd4", "Nxd4", "Nf6", "Nc3", "e6"],
        description: "The Scheveningen sets up a small pawn center with ...d6 and ...e6. Flexible and solid, favored by Kasparov."
      },
      {
        name: "Alapin Variation",
        eco: "B22",
        moves: ["e4", "c5", "c3"],
        description: "The Alapin (2.c3) prepares d4 while avoiding the theoretical complexities of the Open Sicilian."
      },
      {
        name: "Closed Sicilian",
        eco: "B23",
        moves: ["e4", "c5", "Nc3"],
        description: "The Closed Sicilian avoids opening the center early. White often follows with g3, Bg2, and d3."
      }
    ]
  },
  {
    category: "Italian Game / Giuoco Piano",
    openings: [
      {
        name: "Italian Game",
        eco: "C50",
        moves: ["e4", "e5", "Nf3", "Nc6", "Bc4"],
        description: "The Italian Game develops the bishop to an active diagonal targeting f7. One of the oldest openings in chess."
      },
      {
        name: "Giuoco Piano",
        eco: "C53",
        moves: ["e4", "e5", "Nf3", "Nc6", "Bc4", "Bc5"],
        description: "The Giuoco Piano ('quiet game') leads to positions with chances for both sides. 4.c3 prepares d4."
      },
      {
        name: "Evans Gambit",
        eco: "C51",
        moves: ["e4", "e5", "Nf3", "Nc6", "Bc4", "Bc5", "b4"],
        description: "The Evans Gambit sacrifices a pawn for rapid development and central control. Very aggressive."
      },
      {
        name: "Two Knights Defense",
        eco: "C55",
        moves: ["e4", "e5", "Nf3", "Nc6", "Bc4", "Nf6"],
        description: "Black immediately counterattacks the e4 pawn. Leads to sharp tactical play."
      }
    ]
  },
  {
    category: "Ruy Lopez (Spanish Game)",
    openings: [
      {
        name: "Ruy Lopez",
        eco: "C60",
        moves: ["e4", "e5", "Nf3", "Nc6", "Bb5"],
        description: "The Ruy Lopez is one of the most important openings in chess. White pins the knight defending e5."
      },
      {
        name: "Morphy Defense",
        eco: "C65",
        moves: ["e4", "e5", "Nf3", "Nc6", "Bb5", "a6"],
        description: "The most common response. 3...a6 questions the bishop and prepares ...b5."
      },
      {
        name: "Berlin Defense",
        eco: "C65",
        moves: ["e4", "e5", "Nf3", "Nc6", "Bb5", "Nf6"],
        description: "The Berlin Defense is extremely solid. After 4.O-O Nxe4 5.d4 Nd6 6.Bxc6 dxc6 7.dxe5 Nf5, a drawish endgame arises (the 'Berlin Wall')."
      },
      {
        name: "Marshall Attack",
        eco: "C89",
        moves: ["e4", "e5", "Nf3", "Nc6", "Bb5", "a6", "Ba4", "Nf6", "O-O", "Be7", "Re1", "b5", "Bb3", "O-O", "c3", "d5"],
        description: "The Marshall Attack is a famous pawn sacrifice. Black gives up the e5 pawn for a fierce kingside attack."
      }
    ]
  },
  {
    category: "Vienna Game (1.e4 e5 2.Nc3)",
    openings: [
      {
        name: "Vienna Gambit",
        eco: "C29",
        moves: ["e4", "e5", "Nc3", "Nf6", "f4"],
        description: "The Vienna Gambit strikes at the center with 3.f4. Similar to the King's Gambit but with the knight already supporting e4."
      },
      {
        name: "Vienna Gambit Accepted",
        eco: "C29",
        moves: ["e4", "e5", "Nc3", "Nf6", "f4", "exf4", "e5"],
        description: "After 3...exf4 4.e5, White gains space and forces the knight to retreat. White develops quickly and exploits the open f-file."
      },
      {
        name: "Vienna Gambit Declined",
        eco: "C29",
        moves: ["e4", "e5", "Nc3", "Nf6", "f4", "d5", "fxe5", "Nxe4"],
        description: "Black strikes back with 3...d5 instead of capturing. Sharp open play with chances for both sides."
      },
      {
        name: "Falkbeer Variation",
        eco: "C26",
        moves: ["e4", "e5", "Nc3", "Nf6", "Bc4"],
        description: "White develops the bishop to c4, targeting f7. A flexible move that can transpose into several sharp lines."
      },
      {
        name: "Stanley Variation",
        eco: "C27",
        moves: ["e4", "e5", "Nc3", "Nf6", "Bc4", "Nxe4"],
        description: "Black grabs the e4 pawn. After 4.Qh5 the position becomes highly tactical with threats against f7 and the knight."
      },
      {
        name: "Max Lange Defense",
        eco: "C25",
        moves: ["e4", "e5", "Nc3", "Nc6"],
        description: "A solid symmetrical response. Black mirrors White's knight development and keeps options flexible."
      },
      {
        name: "Vienna Classical",
        eco: "C28",
        moves: ["e4", "e5", "Nc3", "Nc6", "Bc4", "Nf6"],
        description: "The classical setup combines Nc3 and Bc4 with natural development. A flexible formation that can lead to kingside attacks."
      }
    ]
  },
  {
    category: "Queen's Gambit (1.d4 d5 2.c4)",
    openings: [
      {
        name: "Queen's Gambit Declined",
        eco: "D30",
        moves: ["d4", "d5", "c4", "e6"],
        description: "The QGD is one of the most solid defenses. Black supports d5 with ...e6 and develops naturally."
      },
      {
        name: "Queen's Gambit Accepted",
        eco: "D20",
        moves: ["d4", "d5", "c4", "dxc4"],
        description: "Black captures the gambit pawn. Modern theory shows this is perfectly playable for Black."
      },
      {
        name: "Slav Defense",
        eco: "D10",
        moves: ["d4", "d5", "c4", "c6"],
        description: "The Slav supports d5 with ...c6, keeping the light-squared bishop active. Very solid."
      },
      {
        name: "Semi-Slav Defense",
        eco: "D43",
        moves: ["d4", "d5", "c4", "c6", "Nf3", "Nf6", "Nc3", "e6"],
        description: "The Semi-Slav combines ideas from the Slav and QGD. One of the most complex openings in chess."
      },
      {
        name: "Tarrasch Defense",
        eco: "D32",
        moves: ["d4", "d5", "c4", "e6", "Nc3", "c5"],
        description: "The Tarrasch counters in the center immediately. Black accepts an isolated d-pawn for active piece play."
      }
    ]
  },
  {
    category: "King's Indian Defense",
    openings: [
      {
        name: "King's Indian Defense",
        eco: "E60",
        moves: ["d4", "Nf6", "c4", "g6"],
        description: "The KID is a hypermodern defense where Black allows White to build a big center, then counterattacks."
      },
      {
        name: "Classical Variation",
        eco: "E92",
        moves: ["d4", "Nf6", "c4", "g6", "Nc3", "Bg7", "e4", "d6", "Nf3", "O-O", "Be2", "e5"],
        description: "The Classical KID is the mainline. Both sides have clear plans: White expands on the queenside, Black attacks on the kingside."
      },
      {
        name: "Saemisch Variation",
        eco: "E80",
        moves: ["d4", "Nf6", "c4", "g6", "Nc3", "Bg7", "e4", "d6", "f3"],
        description: "The Saemisch is a positional approach. 5.f3 supports the center and prepares Be3."
      }
    ]
  },
  {
    category: "French Defense (1.e4 e6)",
    openings: [
      {
        name: "French Defense",
        eco: "C00",
        moves: ["e4", "e6"],
        description: "The French Defense is solid and strategic. Black's light-squared bishop is often restricted, but the pawn structure is very resilient."
      },
      {
        name: "Winawer Variation",
        eco: "C15",
        moves: ["e4", "e6", "d4", "d5", "Nc3", "Bb4"],
        description: "The Winawer is the sharpest French variation. 3...Bb4 pins the knight and creates immediate tension."
      },
      {
        name: "Classical Variation",
        eco: "C11",
        moves: ["e4", "e6", "d4", "d5", "Nc3", "Nf6"],
        description: "The Classical French develops naturally. After 4.e5 Nfd7, a complex battle for space ensues."
      },
      {
        name: "Advance Variation",
        eco: "C02",
        moves: ["e4", "e6", "d4", "d5", "e5"],
        description: "The Advance Variation gives White space but locks the center early. Black typically counterattacks with ...c5."
      },
      {
        name: "Tarrasch Variation",
        eco: "C03",
        moves: ["e4", "e6", "d4", "d5", "Nd2"],
        description: "The Tarrasch avoids the Winawer pin. White keeps a solid center and aims for a positional advantage."
      }
    ]
  },
  {
    category: "Caro-Kann Defense (1.e4 c6)",
    openings: [
      {
        name: "Caro-Kann Defense",
        eco: "B10",
        moves: ["e4", "c6"],
        description: "The Caro-Kann is one of the most solid replies to 1.e4. Black's light-squared bishop remains active unlike in the French."
      },
      {
        name: "Advance Variation",
        eco: "B12",
        moves: ["e4", "c6", "d4", "d5", "e5"],
        description: "White gains space with 3.e5. Black typically plays ...Bf5 followed by ...e6 and ...c5."
      },
      {
        name: "Classical Variation",
        eco: "B18",
        moves: ["e4", "c6", "d4", "d5", "Nc3", "dxe4", "Nxe4", "Bf5"],
        description: "The Classical is the main line. Black develops the bishop to f5 before playing ...e6."
      }
    ]
  },
  {
    category: "English Opening (1.c4)",
    openings: [
      {
        name: "English Opening",
        eco: "A10",
        moves: ["c4"],
        description: "The English is a flexible flank opening. It can transpose to many queen's pawn openings or lead to unique positions."
      },
      {
        name: "Symmetrical Variation",
        eco: "A30",
        moves: ["c4", "c5"],
        description: "The Symmetrical English leads to strategic, maneuvering positions. Both sides develop flexibly."
      },
      {
        name: "Reversed Sicilian",
        eco: "A20",
        moves: ["c4", "e5"],
        description: "Black occupies the center. White essentially plays a Sicilian Defense with an extra tempo."
      }
    ]
  },
  {
    category: "London System & Others",
    openings: [
      {
        name: "London System",
        eco: "D00",
        moves: ["d4", "d5", "Bf4"],
        description: "The London System is a solid, easy-to-learn system for White. The bishop goes to f4 before developing the knight."
      },
      {
        name: "Catalan Opening",
        eco: "E01",
        moves: ["d4", "Nf6", "c4", "e6", "g3"],
        description: "The Catalan fianchettoes the kingside bishop, putting pressure on the long diagonal. Very popular at the top level."
      },
      {
        name: "Nimzo-Indian Defense",
        eco: "E20",
        moves: ["d4", "Nf6", "c4", "e6", "Nc3", "Bb4"],
        description: "The Nimzo-Indian pins the knight on c3, restraining White's center. One of the best defenses to 1.d4."
      },
      {
        name: "Grunfeld Defense",
        eco: "D80",
        moves: ["d4", "Nf6", "c4", "g6", "Nc3", "d5"],
        description: "The Grunfeld challenges White's center immediately. After cxd5 Nxd5, Black aims to destroy the center with ...c5."
      }
    ]
  }
];

CT.endgamesData = [
  {
    category: "Basic Checkmates",
    positions: [
      {
        name: "Queen vs King",
        fen: "8/8/8/4k3/8/8/8/4K2Q w - - 0 1",
        scramble: { w: ['K', 'Q'], b: ['K'], turn: 'w' },
        description: "Deliver checkmate with King and Queen. Drive the enemy king to the edge of the board.",
        keyReminder: "Queen restricts, king supports. Mirror the enemy king's moves to push it to the edge. Never check without a purpose.",
        goal: "checkmate",
        maxMoves: 15,
        hints: [
          "Restrict the king's squares with your queen",
          "Use your king to support the queen",
          "Drive the enemy king to the edge, then deliver checkmate"
        ]
      },
      {
        name: "Rook vs King",
        fen: "8/8/8/4k3/8/8/8/R3K3 w - - 0 1",
        scramble: { w: ['K', 'R'], b: ['K'], turn: 'w' },
        description: "Deliver checkmate with King and Rook. The key technique is 'the box' - restrict the king to smaller and smaller areas.",
        keyReminder: "Build a 'box' with the rook and shrink it rank by rank. Use your king to gain opposition and force the enemy king backward.",
        goal: "checkmate",
        maxMoves: 25,
        hints: [
          "Create a 'box' with your rook to restrict the enemy king",
          "Bring your king up to support the rook",
          "Use opposition to push the enemy king to the edge"
        ]
      },
      {
        name: "Two Rooks vs King",
        fen: "8/8/8/4k3/8/8/8/R3K2R w - - 0 1",
        scramble: { w: ['K', 'R', 'R'], b: ['K'], turn: 'w' },
        description: "Checkmate with two rooks using the 'lawnmower' or 'staircase' technique.",
        keyReminder: "Alternate rook checks on successive ranks like a lawnmower. Your king doesn't need to help — the rooks do all the work.",
        goal: "checkmate",
        maxMoves: 12,
        hints: [
          "Use the 'lawnmower' technique: alternate rook checks to push the king to the edge",
          "Each rook cuts off one rank, then the other rook gives check on the next rank"
        ]
      },
      {
        name: "Two Bishops vs King",
        fen: "8/8/8/4k3/8/8/8/2B1KB2 w - - 0 1",
        scramble: { w: ['K', 'B', 'B'], b: ['K'], turn: 'w', bishopColors: true },
        description: "Checkmate with two bishops. You must drive the king to a corner.",
        keyReminder: "Place bishops side-by-side to create a diagonal wall. Drive the king to any corner — your king must actively help push.",
        goal: "checkmate",
        maxMoves: 25,
        hints: [
          "Place your bishops side by side to create a diagonal barrier",
          "Gradually restrict the enemy king toward a corner",
          "Your king must be active and help push the enemy king"
        ]
      }
    ]
  },
  {
    category: "Rook Endgames",
    positions: [
      {
        name: "Lucena Position",
        fen: "3K4/3P4/8/1k6/8/8/3r4/R7 w - - 0 1",
        description: "The most important rook endgame. Learn the 'bridge' technique to promote the pawn.",
        keyReminder: "The king blocks its own pawn. Activate your rook, then step the king aside. When the defending rook checks from behind, interpose your rook between the kings to block — that's the bridge.",
        goal: "promote",
        maxMoves: 15,
        hints: [
          "Your king blocks the pawn — activate your rook first, then find a way to step the king aside",
          "The king must leave the promotion square so the pawn can advance",
          "When the defending rook checks from behind, use your rook to block the check"
        ]
      },
      {
        name: "Philidor Position",
        fen: "8/3k4/r7/3PK3/8/8/8/7R b - - 0 1",
        description: "You are the defending side (Black). White has a rook and a dangerous passed pawn — your goal is to hold the draw. A draw here is a victory for the defender.",
        keyReminder: "Keep your rook on the 6th rank while the pawn is on the 5th — this stops the enemy king from advancing. Once the pawn pushes to the 6th, immediately retreat your rook to the back rank and deliver endless checks from behind. The attacker's king has no shelter, so the game is drawn.",
        goal: "draw",
        maxMoves: 20,
        hints: [
          "You are the defender — a draw is your goal. Hold the rook on the 6th rank to block the king",
          "Only retreat to the back rank when the pawn advances to the 6th rank",
          "Check from behind — the king cannot escape without abandoning the pawn"
        ]
      },
      {
        name: "Rook + Pawn vs Rook (6th rank)",
        fen: "4k3/8/3KP3/8/8/8/r7/5R2 w - - 0 1",
        description: "White's king stands next to the pawn on the 6th rank. Find the winning technique.",
        keyReminder: "Cut off the enemy king with your rook. Advance the pawn to the 7th only when you can transition into a Lucena position — never trade rooks into a drawn K+P vs K.",
        goal: "promote",
        maxMoves: 20,
        hints: [
          "Use your rook to cut off the enemy king from approaching",
          "Advance the king to support the pawn while the rook shields from checks"
        ]
      }
    ]
  },
  {
    category: "Pawn Endgames",
    positions: [
      {
        name: "Key Squares (Opposition)",
        fen: "8/8/8/8/4k3/8/4P3/4K3 w - - 0 1",
        description: "Understanding opposition is key to pawn endgames. White needs to gain the opposition to promote.",
        keyReminder: "King first, pawn second. Gain the opposition (kings face-to-face with one square between). The key squares for an e-pawn are d4, e4, f4 — reach one and the pawn promotes.",
        goal: "promote",
        maxMoves: 20,
        hints: [
          "Advance the king before pushing the pawn",
          "Try to get the opposition (kings facing each other with one square between)",
          "The key squares for a pawn on e2 are d4, e4, and f4"
        ]
      },
      {
        name: "Outside Passed Pawn",
        fen: "8/8/4k1p1/6p1/1P3pP1/5P2/4K3/8 w - - 0 1",
        description: "The outside passed pawn decoys the enemy king, allowing your king to capture the remaining pawns.",
        keyReminder: "Push the outside passer to lure the enemy king away, then invade on the opposite wing with your king to clean up the remaining pawns.",
        goal: "promote",
        maxMoves: 25,
        hints: [
          "Push the outside passed pawn (b-pawn) to distract Black's king",
          "Once the enemy king chases the b-pawn, your king enters on the kingside"
        ]
      },
      {
        name: "Triangulation",
        fen: "8/3k4/3p4/3PK3/8/8/8/8 w - - 0 1",
        description: "With locked pawns, outflank via a triangular king maneuver to gain the opposition and break through.",
        keyReminder: "The direct approach draws — go around to the kingside (Kf6 or Kf5) to gain the opposition on the e-file, then break through to win the d6 pawn and promote.",
        goal: "promote",
        maxMoves: 35,
        hints: [
          "The direct approach (Kd4, Ke4) only draws — you need to outflank",
          "Head to the kingside with your king to gain the opposition on the e-file"
        ]
      }
    ]
  },
  {
    category: "Queen Endgames",
    positions: [
      {
        name: "Queen vs Pawn on 7th",
        fen: "8/8/8/8/8/1k6/1p6/4K2Q w - - 0 1",
        description: "Stop the pawn from promoting and deliver checkmate. Bishop and rook pawns are the trickiest.",
        keyReminder: "Check to bring your king closer, then pin the pawn when the enemy king stands in front of it. Watch for stalemate traps — bishop and rook pawns are especially dangerous.",
        goal: "checkmate",
        maxMoves: 30,
        hints: [
          "Use checks to bring your king closer",
          "Pin the pawn to the king when possible",
          "Be careful not to stalemate!"
        ]
      }
    ]
  }
];
