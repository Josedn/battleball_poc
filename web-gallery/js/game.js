/* PLAYER */
function Player(id, x, y, image)
{
  this.id = id;
  this.x = x;
  this.y = y;
  this.image = image;
  this.targetX = x;
  this.targetY = y;
}

Player.SPEED = 2; //squares per second

Player.prototype.move = function (delta) {
  if (this.targetX > this.x)
  {
    this.x += Player.SPEED * delta;
    if (this.x > this.targetX)
    {
      this.x = this.targetX;
    }
  }
  else if (this.targetX < this.x)
  {
    this.x += -Player.SPEED * delta;
    if (this.x < this.targetX)
    {
      this.x = this.targetX;
    }
  }

  if (this.targetY > this.y)
  {
    this.y += Player.SPEED * delta;
    if (this.y > this.targetY)
    {
      this.y = this.targetY;
    }
  }
  else if (this.targetY < this.y)
  {
    this.y -= Player.SPEED * delta;
    if (this.y < this.targetY)
    {
      this.y = this.targetY;
    }
  }
}

/* CAMERA */
function Camera(map) {
    this.width = Game.ctx.canvas.clientWidth;
    this.height = Game.ctx.canvas.clientHeight;
    this.x = 592/*(this.width - Map.TILE_W) / 2*/ ;
    this.y = 116/*Map.TILE_H*/ ;
    this.maxX = 1000;
    this.maxY = 1000;
    this.minX = -1000;
    this.minY = -1000;
}

Camera.SPEED = 256; // pixels per second

Camera.prototype.move = function (delta, dirx, diry) {
    // move camera
    this.x += dirx * Camera.SPEED * delta;
    this.y += diry * Camera.SPEED * delta;
    // clamp values
    this.x = Math.round(Math.max(this.minX, Math.min(this.x, this.maxX)));
    this.y = Math.round(Math.max(this.minY, Math.min(this.y, this.maxY)));
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

  this.isValidTile = function(x, y) {
    return x >= 0 && x < self.cols && y >= 0 && y < self.rows;
  }
}
Map.TILE_H = 32;
Map.TILE_W = 64;
Game.load = function () {
    return [
        Loader.loadImage('room_tile', './web-gallery/assets/room_tile.png'),
        Loader.loadImage('empty_tile', './web-gallery/assets/empty_tile.png'),
        Loader.loadImage('shadow_tile', './web-gallery/assets/shadow_tile.png'),
        Loader.loadImage('selected_tile', './web-gallery/assets/selected_tile.png'),
        Loader.loadImage('jose', './web-gallery/assets/jose.png'),
        Loader.loadImage('press', './web-gallery/assets/press.png')
    ];
};

Game.init = function () {
    this.tileAtlas = Loader.getImage('tiles');
    this.players = [];
    this.initIO();
    Keyboard.listenForEvents(
        [Keyboard.LEFT, Keyboard.RIGHT, Keyboard.UP, Keyboard.DOWN]);
    this.selectedScreenX = 0;
    this.selectedScreenY = 0;

    this.roomTile = Loader.getImage('room_tile');
    this.emptyTile = Loader.getImage('empty_tile');
    this.selectedTile = Loader.getImage('selected_tile');
    this.shadowTile = Loader.getImage('shadow_tile');
};

Game.onMouseMove = function (x, y) {
  if (Game.camera == undefined)
  {
    return;
  }
  this.selectedScreenX = x;
  this.selectedScreenY = y;
};

Game.onMouseClick = function (x, y) {
  if (Game.camera == undefined)
  {
    return;
  }
  Game.onMouseMove(x, y);
  var mapX = this.camera.x;
  var mapY = this.camera.y;

  var xminusy = (this.selectedScreenX - 32 - mapX) / Map.TILE_H;
  var xplusy =  (this.selectedScreenY - mapY) * 2 / Map.TILE_H;

  var x = Math.floor((xminusy + xplusy) / 2);
  var y = Math.floor((xplusy - xminusy) / 2);
  if (this.map.isValidTile(x, y))
  {
    Game.requestMovement(x, y);
  }
}

Game._drawIsometricPlayer = function (player) {
  if (Game.camera == undefined)
  {
    return;
  }
  var mapX = this.camera.x;
  var mapY = this.camera.y;

  var mapPositionX = (player.x - player.y) * Map.TILE_H + mapX;
  var mapPositionY = (player.x + player.y) * Map.TILE_H / 2 + mapY;

  this.ctx.drawImage(this.shadowTile, mapPositionX, mapPositionY);
  this.ctx.drawImage(player.image, mapPositionX, mapPositionY - 85);
}
Game._drawIsometricLayer = function (layer) {
  if (Game.camera == undefined)
  {
    return;
  }

  // mapX and mapY are offsets to make sure we can position the map as we want.
  var mapX = this.camera.x;
  var mapY = this.camera.y;

  // loop through our map and draw out the image represented by the number.
  for (var i = 0; i < this.map.cols; i++) {
    for (var j = 0; j < this.map.rows; j++) {
      // Draw the represented image number, at the desired X & Y coordinates followed by the graphic width and height.
      this.ctx.drawImage(this.roomTile, (i - j) * Map.TILE_H + mapX, (i + j) * Map.TILE_H / 2 + mapY);
    }
  }
}
Game._drawIsometricSelectedTile = function() {
  if (Game.camera == undefined)
  {
    return;
  }

  var mapX = this.camera.x;
  var mapY = this.camera.y;

  var xminusy = (this.selectedScreenX - 32 - mapX) / Map.TILE_H;
  var xplusy =  (this.selectedScreenY - mapY) * 2 / Map.TILE_H;

  var x = Math.floor((xminusy + xplusy) / 2);
  var y = Math.floor((xplusy - xminusy) / 2);

  if (this.map.isValidTile(x, y))
  {
    this.ctx.drawImage(this.selectedTile, (x - y) * Map.TILE_H + mapX, (x + y) * Map.TILE_H / 2 + mapY - 3);
  }

}

