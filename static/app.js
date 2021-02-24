// model
// -----

// rows containing the matches
let rows;
let rows_previous;

let selectedRowIndex; //todo: set to undefined or null, when not in use
let nMatchesTaken; //todo: analog

// game states
const gameBegin = 0, userSelecting = 1, compiSelecting = 2, gameGoing = 3/*, gameOver = 4*/;
let gameState;

// rules
let firstMoveByUser = true;

function resetRows() {
  rows = [1,2,3,4,5];
  rows_previous = Array.from(rows);
}

function nMatches() {
  return rows.reduce((total,num) => total + num, 0);
}

/**
 * Takes off some matches to simulate the move by the computer.
 * @returns {number} - index of row, from which matches were taken
 */
function takeOffMatches() {
  console.assert(nMatches() > 0);
  for (let i = 4; i >= 0; i--) {
    if (rows[i] > 0) {
      let n = Math.min(3, rows[i]);
      rows[i] -= n;
      return i;
    }
  }
}

/**
 * Perform all state-transition actions that do not depend on the previous gameState.
 */
function enterGameState(newState) {
  switch (newState) {
    case gameBegin:
      resetRows();
      showRows();
      ui_message.innerText = 'Click Start to begin the game';
      break;
    case gameGoing:
      nMatchesTaken = 0;
      selectedRowIndex = -1; //undef
      rows_previous = Array.from(rows);
      ui_message.innerText = 'click on a row and take off up to 3 matches';
      break;
    case userSelecting:
      if (nMatchesTaken < 3) {
        ui_message.innerText = 'Take off another match or click OK or Cancel';
      } else {
        ui_message.innerText = 'You took off 3 matches, click OK or Cancel';
      }
      break;
    case compiSelecting:
      //simulate response
      console.log('fire response begin')
      ui_message.innerText = 'Wait for the compi to take off matches';
      setTimeout(() => document.dispatchEvent(simulatedResponseEvent), 2000);
      console.log('fire response end');
      break;
    default:
      console.assert(false);
  }
  gameState = newState;
  setButtons();
}

// UI
// --

// ui vars
const ui_OK = document.getElementById("OK");
const ui_Cancel = document.getElementById("Cancel");
const ui_Quit = document.getElementById("Quit");
const ui_matches = document.getElementById("matches");
const ui_message = document.getElementById("message");

const ui_rows = [];
for (let i=0; i<5; i++) {
  ui_rows.push(document.getElementById("row"+String(i)));
}

// helper functions

/**
 * Shows a row.
 * @param {Number} rowIndex - index of row.
 */
function showRow(rowIndex) {
  let n = rows[rowIndex];
  let s = '';
  if (n > 0) {
    s = 'I';
    for (let k = 1; k < n; k++) {
      s = s + ' I';
    }
  }
  ui_rows[rowIndex].firstElementChild.innerHTML = s;
}

/**
 * Shows all rows.
 */
function showRows() {
  for (let i = 0; i < 5; i++) {
    showRow(i);
  }
}

/**
 * Sets the buttons depending on gameState
 */
function setButtons() {
  switch (gameState) {
    case gameBegin:
      ui_OK.innerText = 'Start';
      ui_OK.disabled = false;
      ui_Cancel.disabled = true;
      ui_Quit.disabled = true;
      break;
    case gameGoing:
      ui_OK.innerText = 'OK';
      ui_OK.disabled = true;
      ui_Cancel.disabled = true;
      ui_Quit.disabled = false;
      break;
    case userSelecting:
      ui_OK.innerText = 'OK';
      ui_OK.disabled = false;
      ui_Cancel.disabled = false;
      ui_Quit.disabled = false;
      break;
    default:
      ui_OK.innerText = 'OK';
      ui_OK.disabled = true;
      ui_Cancel.disabled = true;
      ui_Quit.disabled = true;
  }
}

// load all event listeners

const simulatedResponseEvent = new Event('simulatedResponse');

function loadEventListeners() {
  document.addEventListener('DOMContentLoaded', init);
  document.addEventListener('simulatedResponse', response, true);
  ui_matches.addEventListener('click', matches);
  ui_OK.addEventListener('click', ok);
  ui_Cancel.addEventListener('click', cancel);
  ui_Quit.addEventListener('click', quit);
}

loadEventListeners();

/**
 * event listeners
 * @param e {Event} - the event
 */

/**
 * Handle page-load event.
 */
function init(e) {
  console.log(e)
  enterGameState(gameBegin);
}

/**
 * Handle the event when user clicks on a row.
 */
function matches(e) {
  const t = e.target;
  console.log(`${t} clicked`);
  // the event only has an effect for the following 2 states
  if (gameState === userSelecting || gameState === gameGoing) {
    // additinally: the user must click on or near a symbol representing a match.
    if (t.nodeName === 'SPAN') {
      const p = t.parentElement;
      let i = p.id[3]; // the char at this index gives the row-index
      //console.log(i)
      i = Number(i);
      //console.log(ui_rows[i]);
      if (gameState === gameGoing) { // first click of this move
        selectedRowIndex = i;
      }
      if (i === selectedRowIndex) { // the same row as before was clicked, or first click
        if (nMatchesTaken < 3) { // max not yet done
          rows[i] -= 1;
          nMatchesTaken += 1;
          showRow(i);
        } else {
          alert('You cannot take off more than 3 matches. Click OK or Cancel!');
        }
      } else { // another row than the one before was clicked
        alert('To take off matches from another row, click Cancel first!');
      }
      // remain in state userSelecting or enter it
      enterGameState(userSelecting);
    } else {
      console.log("clicked outside of matches");
    }
  } else {
    console.log("row click has no effect");
  }
}

/**
 * Handle the response of the computer, currently simulated.
 */
function response(e) {
  console.log('response begin');
  if (nMatches() > 1) {
    let i = takeOffMatches();
    showRow(i);
    enterGameState(gameGoing);
  } else {
    let s = (nMatches() === 1) ? "You won!" : "You lost!";
    alert(s);
    enterGameState(gameBegin);
  }
  console.log('response end');
}

/**
 * Handle click on OK resp. Start.
 */
function ok(e) {
  console.log("ok clicked");
  if (gameState === gameBegin) {
    if (firstMoveByUser) {
      enterGameState(gameGoing);
    } else {
      enterGameState(compiSelecting);
    }
  } else if (gameState === userSelecting) {
      enterGameState(compiSelecting);
  } else {
    console.log("ok has no effect")
  }
}

/**
 * Handle click on Cancel.
 */
function cancel(e) {
  console.log("cancel clicked")
  if (gameState === userSelecting) {
    // reset selected row
    rows[selectedRowIndex] = rows_previous[selectedRowIndex];
    showRow(selectedRowIndex);
    // new state
    enterGameState(gameGoing);
  } else {
    console.log("cancel has no effect")
  }
}

/**
 * Handle Click on Quit.
 */
function quit(e) {
  console.log("quit clicked")
  if (gameState === userSelecting || gameState === gameGoing) {
    if (confirm("Quitting means you lost the game!")) {
      enterGameState(gameBegin);
    }
  } else {
    console.log("quit has no effect")
  }
}

