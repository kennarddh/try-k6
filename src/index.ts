import { PrismaClient } from '@prisma/client'
import http from 'http'

const prisma = new PrismaClient()

await prisma.$connect()

const server = http.createServer((req, res) => {
	res.writeHead(200, { 'Content-Type': 'application/json' });
	res.end(JSON.stringify({
	  data: 'Hello World!',
	}));
});

server.on('clientError', (err, socket) => {
	socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
});

server.listen(8000,()=>{
	console.log("Server is running on port 8000")
});

