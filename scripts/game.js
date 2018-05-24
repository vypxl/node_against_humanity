

let socket = io.connect(window.location.protocol + "//" + window.location.host)

console.log(new URL(window.location.href).searchParams.get("name"))

socket.emit("join", new URL(window.location.href).searchParams.get("name"))

let app = new Vue({
  el: "#app",
  mounted: function() {
    document.addEventListener("keydown", evt => {
      if(evt.code == "Enter") this.submit();
    })
  },
  data: {
    STATE_LOBBY: 0,
    STATE_CHOOSE_ANSWERS: 1,
    STATE_END_ROUND: 2,
    STATE_WINNER: 3,
    STATE_END_GAME: 4,

    stuff: undefined,

    chosen: [],
    toDelete: [],
    winnerChoice: undefined,
    doneAction: false,
    jokersUsed: 0,
    jokerCards: [],

    message: function() {
      switch (this.stuff.state) {
        case this.STATE_LOBBY:
          return "Gathering players..";
          break;
        case this.STATE_CHOOSE_ANSWERS:
          return "Choose your cards!";
          break;
        case this.STATE_END_ROUND:
          return "Reviewing the results!";
          break;
        case this.STATE_WINNER:
          return "And the Winner is..";
          break;
        case this.STATE_END_GAME:
          return "The game is over.";
          break;
        default:

      }
    },
    submitButtonCaption: function() {
      if(this.doneAction) return "¯\\_(ツ)_/¯";
      switch (this.stuff.state) {
        case this.STATE_LOBBY:
          return "Ready";
          break;
        case this.STATE_CHOOSE_ANSWERS:
          return "Submit";
          break;
        case this.STATE_END_ROUND:
          return this.stuff.isKing ? "Confirm Winner" : "¯\\_(ツ)_/¯";
          break;
        case this.STATE_WINNER:
          return "¯\\_(ツ)_/¯";
          break;
        case this.STATE_END_GAME:
          return "¯\\_(ツ)_/¯";
          break;
        default:

      }
    },
    standbyMessage: function() {
      ret = ""
      if(this.stuff.state == this.STATE_CHOOSE_ANSWERS && this.stuff.isKing)
        ret += "<span style=\"text-align: center; display: block;\">You are the Czar!<br>" + this.stuff.question.text + "</span><br>";
      ret += "Please stand by..<br>";
      return ret;
    },

    cardSelect: function(evt) {
      el = $(evt.currentTarget);

      if(el.hasClass("to-delete")) {
        el.removeClass("to-delete");
        this.toDelete.splice(this.toDelete.indexOf(el.find(".card-index").html()), 1)
      }

      el.toggleClass("chosen");
      if(el.hasClass("chosen") && this.chosen.length == this.stuff.question.pick) {
        el.toggleClass("chosen");
        // alert("You can only pick " + this.stuff.question.pick + "answers!")
        el.toggleClass("warn");
        setTimeout(() => {
          el.removeClass("warn");
        }, 100)
      } else if(el.hasClass("chosen")) this.chosen.push(el.find(".card-index").html())
      else this.chosen.splice(this.chosen.indexOf(el.find(".card-index").html()), 1)
      this.updateQuestion();
    },
    cardDelete: function(evt) {
      evt.preventDefault();
      el = $(evt.currentTarget)

      if(el.hasClass("chosen")) {
        el.removeClass("chosen");
        this.chosen.splice(this.chosen.indexOf(el.find(".card-index").html()), 1)
      }

      el.toggleClass("to-delete");
      if(el.hasClass("to-delete")) this.toDelete.push(el.find(".card-index").html())
      else this.toDelete.splice(this.toDelete.indexOf(el.find(".card-index").html()), 1)
      this.updateQuestion();
    },
    joker: function() {
      app.jokersUsed++;
      app.jokerCards.push({
        text: $('#joker').val()
      });
      $('#joker').val("");
    },
    selectWinner: function(evt) {
      if(this.stuff.isKing) {
        el = $(evt.currentTarget);
        $(".card").removeClass("chosen");
        el.addClass("chosen");
        this.winnerChoice = parseInt(el.find(".player-id").html());
      }
    },
    updateQuestion: function() {
      let str = this.stuff.question.text
      for (var i = 0; i < this.stuff.question.pick; i++) {
        let replace = this.chosen[i];
        if(replace !== undefined) {
          replace = this.stuff.cards.concat(this.jokerCards)[replace].text;
          strr = str.replace("_", replace);
          if(strr == str) str += (" - " + replace + ".")
          else str = strr
        }
      }
      $("#question").html(str);
    },
    submit: function() {
      if(app.doneAction) return;
      if(app.stuff.state == app.STATE_LOBBY) {
        socket.emit("ready");
        app.doneAction = true;
      } else if(app.stuff.state == app.STATE_CHOOSE_ANSWERS) {
        if(app.chosen.length == app.stuff.question.pick) {
          socket.emit("chosen", {
            choice: $("#question").html(),
            toDelete: app.toDelete.concat([app.chosen]),
            wasJoker: app.jokersUsed
          });
          for (c of app.chosen) {
            if(parseInt(c) >= app.stuff.cards.length) {
                app.jokerCards.splice(parseInt(c) - app.stuff.cards.length, 1);
            }
          }
          app.jokersUsed = 0;
          app.toDelete = [];
          app.chosen = [];
          app.winnerChoice = undefined;
          app.doneAction = true;
        } else {
          alert("You did not pick enough cards!");
        }
      } else if(app.stuff.state == app.STATE_END_ROUND && app.stuff.isKing) {
        if(app.winnerChoice !== undefined) socket.emit("winnerIs", app.winnerChoice);
        else alert("Please select a winner!");
      }
    }
  }
});

let prevState = undefined;

socket.on("update", data => {
  app.stuff = data
  if(data.state != prevState) {
    app.doneAction = false;
    prevState = data.state
  }
  if(data.spectator || (data.state == app.STATE_CHOOSE_ANSWERS && data.isKing)) app.doneAction = true;
});
