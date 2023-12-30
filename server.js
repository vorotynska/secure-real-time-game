require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const expect = require('chai');
const socket = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const {
  v4: uuidv4
} = require('uuid')

const fccTestingRoutes = require('./routes/fcctesting.js');
const runner = require('./test-runner.js');

const app = express();

app.use('/public', express.static(process.cwd() + '/public'));
app.use('/assets', express.static(process.cwd() + '/assets'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(helmet({
  noSniff: true,
  xssFilter: true,
  noCache: true,
  hidePoweredBy: {
    setTo: 'PHP 7.4.3'
  }
}));

//For FCC testing purposes and enables user to connect from outside the hosting platform
app.use(cors({
  origin: '*'
}));

// Index page (static HTML)
app.route('/')
  .get(function (req, res) {
    res.sendFile(process.cwd() + '/views/index.html');
  });

//For FCC testing purposes
fccTestingRoutes(app);

// 404 Not Found Middleware
app.use(function (req, res, next) {
  res.status(404)
    .type('text')
    .send('Not Found');
});

const portNum = process.env.PORT || 3000;

// Set up server and tests
const server = app.listen(portNum, () => {
  console.log(`Listening on port ${portNum}`);
  if (process.env.NODE_ENV === 'test') {
    console.log('Running Tests...');
    setTimeout(function () {
      try {
        runner.run();
      } catch (error) {
        console.log('Tests are not valid:');
        console.error(error);
      }
    }, 1500);
  }
});

// Socket.io


const dim = require('./public/dim.js').default;

const Player = require('./public/Player');
const Collectible = require('./public/Collectible');

const random = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const getRandomPos = () => {
  let x = Math.floor(random(dim.minX + 50, dim.maxX - 50) / 10) * 10;
  let y = Math.floor(random(dim.minY + 50, dim.maxY - 50) / 10) * 10;
  return [x, y];
}

let players = [];
let [foodX, foodY] = getRandomPos();
let foodEntity = new Collectible({
  x: foodX,
  y: foodY,
  value: 1,
  id: uuidv4()
});
let [mineX, mineY] = getRandomPos();
let mineEntity = new Player({
  x: mineX,
  y: mineY,
  score: 1,
  id: uuidv4()
});
let connections = [];

const io = socket(server);
io.sockets.on('connection', socket => {
  console.log(`New connection ${socket.id} (${(new Date(Date.now())).toLocaleTimeString('se-SE')})`);
  connections.push(socket);
  console.log(`Connected: ${connections.length}`);

  let [posX, posY] = getRandomPos();
  let player = new Player({
    x: posX,
    y: posY,
    score: 0,
    id: socket.id
  });
  players.push(player);

  socket.emit('init', {
    id: socket.id,
    players: players,
    foodItem: foodEntity,
    mineItem: mineEntity
  });

  socket.on('update', (updateUser) => {
    for (p of players) {
      if (p.id === socket.id) {
        p.x = updateUser.x;
        p.y = updateUser.y;
        p.score = updateUser.score;
      }
    }

    io.emit('update', {
      players: players,
      mine: mineEntity,
      food: foodEntity,
      player: null
    });
  });

  socket.on('disconnect', () => {
    console.log(`${socket.id} disconnected (${(new Date(Date.now())).toLocaleTimeString('se-SE')})`);
    socket.broadcast.emit('remove-player', socket.id);
    connections.splice(connections.indexOf(socket), 1);
    players = players.filter(p => p.id !== socket.id);
    console.log(`${connections.length} connected`);
  });
});

setInterval(tick, 1000 / 50);

let VX = 2;
let VY = 2;

function tick() {
  if (mineEntity.x + mineEntity.w > dim.maxX) VX = -VX;
  if (mineEntity.y + mineEntity.h > dim.maxY) VY = -VY;
  if (mineEntity.x < dim.minX) VX = -VX;
  if (mineEntity.y < dim.minY) VY = -VY;
  mineEntity.x += VX;
  mineEntity.y += VY;
  let playerUpdate = null;

  for (p of players) {
    if (mineEntity.collision(p)) {
      let [posX, posY] = getRandomPos();
      p.x = posX;
      p.y = posY;
      p.score = 0;
      playerUpdate = p;
    }

    let newP = new Player(p);
    if (newP.collision(foodEntity)) {
      p.score += foodEntity.value;
      let [foodX, foodY] = getRandomPos();
      foodEntity = new Collectible({
        x: foodX,
        y: foodY,
        value: 1,
        id: uuidv4()
      });
      playerUpdate = p;
    }
  }

  io.emit('update', {
    players: players,
    mine: mineEntity,
    food: foodEntity,
    player: playerUpdate
  });
}

module.exports = app; // For testing