/* establish global variables for ESLint */
/* global $ document jQuery */

import $ from 'jquery';
import jQuery from 'jquery';

// import custom styles for project
import './index.scss';

// Placeholder for currentGame object
let currentGame;

// Game object constructor for game initialization
const Game = function constructor(playerIcon, board, startingTurn) {
  // if the board is undefined then start with an empty board
  this.board = board === undefined ? ['', '', '', '', '', '', '', '', ''] : board;
  // set the player's icon
  this.playerIcon = playerIcon;
  // set the ai's icon
  this.aiIcon = playerIcon === 'X' ? 'O' : 'X';
  // if the starting turn is undefined start with X
  this.turn = startingTurn === undefined ? 'X' : startingTurn;
  // number of turns played
  this.turnNum = 0;
  // who is the winner (X or O)
  this.winner = null;
  // indication that game is over
  this.gameOver = false;
  // array of three winning positions
  this.winPositions = null;
  this.bestAIMove = null;
};

// method that checks for win or tie
// updates Game.winner, Game.winPositions, and Game.gameOver
Game.prototype.checkGameOver = function checkGameOVer() {
  // array of coordinates for all possible win cases
  const winCases = [
    [0, 1, 2], // first row
    [3, 4, 5], // second row
    [6, 7, 8], // thrid row
    [0, 3, 6], // first col
    [1, 4, 7], // second col
    [2, 5, 8], // thrid col
    [0, 4, 8], // diag from upper left to lower right
    [6, 4, 2], // diag from lower left to upper right
  ];

  // loop through all win cases to find a winner
  for (let currCase = 0; currCase < winCases.length; currCase += 1) {
    // grab the coordinates from the winCases for each position
    const pos1 = winCases[currCase][0];
    const pos2 = winCases[currCase][1];
    const pos3 = winCases[currCase][2];

    // add the values of the board for each of the positions
    const sumOfPositions = this.board[pos1] + this.board[pos2] + this.board[pos3];

    // three in a row from Xs
    if (sumOfPositions === 'XXX') {
      // array of the winning positions
      this.winPositions = winCases[currCase];
      this.winner = 'X';
      this.gameOver = true;
      return true;
    }
    // three in a row from Os
    else if (sumOfPositions === 'OOO') {
      // array of the winning positions
      this.winPositions = winCases[currCase];
      this.winner = 'O';
      this.gameOver = true;
      return true;
    }
  }

  // if all positions played and still no winner then game is over (Tie)
  if (!this.board.includes('') && this.gameOver === false) {
    this.gameOver = true;
    return true;
  }

  // game not over
  return false;
};

// method to determine the possible moves
Game.prototype.getPossibleMoves = function getPossibleMoves() {
  const possibleMoves = [];
  for (let currPos = 0; currPos < this.board.length; currPos += 1) {
    // find all the board values that are empty and add them as a possible move
    if (this.board[currPos] === '') {
      possibleMoves.push(currPos);
    }
  }
  return possibleMoves;
};

// method that takes position and updates board but not display for the min max algorithm
Game.prototype.evaluateMove = function evaluateMove(pos) {
  // log the move based on the current turn, X/O
  this.board[pos] = this.turn;
  // invert the turn
  this.turn = this.turn === 'X' ? 'O' : 'X';
  // increment the turn count
  this.turnNum += 1;
};

// method that takes position and updates board
Game.prototype.move = function move(pos) {
  // log the move based on the current turn, X/O
  this.board[pos] = this.turn;
  // Add the icon to the display
  $(`#${pos}`).html(this.turn);
  // animate the icon dropping onto the board
  $(`#${pos}`).addClass('drop');
  // invert the turn
  this.turn = this.turn === 'X' ? 'O' : 'X';
  // increment the turn count
  this.turnNum += 1;
};

// method called when AI takes turn
Game.prototype.aiTurn = function aiTurn() {
  // indicate to user that AI is calculating next move
  $('#thinking').show();

  // wrap AI turn in delay to help it seem like it is thinking
  setTimeout(() => {
    // if ai goes first short circuit and play best moves (corners or middle)
    if (this.turnNum === 0 && this.aiIcon === 'X') {
      // randomly play a corner or middle (any even position from 0 to 8)
      this.bestAIMove = Math.floor(Math.random() * 5) * 2;
      this.move(this.bestAIMove); // play the move
    }
    // if player gets first move short circuit and play center if possible otherwise play a corner
    else if (this.turnNum === 1 && this.aiIcon === 'O') {
      if (this.board.indexOf('X') !== 4) { // player did not take center pos on first move
        this.bestAIMove = 4; // take center position
        this.move(this.bestAIMove); // play the move
      }
      // player took the center position on first move
      else {
        // must play a random corner to tie
        this.bestAIMove = [0, 2, 6, 8][Math.floor(Math.random() * 4)];
        this.move(this.bestAIMove); // play the move
      }
    }

    // Any moves beyond the first two should be evaluted using algorithm
    else {
      // this will the Game.bestAIMove
      this.getNextMove(this);
      // play the move
      this.move(this.bestAIMove);
    }

    // evaulate if move ended game
    if (this.checkGameOver()) {
      setTimeout(this.gameFinished.bind(this), 500); // clean up the game after a slight pause
    }

    // remove indication of AI thinking
    $('#thinking').hide();
  }, 500);
};

