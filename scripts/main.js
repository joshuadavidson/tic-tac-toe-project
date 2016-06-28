var playerIcon = ''; //String representing the player's chosen icon
var inputReady; //Boolean indication that user can input values (false during AI move)
var board = [ //represent the board with a 3x3 matrix array 0=Nothing 1=X -1=O
  [0,0,0],
  [0,0,0],
  [0,0,0]]

function aiTurn() {
  //check for player/AI win state

  //evaluate best moves

  //update board with AI moves

  //allow user input

  //check for player/AI win state
}


$(document).ready(function() {

  //Log the player's moves when they click a cell
  $('td').click(function() {
    if (inputReady && !$(this).hasClass('drop')) { //If input ready (AI has moved) and cell is not already played and
      $(this).html(playerIcon); //Add the player's icon to the cell
      $(this).addClass('drop'); //animate the icon dropping onto board

      //determine the position the player clicked
      row = $(this).attr('id').charAt(0); //get the row
      col = $(this).attr('id').charAt(2); //get the col
      board[row][col] = playerIcon === 'X' ? 1 : -1; //update the board

      inputReady = false; //prevent further input until AI has moved.
      aiTurn(); //give AI a turn
    }
  });

  //Modal control to get player's icon
  $('.player-selection').click(function() {
    playerIcon = $(this).html();
    inputReady = playerIcon === 'X'; //X always starts first
    $('main').hide().fadeIn(500); //show the main board
    $('.modal-background').fadeOut(500); //hide the modal
    if (!inputReady) {//if input not ready (AI's turn) give it a turn
      aiTurn();
    }

  });

});
