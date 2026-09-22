import { useState } from 'react'
import { Bot, MessageCircle, Send, X } from 'lucide-react'
import api from '../services/api'

const prompts = ['Recommend a destination', 'Good for families?', 'Show me water parks']

export default function ChatWidget() {
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [messages, setMessages] = useState([{ role: 'assistant', content: 'Hi! Ask me about Tourify destinations, family trips, or water parks.' }])

  const send = async (value = input) => {
    const content = value.trim()
    if (!content || loading) return
    const next = [...messages, { role: 'user', content }]
    setMessages(next)
    setInput('')
    setLoading(true)
    try {
      const response = await api.post('/chat', { messages: next })
      setMessages([...next, { role: 'assistant', content: response.data.reply }])
    } catch (error) {
      setMessages([...next, { role: 'assistant', content: 'I’m having trouble connecting right now. Please browse our destinations directly and try again shortly.' }])
    } finally {
      setLoading(false)
    }
  }

  return <div className={`chat-widget${open ? ' is-open' : ''}`}>
    {open && <section className="chat-panel" aria-label="Tourify travel assistant">
      <header><div><Bot size={18}/><strong>Tourify Assistant</strong></div><button aria-label="Close chat" onClick={() => setOpen(false)}><X size={18}/></button></header>
      <div className="chat-messages">{messages.map((message, index) => <p className={`chat-message ${message.role}`} key={`${message.role}-${index}`}>{message.content}</p>)}{loading && <p className="chat-message assistant typing">Thinking…</p>}</div>
      {messages.length === 1 && <div className="chat-prompts">{prompts.map(prompt => <button key={prompt} onClick={() => send(prompt)}>{prompt}</button>)}</div>}
      <form className="chat-input" onSubmit={event => { event.preventDefault(); send() }}><input value={input} onChange={event => setInput(event.target.value)} placeholder="Ask about a destination…" aria-label="Message"/><button aria-label="Send message" disabled={loading || !input.trim()}><Send size={17}/></button></form>
    </section>}
    <button className="chat-launcher" aria-label={open ? 'Close assistant' : 'Open assistant'} onClick={() => setOpen(!open)}>{open ? <X/> : <MessageCircle/>}<span>{open ? 'Close' : 'Chat'}</span></button>
  </div>
}
