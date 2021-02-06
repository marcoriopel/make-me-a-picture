
const io = require("socket.io")({
    cors: {
        origin: "*",
    }
});
const socketapi = {
    io: io
};

io.on("connection", function (socket) {
    console.log("A user connected");

    socket.on('message', (message) => {
        console.log(message);
        io.emit('message', `${socket.id.substr(0, 2)} said ${message}`);
    });
});

module.exports = socketapi;