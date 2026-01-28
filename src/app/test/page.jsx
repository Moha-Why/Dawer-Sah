// Test page to verify Supabase data
import { createClient } from "@supabase/supabase-js"

export const dynamic = 'force-dynamic'

async function getTestData() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  console.log('🔍 Test Page - Checking environment variables:')
  console.log('URL exists:', !!supabaseUrl)
  console.log('Key exists:', !!supabaseKey)

  if (!supabaseUrl || !supabaseKey) {
    return {
      error: 'Missing environment variables',
      hasUrl: !!supabaseUrl,
      hasKey: !!supabaseKey
    }
  }

  const supabase = createClient(supabaseUrl, supabaseKey)

  try {
    console.log('📡 Test Page - Fetching products...')

    const { data, error } = await supabase
      .from('products')
      .select('id, name, price, newprice, type')
      .limit(5)

    if (error) {
      console.error('❌ Test Page - Error:', error)
      return { error: error.message }
    }

    console.log(`✅ Test Page - Fetched ${data?.length || 0} products`)
    return { data, count: data?.length || 0 }

  } catch (err) {
    console.error('❌ Test Page - Caught error:', err)
    return { error: err.message }
  }
}

export default async function TestPage() {
  const result = await getTestData()

  return (
    <div style={{ padding: '40px', fontFamily: 'monospace' }}>
      <h1>🧪 Supabase Connection Test</h1>

      <div style={{ background: '#f5f5f5', padding: '20px', marginTop: '20px', borderRadius: '8px' }}>
        <h2>Environment Variables:</h2>
        <p>✅ NEXT_PUBLIC_SUPABASE_URL: {process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : '❌ Missing'}</p>
        <p>✅ NEXT_PUBLIC_SUPABASE_ANON_KEY: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : '❌ Missing'}</p>
      </div>

      {result.error ? (
        <div style={{ background: '#ffebee', padding: '20px', marginTop: '20px', borderRadius: '8px', color: '#c62828' }}>
          <h2>❌ Error</h2>
          <p>{result.error}</p>
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
      ) : (
        <div style={{ background: '#e8f5e9', padding: '20px', marginTop: '20px', borderRadius: '8px' }}>
          <h2>✅ Success!</h2>
          <p><strong>Products found: {result.count}</strong></p>

          <h3 style={{ marginTop: '20px' }}>Products:</h3>
          <ul>
            {result.data?.map((product) => (
              <li key={product.id} style={{ marginBottom: '10px' }}>
                <strong>{product.name}</strong> - {product.price} LE
                {product.newprice && ` (Sale: ${product.newprice} LE)`}
                <br />
                <small>Type: {product.type} | ID: {product.id}</small>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
