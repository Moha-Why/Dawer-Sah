// app/product/[id]/page.jsx - SERVER COMPONENT
import ProductDetailClient from './ProductDetailClient'
import { getAllProducts, getProductById, getRelatedProducts } from '@/lib/productService'
import { notFound } from 'next/navigation'

export default async function ProductDetailPage({ params }) {
  const { id } = await params
  
  try {
    console.log(`📦 Loading vehicle ${id}...`)
    
    const product = await getProductById(id)
    
    if (!product) {
      console.log(`❌ Vehicle ${id} not found`)
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
        title: 'Vehicle Not Found - Dawer Sah',
        description: 'The requested vehicle could not be found.'
      }
    }

    const price = product.newprice || product.price
    const discountText = product.newprice ? ` - ${Math.round((1 - product.newprice / product.price) * 100)}% OFF` : ''
    
    return {
      title: `${product.name} - ${price} EGP${discountText} | Dawer Sah`,
      description: product.description || `View ${product.name} at Dawer Sah.`,
      openGraph: {
        title: product.name,
        description: product.description || `View ${product.name} at Dawer Sah`,
        type: 'website',
        url: `https://dawer-sah.vercel.app/product/${id}`,
        siteName: 'Dawer Sah',
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
      title: 'Vehicle - Dawer Sah',
      description: 'Quality pre-owned vehicle at Dawer Sah'
    }
  }
}

export const dynamic = 'force-dynamic'
export const revalidate = 3600