/**
 * SFHT Ascent - Webhook Server (Pure Node.js - ES Module)
 * Handles Dodo Payments webhooks for payment verification
 *
 * Usage:
 *   1. Copy .env.example to .env and fill in your actual API keys
 *   2. Run: node server/webhook.js
 *   3. Use ngrok to expose: npx ngrok http 3001
 *   4. Add the ngrok URL to Dodo Dashboard as webhook endpoint
 *
 * Security:
 *   - All sensitive keys are stored in .env (never commit this file!)
 *   - .env is already in .gitignore
 *   - Use .env.example as a template for required variables
 */

import http from 'http'
import https from 'https'
import crypto from 'crypto'
import { config } from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

// ============== CONFIGURATION ==============
// Load environment variables from .env file
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
config({ path: join(__dirname, '..', '.env') })

// Validate required environment variables
const requiredEnvVars = ['SUPABASE_URL', 'SUPABASE_SERVICE_KEY', 'DODO_API_KEY']
const missing = requiredEnvVars.filter(key => !process.env[key])

if (missing.length > 0) {
    console.error('❌ Missing required environment variables:', missing.join(', '))
    console.error('Please check your .env file in the root directory')
    process.exit(1)
}

const PORT = process.env.PORT || 3001
const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY
const DODO_API_KEY = process.env.DODO_API_KEY
// Dodo API Base URLs: test.dodopayments.com (test) or live.dodopayments.com (production)
const DODO_API_BASE = process.env.DODO_API_BASE || 'https://test.dodopayments.com'
const DODO_WEBHOOK_SECRET = process.env.DODO_WEBHOOK_SECRET || ''

// ============================================

/**
 * Make a request to Supabase REST API
 */
function supabaseRequest(method, path, body = null) {
    return new Promise((resolve, reject) => {
        const url = new URL(path, SUPABASE_URL)
        
        const options = {
            hostname: url.hostname,
            path: url.pathname + url.search,
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'apikey': SUPABASE_SERVICE_KEY,
                'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`
            }
        }

        const req = https.request(options, (res) => {
            let data = ''
            res.on('data', chunk => data += chunk)
            res.on('end', () => {
                try {
                    resolve({ status: res.statusCode, data: JSON.parse(data || '{}') })
                } catch {
                    resolve({ status: res.statusCode, data: data })
                }
            })
        })

        req.on('error', reject)
        
        if (body) {
            req.write(JSON.stringify(body))
        }
        req.end()
    })
}

/**
 * Make a request to Dodo Payments API
 */
