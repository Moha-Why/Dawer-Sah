import { getProductById, updateProduct, deleteProduct } from "@/lib/productService"
import { NextResponse } from "next/server"

export async function GET(req, { params }) {
  try {
    const { id } = await params
    const data = await getProductById(id)

    if (!data) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    return NextResponse.json(data, { status: 200 })
  } catch (error) {
    console.error("GET error:", error)
    return NextResponse.json({ error: "Internal server error: " + error.message }, { status: 500 })
  }
}

export async function PUT(req, { params }) {
  try {
    const { id } = await params
    const body = await req.json()

    const updateData = {
      name: body.name,
      price: body.price,
      newprice: body.newprice || null,
      colors: body.colors || [],
      type: body.type || null,
      description: body.description || "",
      pictures: body.pictures || [],
      brand: body.brand || null,
      year: body.year || null,
      mileage: body.mileage || null,
      transmission: body.transmission || null,
      fuelType: body.fuelType || null,
      engineSize: body.engineSize || null,
      features: body.features || []
    }

    if (body.color_images !== undefined) {
      updateData.color_images = body.color_images
      if (body.color_images && typeof body.color_images === "object") {
        updateData.colors = Object.keys(body.color_images)
        updateData.pictures = Object.values(body.color_images).flat()
      }
    }

    const data = await updateProduct(id, updateData)
    return NextResponse.json(data, { status: 200 })
  } catch (error) {
    console.error("PUT error:", error)
    return NextResponse.json({ error: "Failed to update product: " + error.message }, { status: 500 })
  }
}

export async function DELETE(req, { params }) {
  try {
    const { id } = await params

    if (!id) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 })
    }

    await deleteProduct(id)

    return NextResponse.json({ success: true, message: "Product deleted successfully" }, { status: 200 })
  } catch (error) {
    console.error("DELETE error:", error)
    return NextResponse.json({ error: "Internal server error: " + error.message }, { status: 500 })
  }
}
