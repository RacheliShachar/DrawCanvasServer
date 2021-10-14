var app = require('express')();
var http = require('http').createServer(app);
const PORT = 8080;
var io = require('socket.io')(http);
///////////////////////////////
// var STATIC_CHANNELS = [{
//     name: 'Global chat',
//     participants: 0,
//     id: 1,
//     sockets: []
// }, {
//     name: 'Funny',
//     participants: 0,
//     id: 2,
//     sockets: []
// }];
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    next();
})

var CHANNEL = {
    name: 'Canvas',
    participants: 0,
    sockets: [],
    messages: [],
    drawings: []
}

app.get("/getChannel", function(req, res) {
    res.json({
        channel: CHANNEL
    })
});


http.listen(PORT, () => {
    console.log(`listening on *:${PORT}`);
});

io.on('connection', (socket) => { /* socket object may be used to send specific messages to the new connected client */

    console.log('new client connected');
    socket.emit('connection', null);
    // socket.on('channel-join', id => {
    //     console.log('channel join', id);
    //     STATIC_CHANNELS.forEach(c => {
    //         if (c.id === id) {
    //             if (c.sockets.indexOf(socket.id) == (-1)) {
    //                 c.sockets.push(socket.id);
    //                 c.participants++;
    //                 io.emit('channel', c);
    //             }
    //         } else {
    //             let index = c.sockets.indexOf(socket.id);
    //             if (index != (-1)) {
    //                 c.sockets.splice(index, 1);
    //                 c.participants--;
    //                 io.emit('channel', c);
    //             }
    //         }
    //});

    socket.on('connect-channel', () => {
        console.log('connect-channel');
        io.emit('connect-channel', CHANNEL);
    })
    socket.on('add-participant', () => {
        console.log('add-participant');
        CHANNEL.participants++;
        CHANNEL.push(socket.id);
        io.emit('add-participant-channel', CHANNEL);

    })
    socket.on('send-message', message => {
        CHANNEL.messages.push(message);
        io.emit('message', CHANNEL);
    });
    socket.on('send-drawing', drawing => {
        let drw = {
            id: drawing.id,
            name: drawing.name,
            color: drawing.selectedColor,
            points: CHANNEL.points
        }
        if (!drw.points) {
            drw.points = [drawing.startPoint]
        }
        drw.points.push(drawing.endPoint)
        CHANNEL.drawings.push(drw);
        io.emit('drawing', CHANNEL);


    })
    socket.on('delete-drawings', () => {
        CHANNEL.drawings = []
        io.emit('clear-canvas', CHANNEL);

    })

});