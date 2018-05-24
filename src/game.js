const STATE_LOBBY = 0;
const STATE_CHOOSE_ANSWERS = 1;
const STATE_END_ROUND = 2;
const STATE_WINNER = 3;
const STATE_END_GAME = 4;

let state = STATE_LOBBY;

let next_id = 0;
let players = [];

let config = require("../config.json")

let cards = require("../data/cards_" + config.lang + ".json")
let questions = cards.black
let answers = cards.white

for(a of answers) {
  a.text = a.text.replace(/\.$/, "");
}

let question = ""
let winner = undefined;

function addPlayer(name, s) {
  console.log(next_id);
  next_id++;
  players.push({
    id: next_id,
    name: name,
    points: 0,
    isKing: false,
    wasKing: false,
    cards: [],
    jokers: 3,
    ready: false,
    socket: s,
    spectator: false,

    dropCards: function(indexes) {
      for (i of indexes) {
        this.cards = this.cards.splice(i, 1)
      }
    },
    drawCards: function(count) {
      for (let i = 0; i < count; i++) {
        this.cards.push(answers[Math.floor(Math.random() * answers.length)])
      }
    }
  });

  return next_id;
}

function removePlayer(id) {
  players = players.filter(p => p.id != id);
}

function startGame() {
  console.log("starting game");
  for (p of players) {
    p.cards = [];
    p.jokers = 3;
    p.was_king = false,
    p.points = 0;
    p.ready = false;
    p.choice = undefined;
  }
  round();
}

function round() {
  state = STATE_CHOOSE_ANSWERS;

  question = questions[Math.floor(Math.random() * questions.length)]

  if (players.every(p => p.wasKing)) {
    for (p of players) {
      p.wasKing = false;
    }
  }

  for (p of players) {
    p.choice = undefined;
    p.ready = false;
    p.isKing = false;
    p.drawCards(10 - p.cards.length);
  }
  let newKing = players.find(p => !p.wasKing);
  newKing.wasKing = true;
  newKing.isKing = true;
  winner = undefined;
  update();
}

function update(io) {
  // console.log(players.map(p => { return { id: p.id, name: p.name, ready: p.ready, points: p.points, jokers: p.jokers, isKing: p.isKing, wasKing: p.wasKing, choice: p.choice } }));
  if (players.filter(p => !p.spectator).length != 0) {
    if (state == STATE_LOBBY && players.every(p => p.ready)) startGame();
    console.log(players.every(p => p.choice !== undefined || p.isKing || p.spectator));
    if (state == STATE_CHOOSE_ANSWERS && players.every(p => p.choice !== undefined || p.isKing || p.spectator)) state = STATE_END_ROUND;
    if (state == STATE_CHOOSE_ANSWERS && players.some(p => p.points >= config.pointsToWin)) {
      winner = players.find(p => p.points >= config.pointsToWin);
      winner = winner.name;
      state = STATE_END_GAME;
      console.log("game over");
      setTimeout(() => { state = STATE_LOBBY; update() }, config.idleTime)
    }

    let plI = (pls => pls.map(_p => ({ name: _p.name, points: _p.points, ready: _p.ready, choice: _p.choice, id: _p.id, isKing: _p.isKing })));
    let plInfo = plI(players);
    if(state == STATE_END_ROUND || state == STATE_WINNER) plInfo = plI(players.filter(p => !p.isKing && !p.spectator));
    if(state == STATE_WINNER) for (p of players) { p.spectator = false; }

    for(p of players) {
      p.socket.emit("update", {
        state: state,
        points: p.points,
        isKing: p.isKing,
        cards: p.cards,
        jokers: p.jokers,
        spectator: p.spectator,
        players: plInfo,
        question: question,
        winner: winner ? winner : { id: "nope", name: -1, choice: "secret" }
      });
    }
  } else {
    state = STATE_LOBBY;
    console.log("reset");
  }
}

module.exports = function(io) {
  this.addPlayer = addPlayer;
  this.removePlayer = removePlayer;

  io.on('connection', s => {
    let name = undefined;
    let id = undefined;
    s.on("join", _name => {
      id = addPlayer(_name, s);
      name = _name;
      console.log(name + " joined" + (state != STATE_LOBBY ? " - he is a spectator" : ""));

      if(state != STATE_LOBBY) players.find(p => p.id == id).spectator = true;

      update();
    });
    s.on("ready", () => {
      console.log(name + " ready");
      players.find(p => p.id == id).ready = true;
      update();
    });
    s.on("chosen", data => {
      console.log(name + " chose " + JSON.stringify(data))
      players.find(p => p.id == id).choice = data.choice;
      for(i of data.toDelete.map(i => parseInt(i))) {
        players.find(p => p.id == id).cards.splice(i, 1);
      }
      if (data.wasJoker) p.jokers--;
      update();
    });
    s.on("winnerIs", winnerId => {
      if(players.find(p => p.id == id).isKing) {
        players.find(p => p.id == winnerId).points++;
        winner = {};
        w = players.find(p => p.id == winnerId);
        winner.choice = w.choice;
        winner.name = w.name;
        winner.id = w.id;
        state = STATE_WINNER;
        update();
        setTimeout(round, config.idleTime)
      }
    });

    s.on("disconnect", () => {
      if (id !== undefined) removePlayer(id);
      update();
    });
  });
};
