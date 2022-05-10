const io = require('socket.io')(9000, {
    cors: {
        origin: "http://localhost:3000"
    }
});

let users = [];

const addUser = (userId,socketId)=> {
    // console.log(users.length);
    !users.some((user) => user.userId === userId) &&
    users.push({ userId, socketId});
    // console.log(users);
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
        // console.log(users);
        let myusers = [];
        for(let i=0; i<users.length; i++) {
            myusers.push(users[i].userId);
        }
        io.emit("getUsers", myusers);
    });

    // send and get message
    socket.on("sendMessage", ({_id,conversation,sender,receiver,text,createdAt,updatedAt})=> {
        let myreceiver = getUser(receiver._id);
        // console.log(receiver._id);
        if(myreceiver) {
            io.to(myreceiver.socketId).emit("getMessage", {
                _id,
                conversation,
                sender,
                receiver,
                text,
                createdAt,
                updatedAt
            });
        }
    });

    // Disconnection
    socket.on("disconnect", ()=> {
        console.log("disconnected");
        removeUser(socket.id);
        io.emit("getUsers", users);
    })
});