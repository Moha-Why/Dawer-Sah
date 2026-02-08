// lib/productService.js - JSON-based data layer (database-ready abstraction)
import fs from 'fs'
import path from 'path'

// Simple in-memory cache
let productsCache = null
let cacheTimestamp = null

/**
 * Read cars from JSON file
 * When switching to a database, only this function needs to change
 */
function readCarsFromFile() {
  const filePath = path.join(process.cwd(), 'data', 'cars.json')
  const fileContent = fs.readFileSync(filePath, 'utf-8')
  return JSON.parse(fileContent)
}

/**
 * Write cars to JSON file
 * When switching to a database, only this function needs to change
 */
function writeCarsToFile(cars) {
  const filePath = path.join(process.cwd(), 'data', 'cars.json')
  fs.writeFileSync(filePath, JSON.stringify(cars, null, 2), 'utf-8')
}

/**
 * Get all products (cars) with caching
 */
export async function getAllProducts(forceRefresh = false) {
  if (!forceRefresh && productsCache && cacheTimestamp) {
    return productsCache
  }

  try {
    const data = readCarsFromFile()

    productsCache = data.map(product => ({
      ...product,
      type: product.type ? product.type.toLowerCase() : product.type
    }))
    cacheTimestamp = Date.now()

    return productsCache
  } catch (error) {
    console.error('Error reading cars data:', error)
    return productsCache || getFallbackProducts()
  }
}

/**
 * Get product by ID
 */
export async function getProductById(id) {
  try {
    if (productsCache) {
      const cachedProduct = productsCache.find(p => p.id.toString() === id.toString())
      if (cachedProduct) return cachedProduct
    }

    const data = readCarsFromFile()
    const product = data.find(p => p.id.toString() === id.toString())
    return product || null
  } catch (error) {
    console.error(`Error fetching product ${id}:`, error)
    return null
  }
}

/**
 * Get related products by same type
 */
export async function getRelatedProducts(currentProduct, limit = 8) {
  if (!currentProduct) return []

  try {
    const allProducts = await getAllProducts(false)
    if (!allProducts || allProducts.length === 0) return []

    return allProducts
      .filter(p => p.type === currentProduct.type && p.id !== currentProduct.id)
      .slice(0, limit)
  } catch (error) {
    console.error('Error fetching related products:', error)
    return []
  }
}

/**
 * Get sale/discounted products
 */
export async function getSaleProducts(limit = 4) {
  try {
    const allProducts = await getAllProducts(false)
    if (!allProducts || allProducts.length === 0) return []

    return allProducts
      .filter(p => p.newprice && p.newprice > 0 && p.newprice < p.price)
      .slice(0, limit)
  } catch (error) {
    console.error('Error fetching sale products:', error)
    return []
  }
}

/**
 * Get product categories (vehicle body types)
 */
export async function getProductCategories() {
  try {
    const allProducts = await getAllProducts(false)
    if (!allProducts || allProducts.length === 0) return getFallbackCategories()

    const uniqueTypes = [...new Set(allProducts.map(p => p.type).filter(Boolean))]

    const categoryMapping = {
      "sedan": {
        name: "Sedans",
        description: "Comfortable and efficient sedans",
        image: "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=600&h=400&fit=crop"
      },
      "suv": {
        name: "SUVs",
        description: "Spacious and powerful SUVs",
        image: "https://images.unsplash.com/photo-1556189250-72ba954cfc2b?w=600&h=400&fit=crop"
      },
      "hatchback": {
        name: "Hatchbacks",
        description: "Compact and versatile hatchbacks",
        image: "/honda_hr.png"
      },
      "truck": {
        name: "Trucks",
        description: "Tough and capable trucks",
        image: "https://images.unsplash.com/photo-1559416523-140ddc3d238c?w=600&h=400&fit=crop"
      },
      "coupe": {
        name: "Coupes",
        description: "Sporty and stylish coupes",
        image: "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=600&h=400&fit=crop"
      },
      "van": {
        name: "Vans",
        description: "Practical and spacious vans",
        image: "https://images.unsplash.com/photo-1570733577524-3a047079e80d?w=600&h=400&fit=crop"
      }
    }

    const categories = uniqueTypes.map(type => {
      const mapping = categoryMapping[type.toLowerCase()] || {
        name: type.charAt(0).toUpperCase() + type.slice(1),
        description: `Browse our ${type} collection`,
        image: "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=600&h=400&fit=crop"
      }
      const productCount = allProducts.filter(p => p.type === type).length
      return { key: type, ...mapping, count: productCount }
    })

    return categories
  } catch (error) {
    console.error('Error fetching categories:', error)
    return getFallbackCategories()
  }
}

