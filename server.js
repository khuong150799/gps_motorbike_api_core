const express = require('express');
const app = express();
const server = require('http').createServer(app);
const cors = require('cors');
const { Server } = require('socket.io');
const io = new Server(server, {
    cors: {
        origin: true,
        methods: ['GET', 'POST'],
    },
});

const mqtt = require('mqtt');
const port = 3009;

// const db = require('./app/models/connecDB');
// db();
app.use(cors({ origin: true, credentials: true }));
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
const cookieParser = require('cookie-parser');
app.use(cookieParser());

require('./app/routes/role.route')(app);
require('./app/routes/user.route')(app);
require('./app/routes/admin.route')(app);
require('./app/routes/device.route')(app);
// require('./app/routes/location_devices.route')(app);
// require('./app/routes/marker.router')(app);
// require('./app/routes/rbush.route')(app);
//mqtt
// const client = mqtt.connect('mqtt://0.tcp.ap.ngrok.io:16714');

// client.on('connect', (ack) => {
//     console.log('connect mqtt successfully');
//     console.log('ack', ack);
//     client.subscribe('mqtt', (err) => {
//         console.log('err mqtt', err);
//     });
// });
// client.on('message', (topic, mess) => {
//     console.log('topic', topic);
//     console.log('message', mess.toString());
//     io.emit('send', mess.toString());
// });
// client.on('error', (err) => {
//     console.log('err mqtt', err);
// });

//socket

// io.on('connection', (socket) => {
//     console.log('user connection successfully');
//     socket.on('request', (mess) => {
//         console.log(mess);
//         //gọi axios marker để trả về tọa độ mới nhất của tất cả thiết bị thuộc đại lí do soket gởi userid lên
//     });
// });

server.listen(port, () => {
    console.log(`app run at http://localhost:${port}`);
});
