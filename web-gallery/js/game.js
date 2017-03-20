function Chat(from, text, x)
{
  this.from = from;
  this.text = text;
  this.x = x;
  this.y = 170;
  this.targetX = x;
  this.targetY = this.y;
  this.stamp = new Date().getTime();
}
Chat.SPEED = 32;
Chat.prototype.move = function(delta){
  if (this.targetY > this.y)
  {
    this.y += Chat.SPEED * delta;
    if (this.y > this.targetY)
    {
      this.y = this.targetY;
    }
  }
  else if (this.targetY < this.y)
  {
    this.y -= Chat.SPEED * delta;
    if (this.y < this.targetY)
    {
      this.y = this.targetY;
    }
  }
  if (this.targetY < -10)
  {
    Game.chats.splice(0, 1);
  }
}

Game.moveChats = function()
{
  for (var i = 0; i < Game.chats.length; i++)
  {
    Game.chats[i].targetY -= 20;
  }
}

/* PLAYER */
function Player(id, x, y, rot, look)
{
  this.id = id;
  this.x = x;
  this.y = y;
  this.rot = rot;
  this.look = look;
  this.targetX = x;
  this.targetY = y;
  this.sprites = {};
}
Player.prototype.getSpriteURL = function(direction, walkFrame)
{
  var spritesURL = "https://www.habbo.com/habbo-imaging/avatarimage?figure=" + this.look;
  spritesURL += '&direction=' + direction + '&head_direction=' + direction;

  if (walkFrame > 0)
  {
    spritesURL += '&action=wlk&frame=' + (walkFrame-1);
  }
  return spritesURL;
}
Player.prototype.loadSprite = function(direction, walkFrame)
{
  var img = new Image();
  img.src = this.getSpriteURL(direction, walkFrame);
  this.sprites[img.src] = img;
  return img;
}
Player.prototype.getSprite = function(direction, walkFrame)
{
  var sprite = this.getSpriteURL(direction, walkFrame);
  if (this.sprites[sprite] == undefined)
  {
    return this.loadSprite(direction, walkFrame);
  }
  return this.sprites[sprite];
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
  this.reset();
}

Camera.prototype.reset = function() {
  this.width = Game.ctx.canvas.clientWidth;
  this.height = Game.ctx.canvas.clientHeight;
  this.x = (this.width - Map.TILE_W) / 2;
  this.y = (this.height - Map.TILE_H) / 4;
}

Camera.SPEED = 256; // pixels per second

Camera.prototype.move = function (delta, dirx, diry) {
    // move camera
    this.x += dirx * Camera.SPEED * delta;
    this.y += diry * Camera.SPEED * delta;
    // clamp values
    //this.x = Math.round(Math.max(this.minX, Math.min(this.x, this.maxX)));
    //this.y = Math.round(Math.max(this.minY, Math.min(this.y, this.maxY)));
    this.x = Math.round(this.x);
    this.y = Math.round(this.y);
};

/* MAP */
Map = function(cols, rows, layer)
{
  this.cols = cols;
  this.rows = rows;
  this.layer = layer;

  var self = this;
  this.getTile = function (col, row) {
      return self.layer[col * self.rows + row];
  }

  this.isValidTile = function(x, y) {
    if (x >= 0 && x < self.cols && y >= 0 && y < self.rows)
    {
      return self.getTile(x, y) == 1;
    }
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
        Loader.loadImage('room_door', './web-gallery/assets/room_door.png'),
        Loader.loadImage('room_wall_l', './web-gallery/assets/room_wall_door.png'),
        Loader.loadImage('room_wall_l_first', './web-gallery/assets/room_wall_first.png'),
        Loader.loadImage('room_wall_r', './web-gallery/assets/room_wall_r.png'),
        Loader.loadImage('chat1', './web-gallery/assets/chat1.png'),
        Loader.loadImage('chat2', './web-gallery/assets/chat2.png'),
        Loader.loadImage('chat3', './web-gallery/assets/chat3.png')
    ];
};

