/**
 * SFHT Ascent - Webhook Server
 * Handles Dodo Payments webhooks for payment verification
 */

const express = require('express')
const cors = require('cors')
const crypto = require('crypto')
const { createClient } = require('@supabase/supabase-js')

const app = express()
const PORT = process.env.PORT || 3001

// Supabase Admin Client (uses service_role key for elevated privileges)
const supabaseUrl = process.env.SUPABASE_URL || 'YOUR_SUPABASE_URL'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || 'YOUR_SERVICE_ROLE_KEY'
const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Dodo Webhook Secret (user will provide this)
const DODO_WEBHOOK_SECRET = process.env.DODO_WEBHOOK_SECRET || 'YOUR_WEBHOOK_SECRET'

// Middleware
app.use(cors())
app.use(express.json({ 
    verify: (req, res, buf) => {
        // Store raw body for signature verification
        req.rawBody = buf.toString()
    }
}))

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'sfht-ascent-webhook' })
})

/**
 * Dodo Payments Webhook Endpoint
 * POST /webhook/dodo
 */
app.post('/webhook/dodo', async (req, res) => {
    console.log('📩 Webhook received from Dodo')
    
    try {
        // 1. Verify Signature (if webhook secret is configured)
        const signature = req.headers['x-dodo-signature'] || req.headers['dodo-signature']
        
        if (DODO_WEBHOOK_SECRET && DODO_WEBHOOK_SECRET !== 'YOUR_WEBHOOK_SECRET') {
            const expectedSignature = crypto
                .createHmac('sha256', DODO_WEBHOOK_SECRET)
                .update(req.rawBody)
                .digest('hex')
            
            if (signature !== expectedSignature) {
                console.error('❌ Invalid webhook signature')
                return res.status(401).json({ error: 'Invalid signature' })
            }
            console.log('✅ Signature verified')
        } else {
            console.warn('⚠️ Webhook secret not configured, skipping signature verification')
        }

        // 2. Parse Event
        const event = req.body
        console.log('Event Type:', event.type || event.event_type)
        console.log('Event Data:', JSON.stringify(event, null, 2))

        // 3. Handle Payment Events
        // Dodo might use different event names like 'payment.succeeded', 'payment_intent.succeeded', etc.
        const eventType = event.type || event.event_type || ''
        const isSuccessEvent = 
            eventType.includes('succeeded') || 
            eventType.includes('success') ||
            eventType.includes('completed') ||
            event.status === 'succeeded' ||
            event.status === 'completed'

        if (isSuccessEvent) {
            // Extract customer email or user identifier
            const customerEmail = event.customer?.email || 
                                  event.data?.customer?.email || 
                                  event.metadata?.email ||
                                  event.buyer_email

            const paymentId = event.payment_id || event.id || event.data?.id

            console.log(`💰 Payment succeeded! Customer: ${customerEmail}, PaymentID: ${paymentId}`)

            if (customerEmail) {
                // Find user by email and upgrade to Pro
                const { data: users, error: findError } = await supabase
                    .from('auth.users')
                    .select('id')
                    .eq('email', customerEmail)
                    .single()

                if (findError) {
                    // Try using auth admin API instead
                    const { data: authUser, error: authError } = await supabase.auth.admin.listUsers()
                    const matchedUser = authUser?.users?.find(u => u.email === customerEmail)
                    
                    if (matchedUser) {
                        // Update user metadata
                        const { error: updateError } = await supabase.auth.admin.updateUserById(
                            matchedUser.id,
                            { user_metadata: { plan_type: 'pro' } }
                        )

                        if (updateError) {
                            console.error('❌ Failed to update user:', updateError)
                        } else {
                            console.log(`✅ User ${customerEmail} upgraded to Pro!`)
                            
                            // Record transaction
                            await supabase.from('transactions').insert([{
                                user_id: matchedUser.id,
                                provider: 'dodopayments',
                                plan_name: 'summit_pro',
                                amount: 7.00,
                                currency: 'USD',
                                status: 'succeeded',
                                provider_txn_id: paymentId
                            }])
                        }
                    }
                }
            }
        }

        // Always respond 200 to acknowledge receipt
        res.status(200).json({ received: true })

    } catch (error) {
        console.error('❌ Webhook processing error:', error)
        // Still return 200 to prevent Dodo from retrying
        res.status(200).json({ received: true, error: error.message })
    }
})

// Start Server
app.listen(PORT, () => {
    console.log(`🚀 Webhook server running on http://localhost:${PORT}`)
    console.log(`📌 Webhook URL: http://localhost:${PORT}/webhook/dodo`)
    console.log('')
    console.log('⚠️  For external access (Dodo needs to reach this):')
    console.log('    Run: npx ngrok http 3001')
    console.log('    Then use the ngrok URL as your webhook endpoint in Dodo Dashboard')
})