// method called when player makes a move
Game.prototype.playerTurn = function playerTurn(tdClicked) {
  // If it is player's turn and cell is not already played
  if (this.turn === this.playerIcon && !$(tdClicked).hasClass('drop') && !this.gameOver) {
    // move based on where the player clicked
    this.move($(tdClicked).attr('id').charAt(0));

    // evaulate if move ended game
    if (this.checkGameOver()) {
      // clean up the game after a slight pause
      setTimeout(this.gameFinished.bind(this), 500);
    }
    // game not over give ai turn
    else {
      this.aiTurn(); // give AI a turn
    }
  }
};

// method that runs when game is over to clean up game
Game.prototype.gameFinished = function gameFinished() {
  // animate the winning set if not a tie
  if (this.winner !== null) {
    for (let i = 0; i < this.winPositions.length; i += 1) {
      $(`#${this.winPositions[i]}`).addClass('win-pulse');
    }
  }

  $('main').fadeOut(1500); // fade out the board

  // generate the closing phrase
  // player has won
  if (this.winner === this.playerIcon) {
    $('#closing-phrase').html("I'm not sure how,<br>but you won!");
  }
  // player has won
  else if (this.winner === this.aiIcon) {
    $('#closing-phrase').html('Looks like I won.<br>Better luck next time.');
  }
  // winner is null meaning that game was tie
  else if (this.winner === null) {
    $('#closing-phrase').html('A tie.<br>This calls for a rematch.');
  }

  $('.modal-end').delay(500).fadeIn(750); // fade in the end screen
};

// Use a min max algorithm to recursively find the next move
Game.prototype.getNextMove = function getNextMove(game) {
  // array containing the results of each game
  const results = [];
  // get all the possible moves from the current state
  const moves = game.getPossibleMoves();
  // variable for the nextGame to be evaluated
  let nextGame;
  // variable for the index of results that contains max value
  let indexOfMax;

  // evaluate if game is over
  game.checkGameOver();

  // if game is over then return a value for the end of the branch for the results
  // ai has won return 1 value (good)
  if (game.gameOver && game.winner === game.aiIcon) {
    return 1;
  }
  // player has won return -1 value (bad)
  else if (game.gameOver && game.winner === game.playerIcon) {
    return -1;
  }
  // if there is a tie return 0 value
  else if (game.gameOver) {
    return 0;
  }

  // recursively run minimax on all possible moves
  for (let i = 0; i < moves.length; i += 1) {
    // create a new game to pass to the results array
    // must use JQuery Extend for a deep copy
    nextGame = jQuery.extend(true, {}, game);

    // apply a single move and store that state as next game
    nextGame.evaluateMove(moves[i]);
    // run minimax on the next game
    results.push(this.getNextMove(nextGame));
  }

  // evaluate the best move for each player using min max
  // best move for AI if it is their turn
  if (game.turn === game.aiIcon) {
    indexOfMax = results.indexOf(Math.max.apply(null, results));
    // store the best move
    currentGame.bestAIMove = moves[indexOfMax];
    // return the best
    return results[indexOfMax];
  }

  // best move for the player if it is their turn
  const indexOfMin = results.indexOf(Math.min.apply(null, results));
  // store the best move
  currentGame.bestAIMove = moves[indexOfMax];
  // resturn the best
  return results[indexOfMin];
};

$(document).ready(() => {
  // Log the player's moves when they click a cell
  $('td').click(function onClick() {
    currentGame.playerTurn(this);
  });

  // Modal control to get player's icon and start game
  $('.player-selection').click(function onClick() {
    // start a new game with the player's selection as their icon and an empty board
    currentGame = new Game($(this).html());
    // Initially hide the header that shows 'Thinking...'
    $('#thinking').hide();
    // Initially hide the ending modal
    $('.modal-end').hide();
    // show the main board
    $('main').hide().fadeIn(500);
    // hide the starting modal
    $('.modal-start').fadeOut(500);

    // if player selected O it is not their turn and AI goes first
    if (currentGame.turn === currentGame.aiIcon) {
      // give AI a turn after 0.5 sec
      setTimeout(currentGame.aiTurn.bind(currentGame), 500);
    }
  });

  $('button').click(() => {
    // clear the current game
    currentGame = null;
    $('td').each(function onEach() {
      $(this).html('');
      $(this).removeClass('drop');
      $(this).removeClass('win-pulse');
    });

    $('.modal-end').fadeOut(500); // fade out the end screen
    $('.modal-start').fadeIn(500); // fade in the start screen
  });
});

// polyfill for Array.includes method for older browsers (safari)
if (!Array.prototype.includes) {
  Array.prototype.includes = function includes(searchElement /* , fromIndex */) {
    const O = Object(this);
    const len = parseInt(O.length, 10) || 0;
    if (len === 0) {
      return false;
    }
    const n = parseInt(arguments[1], 10) || 0;
    let k;
    if (n >= 0) {
      k = n;
    }
    else {
      k = len + n;
      if (k < 0) {
        k = 0;
      }
    }
    let currentElement;
    while (k < len) {
      currentElement = O[k];
      if (searchElement === currentElement ||
        (searchElement !== searchElement && currentElement !== currentElement)) { //  NaN !== NaN
        return true;
      }
      k += 1;
    }
    return false;
  };
}
