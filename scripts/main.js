var playerIcon = ''; //String representing the player's chosen icon

$(document).ready(function() {



  //Log the player's moves when they click a cell
  $('td').click(function() {
    if (!$(this).hasClass('drop')) { //If cell does
      $(this).html(playerIcon); //Add the player's icon to the cell
      $(this).addClass('drop'); //animate the icon dropping onto board
    }
  });

  //modal to get player's icon
  $('.player-selection').click(function() {
    playerIcon = $(this).html();
    console.log(playerIcon);
    $('main').hide().fadeIn(500);//show the main board
    $('.modal-background').fadeOut(500);//hide the modal
  });

});