Game.init = function () {
    this.tileAtlas = Loader.getImage('tiles');
    this.players = [];
    this.chats = [];
    this.initIO();
    Keyboard.listenForEvents(
        [Keyboard.LEFT, Keyboard.RIGHT, Keyboard.UP, Keyboard.DOWN]);

    this.onResize();

    setInterval(this.moveChats, 3000);
    this.selectedScreenX = 0;
    this.selectedScreenY = 0;

    this.roomTile = Loader.getImage('room_tile');
    this.emptyTile = Loader.getImage('empty_tile');
    this.selectedTile = Loader.getImage('selected_tile');
    this.shadowTile = Loader.getImage('shadow_tile');
    this.roomDoor = Loader.getImage('room_door');
    this.roomWallL = Loader.getImage('room_wall_l');
    this.roomWallR = Loader.getImage('room_wall_r');
};

Game.onMouseMove = function (x, y, isDrag) {
  if (Game.camera == undefined)
  {
    return;
  }
  if (isDrag)
  {
    var diffX = this.selectedScreenX - x;
    var diffY = this.selectedScreenY - y;
    this.camera.x -= diffX;
    this.camera.y -= diffY;
  }

  this.selectedScreenX = x;
  this.selectedScreenY = y;
};

Game.onMouseClick = function (x, y) {
  if (Game.camera == undefined)
  {
    return;
  }
  Game.onMouseMove(x, y, false);
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

  var diffX = Math.abs(player.targetX - player.x);
  var diffY = Math.abs(player.targetY - player.y);

  var walkFrame = 0;
  if (diffX > 0 && diffX < 0.25)
  {
    walkFrame = 1;
  }
  else if (diffX > 0.25 && diffX < 0.5)
  {
    walkFrame = 2;
  }
  else if (diffX > 0.5 && diffX < 0.75)
  {
    walkFrame = 3;
  }
  else if (diffX > 0.75)
  {
    walkFrame = 4;
  }
  else if (diffY > 0 && diffY < 0.25)
  {
    walkFrame = 1;
  }
  else if (diffY > 0.25 && diffY < 0.5)
  {
    walkFrame = 2;
  }
  else if (diffY > 0.5 && diffY < 0.75)
  {
    walkFrame = 3;
  }
  else if (diffY > 0.75)
  {
    walkFrame = 4;
  }

  this.ctx.drawImage(this.shadowTile, mapPositionX, mapPositionY);
  this.ctx.drawImage(player.getSprite(player.rot, walkFrame), mapPositionX, mapPositionY - 85);
}
Game._drawIsometricWalls = function () {
  if (Game.camera == undefined)
  {
    return;
  }

  var mapX = this.camera.x;
  var mapY = this.camera.y;

  for (var i = 1; i < this.map.rows; i++) {
    if (i == 4)
    {
      this.ctx.drawImage(this.roomDoor, (1 - i) * Map.TILE_H + mapX - 8, (i + 1) * Map.TILE_H / 2 + mapY - 119);
    }
    else {
      this.ctx.drawImage(this.roomWallL, (1 - i) * Map.TILE_H + mapX - 8, (i + 1) * Map.TILE_H / 2 + mapY - 119);
    }
  }

  this.ctx.drawImage(Loader.getImage("room_wall_l_first"), (1 - (this.map.rows - 1)) * Map.TILE_H + mapX - 8, (1 + this.map.rows - 1) * Map.TILE_H / 2 + mapY - 119);

  for (var i = 1; i < this.map.cols; i++) {
    // Draw the represented image number, at the desired X & Y coordinates followed by the graphic width and height.
    this.ctx.drawImage(this.roomWallR, (i - 1) * Map.TILE_H + mapX + 32, (i + 1) * Map.TILE_H / 2 + mapY - 119);
  }
}
Game._drawIsometricLayer = function () {
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
      var tile = Game.map.getTile(i, j);
      // Draw the represented image number, at the desired X & Y coordinates followed by the graphic width and height.
      if (tile == 1)
      {
        this.ctx.drawImage(this.roomTile, (i - j) * Map.TILE_H + mapX, (i + j) * Map.TILE_H / 2 + mapY);
      }
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
Game._drawChats = function() {
  for (var i = 0; i < this.chats.length; i++)
  {
    var currentChat = this.chats[i];

    var fromWidth = this.ctx.measureText(currentChat.from + ": ").width;
    var textWidth = this.ctx.measureText(currentChat.text).width;

    var currentWidth = 0;
    var leftChat = Loader.getImage('chat1');
    var midChat = Loader.getImage('chat2');
    var rightChat = Loader.getImage('chat3');

    this.ctx.drawImage(leftChat, currentChat.x, currentChat.y);
    while (currentWidth < (textWidth + fromWidth)) {
      this.ctx.drawImage(midChat, currentChat.x + leftChat.width + currentWidth, currentChat.y);
      currentWidth += 10;
    }

    this.ctx.drawImage(rightChat, currentChat.x + leftChat.width + currentWidth, currentChat.y);
    this.ctx.font = "bold 15px Ubuntu"
    this.ctx.textBaseline = "middle";
    this.ctx.fillStyle = "black";
    this.ctx.fillText(currentChat.from + ": ", currentChat.x + leftChat.width, currentChat.y + 12);
    this.ctx.font = "15px Ubuntu"
    this.ctx.fillText(currentChat.text, currentChat.x + leftChat.width + fromWidth, currentChat.y + 12);
  }
}

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
    for (var i = 0; i < this.chats.length; i++)
    {
      this.chats[i].move(delta);
    }
};
Game.onResize = function() {
  this.ctx.canvas.width = window.innerWidth;
  this.ctx.canvas.height = window.innerHeight;
  if (this.camera != undefined)
  {
    this.camera.reset();
  }
}

