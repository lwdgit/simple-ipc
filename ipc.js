const ipc = require('node-ipc');
const SERVER_ID = 'server' + (process.cwd() + __filename).replace(/[/\.\\]/g, '').slice(-60);
const server = exports.server = function (serverId = SERVER_ID) {
  ipc.config.id = serverId;
  ipc.config.retry = 500;
  ipc.config.silent = true;
  return new Promise(function (resolve) {
    ipc.serve(
            function () {
              ipc.server
                .on('connect',
                    function () {
                      ipc.log('server: connected')
                    }
                )
                .on(
                    'disconnect',
                    function () {
                      ipc.log('server: disconnect')
                    }
                )
              return resolve(ipc.server)
            }
        )

    ipc.server.start()
    ipc.log('server: ' + serverId + ' start success')
  })
}




var serverMap = {}

function connect (ipc, serverId = SERVER_ID) {
  return new Promise(function (resolve) {
    if (serverMap[serverId]) {
      return connected();
    }

    function connected () {
      return resolve(serverMap[serverId]);
    }

    ipc.connectTo(
            serverId,
            function () {
                (serverMap[serverId] = ipc.of[serverId])
                .on(
                    'connect',
                    function () {
                      ipc.log('connected server')
                      return connected();
                    }
                )
                .on(
                    'disconnect',
                    function () {
                      ipc.log('server: ' + serverId + ' closed');
                    }
                )
            }
        )
  })
}

const client = exports.client = function (clientId = 'client' + Math.random()) {
  ipc.config.id = clientId;
  ipc.config.retry = 500;
  ipc.config.silent = true;
  return {
    connect: function (serverId = SERVER_ID) {
      return connect(ipc, serverId);
    }
  }
}

exports.Server = class {
    constructor(config = {}) {
        this._socket = [];
        this.start();
        this._events = Object.assign({}, config.events);
    }
    start() {
        const self = this;
        server().then(function(instance) {
            self.instance = instance;
            self._listen.call(self);
        }).catch(function(e) {
            console.error('Error:', e);
        });
    }
    on(event, fn) {
        this._events[event, fn];
        this.instance.on(event, fn.bind(this));
    }
    _listen() {
        const self = this;
        this.instance.on('connect', function(socket) {
            ipc.log('connect');
            self._socket.push(socket);
            self.instance.emit(socket, 'connect');
        }).on('close', function() {
            ipc.log('close');
        });
        for(let event in this._events) {
            this.instance.on(event, this._events[event].bind(this));
        }
    }
    emit(type, msg) {
        for(let socket of this._socket) {
            this.instance.emit.call(this.instance, socket, type, msg);
        }
    }
}


exports.Client = class {
  constructor(config = {}) {
    this._events = Object.assign({}, config.events);
    this.start();
  }
  start() {
    const self = this;
    client().connect().then(function(instance) {
      self.instance = instance;
      self._listen();
    }).catch(function(e) {
        console.error('Error:', e);
    });
  }
  on(event, fn) {
      this._events[event, fn];
      this.instance.on('event', fn.bind(this));
  }
  _listen() {
      const self = this;
      this.instance.on('connect', function() {
          ipc.log('connect', self);
      }).on('close', function() {
          console.log('close');
      });
      for(let event in this._events) {
          this.instance.on(event, this._events[event].bind(this));
      }
  }
}
