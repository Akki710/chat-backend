const express=require('express');
const socket=require('socket.io');
const cors=require('cors');

const { addUser, removeUser, getUser, getUserInRoom }= require('./users');

const router=require('./router.js');

const PORT=process.env.PORT || 5001;
const app=express();


app.use(cors());
app.use(express.json());

const server=app.listen(PORT,()=>{
    console.log("Server is running on Port :  ",PORT);
});

const io=socket(server,{
    cors:{
        origin:'*'
    }
});

io.on("connection",(socketClient)=>{
    console.log(socketClient.id);

    socketClient.on("join",({userName,userRoom}, callback)=>{
        const {error, user}=addUser({id:socketClient.id, name:userName,room:userRoom});

        if(error) return callback(error);
        socketClient.join(user.room);
        
        socketClient.emit("message",{user:"Admin", text: `${user.name}, Welcome to Room ${user.room}`});
        socketClient.broadcast.to(user.room).emit("message", {user:"Admin" ,text:`${user.name} has Joined!!`});

        io.to(user.room).emit("roomData",{room:user.room, users: getUserInRoom(user.room)});
        callback();

        console.log(user.name+ "Joined the Room "+ user.room);
    });


    socketClient.on("sendMessage",(message,callback)=>{
        const user= getUser(socketClient.id);

        io.to(user.room).emit("message",{user:user.name, text:message});
        callback();
    });


    socketClient.on("disconnect",()=>{
        const user= removeUser(socketClient.id);

        if (user){
            io.to(user.room).emit("message",{user:"Admin",text:`${user.name} has left the chat `});
            io.to(user.room).emit("roomData",{room:user.room, users:getUserInRoom(user.room)});
        }

        console.log(user.name+" has Left the "+ user.room);
    });

})


app.use(router);