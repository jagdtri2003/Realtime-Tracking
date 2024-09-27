const express  = require('express');
const app = express();
const http = require('http');

const socket = require('socket.io');

const server = http.createServer(app);

const io = socket(server);
const users = {};

app.set('view engine', 'ejs');
app.use(express.static('public'));

io.on('connection', (socket) => {
    const userId = socket.id; // You can use socket.id or any other unique identifier
    users[userId] = { id: userId }; // Store user info
    socket.emit('welcome-user', {id: userId});
    socket.on('sendLocation', (data) => {
        io.emit('receiveLocation', {id: socket.id,...data});
    });
    socket.on("disconnect", () => {
        io.emit('disconnect-user', {id: socket.id});
    })
    console.log("Connected");
})

app.get('/', (req, res) => {
    res.render('index.ejs')
});



server.listen(3000);