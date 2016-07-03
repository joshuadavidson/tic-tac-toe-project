"use strict";
var currentGame;

//Game object constructor for game initialization
var Game = function(playerIcon, board, startingTurn) {
  this.board = board === undefined ? ['', '', '', '', '', '', '', '', ''] : board; //if the board is undefined then start with an empty board
  this.playerIcon = playerIcon; //set the player's icon
  this.aiIcon = playerIcon === 'X' ? 'O' : 'X'; //set the ai's icon
  this.turn = startingTurn === undefined ? 'X' : startingTurn; //if the starting turn is undefined start with X
  this.turnNum = 0; //number of turns played
  this.winner = null; //who is the winner (X or O)
  this.gameOver = false; //indication that game is over
  this.winPositions = null; //array of three winning positions
  this.bestAIMove = null;
}

//function that updates Game.winner, Game.winPositions, and Game.gameOver if game is over (win or tie)
Game.prototype.checkGameOver = function() {
  var winCases = [ //array of coordinates for all possible win cases
    [0, 1, 2], //first row
    [3, 4, 5], //second row
    [6, 7, 8], //thrid row
    [0, 3, 6], //first col
    [1, 4, 7], //second col
    [2, 5, 8], //thrid col
    [0, 4, 8], //diag from upper left to lower right
    [6, 4, 2] //diag from lower left to upper right
  ];

  //loop through all win cases to find a winner
  for (var currCase = 0; currCase < winCases.length; currCase++) {
    //grab the coordinates from the winCases for each position
    var pos1 = winCases[currCase][0];
    var pos2 = winCases[currCase][1];
    var pos3 = winCases[currCase][2];
    var sumOfPositions = this.board[pos1] + this.board[pos2] + this.board[pos3]; //add the values of the board for each of the positions

    if (sumOfPositions === 'XXX') { //three in a row from Xs
      this.winPositions = winCases[currCase]; //array of winning positions
      this.winner = 'X';
      this.gameOver = true; //mark game as finished
      return true;
    } else if (sumOfPositions === 'OOO') { //three in a row from Os
      this.winPositions = winCases[currCase]; //array of winning positions
      this.winner = 'O';
      this.gameOver = true; //mark game as finished
      return true;
    }
  }

  //if all positions played and still no winner then game is over (Tie)
  if (!this.board.includes('') && this.gameOver === false) {
    this.gameOver = true;
    return true;
  }

  return false; //game not over
};

Game.prototype.getPossibleMoves = function() {
  var possibleMoves = [];
  for (var currPos = 0; currPos < this.board.length; currPos++) {
    if (this.board[currPos] === '') { //find all the board values that are empty and add them as a possible move
      possibleMoves.push(currPos);
    }
  }
  return possibleMoves;
}

//function that takes position and updates board but not display for the min max algorithm
Game.prototype.evaluateMove = function(pos) {
  this.board[pos] = this.turn; //log the move based on the current turn
  this.turn = this.turn === 'X' ? 'O' : 'X'; //invert the turn
  this.turnNum++; //increment the turn count
}

//function that takes position and updates board
Game.prototype.move = function(pos) {
  this.board[pos] = this.turn; //log the move based on the current turn
  $('#' + pos).html(this.turn); //Add the icon to the display
  $('#' + pos).addClass('drop'); //animate the icon dropping onto the board
  this.turn = this.turn === 'X' ? 'O' : 'X'; //invert the turn
  this.turnNum++; //increment the turn count
}

Game.prototype.aiTurn = function() {
  $('#thinking').show();
  setTimeout(function() { //wrap AI turn in delay to help it seem like it is thinking
    //if ai goes first short circuit and play best moves (corners or middle)
    if (this.turnNum === 0 && this.aiIcon === 'X') {
      this.bestAIMove = Math.floor(Math.random() * 5) * 2; //randomly play a corner or middle (any even position from 0 to 8)
      this.move(this.bestAIMove); //play the move
    }
    //if player gets first move short circuit and play center if possible otherwise play a corner
    else if (this.turnNum === 1 && this.aiIcon === 'O') {
      if (this.board.indexOf('X') !== 4) { //player did not take center pos on first move
        this.bestAIMove = 4; //take center position
        this.move(this.bestAIMove); //play the move
      } else { //player took the center pos on first move
        this.bestAIMove = [0, 2, 6, 8][Math.floor(Math.random() * 4)]; //must play a random corner to tie
        this.move(this.bestAIMove); //play the move
      }
    }
    //Any moves beyond the first two should be evaluted using algorithm
    else {
      this.getNextMove(this); //this will the Game.bestAIMove
      this.move(this.bestAIMove); //play the move
    }

    //evaulate if move ended game
    if (this.checkGameOver()) {
      setTimeout(this.gameFinished.bind(this), 500); //clean up the game after a slight pause
    }
    $('#thinking').hide();
  }.bind(this), 500); //wrap AI turn in delay to help it seem like it is thinking, bind it to the Game object so that this is correctly referenced w/in function
}

