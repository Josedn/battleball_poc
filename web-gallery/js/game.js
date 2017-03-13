/* PLAYER */
function Player(id, x, y, image)
{
  this.id = id;
  this.x = x;
  this.y = y;
  this.image = image;
}

/* CAMERA */
function Camera(map, width, height) {
    this.x = 0;
    this.y = 0;
    this.width = width;
    this.height = height;
    this.maxX = map.cols * map.tsize - width;
    this.maxY = map.rows * map.tsize - height;
}

Camera.SPEED = 256; // pixels per second

Camera.prototype.move = function (delta, dirx, diry) {
    // move camera
    this.x += dirx * Camera.SPEED * delta;
    this.y += diry * Camera.SPEED * delta;
    // clamp values
    this.x = Math.max(0, Math.min(this.x, this.maxX));
    this.y = Math.max(0, Math.min(this.y, this.maxY));
};

/* MAP */
Map = function(cols, rows, tsize, layers)
{
  this.cols = cols;
  this.rows = rows;
  this.tsize = tsize;
  this.layers = layers;

  var self = this;
  this.getTile = function (layer, col, row) {
      return self.layers[layer][row * self.cols + col];
  }
}
Game.load = function () {
    return [
        Loader.loadImage('tiles', './web-gallery/assets/tiles.png'),
        Loader.loadImage('character', './web-gallery/assets/character.png'),
        Loader.loadImage('priest', './web-gallery/assets/priest.png')
    ];
};

Game.init = function () {
    this.tileAtlas = Loader.getImage('tiles');
    this.players = [];
    this.initIO();
    Keyboard.listenForEvents(
        [Keyboard.LEFT, Keyboard.RIGHT, Keyboard.UP, Keyboard.DOWN]);
};

Game._drawPlayer = function (player) {
  if (Game.camera == undefined)
  {
    return;
  }
  var mapPositionX = (player.x * Game.map.tsize) - this.camera.x;
  var mapPositionY = (player.y * Game.map.tsize) - this.camera.y;

  console.log("VirtualX: " + mapPositionX);
  console.log("VirtualY: " + mapPositionY);

  this.ctx.drawImage(player.image, mapPositionX, mapPositionY);
}

Game._drawLayer = function (layer) {
  if (Game.camera == undefined)
  {
    return;
  }

  var startCol = Math.floor(this.camera.x / Game.map.tsize);
  var endCol = startCol + (this.camera.width / Game.map.tsize);
  var startRow = Math.floor(this.camera.y / Game.map.tsize);
  var endRow = startRow + (this.camera.height / Game.map.tsize);
  var offsetX = -this.camera.x + startCol * Game.map.tsize;
  var offsetY = -this.camera.y + startRow * Game.map.tsize;

  for (var c = startCol; c <= endCol; c++) {
      for (var r = startRow; r <= endRow; r++) {
          var tile = Game.map.getTile(layer, c, r);
          var x = (c - startCol) * Game.map.tsize + offsetX;
          var y = (r - startRow) * Game.map.tsize + offsetY;
          if (tile !== 0) { // 0 => empty tile
              this.ctx.drawImage(
                  this.tileAtlas, // image
                  (tile - 1) * Game.map.tsize, // source x
                  0, // source y
                  Game.map.tsize, // source width
                  Game.map.tsize, // source height
                  Math.round(x),  // target x
                  Math.round(y), // target y
                  Game.map.tsize, // target width
                  Game.map.tsize // target height
              );
          }
      }
  }
};

Game.update = function (delta) {
    // handle camera movement with arrow keys
    var dirx = 0;
    var diry = 0;
    if (Keyboard.isDown(Keyboard.LEFT)) { dirx = -1; }
    if (Keyboard.isDown(Keyboard.RIGHT)) { dirx = 1; }
    if (Keyboard.isDown(Keyboard.UP)) { diry = -1; }
    if (Keyboard.isDown(Keyboard.DOWN)) { diry = 1; }

    if (this.camera != undefined)
    {
      this.camera.move(delta, dirx, diry);
    }
};

