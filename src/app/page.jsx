// app/page.jsx - Fixed for Vercel Deployment
import Nav from "./Nav"
import StoreSSG from "../app/StoreSSG"
import { getAllProducts, getSaleProducts, getProductCategories } from "@/lib/productService"

/**
 * ✅ FIXED: Home Page without Build Mode Issues
 */
export default async function Home() {
  console.log('🏠 Building home page...')
  
  let allProducts = []
  let saleProducts = []
  let categories = []
  
  try {
    // ✅ FIXED: Always fetch real data, let fallbacks handle errors
    console.log('📡 Fetching data from Supabase...')
    
    // Parallel data fetching with individual error handling
    const [productsResult, saleResult, categoriesResult] = await Promise.allSettled([
      getAllProducts(false),
      getSaleProducts(4),
      getProductCategories()
    ])
    
    // Handle each result individually
    if (productsResult.status === 'fulfilled') {
      allProducts = productsResult.value || []
      console.log(`✅ Products loaded: ${allProducts.length}`)
    } else {
      console.error('❌ Failed to load products:', productsResult.reason)
      allProducts = []
    }
    
    if (saleResult.status === 'fulfilled') {
      saleProducts = saleResult.value || []
      console.log(`✅ Sale products loaded: ${saleProducts.length}`)
    } else {
      console.error('❌ Failed to load sale products:', saleResult.reason)
      saleProducts = []
    }
    
    if (categoriesResult.status === 'fulfilled') {
      categories = categoriesResult.value || []
      console.log(`✅ Categories loaded: ${categories.length}`)
    } else {
      console.error('❌ Failed to load categories:', categoriesResult.reason)
      categories = []
    }

    console.log(`✅ Home page data loaded:`)
    console.log(`   - Products: ${allProducts.length}`)
    console.log(`   - Sale products: ${saleProducts.length}`)
    console.log(`   - Categories: ${categories.length}`)
    
  } catch (error) {
    console.error('❌ Error loading home page data:', error)
    
    // Use empty fallback to prevent build failure
    console.log('⚠️ Using empty fallback data for home page')
    allProducts = []
    saleProducts = []
    categories = []
  }

  return (
    <>
      <Nav />
      <StoreSSG
        initialProducts={allProducts}
        initialSaleProducts={saleProducts}
        initialCategories={categories}
      />
    </>
  )
}

/**
 * Enhanced Metadata for SEO
 */
export const metadata = {
  title: "Dawer Sah - Quality Used Cars for Sale",
  description: "Find your perfect pre-owned vehicle at Dawer Sah. Wide selection of sedans, SUVs, trucks and more from top brands. Fair prices and trusted service.",
  keywords: "used cars, pre-owned vehicles, cars for sale, sedans, SUVs, trucks, Toyota, BMW, Mercedes, Honda, Hyundai",
  authors: [{ name: "Dawer Sah" }],
  creator: "Dawer Sah",
  publisher: "Dawer Sah",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Dawer Sah",
    title: "Dawer Sah - Quality Used Cars for Sale",
    description: "Find your perfect pre-owned vehicle at Dawer Sah.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Dawer Sah - Used Cars",
        type: "image/jpeg"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Dawer Sah - Quality Used Cars for Sale",
    description: "Find your perfect pre-owned vehicle at Dawer Sah.",
    images: ["/og-image.jpg"],
    creator: "@dawersah"
  }
}

/**
 * ✅ FIXED: Build Configuration for Vercel
 */
export const dynamic = 'force-dynamic' // Allow real data fetching
export const revalidate = 0 // Disable static caching, use in-memory cache instead
export const fetchCache = 'default-cache'
export const preferredRegion = 'auto'