Connection = function(messageHandler) {
  this.connected = false;
  var self = this;
  var wsImpl = window.WebSocket || window.MozWebSocket;
  console.log("Connecting to server...");
  // create a new websocket and connect
  this.ws = new wsImpl('ws://localhost:8181/');

  // when data is comming from the server, this metod is called
  this.ws.onmessage = function (evt) {
      messageHandler.handleMessage(evt.data);
  };
  // when the connection is established, this method is called
  this.ws.onopen = function () {
    self.connected = true;
    messageHandler.handleOpenConnection();
  };
  // when the connection is closed, this method is called
  this.ws.onclose = function () {
    self.connected = false;
    messageHandler.handleClosedConnection();
  }
  //when Error
  this.ws.onerror = function () {
    self.connected = false;
    messageHandler.handleConnectionError();
  }
}

Connection.prototype.sendMessage = function(message)
{
  if (this.isConnected())
  {
    this.ws.send(message.body);
  }
  else {
    console.log("Can't send, socket is no connected");
  }
}

Connection.prototype.isConnected = function()
{
  return this.connected;
}
/*
function onButtonPressed()
{
  var test = new Connection();
  console.log("IsConnected?: " + test.isConnected())

}
*/
ServerMessage = function(data)
{
  this.popToken = function() {
    if (self.tokens.length > self.pointer)
    {
      return self.tokens[self.pointer++];
    }
    return null;
  };

  this.popInt = function() {
    return parseInt(self.popToken());
  };

  this.popString = function() {
    var tickets = self.popInt();
    var totalString = self.popToken();
    for (var i = 0; i < tickets; i++)
    {
      totalString += '|' + self.popToken();
    }
    return totalString;
  }

  this.pointer = 0;
  this.id = -1;
  this.body = data;
  this.tokens = data.split('|');
  var self = this;
  this.id = this.popInt();
}

ClientMessage = function(id) {
  this.appendToken = function(token) {
    self.body += '|' + token;
  }

  this.appendInt = function(i) {
    self.appendToken(i + "");
  }

  this.appendString = function(str) {
    var tickets = 0;
    for (var i = 0; i < str.length; i++)
    {
      if (str.charAt(i) == '|')
      {
        tickets++;
      }
    }

    self.appendInt(tickets);
    self.appendToken(str);
  }

  this.body = id + "";
  var self = this;
}
