import { google } from 'googleapis'
import fs from 'fs'
import path from 'path'

export default async function handler(req, res) {
  try {
    const caminho = path.resolve(process.cwd(), 'credenciais/credenciaisReais.json')
    const raw = fs.readFileSync(caminho, 'utf-8')
    const credenciais = JSON.parse(raw)

    const auth = new google.auth.GoogleAuth({
      credentials: credenciais,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    })

    const client = await auth.getClient()
    const token = await client.getAccessToken()

    res.status(200).json({ token: token?.token || 'sem token' })
  } catch (err) {
    console.error('❌ Erro no teste-auth:', err)
    res.status(500).json({
      erro: err.message,
      detalhe: JSON.stringify(err, Object.getOwnPropertyNames(err)),
    })
  }
}
