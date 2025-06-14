import { google } from 'googleapis'
import credenciais from '../../credenciais/credenciais.json'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Método não permitido')

  const { produto, quantidade, valorUnitario, data } = req.body
  if (!produto || !quantidade || !data || !valorUnitario) {
    return res.status(400).json({ erro: 'Dados incompletos' })
  }

  try {
    const auth = new google.auth.GoogleAuth({
      credentials: credenciais,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    })

    const sheets = google.sheets({ version: 'v4', auth })
    const spreadsheetId = process.env.SHEET_ID

    // 👉 1. Lança em Movimentações
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'Movimentacoes!A:F',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[data, produto, quantidade, 'entrada', 'Manual', valorUnitario]],
      },
    })

    // 👉 2. Atualiza EstoqueAtual
    const estoque = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'EstoqueAtual!A:C',
    })

    const rows = estoque.data.values || []
    const index = rows.findIndex(r => r[0] === produto)

    if (index >= 0) {
      const novaQtd = parseFloat(rows[index][1] || 0) + parseFloat(quantidade)
      const novoValor = parseFloat(valorUnitario)
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `EstoqueAtual!B${index + 1}:C${index + 1}`,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [[novaQtd, novoValor]],
        },
      })
    } else {
      // Novo produto
      await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: 'EstoqueAtual!A:C',
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [[produto, quantidade, valorUnitario]],
        },
      })
    }

    res.status(200).json({ sucesso: true })
  } catch (err) {
    console.error('❌ ERRO COMPLETO:', err)
    res.status(500).json({
      erro: err.message || 'Erro interno',
      detalhe: JSON.stringify(err, Object.getOwnPropertyNames(err))
    })
  }
}