Game.render = function () {
  this._drawIsometricWalls();
  this._drawIsometricLayer();
  this._drawIsometricSelectedTile();
  for (var i = 0; i < this.players.length; i++)
  {
    this._drawIsometricPlayer(this.players[i]);
  }

  this._drawChats();
};
/* Requests */

Game.doLogin = function() {
  var message = new ClientMessage(1);
  message.appendString("Jose");
  message.appendString("hd-190-10.lg-3023-1408.ch-215-91.hr-893-45");
  this.connection.sendMessage(message);
}

Game.requestChat = function(chat) {
  if (chat.length < 1)
  {
    return;
  }
  var message = new ClientMessage(9);
  message.appendString(chat);
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
    case 10:
      Game.handleChat(request);
      break;
  }
}

Game.handleMovement = function(request) {
  var userId = request.popInt();
  var x = request.popInt();
  var y = request.popInt();
  var rot = request.popInt();

  for (var i = 0; i < Game.players.length; i++)
  {
    if (Game.players[i].id == userId)
    {
      Game.players[i].targetX = x;
      Game.players[i].targetY = y;
      Game.players[i].rot = rot;
    }
  }

}

Game.handlePlayers = function(request) {
  var count = request.popInt();
  console.log("Players: " + count);

  this.players = [];

  for (var i = 0; i < count; i++)
  {
    this.players.push( new Player(request.popInt(), request.popInt(), request.popInt(), request.popInt(),  request.popString()) );
  }
}

Game.handleMap = function(request) {
  console.log("Received map");
  var width = request.popInt();
  var height = request.popInt();

  var layer = [];
  for (var j = 0; j < width * height; j++)
  {
    layer.push(request.popInt());
  }

  Game.map = new Map(width, height, layer);
  Game.camera = new Camera(Game.map);
}
Game.handleChat = function(request) {
  var fromId = request.popInt();
  var from = request.popString();
  var text = request.popString();

  for (var i = 0; i < Game.players.length; i++)
  {
    if (Game.players[i].id == fromId)
    {
      var mapX = this.camera.x;
      var mapPositionX = (Game.players[i].x - Game.players[i].y) * Map.TILE_H + mapX;
      Game.chats.push(new Chat(from, text, mapPositionX));
    }
  }
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

}

function onChatSubmit()
{
  var chat_text = document.getElementById("input_chat").value;
  document.getElementById("input_chat").value = "";
  Game.requestChat(chat_text);
}
