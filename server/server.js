import express from 'express'; import cors from 'cors'; import morgan from 'morgan'; import 'dotenv/config'
import auth from './routes/auth.js'; import destinations from './routes/destinations.js'; import bookings from './routes/bookings.js'; import tickets from './routes/tickets.js'; import admin from './routes/admin.js'; import { notFound, errors } from './middleware/errors.js'
const app = express(); const allowedOrigins=(process.env.CLIENT_URL||'http://localhost:5173').split(','); const isLocalOrigin=origin=>/^http:\/\/localhost:\d+$/.test(origin); app.use(cors({origin:(origin,done)=>!origin||allowedOrigins.includes(origin)||origin.endsWith('.vercel.app')||isLocalOrigin(origin)?done(null,true):done(new Error('Origin not allowed'))})); app.use(express.json()); app.use(morgan('dev'))
app.get('/api/health', (_,res) => res.json({ status: 'ok' })); app.use('/api/auth',auth); app.use('/api/destinations',destinations); app.use('/api/bookings',bookings); app.use('/api/tickets',tickets); app.use('/api/admin',admin); app.use(notFound); app.use(errors)
if (!process.env.VERCEL) app.listen(process.env.PORT || 5000, () => console.log('Tourify API ready'))
export default app
