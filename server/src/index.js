import express from 'express'
import cors from 'cors'
import webpush from 'web-push'
import dotenv from 'dotenv'

dotenv.config()

const app = express()
app.use(cors())
app.use(express.json())

const PORT = process.env.PORT || 4001

// Generate once and store; for demo we generate at runtime if missing
let VAPID_PUBLIC = process.env.VAPID_PUBLIC_KEY
let VAPID_PRIVATE = process.env.VAPID_PRIVATE_KEY
if (!VAPID_PUBLIC || !VAPID_PRIVATE) {
	const keys = webpush.generateVAPIDKeys()
	VAPID_PUBLIC = keys.publicKey
	VAPID_PRIVATE = keys.privateKey
	console.log('Generated VAPID keys (save these to .env):')
	console.log('VAPID_PUBLIC_KEY=', VAPID_PUBLIC)
	console.log('VAPID_PRIVATE_KEY=', VAPID_PRIVATE)
}

webpush.setVapidDetails('mailto:you@example.com', VAPID_PUBLIC, VAPID_PRIVATE)

const subscriptions = new Set()

app.get('/api/vapid-public-key', (_req, res) => {
	res.json({ publicKey: VAPID_PUBLIC })
})

app.post('/api/subscribe', (req, res) => {
	const sub = req.body
	if (!sub || !sub.endpoint) return res.status(400).json({ error: 'Invalid subscription' })
	subscriptions.add(sub)
	res.json({ ok: true })
})

app.post('/api/notify', async (req, res) => {
	const { title = 'Task PWA', body = 'Hello', data } = req.body || {}
	const payload = JSON.stringify({ title, body, data })
	const results = []
	for (const sub of subscriptions) {
		try {
			await webpush.sendNotification(sub, payload)
			results.push({ endpoint: sub.endpoint, ok: true })
		} catch (err) {
			results.push({ endpoint: sub.endpoint, ok: false, error: String(err) })
		}
	}
	res.json({ sent: results.length, results })
})

app.listen(PORT, () => console.log(`Push server running on http://localhost:${PORT}`)) 