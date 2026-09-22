import { Router } from 'express'
import { supabase } from '../config/supabase.js'

const router = Router()
const visitors = new Map()
const WINDOW_MS = 60_000
const MAX_REQUESTS = 20

function allowed(ip) {
  const now = Date.now()
  const recent = (visitors.get(ip) || []).filter(time => now - time < WINDOW_MS)
  if (recent.length >= MAX_REQUESTS) {
    visitors.set(ip, recent)
    return false
  }
  recent.push(now)
  visitors.set(ip, recent)
  return true
}

function isIndonesian(text) {
  return /\b(halo|hai|tolong|wisata|tiket|destinasi|harga|keluarga|liburan|berapa|yang|untuk|dimana|di mana)\b/i.test(text)
}

function fallbackReply(text, destinations, indonesian) {
  const query = text.toLowerCase()
  const family = /family|keluarga|anak|kid|children/.test(query)
  const water = /water|air|water park|kolam/.test(query)
  const nature = /nature|alam|wildlife|satwa|safari/.test(query)
  const matches = destinations.filter(item => {
    const haystack = `${item.name} ${item.category} ${item.description}`.toLowerCase()
    return (family && /family|anak|all ages|water park|theme park/.test(haystack)) ||
      (water && /water/.test(haystack)) || (nature && /nature|wildlife|safari/.test(haystack))
  }).slice(0, 3)
  const picks = (matches.length ? matches : destinations.slice(0, 3))
    .map(item => `${item.name} (${item.category}, ${item.location})`)
    .join(', ')

  if (indonesian) {
    return family
      ? `Untuk liburan keluarga, saya merekomendasikan ${picks || 'destinasi pilihan Tourify'}. Semua rekomendasi berasal dari daftar destinasi Tourify.`
      : `Saya merekomendasikan ${picks || 'destinasi pilihan Tourify'}. Coba tanyakan kategori seperti water park, nature, atau tempat untuk keluarga.`
  }
  return family
    ? `For a family trip, I recommend ${picks || 'a Tourify destination'}. These suggestions come from Tourify’s destination list.`
    : `I recommend ${picks || 'a Tourify destination'}. Try asking about water parks, nature, or family-friendly places.`
}

async function getDestinations() {
  const { data, error } = await supabase.from('destinations')
    .select('name,slug,category,location,description,price,rating')
    .order('rating', { ascending: false }).limit(12)
  if (error) throw error
  return data || []
}

async function askProvider(messages, destinations) {
  const base = (process.env.AI_BASE_URL || 'https://maas.qwencloudapi.com/compatible-mode/v1').replace(/\/$/, '')
  const apiKey = process.env.DASHSCOPE_API_KEY || process.env.AI_API_KEY
  const model = process.env.AI_MODEL || 'qwen3.8-flash'
  if (!apiKey) return null
  const endpoint = base.endsWith('/chat/completions') ? base : `${base}/chat/completions`
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model,
      temperature: 0.35,
      max_tokens: 350,
      messages: [
        { role: 'system', content: `You are Tourify's concise travel assistant. Reply in the same language as the visitor (Indonesian or English). Recommend only destinations in this data and never invent prices, availability, bookings, or ticket status. Explain that booking happens on the destination page. Destination data: ${JSON.stringify(destinations)}` },
        ...messages
      ]
    })
  })
  if (!response.ok) throw new Error(`AI provider returned ${response.status}`)
  const payload = await response.json()
  return payload.choices?.[0]?.message?.content?.trim() || null
}

router.post('/', async (req, res, next) => {
  try {
    if (!allowed(req.ip)) return res.status(429).json({ message: 'Please wait a moment before sending another message.' })
    const raw = Array.isArray(req.body?.messages) ? req.body.messages : []
    const messages = raw.filter(item => ['user', 'assistant'].includes(item?.role) && typeof item.content === 'string')
      .slice(-8).map(item => ({ role: item.role, content: item.content.slice(0, 1000) }))
    const latest = [...messages].reverse().find(item => item.role === 'user')?.content || ''
    if (!latest) return res.status(400).json({ message: 'Please enter a message.' })
    const destinations = await getDestinations()
    let reply = null
    try { reply = await askProvider(messages, destinations) } catch (error) { console.warn('AI provider unavailable:', error.message) }
    res.json({ reply: reply || fallbackReply(latest, destinations, isIndonesian(latest)), source: reply ? 'ai' : 'fallback' })
  } catch (error) {
    next(error)
  }
})

export default router
