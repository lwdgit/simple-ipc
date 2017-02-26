const test = require('ava');
const {Client} = require('../ipc');

test.cb('client start', (t) => {
    t.plan(1);
    new Client({
        events: {
            'connect': function() {
                console.log('connect');
            },
            'close': function() {
                console.log('client close');
            },
            'mymsg': function(msg) {
                t.is(msg, 'hello');
                console.log('receive', msg);
                t.end();
            }
        }
    })
});