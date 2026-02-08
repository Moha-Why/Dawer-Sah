import { getAllProducts, addProduct } from "@/lib/productService"

export async function GET() {
  try {
    const products = await getAllProducts(true)
    return new Response(JSON.stringify(products), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    })
  } catch (err) {
    console.error("API GET error:", err)
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    })
  }
}

export async function POST(req) {
  try {
    const body = await req.json()

    if (body.color_images && typeof body.color_images === "object") {
      body.colors = Object.keys(body.color_images)
      body.pictures = Object.values(body.color_images).flat()
    }

    const data = await addProduct(body)
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    })
  } catch (err) {
    console.error("API POST error:", err)
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    })
  }
}
