/*
Week 4 – Example 4: Playable Maze (ENHANCED WITH POWER-UPS AND COINS)
Course: GBDA302
Instructors: Dr. Karen Cochrane and David Han
Date: Feb. 5, 2026

NEW FEATURES:
- Pink power-ups that make player glow
- Purple coins worth 100 points (disappear after 15 seconds)
- Score tracking
- Sound feedback (optional - commented out if you don't have sounds)

This is the "orchestrator" file that ties everything together.
*/

const TS = 32;

// Raw JSON data (from levels.json).
let levelsData;

// Array of Level instances.
let levels = [];

// Current level index.
let li = 0;

// Player instance (tile-based).
let player;

// NEW: Score tracking
let score = 0;

// NEW: Optional sound effects (you can add these later)
// let powerUpSound;
// let coinSound;

function preload() {
  // Ensure level data is ready before setup runs.
  levelsData = loadJSON(
    "levels.json",
    // Success callback
    function (data) {
      console.log("✅ levels.json loaded successfully!");
      console.log("Number of levels:", data.levels.length);
    },
    // Error callback
    function (error) {
      console.error("❌ Error loading levels.json:", error);
      alert(
        "ERROR: Could not load levels.json. Make sure it's in the same folder as index.html!",
      );
    },
  );

  // NEW: Load sound effects (uncomment if you have sound files)
  // powerUpSound = loadSound("powerup.mp3");
  // coinSound = loadSound("coin.mp3");
}

function setup() {
  /*
  Convert raw JSON grids into Level objects.
  */

  // Check if levels.json loaded properly
  if (!levelsData || !levelsData.levels) {
    console.error("levelsData is undefined or missing 'levels' array!");
    alert(
      "ERROR: levels.json did not load correctly. Check the console (F12) for details.",
    );
    noLoop(); // Stop the draw loop
    return;
  }

  console.log("✅ Setting up game with", levelsData.levels.length, "levels");

  levels = levelsData.levels.map((grid) => new Level(copyGrid(grid), TS));

  // Create a player.
  player = new Player(TS);

  // Load the first level (sets player start + canvas size).
  loadLevel(0);

  noStroke();
  textFont("sans-serif");
  textSize(14);

  console.log("✅ Game setup complete!");
}

function draw() {
  background(240);

  // Draw current level then player on top.
  levels[li].draw();
  player.draw();

  drawHUD();
}

function drawHUD() {
  /*
  HUD = "Heads Up Display"
  This shows information to the player at the top of the screen
  */

  fill(225);
  textSize(11);

  // Show level number
  text(`Level ${li + 1}/${levels.length}`, 10, 16);

  // NEW: Show score
  text(`Score: ${score}`, 10, 25);

  // Show controls
  //text(`WASD/Arrows to move`, 10, 48);

  // NEW: Show glow status
  if (player.isGlowing) {
    fill(255, 105, 180); // Pink text
    text(`You are Glowing! (Literally)`, 185, 16);
  }
}

function keyPressed() {
  /*
  Convert key presses into a movement direction. (WASD + arrows)
  */
  let dr = 0;
  let dc = 0;

  if (keyCode === LEFT_ARROW || key === "a" || key === "A") dc = -1;
  else if (keyCode === RIGHT_ARROW || key === "d" || key === "D") dc = 1;
  else if (keyCode === UP_ARROW || key === "w" || key === "W") dr = -1;
  else if (keyCode === DOWN_ARROW || key === "s" || key === "S") dr = 1;
  else return; // not a movement key

  // Try to move. Returns info about what happened.
  const result = player.tryMove(levels[li], dr, dc);

  // NEW: Handle item collection
  if (result.moved) {
    if (result.item === "powerup") {
      // Player collected a pink power-up!
      console.log("Collected power-up! Player is now glowing!");
    } else if (result.item === "coin") {
      // Player collected a purple coin!
      score += 100; // Add 100 points
      console.log("Collected coin! +100 points! Score:", score);
    }

    // Check if the player reached the goal
    if (levels[li].isGoal(player.r, player.c)) {
      nextLevel();
    }
  }
}

// ----- Level switching -----

function loadLevel(idx) {
  /*
  This function:
  1. Changes to a new level
  2. Places the player at the start
  3. Resets the level timer
  4. Resizes the canvas
  */

  li = idx;

  const level = levels[li];

  player.isGlowing = false; // to restart the glow at each level

  // NEW: Reset the level timer (important for purple coins!)
  level.resetTimer();

  // Place player at the level's start tile (2), if present.
  if (level.start) {
    player.setCell(level.start.r, level.start.c);
  } else {
    // Fallback spawn: top-left-ish (but inside bounds).
    player.setCell(1, 1);
  }

  // Ensure the canvas matches this level's dimensions.
  resizeCanvas(level.pixelWidth(), level.pixelHeight());
}

function nextLevel() {
  /*
  Go to the next level (or loop back to level 1)
  */

  // Wrap around when we reach the last level.
  const next = (li + 1) % levels.length;
  loadLevel(next);
}

// ----- Utility -----

function copyGrid(grid) {
  /*
  Make a deep-ish copy of a 2D array.
  
  Why copy?
  - Because Level constructor may modify tiles
  - We don't want to change the original JSON data
  */
  return grid.map((row) => row.slice());
}
