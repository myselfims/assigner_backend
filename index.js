
import express from 'express';
import user from './routes/user.js';
import login from './routes/login.js'
import tasks from './routes/tasks.js'
import comment from './routes/comment.js'
import otp from './routes/otp.js'
import cors from 'cors';
import { createServer } from 'node:http';
import { initializeSocket } from './socket/socket.js';



const app = express();
app.use(express.json())
app.use(cors())
const server = createServer(app);
const io = initializeSocket(server)


app.use('/api/users',user)
app.use('/api/login',login)
app.use('/api/tasks',tasks)
app.use('/api/comments',comment)
app.use('/api/otp',otp)

const PORT = process.env.PORT || 3000

server.listen(PORT, () => {
    console.log('Listening on port 3000');
});
