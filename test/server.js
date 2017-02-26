const test = require('ava');
const {Server} = require('../ipc');
test.cb('server start', (t) => {
    t.plan(1);
    new Server({
        events: {
            'connect': function() {
                this.emit('mymsg', 'hello');
            },
            'msg': function(msg) {
                console.log('oh, client say:', msg);
                t.is('ok', msg);
                t.end();
            },
            'close': function() {
                console.log('detect close');
            }
        }
    })
});
