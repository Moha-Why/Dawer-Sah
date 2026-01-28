// app/product/[id]/page.jsx - SERVER COMPONENT
import ProductDetailClient from './ProductDetailClient'
import { getAllProducts, getProductById, getRelatedProducts } from '@/lib/productService'
import { notFound } from 'next/navigation'

export default async function ProductDetailPage({ params }) {
  const { id } = await params
  
  try {
    console.log(`📦 Loading product ${id} with REAL Supabase data...`)
    
    const product = await getProductById(id)
    
    if (!product) {
      console.log(`❌ Product ${id} not found in Supabase`)
      notFound()
    }

    const relatedProducts = await getRelatedProducts(product, 8)

    return (
      <div className="min-h-screen pt-16">
        <ProductDetailClient 
          productId={id} 
          initialProduct={product}
          initialRelatedProducts={relatedProducts}
        />
      </div>
    )
    
  } catch (error) {
    console.error(`❌ Error loading product ${id}:`, error)
    notFound()
  }
}

// Metadata function
export async function generateMetadata({ params }) {
  const { id } = await params
  
  try {
    const product = await getProductById(id)
    
    if (!product) {
      return {
        title: 'Product Not Found - Wn Store',
        description: 'The requested product could not be found.'
      }
    }

    const price = product.newprice || product.price
    const discountText = product.newprice ? ` - ${Math.round((1 - product.newprice / product.price) * 100)}% OFF` : ''
    
    return {
      title: `${product.name} - ${price} LE${discountText} | Wn Store`,
      description: product.description || `Shop ${product.name} at Wn Store.`,
      openGraph: {
        title: product.name,
        description: product.description || `Shop ${product.name} at Wn Store`,
        type: 'website',
        url: `https://wn-store.vercel.app/product/${id}`,
        siteName: 'Wn Store',
        images: product.pictures?.map(pic => ({
          url: pic,
          width: 800,
          height: 1000,
          alt: product.name
        })) || []
      }
    }
  } catch (error) {
    return {
      title: 'Product - Wn Store',
      description: 'Fashion product at Wn Store'
    }
  }
}

export const dynamic = 'force-dynamic'
export const revalidate = 3600