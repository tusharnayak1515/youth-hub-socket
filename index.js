const io = require('socket.io')(9000, {
    cors: {
        origin: "http://localhost:3000"
    }
});

let users = [];

const addUser = (userId,socketId,status)=> {
    // console.log(users.length);
    let found = true;
    for(let i=0; i< users.length; i++) {
        console.log(users[i].userId !== userId);
        if(users[i].userId !== userId) {
            found = false;
        }
        else {
            found = true;
        }
    }
    if(!found) {
        users.push({userId, socketId, status});
    }

    if(users.length === 0) {
        console.log("yes");
        users.push({userId, socketId, status});
    }
    console.log(users);
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
        let status = "online";
        addUser(userId, socket.id, status);
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
        if(myreceiver === undefined) {
            let status = "offline";
            addUser(receiver._id,socket.id, status);
            myreceiver = getUser(receiver._id);
            // io.emit("getUsers", users);
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
        console.log("disconnected");
        removeUser(socket.id);
        io.emit("getUsers", users);
    })
});