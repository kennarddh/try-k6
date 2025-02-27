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

// const productID = 28

console.log(`Product ID: ${productID}`)

http.createServer(async function (_, res) {
	const product = await prisma.products.update({
		where: {
			id: productID,
			stock: {
				gt: 0,
			},
		},
		data: {
			stock: {
				decrement: 1,
			},
		},
		select: { stock: true },
	})

	if (product.stock === 0) {
		res.writeHead(400, { 'Content-Type': 'application/json' })
		res.end(
			JSON.stringify({
				data: `Product sold out!`,
			}),
		)

		return
	}

	res.writeHead(200, { 'Content-Type': 'application/json' })
	res.end(
		JSON.stringify({
			data: `Bought product ${product!.stock}`,
		}),
	)
}).listen(8000)

console.log('Server is running on port 8000')
