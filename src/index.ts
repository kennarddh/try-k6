import { PrismaClient } from '@prisma/client'
import http from 'http'

const prisma = new PrismaClient()

await prisma.$connect()

const productID = (
	await prisma.products.create({
		data: {
			name: `Product ${crypto.randomUUID()}`,
			stock: 1000,
		},
		select: {
			id: true,
		},
	})
).id

const server = http.createServer(async (req, res) => {
	const products = await prisma.$queryRaw<{ name: string; stock: number }[]>`
			UPDATE "Products"
			SET stock = stock - 1
			WHERE id = ${productID} AND stock >= 1
			RETURNING name, stock;
		`

	if (products.length === 0) {
		res.writeHead(400, { 'Content-Type': 'application/json' })
		res.end(
			JSON.stringify({
				data: `Product sold out!`,
			}),
		)

		return
	}

	const product = products[0]

	res.writeHead(200, { 'Content-Type': 'application/json' })
	res.end(
		JSON.stringify({
			data: `Bought product '${product!.name}' current stock is ${product!.stock}`,
		}),
	)
})

server.on('clientError', (err, socket) => {
	socket.end('HTTP/1.1 400 Bad Request\r\n\r\n')
})

server.listen(8000, () => {
	console.log('Server is running on port 8000')
})
