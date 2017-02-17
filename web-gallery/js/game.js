var map = {
    cols: 10,
    rows: 10,
    tsize: 64,
    layers: [[
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
    ]],
    getTile: function (layer, col, row) {
        return this.layers[layer][row * map.cols + col];
    }
};

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
    for (var c = 0; c < map.cols; c++) {
        for (var r = 0; r < map.rows; r++) {
            var tile = map.getTile(layer, c, r);
            if (tile !== 0) { // 0 => empty tile
                this.ctx.drawImage(
                    this.tileAtlas, // image
                    (tile - 1) * map.tsize, // source x
                    0, // source y
                    map.tsize, // source width
                    map.tsize, // source height
                    c * map.tsize,  // target x
                    r * map.tsize, // target y
                    map.tsize, // target width
                    map.tsize // target height
                );
            }
        }
    }
};

Game.render = function () {
    // draw map background layer
    this._drawLayer(0);
    // draw game sprites
    for (i = 0; i < this.players.length; i++)
    {
      this.ctx.drawImage(this.players[i].image, this.players[i].x, this.players[i].y)
    }
    // draw map top layer
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

Game.initIO = function() {
  this.connection = new Connection(this);
}

Game.handleMessage = function(message) {

}