Game._drawSelectedTile = function() {
  if (Game.camera == undefined)
  {
    return;
  }

  var absoluteX = Math.floor((this.camera.x + this.selectedScreenX) / 64);
  var absoluteY = Math.floor((this.camera.y + this.selectedScreenY) / 64);
  var mapPositionX = (absoluteX * Game.map.tsize) - this.camera.x;
  var mapPositionY = (absoluteY * Game.map.tsize) - this.camera.y;

  this.ctx.strokeStyle="#FF0000";
  this.ctx.strokeRect(mapPositionX, mapPositionY, this.map.tsize, this.map.tsize);

  /* ////Square

  var ctx = Game.ctx;
  var x = 10;
  var y = 60;
  var w = 220;
  var h = 90;
  var radius = 10;
  var r = x + w;
  var b = y + h;

  this.ctx.beginPath();
  this.ctx.strokeStyle="red";
  this.ctx.lineWidth="1";
  this.ctx.moveTo(x+radius, y);
  //this.ctx.lineTo(x+radius/2, y-10);
  this.ctx.lineTo(x+radius * 2, y);
  this.ctx.lineTo(r-radius, y);
  this.ctx.quadraticCurveTo(r, y, r, y+radius);
  this.ctx.lineTo(r, y+h-radius);
  this.ctx.quadraticCurveTo(r, b, r-radius, b);
  this.ctx.lineTo(x+radius, b);
  this.ctx.quadraticCurveTo(x, b, x, b-radius);
  this.ctx.lineTo(x, y+radius);
  this.ctx.quadraticCurveTo(x, y, x+radius, y);
  this.ctx.stroke(); */
}

Game._drawPlayer = function (player) {
  if (Game.camera == undefined)
  {
    return;
  }
  var mapPositionX = (player.x * Game.map.tsize) - this.camera.x;
  var mapPositionY = (player.y * Game.map.tsize) - this.camera.y;

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
    for (var i = 0; i < this.players.length; i++)
    {
      this.players[i].move(delta);
    }
};

Game.render = function () {
    /*// draw Game.map background layer
    this._drawLayer(0);
    // draw game sprites
    for (var i = 0; i < this.players.length; i++)
    {
      this._drawPlayer(this.players[i]);
    }
    // draw Game.map top layer
    this._drawLayer(1);

    this._drawSelectedTile();*/
    this._drawIsometricLayer();
    this._drawIsometricSelectedTile();
    for (var i = 0; i < this.players.length; i++)
    {
      this._drawIsometricPlayer(this.players[i]);
    }
};

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
/* Requests */

Game.doLogin = function() {
  var message = new ClientMessage(1);
  message.appendString("Jose");
  message.appendString("press");
  this.connection.sendMessage(message);
}

Game.requestMap = function() {
  this.connection.sendMessage(new ClientMessage(2));
  console.log("Requesting map...");
}

Game.requestMovement = function(x, y) {
  var message = new ClientMessage(7);
  message.appendInt(x);
  message.appendInt(y);
  this.connection.sendMessage(message);
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
    case 8:
      Game.handleMovement(request);
      break;
  }
}

Game.handleMovement = function(request) {
  var userId = request.popInt();
  var x = request.popInt();
  var y = request.popInt();

  for (var i = 0; i < Game.players.length; i++)
  {
    if (Game.players[i].id == userId)
    {
      Game.players[i].targetX = x;
      Game.players[i].targetY = y;
    }
  }

}

Game.handlePlayers = function(request) {
  var count = request.popInt();
  console.log("Players: " + count);

  this.players = [];

  for (var i = 0; i < count; i++)
  {
    this.players.push( new Player(request.popInt(), request.popInt(), request.popInt(),  Loader.getImage(request.popString())) );
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

  for (var i = 0; i < layerCount; i++)
  {
    var layer = [];
    for (j = 0; j < width * height; j++)
    {
      layer.push(request.popInt());
    }
    layers.push(layer);
  }

  Game.map = new Map(width, height, tsize, layers);
  Game.camera = new Camera(Game.map);
}

Game.handleLoggedIn = function() {
  console.log("I'm logged!");

  Game.requestMap();
}

/* IO */
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
  /*for (var i = 0; i < Game.players.length; i++)
  {
    Game.players[i].targetY -= 1;
    Game.players[i].targetX -= 1;
  }*/

}
