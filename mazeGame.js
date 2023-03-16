const portals = {
  "0,26": [14, 18],
  "14,18": [0, 26],
  "25,7": [47, 6],
  "47,6": [25, 7],
}
const scroll1 = "bells are a troll's weakness."
const scroll2 = "throne room"
let hasShield = false;
let hasSword = false;
let padlockKeys = 0;
let doorKeys = 0;
let health = 5;
let playerPosition = [0, 0];
const map = require("./map.js");

const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

function handleUserInput(input) {
  console.clear();
  let message = "";
  if (!["w", "a", "s", "d"].includes(input)) {
    render();
    prompt("enter 'w', 'a', 's', or 'd'.");
  } else {
    try {
      updatePlayerPosition(input);
      message = handleInteraction();
    }
    catch (error) {
      message = error.message;
    }
    render();
    console.log(message);
    winLoseOrContinue();
  }
}

function prompt(message) {
  console.log(message);
  readline.question("", handleUserInput);
}

function updatePlayerPosition(input) {
  const move = playerPosition.slice();
  if (input === "w") move[0]++;
  if (input === "s") move[0]++;
  if (input === "a") move[1]--;
  if (input === "d") move[1]++;
  
  if (move[0] < 0 || move[1] < 0 || move[0] >= map.length || move[1] >= map[0].length || map[move[0]][move[1]] === "🪨") {
    throw new Error("you cannot pass through stone.");
  }

  if (map[move[0]][move[1]] === "🔒") {
    if (padlockKeys === 0) {
      throw new Error("you need a padlock key.");
    }
    padlockKeys--;
    map[move[0]][move[1]] = "  ";
  }

  if (map[move[0]][move[1]] === "🚪") {
    if (doorKeys === 0) {
      throw new Error("you need a door key.");
    }
    doorKeys--;
    map[move[0]][move[1]] = "  ";
  }

  if (map[move[0]][move[1]] === "🔔") {
    if (map[move[0]][move[1]-1] === "🧌") {
      map[move[0]][move[1]-1] = "  ";
    }
    if (map[move[0]][move[1]+1] === "🧌") {
      map[move[0]][move[1]+1] = "  ";
    }
    throw new Error("you rang the bell. nearby trolls flee.");
  }

  if (map[move[0]][move[1]] === "🧌" && !hasSword) {
    health = hasShield ? health - 1 : 0;
    throw new Error("fighting a troll without a sword is a bad idea.");
  }

  if (map[move[0]][move[1]] === "🐉" && !(hasSword && hasShield)) {
    health = 0;
    throw new Error("you were vanquished by the dragon");
  }

  if (move.join() in portals) {
    playerPosition = portals[move.join()];
    throw new Error("you fell through a portal.");
  }

  playerPosition = move;
}

function handleInteraction() {
  const [y, x] = playerPosition;
  const cell = map[y][x];
  if (cell === "🗡️") {
    map[y][x] = "  ";
    hasSword = true;
    return "you found a sword.";
  }
  if (cell === "🛡️") {
    map[y][x] = "  ";
    hasShield = true;
    return "you found a shield.";
  }
  if (cell === "🗝️") {
    map[y][x] = "  ";
    doorKeys++;
    return "you found a door key.";
  }
  if (cell === "🔑") {
    padlockKeys++;
    return "you found a padlock key.";
  }
  if (cell === "💚") {
    map[y][x] = "  ";
    health = 5;
    return "you healed.";
  }
  if (cell === "🪤") {
    map[y][x] = "  ";
    health--;
    return "OUCH!";
  }
  if (cell === "🔥") {
    health = 0;
  }
  if (cell === "🐉") {
    map[y][x] = "  ";
    health -= 4;
    return "you defeated the dragon, barely.";
  }
  if (cell === "🧌") {
    map[y][x] = "  ";
    return "you defeated the troll.";
  }
  if (cell === "📜") {
    if (X < 20) return scroll1;
    else return scroll2;
  }
  if (/\d[a-z]/.test(cell)) {
    return "you passed through a portal";
  }
  return "";
}

function winLoseOrContinue() {
  if (map[playerPosition[0]][playerPosition[1]] === "🚽") {
    console.log("YOU MADE IT! good job.");
  }
  else if (health <= 0) {
    deathMessage();
    readline.close();
  }
  else {
    prompt("enter your move with WASD.");
  }
}

function deathMessage() {
  if (map[playerPosition[0]][playerPosition[1]+1] === "🐉") {
    console.log("you defeated the dragon, but were mortally wounded.");
  } else {
    console.log("you died.");
  }
}

function render() {
  const [y, x] = playerPosition;
  let view = "💚".repeat(health) + "  ".repeat(7-health);
  if (doorKeys) view += "🗝️ x" + doorKeys + "  ";
  if (padlockKeys) view += "🔑 x" + padlockKeys + "  ";
  if (hasSword) view += "🗡️ ";
  if (hasShield) view += "🛡️";

  view += "\n\n";

  for (let i = y - 3; i <= y + 3; i++) {
    for (let j = x - 3; j <= x + 3; j++) {
      if (i < 0 || i >= map.length || j < 0 || j >= map[i].length) {
        view += "🪨 ";
      }
      else if (i !== y || j !== x) {
        const adjacent = Math.abs(i-y) + Math.abs(j-x) === 1;
        const isTrap = map[i][j] === "🪤";
        if (isTrap && !adjacent) view += "  ";
        else view += ["  ", "💚", "🚪", "🔥", "🔔"].includes(map[i][j]) ? map[i][j] : map[i][j] + " ";
      }
      else {
        view += health <= 0 ? "💀" : hasShield && hasSword ? "🥷 " : "🧑";
      }
    }
    view += "\n";
  }
  console.log(view);
}

console.clear();
render();
prompt("\nenter your move with WASD.");