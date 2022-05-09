const io = require('socket.io')(9000, {
    cors: {
        origin: "http://localhost:3000"
    }
});

let users = [];

const addUser = (userId,socketId)=> {
    !users.some((user)=> user.userId === userId) &&
        users.push({userId, socketId});
}

const removeUser = (socketId)=> {
    users = users.filter((user)=> user.socketId !== socketId);
}

const getUser = (userId)=> {
    return users.find((user)=> user.userId === userId);
}

io.on("connection", (socket) => {
    console.log(`A user with socket id ${socket.id} is connected!`);

    // Take userId and socketId from user
    socket.on("addUser", (userId)=> {
        addUser(userId, socket.id);
        io.emit("getUsers", users);
    });

    // send and get message
    socket.on("sendMessage", ({_id,conversation,sender,receiver,text,createdAt,updatedAt})=> {
        const myreceiver = getUser(receiver._id);
        if(myreceiver === undefined) {
            addUser(receiver._id,socket.id);
        }
        io.to(myreceiver.socketId).emit("getMessage", {
            _id,
            conversation,
            sender,
            receiver,
            text,
            createdAt,
            updatedAt
        });
    });

    // Disconnection
    socket.on("disconnect", ()=> {
        removeUser(socket.id);
        io.emit("getUsers", users);
    })
});