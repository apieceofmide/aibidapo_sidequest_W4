/*
Level.js - ENHANCED VERSION

A Level represents ONE maze grid loaded from levels.json. 

Tile legend:
0 = floor
1 = wall
2 = start
3 = goal
4 = pink power-up (makes player glow)
5 = purple coin (worth 100 points, disappears after 15 seconds)

NEW FEATURES:
- Tracks collected items
- Timer for purple coins
- Draws power-ups and coins
*/

class Level {
  constructor(grid, tileSize) {
    // Store the tile grid and tile size (pixels per tile).
    this.grid = grid;
    this.ts = tileSize;

    // Start position in grid coordinates (row/col).
    this.start = this.findStart();

    // NEW: Keep track of collected items
    // This stores which tiles have been collected (so we don't draw them again)
    this.collectedItems = [];

    // NEW: Timer for purple coins
    // When the level loads, start a timer
    this.levelStartTime = millis(); // millis() = time in milliseconds since game started
    this.coinDuration = 15000; // 15 seconds in milliseconds (15 * 1000)

    // Normalize the start tile to floor after finding it
    if (this.start) {
      this.grid[this.start.r][this.start.c] = 0;
    }
  }

  // ----- Size helpers -----

  rows() {
    return this.grid.length;
  }

  cols() {
    return this.grid[0].length;
  }

  pixelWidth() {
    return this.cols() * this.ts;
  }

  pixelHeight() {
    return this.rows() * this.ts;
  }

  // ----- Semantic helpers -----

  inBounds(r, c) {
    return r >= 0 && c >= 0 && r < this.rows() && c < this.cols();
  }

  tileAt(r, c) {
    return this.grid[r][c];
  }

  isWall(r, c) {
    return this.tileAt(r, c) === 1;
  }

  isGoal(r, c) {
    return this.tileAt(r, c) === 3;
  }

  // NEW: Check if tile is a pink power-up
  isPowerUp(r, c) {
    return this.tileAt(r, c) === 4;
  }

  // NEW: Check if tile is a purple coin
  isCoin(r, c) {
    return this.tileAt(r, c) === 5;
  }

  // NEW: Check if an item has been collected
  isCollected(r, c) {
    // Check if this position exists in our collectedItems array
    return this.collectedItems.some((item) => item.r === r && item.c === c);
  }

  // NEW: Collect an item at a specific position
  collectItem(r, c) {
    // Add this position to our collected items list
    this.collectedItems.push({ r: r, c: c });
  }

  // NEW: Check if purple coins should still be visible
  coinsStillAvailable() {
    const timeElapsed = millis() - this.levelStartTime;
    return timeElapsed < this.coinDuration;
  }

  // NEW: Reset the level timer (called when level is loaded)
  resetTimer() {
    this.levelStartTime = millis();
    this.collectedItems = []; // Also reset collected items
  }

  // ----- Start-finding -----

  findStart() {
    for (let r = 0; r < this.rows(); r++) {
      for (let c = 0; c < this.cols(); c++) {
        if (this.grid[r][c] === 2) {
          return { r, c };
        }
      }
    }
    return null;
  }

  // ----- Drawing -----

  draw() {
    /*
    Draw each tile as a rectangle.
    
    Visual rules:
    - Walls (1): dark teal
    - Floor (0): light gray
    - Goal (3): light with orange highlight
    - Pink power-up (4): pink circle
    - Purple coin (5): purple circle (only if timer hasn't expired)
    */

    for (let r = 0; r < this.rows(); r++) {
      for (let c = 0; c < this.cols(); c++) {
        const v = this.grid[r][c];

        // Draw base tile (floor or wall)
        if (v === 1) {
          fill(30, 50, 60); // Dark teal for walls
        } else {
          fill(232); // Light gray for floor
        }
        rect(c * this.ts, r * this.ts, this.ts, this.ts);

        // Draw goal highlight
        if (v === 3) {
          noStroke();
          fill(255, 200, 120, 200);
          rect(c * this.ts + 4, r * this.ts + 4, this.ts - 8, this.ts - 8, 6);
        }

        // NEW: Draw pink power-up (if not collected)
        if (v === 4 && !this.isCollected(r, c)) {
          fill(255, 105, 180); // Hot pink color
          noStroke();
          circle(
            c * this.ts + this.ts / 2,
            r * this.ts + this.ts / 2,
            this.ts * 0.5,
          );
          // Add a little sparkle effect
          fill(255, 200, 220);
          circle(
            c * this.ts + this.ts / 2,
            r * this.ts + this.ts / 2,
            this.ts * 0.25,
          );
        }

        // NEW: Draw purple coin (if not collected AND timer hasn't expired)
        if (v === 5 && !this.isCollected(r, c) && this.coinsStillAvailable()) {
          fill(138, 43, 226); // Purple color
          noStroke();
          circle(
            c * this.ts + this.ts / 2,
            r * this.ts + this.ts / 2,
            this.ts * 0.4,
          );
          // Add a light purple center
          fill(225, 194, 255);
          circle(
            c * this.ts + this.ts / 2,
            r * this.ts + this.ts / 2,
            this.ts * 0.15,
          );
        }
      }
    }

    // NEW: Draw timer for purple coins
    this.drawCoinTimer();
  }

  // NEW: Draw a timer showing how long purple coins are available
  drawCoinTimer() {
    const timeElapsed = millis() - this.levelStartTime;
    const timeRemaining = Math.max(0, this.coinDuration - timeElapsed);
    const secondsRemaining = Math.ceil(timeRemaining / 1000);

    // Only show timer if there are still coins available
    if (this.coinsStillAvailable() && secondsRemaining > 0) {
      fill(225, 194, 255); // Purple color
      textSize(12);
      text(`Purple coins: ${secondsRemaining}s`, 10, this.pixelHeight() - 10);
    }
  }
}