function dodoApiRequest(method, path) {
    return new Promise((resolve, reject) => {
        const url = new URL(path, DODO_API_BASE)
        
        const options = {
            hostname: url.hostname,
            path: url.pathname + url.search,
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${DODO_API_KEY}`
            }
        }

        const req = https.request(options, (res) => {
            let data = ''
            res.on('data', chunk => data += chunk)
            res.on('end', () => {
                try {
                    resolve({ status: res.statusCode, data: JSON.parse(data || '{}') })
                } catch {
                    resolve({ status: res.statusCode, data: data })
                }
            })
        })

        req.on('error', reject)
        req.end()
    })
}

/**
 * Verify payment and upgrade user
 * Called by frontend after redirect from Dodo
 */
async function verifyPaymentAndUpgrade(email) {
    console.log(`\n🔍 Verifying payment for: ${email}`)
    console.log(`📡 Using Dodo API: ${DODO_API_BASE}`)

    try {
        // Get recent payments from Dodo API
        const paymentsRes = await dodoApiRequest('GET', '/payments?limit=10')
        
        if (paymentsRes.status !== 200) {
            console.error('❌ Failed to fetch payments:', paymentsRes.data)
            return { success: false, error: 'Failed to fetch payments from Dodo' }
        }

        const payments = paymentsRes.data.items || paymentsRes.data || []
        
        // Find a successful payment for this email
        const payment = payments.find(p => 
            (p.customer?.email?.toLowerCase() === email.toLowerCase() ||
             p.metadata?.email?.toLowerCase() === email.toLowerCase()) &&
            (p.status === 'succeeded' || p.status === 'completed' || p.status === 'paid')
        )

        if (!payment) {
            console.warn('⚠️ No successful payment found for this email')
            return { success: false, error: 'No successful payment found' }
        }

        console.log(`✅ Found payment: ${payment.id}`)

        // Find user in Supabase
        const listRes = await supabaseRequest('GET', '/auth/v1/admin/users')
        
        if (listRes.status !== 200) {
            console.error('❌ Failed to list users:', listRes.data)
            return { success: false, error: 'Failed to query users' }
        }

        const users = listRes.data.users || listRes.data || []
        const user = users.find(u => u.email?.toLowerCase() === email.toLowerCase())

        if (!user) {
            console.warn(`⚠️ User not found for email: ${email}`)
            return { success: false, error: 'User not found' }
        }

        // Update user to Pro
        const updateRes = await supabaseRequest(
            'PUT',
            `/auth/v1/admin/users/${user.id}`,
            { user_metadata: { plan_type: 'pro' } }
        )

        if (updateRes.status !== 200) {
            console.error('❌ Failed to update user:', updateRes.data)
            return { success: false, error: 'Failed to upgrade user' }
        }

        console.log(`✅ User ${email} upgraded to Pro!`)

        // Record transaction
        await supabaseRequest('POST', '/rest/v1/transactions', {
            user_id: user.id,
            provider: 'dodopayments',
            plan_name: 'summit_pro',
            amount: payment.amount || 7.00,
            currency: payment.currency || 'USD',
            status: 'succeeded',
            provider_txn_id: payment.id
        })

        return { success: true, message: 'Payment verified and user upgraded to Pro' }

    } catch (error) {
        console.error('❌ Verification error:', error)
        return { success: false, error: error.message }
    }
}

/**
 * Verify Dodo webhook signature
 */
function verifySignature(payload, signature) {
    if (!DODO_WEBHOOK_SECRET) return true // Skip if not configured
    
    const expectedSig = crypto
        .createHmac('sha256', DODO_WEBHOOK_SECRET)
        .update(payload)
        .digest('hex')
    
    return signature === expectedSig || signature === `sha256=${expectedSig}`
}

/**
 * Handle incoming webhook from Dodo
 */
async function handleDodoWebhook(body, signature) {
    console.log('\n📩 Webhook received from Dodo')
    console.log('Timestamp:', new Date().toISOString())
    
    // Parse the event
    let event
    try {
        event = JSON.parse(body)
    } catch (e) {
        console.error('❌ Failed to parse webhook body')
        return { success: false, error: 'Invalid JSON' }
    }

    console.log('Event:', JSON.stringify(event, null, 2))

    // Verify signature
    if (DODO_WEBHOOK_SECRET && !verifySignature(body, signature)) {
        console.error('❌ Invalid signature')
        return { success: false, error: 'Invalid signature' }
    }
    console.log('✅ Signature OK (or skipped)')

    // Check if this is a successful payment
    const eventType = event.type || event.event_type || event.event || ''
    const status = event.status || event.data?.status || ''
    
    const isSuccess = 
        eventType.toLowerCase().includes('success') ||
        eventType.toLowerCase().includes('completed') ||
        eventType.toLowerCase().includes('paid') ||
        status === 'succeeded' ||
        status === 'completed' ||
        status === 'paid'

    if (!isSuccess) {
        console.log('ℹ️ Event is not a success event, ignoring')
        return { success: true, message: 'Event acknowledged but not a success event' }
    }

    // Extract customer info
    const customerEmail = 
        event.customer?.email ||
        event.data?.customer?.email ||
        event.buyer?.email ||
        event.metadata?.email ||
        event.email

    const paymentId = event.payment_id || event.id || event.data?.id || `dodo_${Date.now()}`
    const amount = event.amount || event.data?.amount || 7.00

    console.log(`💰 Payment Success! Email: ${customerEmail}, ID: ${paymentId}`)

    if (!customerEmail) {
        console.warn('⚠️ No customer email found in webhook payload')
        return { success: true, message: 'No email to process' }
    }

    // Find user in Supabase by email and upgrade to Pro
    try {
        // Use Supabase Auth Admin API to find user
        const listRes = await supabaseRequest('GET', '/auth/v1/admin/users')
        
        if (listRes.status !== 200) {
            console.error('❌ Failed to list users:', listRes.data)
            return { success: false, error: 'Failed to query users' }
        }

        const users = listRes.data.users || listRes.data || []
        const user = users.find(u => u.email?.toLowerCase() === customerEmail.toLowerCase())

        if (!user) {
            console.warn(`⚠️ User not found for email: ${customerEmail}`)
            return { success: true, message: 'User not found' }
        }

        // Update user metadata to Pro
        const updateRes = await supabaseRequest(
            'PUT',
            `/auth/v1/admin/users/${user.id}`,
            { user_metadata: { plan_type: 'pro' } }
        )

        if (updateRes.status !== 200) {
            console.error('❌ Failed to update user:', updateRes.data)
            return { success: false, error: 'Failed to update user' }
        }

        console.log(`✅ User ${customerEmail} upgraded to Pro!`)

        // Record transaction
        const txnRes = await supabaseRequest('POST', '/rest/v1/transactions', {
            user_id: user.id,
            provider: 'dodopayments',
            plan_name: 'summit_pro',
            amount: amount,
            currency: 'USD',
            status: 'succeeded',
            provider_txn_id: paymentId
        })

        if (txnRes.status >= 400) {
            console.warn('⚠️ Transaction record failed:', txnRes.data)
        } else {
            console.log('✅ Transaction recorded')
        }

        return { success: true, message: `User ${customerEmail} upgraded to Pro` }

    } catch (error) {
        console.error('❌ Error processing webhook:', error)
        return { success: false, error: error.message }
    }
}

/**
 * Parse request body
 */
function getBody(req) {
    return new Promise((resolve, reject) => {
        let body = ''
        req.on('data', chunk => body += chunk)
        req.on('end', () => resolve(body))
        req.on('error', reject)
    })
}

/**
 * Main HTTP Server
 */
const server = http.createServer(async (req, res) => {
    // CORS Headers
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

    // Handle preflight
    if (req.method === 'OPTIONS') {
        res.writeHead(204)
        return res.end()
    }

    // Root endpoint - show config (without secrets)
    if (req.method === 'GET' && req.url === '/') {
        res.writeHead(200, { 'Content-Type': 'application/json' })
        return res.end(JSON.stringify({
            status: 'running',
            service: 'sfht-webhook',
            config: {
                dodo_api_base: DODO_API_BASE,
                supabase_url: SUPABASE_URL,
                has_dodo_key: !!DODO_API_KEY,
                has_supabase_key: !!SUPABASE_SERVICE_KEY,
                has_webhook_secret: !!DODO_WEBHOOK_SECRET
            }
        }))
    }

    // Health check
    if (req.method === 'GET' && req.url === '/health') {
        res.writeHead(200, { 'Content-Type': 'application/json' })
        return res.end(JSON.stringify({ status: 'ok', service: 'sfht-webhook' }))
    }

    // Webhook endpoint
    if (req.method === 'POST' && req.url === '/webhook/dodo') {
        try {
            const body = await getBody(req)
            const signature = req.headers['x-dodo-signature'] || 
                              req.headers['dodo-signature'] || 
                              req.headers['x-webhook-signature'] || ''
            
            const result = await handleDodoWebhook(body, signature)
            
            res.writeHead(200, { 'Content-Type': 'application/json' })
            return res.end(JSON.stringify({ received: true, ...result }))
        } catch (error) {
            console.error('Server error:', error)
            res.writeHead(200, { 'Content-Type': 'application/json' })
            return res.end(JSON.stringify({ received: true, error: error.message }))
        }
    }

    // Payment verification endpoint (called by frontend after redirect)
    if (req.method === 'POST' && req.url === '/verify-payment') {
        try {
            const body = await getBody(req)
            const { email } = JSON.parse(body)
            
            if (!email) {
                res.writeHead(400, { 'Content-Type': 'application/json' })
                return res.end(JSON.stringify({ success: false, error: 'Email required' }))
            }
            
            const result = await verifyPaymentAndUpgrade(email)
            
            res.writeHead(200, { 'Content-Type': 'application/json' })
            return res.end(JSON.stringify(result))
        } catch (error) {
            console.error('Verify error:', error)
            res.writeHead(500, { 'Content-Type': 'application/json' })
            return res.end(JSON.stringify({ success: false, error: error.message }))
        }
    }

    // 404 for other routes
    res.writeHead(404, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ error: 'Not found' }))
})

// Start server
server.listen(PORT, () => {
    console.log('═══════════════════════════════════════════════')
    console.log('  🚀 SFHT Ascent Webhook Server')
    console.log('═══════════════════════════════════════════════')
    console.log(`  Local:    http://localhost:${PORT}`)
    console.log(`  Webhook:  http://localhost:${PORT}/webhook/dodo`)
    console.log('')
    console.log('  📌 To expose to internet (for Dodo):')
    console.log('     npx ngrok http 3001')
    console.log('')
    console.log('  Then add the ngrok URL to Dodo Dashboard:')
    console.log('     https://xxxx.ngrok.io/webhook/dodo')
    console.log('═══════════════════════════════════════════════')
})
