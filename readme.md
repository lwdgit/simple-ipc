# simple-ipc

> Simplest way to handle inner process communication.

## Usage

```
//client.js
import { Client } from 'simple-ipc';
new Client({
    events: {
        'connect': function() {
            console.log('connect');
        },
        'close': function() {
            console.log('client close');
        },
        'mymsg': function(msg) {
            console.log('receive', msg);
        }
    }
});
```

```
//server.js
import { Server } from 'simple-ipc';
new Server({
    events: {
        'connect': function() {
            this.emit('mymsg', 'hello');
        },
        'close': function() {
            console.log('detect close');
        }
    }
})
```

## API

 * Server 
   * `constructor({events: {}})` default events listener
   * `on(event, fn)` listen client msg 
   * `emit(event, msg)`  broadcast msg to clients

 * Client 
   * `constructor({events: {}})` default events listener
   * `on(event, fn)`   listen server broadcast
   * `emit(event, msg)`  emit msg to server
