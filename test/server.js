const test = require('ava');
const {Server} = require('../ipc');
test.cb('server start', (t) => {
    t.plan(1);
    new Server({
        events: {
            'connect': function() {
                this.emit('mymsg', 'hello');
            },
            'close': function() {
                console.log('detect close');
                t.pass();
                t.end();
            }
        }
    })
});
