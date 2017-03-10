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

ServerMessage = function(data)
{
  this.popString = function() {
    if (self.tokens.length > self.pointer)
    {
      return self.tokens[self.pointer++];
    }
    return null;
  };

  this.popInt = function() {
    return parseInt(self.popString());
  };

  this.pointer = 0;
  this.id = -1;
  this.body = data;
  this.tokens = data.split('|');
  var self = this;
  this.id = this.popInt();
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
};

Game._drawLayer = function (layer) {
  if (Game.map == undefined)
  {
    return;
  }
    for (var c = 0; c < Game.map.cols; c++) {
        for (var r = 0; r < Game.map.rows; r++) {
            var tile = Game.map.getTile(layer, c, r);
            if (tile !== 0) { // 0 => empty tile
                this.ctx.drawImage(
                    this.tileAtlas, // image
                    (tile - 1) * Game.map.tsize, // source x
                    0, // source y
                    Game.map.tsize, // source width
                    Game.map.tsize, // source height
                    c * Game.map.tsize,  // target x
                    r * Game.map.tsize, // target y
                    Game.map.tsize, // target width
                    Game.map.tsize // target height
                );
            }
        }
    }
};

Game.render = function () {
    // draw Game.map background layer
    this._drawLayer(0);
    // draw game sprites
    for (i = 0; i < this.players.length; i++)
    {
      this.ctx.drawImage(this.players[i].image, this.players[i].x, this.players[i].y)
    }
    // draw Game.map top layer
    this._drawLayer(1);
    console.log("rendering...");
};

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

Game.addPlayer = function() {
  this.players.push( {x: getRandomInt(0, 512), y: getRandomInt(0, 512), image: Loader.getImage('priest')} );
  this.players.push( {x: getRandomInt(0, 512), y: getRandomInt(0, 512), image: Loader.getImage('character')} );
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
    this.players.push( {x: 64 * request.popInt(), y: 64 * request.popInt(), image: Loader.getImage('priest')} );
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