Game.render = function () {
    // draw Game.map background layer
    this._drawLayer(0);
    // draw game sprites
    for (i = 0; i < this.players.length; i++)
    {
      this._drawPlayer(this.players[i]);
    }
    // draw Game.map top layer
    this._drawLayer(1);
};

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
/* Requests */

Game.doLogin = function() {
  this.connection.sendMessage("1|Jose");
}

Game.requestMap = function() {
  this.connection.sendMessage("2|REQUESTMAP");
  console.log("Requesting map...");
}

Game.requestPlayers = function() {
  this.connection.sendMessage("5|REQUESTPLAYERS");
  console.log("Requesting players...");
}

/* Request Handlers */

Game.handleMessage = function(data) {
  var request = new ServerMessage(data);
  switch (request.id)
  {
    case 3:
      Game.handleLoggedIn(request);
      break;
    case 4:
      Game.handleMap(request);
      break;
    case 6:
      Game.handlePlayers(request);
      break;

  }
}

Game.handlePlayers = function(request) {
  var count = request.popInt();
  console.log("Players: " + count);

  for (i = 0; i < count; i++)
  {
    this.players.push( new Player(i, request.popInt(), request.popInt(),  Loader.getImage('priest')) );
  }

}

Game.handleMap = function(request) {
  console.log("Received map");
  var width = request.popInt();
  var height = request.popInt();
  var tsize = request.popInt();
  var layerCount = request.popInt();
  var layers = [];

  console.log("Width: " + width);
  console.log("height: " + height);
  console.log("tsize: " + tsize);
  console.log("layerCount: " + layerCount);

  for (i = 0; i < layerCount; i++)
  {
    var layer = [];
    for (j = 0; j < width * height; j++)
    {
      layer.push(request.popInt());
    }
    layers.push(layer);
  }

  Game.map = new Map(width, height, tsize, layers);
  Game.camera = new Camera(Game.map, 640, 640);
  Game.requestPlayers();
}

Game.handleLoggedIn = function() {
  console.log("I'm logged!");

  Game.requestMap();
}

/* IO */

function setMap() {
  var layers = [[
        3, 3, 3, 3, 3, 3, 3, 3, 1, 3,
        3, 1, 1, 1, 1, 1, 1, 3, 1, 3,
        3, 1, 1, 1, 1, 2, 1, 3, 1, 3,
        3, 1, 1, 1, 1, 1, 1, 3, 1, 3,
        3, 1, 1, 2, 1, 1, 1, 3, 1, 3,
        3, 1, 1, 1, 2, 1, 1, 3, 1, 3,
        3, 1, 1, 1, 2, 1, 1, 3, 1, 3,
        3, 3, 3, 1, 2, 3, 3, 3, 1, 3,
        3, 1, 1, 1, 2, 1, 1, 1, 1, 3,
        3, 1, 1, 1, 2, 1, 1, 1, 1, 3
    ], [
        4, 3, 3, 3, 3, 3, 3, 4, 1, 4,
        4, 0, 0, 0, 0, 0, 0, 4, 1, 4,
        4, 0, 0, 0, 0, 0, 0, 4, 1, 4,
        4, 0, 0, 5, 0, 0, 0, 4, 1, 4,
        4, 0, 0, 0, 0, 0, 0, 4, 1, 4,
        4, 0, 0, 0, 0, 0, 0, 4, 1, 4,
        4, 4, 4, 0, 5, 4, 4, 4, 1, 4,
        4, 3, 3, 0, 0, 3, 3, 3, 1, 4,
        4, 1, 1, 0, 0, 0, 0, 0, 1, 4,
        4, 0, 0, 0, 0, 0, 0, 0, 1, 4
    ]];

    Game.map = new Map(10, 10, 64, layers);
}

Game.initIO = function() {
  this.connection = new Connection(this);
}

Game.handleConnectionError = function() {
  console.log("Connection fail");
}

Game.handleOpenConnection = function() {
  console.log("Connection is open");
  this.doLogin();
}

Game.handleClosedConnection = function() {
  console.log("Connection is closed");

}

function onButtonPressed()
{
  setMap();
}