/**
 * Get unique brands from all products
 */
export async function getProductBrands() {
  try {
    const allProducts = await getAllProducts(false)
    if (!allProducts || allProducts.length === 0) return []

    const brands = [...new Set(allProducts.map(p => p.brand).filter(Boolean))]
    return brands.sort()
  } catch (error) {
    console.error('Error fetching brands:', error)
    return []
  }
}

/**
 * Add a new product (car) - writes to JSON
 */
export async function addProduct(product) {
  try {
    const cars = readCarsFromFile()
    const maxId = cars.length > 0 ? Math.max(...cars.map(c => c.id)) : 0
    const newCar = { ...product, id: maxId + 1 }
    cars.push(newCar)
    writeCarsToFile(cars)
    clearProductsCache()
    return newCar
  } catch (error) {
    console.error('Error adding product:', error)
    throw error
  }
}

/**
 * Update a product by ID
 */
export async function updateProduct(id, updateData) {
  try {
    const cars = readCarsFromFile()
    const index = cars.findIndex(c => c.id.toString() === id.toString())
    if (index === -1) throw new Error('Product not found')

    cars[index] = { ...cars[index], ...updateData }
    writeCarsToFile(cars)
    clearProductsCache()
    return cars[index]
  } catch (error) {
    console.error('Error updating product:', error)
    throw error
  }
}

/**
 * Delete a product by ID
 */
export async function deleteProduct(id) {
  try {
    const cars = readCarsFromFile()
    const filtered = cars.filter(c => c.id.toString() !== id.toString())
    if (filtered.length === cars.length) throw new Error('Product not found')

    writeCarsToFile(filtered)
    clearProductsCache()
    return true
  } catch (error) {
    console.error('Error deleting product:', error)
    throw error
  }
}

/**
 * Force refresh all data
 */
export async function forceRefreshAllData() {
  clearProductsCache()
  const products = await getAllProducts(true)
  return products
}

/**
 * Fallback products
 */
function getFallbackProducts() {
  return [
    {
      id: 1,
      name: "Toyota Camry 2020",
      brand: "Toyota",
      type: "sedan",
      year: 2020,
      mileage: 45000,
      transmission: "Automatic",
      fuelType: "Gasoline",
      engineSize: "2.5L",
      price: 450000,
      newprice: 420000,
      colors: ["white", "silver"],
      pictures: ["https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800&h=600&fit=crop"],
      description: "Well-maintained Toyota Camry",
      features: ["Cruise Control", "Bluetooth"]
    }
  ]
}

function getFallbackCategories() {
  return [
    { key: "sedan", name: "Sedans", description: "Comfortable sedans", image: "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=600&h=400&fit=crop", count: 0 },
    { key: "suv", name: "SUVs", description: "Spacious SUVs", image: "https://images.unsplash.com/photo-1556189250-72ba954cfc2b?w=600&h=400&fit=crop", count: 0 },
    { key: "truck", name: "Trucks", description: "Capable trucks", image: "https://images.unsplash.com/photo-1559416523-140ddc3d238c?w=600&h=400&fit=crop", count: 0 }
  ]
}

/**
 * Clear cache
 */
export function clearProductsCache() {
  productsCache = null
  cacheTimestamp = null
}

/**
 * Get cache info
 */
export function getCacheInfo() {
  return {
    hasCache: !!productsCache,
    cacheSize: productsCache ? productsCache.length : 0,
    cacheAge: cacheTimestamp ? Date.now() - cacheTimestamp : null,
    lastUpdated: cacheTimestamp ? new Date(cacheTimestamp).toISOString() : null,
    manualUpdateOnly: true
  }
}
