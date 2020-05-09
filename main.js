const express = require('express');
const sio = require('socket.io');
const path = require('path');

let app = express();
let server = require('http').Server(app)

console.log("Listening on :::" + (process.env.PORT || 8080));
server.listen(process.env.PORT || 8080);

const game = require('./src/game')(sio(server));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "/views/index.html"));
});

app.get("/game", (req, res) => {
  res.sendFile(path.join(__dirname, "/views/game.html"))
})

app.use('/scripts', express.static(path.join(__dirname, 'scripts')))
app.use('/styles', express.static(path.join(__dirname, 'styles')))
