import { supabase } from '../supabase.js'

export async function requireAuth(req, res, next) {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) {
    console.log('requireAuth: no bearer token')
    return res.status(401).json({ error: 'לא מורשה' })
  }

  const token = header.split(' ')[1]
  const { data, error } = await supabase.auth.getUser(token)

  if (error || !data.user) {
    console.log('requireAuth: invalid token, error:', error?.message)
    return res.status(401).json({ error: 'טוקן לא תקין' })
  }

  req.user = data.user
  next()
}

export async function optionalAuth(req, res, next) {
  const header = req.headers.authorization
  if (header?.startsWith('Bearer ')) {
    const token = header.split(' ')[1]
    const { data } = await supabase.auth.getUser(token)
    req.user = data?.user || null
  } else {
    req.user = null
  }
  next()
}
