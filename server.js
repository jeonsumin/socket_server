const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);

const room = io.of('/test');
const aroom = io.of('/a');

const userList = [];
http.listen(9000, () => {
    console.log("listening to *:9000")
})

app.get('/',(req,res)=> {
    res.sendFile(__dirname + "/public/socket.html")
})

app.get('/:id', (req, res) => {
    res.sendFile(__dirname + "/public/socket.html")
    var connectIdChannel = io.of(`/${req.params.id}`).on('connection', (socket) => {
        socket.on('chat message', (data) => {
            console.log('message from client with connectIdChannel: ', data);

            var room = socket.room = req.params.id
            socket.join(room)
            connectIdChannel.to(room).emit('chat message',data)
        })
    })
})
var roomNum;
io.on('connection', (socket) => {
    console.log("io connect User : ", socket.id)


    socket.on("join_room", (data) => {
        console.log("data : ",data);
        socket.join(data)
        roomNum = data
        console.log("room Num",roomNum)
        io.to(roomNum).emit('receive_message',data)
        console.log(`JOIN_ROOM is fired with data : ${JSON.stringify(data)}`)
    })

    socket.on("send_message",(data) => {
        const responseData = {
            data,
            type: "send_message",
            time: new Date(),
        }
        roomNum = data.room
        io.to(roomNum).emit('receive_message',responseData)
        console.log(`SEND_MESSAGE is fired with data : ${JSON.stringify(responseData)}`)
    })

    io.of(roomNum).on("receive_message",(data) => {
        console.log('receive_message on ::: ',data)
    })
})

io.on('disconnection',response => {
    console.log("disconnect", response)
})

var chat = io.of('/chat').on('connection', function (socket) {
    socket.emit('connectUser', socket.id)

    socket.on('chat message', function (data) {
        console.log('message from client: ', data);

        var name = socket.name = data.name;
        var roomNum = socket.room = data.room;

        // room에 join한다
        socket.join(roomNum);

        // room에 join되어 있는 클라이언트에게 메시지를 전송한다
        chat.to(roomNum).emit('chat message', data);
    });

    socket.on('connectUser', (data) => {
        console.log(data)
    })
});