Game.prototype.playerTurn = function(tdClicked) {
  //If it is player's turn and cell is not already played
  if (this.turn === this.playerIcon && !$(tdClicked).hasClass('drop') && !this.gameOver) {
    this.move($(tdClicked).attr('id').charAt(0)); //move based on where the player clicked

    //evaulate if move ended game
    if (this.checkGameOver()) {
      setTimeout(this.gameFinished.bind(this), 500); //clean up the game after a slight pause
    } else { //game not over give ai turn
      this.aiTurn(); //give AI a turn
    }
  }
}

//function that runs when game is over to clean up game
Game.prototype.gameFinished = function() {

  //animate the winning set if not a tie
  if (this.winner !== null) {
    for (var i = 0; i < this.winPositions.length; i++) {
      $('#' + this.winPositions[i]).addClass('win-pulse');
    }
  }

  $('main').fadeOut(1500); //fade out the board

  //generate the closing phrase
  if (this.winner === this.playerIcon) { //player has won
    $('#closing-phrase').html("I'm not sure how,<br>but you won!");
  } else if (this.winner === this.aiIcon) { //player has won
    $('#closing-phrase').html("Looks like I won.<br>Better luck next time.");
  } else if (this.winner === null) { //winner is null meaning that game was tie
    $('#closing-phrase').html("A tie.<br>This calls for a rematch.");
  }

  $('.modal-end').delay(500).fadeIn(750); //fade in the end screen
}

//Use a min max algorithm to recursively find the next move
Game.prototype.getNextMove = function(game) {
  var results = []; //array containing the results of each game
  var moves = game.getPossibleMoves(); //get all the possible moves from the current state
  var nextGame; //variable for the nextGame to be evaluated
  var indexOfMax; //variable for the index of results that contains max value
  var indexOfMin; //variable for the index of results that contains min value

  game.checkGameOver(); //evaluate if game is over

  //if game is over then return a value for the end of the branch for the results
  if (game.gameOver && game.winner === game.aiIcon) { //ai has won return 1 value (good)
    return 1;
  } else if (game.gameOver && game.winner === game.playerIcon) { //player has won return -1 value (bad)
    return -1;
  } else if (game.gameOver) { //if there is a tie return 0 value
    return 0;
  }

  //recursively run minimax on all possible moves
  for (var i = 0; i < moves.length; i++) {
    nextGame = jQuery.extend(true, {}, game); //create a new game to pass to the results array
    nextGame.evaluateMove(moves[i]); //apply a single move and store that state as next game
    results.push(this.getNextMove(nextGame)); //run minimax on the next game
  }

  //evaluate the best move for each player using min max
  if (game.turn === game.aiIcon) { //best move for AI if it is their turn
    indexOfMax = results.indexOf(Math.max.apply(null, results));
    currentGame.bestAIMove = moves[indexOfMax]; //store the best move
    return results[indexOfMax]; //return the best
  } else { //best move for the player if it is their turn
    indexOfMin = results.indexOf(Math.min.apply(null, results));
    currentGame.bestAIMove = moves[indexOfMax]; //store the best move
    return results[indexOfMin]; //resturn the best
  }
}

$(document).ready(function() {
  //Log the player's moves when they click a cell
  $('td').click(function() {
    currentGame.playerTurn(this);
  });

  //Modal control to get player's icon and start game
  $('.player-selection').click(function() {
    currentGame = new Game($(this).html()); //start a new game with the player's selection as their icon and an empty board
    $('#thinking').hide(); //Initially hide the header that shows 'Thinking...'
    $('.modal-end').hide(); //Initially hide the ending modal
    $('main').hide().fadeIn(500); //show the main board
    $('.modal-start').fadeOut(500); //hide the starting modal

    //if player selected O it is not their turn and AI goes first
    if (currentGame.turn === currentGame.aiIcon) {
      setTimeout(currentGame.aiTurn.bind(currentGame), 500); //give AI a turn after 1 sec
    }
  });

  $('button').click(function() {
    //clear the current game
    currentGame = null;
    $('td').each(function() {
      $(this).html('');
      $(this).removeClass('drop');
      $(this).removeClass('win-pulse');
    });

    $('.modal-end').fadeOut(500); //fade out the end screen
    $('.modal-start').fadeIn(500); //fade in the start screen
  });
});


//polyfill for Array.includes method for older browsers (safari)
if (!Array.prototype.includes) {
  Array.prototype.includes = function(searchElement /*, fromIndex*/ ) {
    'use strict';
    var O = Object(this);
    var len = parseInt(O.length, 10) || 0;
    if (len === 0) {
      return false;
    }
    var n = parseInt(arguments[1], 10) || 0;
    var k;
    if (n >= 0) {
      k = n;
    } else {
      k = len + n;
      if (k < 0) {
        k = 0;
      }
    }
    var currentElement;
    while (k < len) {
      currentElement = O[k];
      if (searchElement === currentElement ||
        (searchElement !== searchElement && currentElement !== currentElement)) { // NaN !== NaN
        return true;
      }
      k++;
    }
    return false;
  };
}
