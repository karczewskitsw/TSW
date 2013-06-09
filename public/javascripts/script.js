$(document).ready(function () {
  var socket = io.connect(window.location.hostname);
  var username = '';
  var game_time = 30; // poczatkowy czas calej gry

  socket.on('connect', function () {
    username = prompt("Podaj swój nick"); // okienko z zapytaniem o username
    socket.emit('newUser', username); // dodaj usera na serwerze
  });

  socket.on('updateUsers', function (users) {
    update_users_list(users); // uaktualnij liste userow po lewej
  });
  
  socket.on('nextQuestion', function (question, number) {
    display_question(question, number); // wyswietl pytanie
  });

  socket.on('setUpGame', function (question, number) {
    $('#start_game').remove(); // remove start button
    display_question(question, number);
    set_game_time(game_time); // ustaw czas calej gry
    set_time_to_users(game_time); // ustaw czas calej gry dla innych userow na liscie
  });

  socket.on('updateGameTime', function (seconds) { // uaktualnij czas gry
    update_game_time(seconds);
  });

  socket.on('updateUserTime', function (user_name, seconds) { // wywolaj funkcje uaktualniajaca czas jednego usera
    update_user_time(user_name, seconds);
  });  

  socket.on('lastOne', function () { // wywolaj funkcje na ostatnim graczu
    game_over_for_last_user('Zostałeś sam. Gra skończona :)');
  });

  $('#start_game').click(function () { // na przycisk rozpoczecia gry
    socket.emit('startGame');
  });

  $('#question_submit').click(function () { // na przycisk dalej!
    submit_question();
  });

  $('#question_input').keypress(function (e) { // nasluchuje na klikniecie entera
    if(e.which == 13) {
      submit_question();
    }
  });
  
  // uakatualnia liste po lewej 
  var update_users_list = function (users) {
    var user_li;
    $('#users_list').find('li').remove(); // czyscimy obecna liste userow
    for (var i = 0; i < users.length; i++) { // tworzymy nowa uaktualniona
      user_li = $("<li id="+users[i].name+" data-id='"+users[i].name+"'><i class='icon-user'></i> "+users[i].name+" <span class='user_time'></span></li>");
      if (users[i].name === username) {
        user_li.addClass("muted");
      }
      $('#users_list').append(user_li);
    }
  };

  // uaktualnia czas odpowiedniemu userowi (gdy otrzymal dodatkowy czas od poprzedniego usera)
  var update_user_time = function (user_name, seconds) {
    var user_li = $('li[id="'+user_name+'"]');
    var user_time = user_li.find('.user_time');
    var new_time = parseInt(user_time.text(), 10) + seconds;
    
    user_time.text(new_time);
  };

  // wyswietla pytanie
  var display_question = function (question, number) {
    $('#question').text(question);
    $('#question_content').data('id', number).show();
    $('#question_time').text(10); // set time
    $('#question_time').countDown({
      startFontSize: "13px",
      callBack: function() {
        next_question();
      }
    });
  };

  // ustawia czas gry
  var set_game_time = function (seconds) {
    $('#game_time').text(seconds); // set time
    $('#game_time').countDown({ // set counter
      startFontSize: "72px",
      callBack: function() {
        game_over('Upłynał czas... Koniec gry');
      }
    });
  };

  // ustawia poczatkowe zegary gry na liscie userow
  var set_time_to_users = function (seconds) {
    $('.user_time').each(function () {
      if ($(this).closest("li").data('id') !== username) {
        $(this).text(seconds);
        $(this).countDown({
          startFontSize: "12px",
        });
      }
    });
  };

  // gdy czas gry sie skonczy
  var game_over = function (msg) {
    $('#question_content').remove(); // usun pytanie
    $('#container').append('<p class="muted">'+msg+'</p>');
    socket.emit('gameOver');
  };

  // jesli gre zakonczyl przedostatni gracz to zakoncz dla ostatniego 
  var game_over_for_last_user = function (msg) {
    $('#container').remove();
    $('#game_time').remove();
    alert(msg);
  };

  // wyslij zapytanie o kolejne pytanie
  var next_question = function () {
    socket.emit('nextQuestion');
  };

  // wyslij odpowiedz na pytanie
  var submit_question = function () {
    var answer = $('#question_input').val();
    var question_number = $('#question_content').data('id');
    socket.emit('submitAnswer', question_number, answer);
    $('#question_input').val(''); // wyczysc input
  };

  // uaktualnij czas gry dzieki innemu graczowi
  var update_game_time = function (seconds) {
    var current_time = parseInt($('#game_time').text(), 10);// get current game time
    $('#game_time').text(current_time + seconds);
  };
});
