

 const commentsSocket = (io) => {
    io.on('connection', (socket) => {
        socket.on('join:comment', (data) => {socket.join(data);console.log(data)});
        socket.on('comment', (data) => socket.to(data.task).emit('comment',data.comment));
    });
}

export default commentsSocket;