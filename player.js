/*
Player.js - ENHANCED VERSION

A Player stores the avatar position in grid coordinates (row/col)
and knows how to:
- draw itself (with optional glow effect)
- attempt a move (tile-by-tile) with collision rules
- detect when it walks over power-ups and coins

NEW FEATURES:
- Glow effect when pink power-up is collected
- Returns what item was collected during movement
*/

class Player {
  constructor(tileSize) {
    this.ts = tileSize;

    // Current grid position (row/col).
    this.r = 0;
    this.c = 0;

    // Movement throttle (so a key press doesn't move 60 tiles per second).
    this.movedAt = 0;
    this.moveDelay = 90; // ms

    // NEW: Glow effect properties
    this.isGlowing = false; // Is the player currently glowing?
    this.glowStartTime = 0; // When did the glow start?
    this.glowDuration = 5000; // How long does glow last? (5 seconds)
  }

  // Place the player at a specific grid location (e.g., the level's start).
  setCell(r, c) {
    this.r = r;
    this.c = c;
  }

  // Convert grid coords to pixel center (for drawing a circle).
  pixelX() {
    return this.c * this.ts + this.ts / 2;
  }

  pixelY() {
    return this.r * this.ts + this.ts / 2;
  }

  // NEW: Activate the glow effect
  activateGlow() {
    this.isGlowing = true;
    this.glowStartTime = millis();
  }

  // NEW: Check if glow should still be active
  updateGlow() {
    if (this.isGlowing) {
      const timeElapsed = millis() - this.glowStartTime;
      if (timeElapsed > this.glowDuration) {
        this.isGlowing = false; // Turn off glow after duration
      }
      if (levels[li].isGoal(player.r, player.c)) {
        this.isGlowing = false; // Turn off glow after duration
      }
    }
  }

  draw() {
    // Update glow status
    this.updateGlow();

    // Draw glow effect FIRST (so it appears behind the player)
    if (this.isGlowing) {
      // Draw multiple layers for a glow effect
      noStroke();

      // Outer glow (largest, most transparent)
      fill(255, 105, 180, 50); // Pink with low opacity
      circle(this.pixelX(), this.pixelY(), this.ts * 1.5);

      // Middle glow
      fill(255, 105, 180, 100);
      circle(this.pixelX(), this.pixelY(), this.ts * 1.2);

      // Inner glow (brightest)
      fill(255, 182, 193, 150); // Light pink
      circle(this.pixelX(), this.pixelY(), this.ts * 0.9);
    }

    // Draw the player (same as before)
    fill(20, 120, 255);
    noStroke();
    circle(this.pixelX(), this.pixelY(), this.ts * 0.6);

    // Optional: Add a white center dot for style
    fill(255);
    circle(this.pixelX(), this.pixelY(), this.ts * 0.2);
  }

  /*
  Try to move by (dr, dc) tiles.

  Inputs:
  - level: a Level instance, used for bounds + wall collision + goal detection
  - dr/dc: desired movement step, typically -1,0,1

  Returns:
  - An object with:
    - moved: true/false if movement happened
    - item: what item was collected ("powerup", "coin", or null)
  */
  tryMove(level, dr, dc) {
    // Throttle discrete movement using millis()
    const now = millis();
    if (now - this.movedAt < this.moveDelay) {
      return { moved: false, item: null };
    }

    const nr = this.r + dr;
    const nc = this.c + dc;

    // Prevent walking off the map.
    if (!level.inBounds(nr, nc)) {
      return { moved: false, item: null };
    }

    // Prevent walking into walls.
    if (level.isWall(nr, nc)) {
      return { moved: false, item: null };
    }

    // Movement is allowed, so commit.
    this.r = nr;
    this.c = nc;
    this.movedAt = now;

    // NEW: Check what we landed on
    let collectedItem = null;

    // Check for pink power-up
    if (level.isPowerUp(nr, nc) && !level.isCollected(nr, nc)) {
      collectedItem = "powerup";
      level.collectItem(nr, nc);
      this.activateGlow(); // Turn on glow effect
    }

    // Check for purple coin (only if timer hasn't expired)
    if (
      level.isCoin(nr, nc) &&
      !level.isCollected(nr, nc) &&
      level.coinsStillAvailable()
    ) {
      collectedItem = "coin";
      level.collectItem(nr, nc);
    }

    return { moved: true, item: collectedItem };
  }
}
