// File: src/app/api/products/[id]/route.js

import { supabaseServer } from "@/lib/supabaseClient";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  try {
    const { id } = await params;

    const { data, error } = await supabaseServer()
      .from("products")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      return NextResponse.json(
        { error: "Product not found: " + error.message },
        { status: 404 }
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("GET error:", error);
    return NextResponse.json(
      { error: "Internal server error: " + error.message },
      { status: 500 }
    );
  }
}

export async function PUT(req, { params }) {
  try {
    const { id } = await params;
    const body = await req.json();



    const { data, error } = await supabaseServer()
      .from("products")
      .update({
        name: body.name,
        price: body.price,
        newprice: body.newprice || null,
        colors: body.colors || [],
        sizes: body.sizes || [],
        type: body.type || null,
        description: body.description || "",
        pictures: body.pictures || []
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Supabase update error:", error);
      return NextResponse.json(
        { error: "Failed to update product: " + error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("PUT error:", error);
    return NextResponse.json(
      { error: "Internal server error: " + error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(req, { params }) {
  try {
    const { id } = await params;



    if (!id) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 }
      );
    }

    const { data: product, error: fetchError } = await supabaseServer()
      .from("products")
      .select("pictures")
      .eq("id", id)
      .single();

    if (fetchError && fetchError.code !== "PGRST116") {
      console.error("Error fetching product:", fetchError);
    }

    if (product?.pictures && product.pictures.length > 0) {
      try {
        const imageUrls = product.pictures
          .map((url) => {
            if (url.includes("/product-images/")) {
              const urlParts = url.split("/product-images/");
              return urlParts[urlParts.length - 1];
            }
            return null;
          })
          .filter(Boolean);

        if (imageUrls.length > 0) {
          const { error: storageError } = await supabaseServer()
            .storage
            .from("product-images")
            .remove(imageUrls);

          if (storageError) {
            console.error("Error deleting images:", storageError);
          } else {

          }
        }
      } catch (storageError) {
        console.error("Storage deletion error:", storageError);
      }
    }

    const { error } = await supabaseServer()
      .from("products")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Supabase delete error:", error);
      return NextResponse.json(
        { error: "Failed to delete product: " + error.message },
        { status: 500 }
      );
    }


    return NextResponse.json(
      { success: true, message: "Product deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("DELETE error:", error);
    return NextResponse.json(
      { error: "Internal server error: " + error.message },
      { status: 500 }
    );
  }
}
