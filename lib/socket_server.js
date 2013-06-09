var socketio = require('socket.io');
var users = []; // lista graczy
var puzzles = [ // lista pytań
  { question: "Ile to jest 2 + 4?", answer: "6"},
  { question: "Czy krowa ma ogon?", answer: "tak" },
  { question: "Podaj wynik działania 2+(6/2)*2", answer: "8"},
  { question: "Kiedy mój ojciec miał 31 lat, ja miałem 8 lat, a teraz ojciec jest dwa razy starszy ode mnie. Ile mam obecnie lat?", answer: "23"},
  { question: "Kto był pierwszym królem Polski?", answer: "Bolesław Chrobry" || "Chrobry"},
  { question: "20/10*2", answer: "4"},
  { question: "5-1*5", answer: "0"},
  { question: "Śpiewa hit Mamma Mia", answer: "abba"},
  { question: "Najwyższa góra Kaukazu", answer: "elbrus"},
  { question: "Najwyższy szczyt Tatr", answer: "gerlach"},
  { question: "Sanki Eskimosa", answer: "akia"},
  { question: "Kuzyn żyrafy", answer: "okapi"},
  { question: "Broń o rozszerzającej się lufie", answer: "garłacz"},
  { question: "Orląt we Lwowie", answer: "cmentarz"},
  { question: "Epilepsja inaczej", answer: "padaczka"},
  { question: "Cd dla chemika", answer: "kadm"},
  { question: "Autor Iliady i Odysei", answer: "homer"},
  { question: "Frodo z Władcy pierścieni", answer: "baggins"},
  { question: "Jaś lub warzywo strączkowe", answer: "fasola"},
  { question: "Stolnik z Pana Tadeusza", answer: "horeszko"},
  { question: "Nastawia kości", answer: "ortopeda"},
  { question: "Rosyjski samochód ciężarowy", answer: "kamaz"},
  { question: "Tętnica główna", answer: "aorta"},
  { question: "Kraj z Teheranem", answer: "iran"}
];

exports.listen = function(server) {
  var io = socketio.listen(server);
  io.sockets.on('connection', function (socket) {
    
    // nasluchiwanie na dolaczenie gracza
    socket.on('newUser', function (name) {
      socket.username = name; // zapis nazwy uzytkownika w jego sockecie
      socket.play = true; // sprawdzamy czy user dalej gra, czy się nie rozłączył 
      users.push({ // dodaje usera do listy graczy
        name: name,
        questions: []
      }); // dodajemy go do listy aktywnych userow, deklarujac mu pusta liste wyswietlonych pytan
      io.sockets.emit('updateUsers', users); // wysłanie do klientów aby uaktualnili listy
    });

    // nasłuchiwanie na rozpoczecie gry, wywoluje sie po wcisnieciu buttona start
    socket.on('startGame', function () {
      var clients = io.sockets.clients(), // wszystkie podlaczone sockety(userzy)
        number;

      for (var i = 0; i < clients.length; i++) { // dla kazdego socketa(usera)
        number = get_puzzle_number(clients[i].username);
        clients[i].emit("setUpGame", puzzles[number].question, number); // wyslij wylosowane pytanie
      };
    });

    // obsługa zakończenia gry
    socket.on('gameOver', function () {
      socket.play = false;
      if (users.length === 2) { // jesli jednemu z 2 ostatnich graczy skonczyl sie czas
        var index = get_user_index(socket.username);
        users.splice(index, 1); // usuwamy usera

        for (var i = 0; i < io.sockets.clients().length; i++) { // znajdz socket ostatniego usera
          if (io.sockets.clients()[i].username === users[0].name) {
            io.sockets.clients()[i].emit("lastOne"); // wyslij zakonczenie gry dla ostatniego ktory zostal sam
          }
        }
      }
    });

    // nasluchuj na prosbe o kolejne pytanie i wyslij do tego socketa ktory o nie prosi
    socket.on('nextQuestion', function () {
      if (socket.play) {
        var number = get_puzzle_number(socket.username);
        socket.emit("nextQuestion", puzzles[number].question, number); // wyslij  
      }
    });

    // nasluchuj na przyjscie rozwiazania pytania i jeśli dostanie odpowiedź, to wysyła kolejne pytanie
    socket.on('submitAnswer', function (question_number, answer) {
      var number = get_puzzle_number(socket.username);
      socket.emit("nextQuestion", puzzles[number].question, number); // wyslij kolejne pytanie

      // sprawdz poprawnosc odpowiedzi i dodaj punkty nastepnemu graczowi jezeli poprawna
      if (puzzles[question_number].answer === answer) { // jezeli odpowiedz jest poprawna
        var next_socket_number = get_next_socket_number(io.sockets.clients(), socket); //pobierz następnego gracza
        var next_socket = io.sockets.clients()[next_socket_number];
        next_socket.emit('updateGameTime', 5); // dodaj mu czas za poprawną odpowiedź
        next_socket.broadcast.emit('updateUserTime', next_socket.username, 5); // wyślij update czasu
      }
      else {
        console.log("niepoprawna odpowiedz"); //błędna odpowiedź
      }
    });
    
    socket.on('disconnect', function () { // jak socket(user) sie rozlaczy to zrob:
      var index = get_user_index(socket.username);
      users.splice(index, 1); // usuwamy usera
      io.sockets.emit('updateUsers', users); // uaktualnij liste na klientach
    });
  });
}

// zwroc numer pytania ktorego user jeszcze nie mial
var get_puzzle_number = function (username) {
  var number,
    index = get_user_index(username);
  if (index >= 0) {
    var user = users[index];
	if (user.questions.length === puzzles.length) user.questions = [];
    while (true) {
      number = get_random_question_number(); 
      if (user.questions.indexOf(number) === -1) {
        user.questions.push(number);
        return number;
      }
    }    
  }
}

// zwroc index usera z listy users
var get_user_index = function (username) {
  for (var i = 0; i < users.length; i++) {
    if (users[i].name === username) {
      return i; 
    }
  };
  return false;
};

// wylosuj numer pytania
var get_random_question_number = function () {
  return Math.floor(Math.random() * puzzles.length);
}

// zwroc index kolejnego usera w liscie users
var get_next_socket_number = function (sockets, socket) {
  for (var i = 0; i < sockets.length; i++) {
    if (sockets[i].id === socket.id) {
      if (i === users.length-1) { // jezeli ostatni user to zwroc pierwszego
        return i = 0;
      }
      return i+1; // kolejny user  
    }
  }
};