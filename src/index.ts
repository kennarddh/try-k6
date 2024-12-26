import { PrismaClient } from '@prisma/client'

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

Bun.serve({
	port: 8000,
	development: false,
	reusePort: true,
	async fetch() {
		const products = await prisma.$queryRaw<{ name: string; stock: number }[]>`
			UPDATE "Products"
			SET stock = stock - 1
			WHERE id = ${productID} AND stock >= 1
			RETURNING name, stock;
		`

		if (products.length === 0) {
			return new Response(
				JSON.stringify({
					data: `Product sold out!`,
				}),
				{ status: 400, headers: { 'Content-Type': 'application/json' } },
			)
		}

		const product = products[0]

		return new Response(
			JSON.stringify({
				data: `Bought product '${product!.name}' current stock is ${product!.stock}`,
			}),
			{ status: 200, headers: { 'Content-Type': 'application/json' } },
		)
	},
})

console.log('Server is running on port 8000')
