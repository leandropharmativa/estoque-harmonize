import { useState } from 'react'

export default function EntradaProduto() {
  const [produto, setProduto] = useState('')
  const [quantidade, setQuantidade] = useState('')
  const [valorUnitario, setValorUnitario] = useState('')
  const [mensagem, setMensagem] = useState('')
  const [carregando, setCarregando] = useState(false)

  const dataHoje = new Date().toISOString().split('T')[0]

  const registrarEntrada = async () => {
    setMensagem('')
    setCarregando(true)
    try {
      const res = await fetch('/api/entrada', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          produto,
          quantidade: parseFloat(quantidade),
          valorUnitario: parseFloat(valorUnitario),
          data: dataHoje
        })
      })

      const json = await res.json()
      if (res.ok) {
        setMensagem('✅ Entrada registrada com sucesso!')
        setProduto('')
        setQuantidade('')
        setValorUnitario('')
      } else {
        setMensagem(`❌ Erro: ${json.erro || 'Não foi possível registrar.'}`)
      }
    } catch (e) {
      setMensagem('❌ Erro ao conectar com a API.')
    }
    setCarregando(false)
  }

  return (
    <div style={{ maxWidth: 400, margin: '2rem auto', padding: '1rem', border: '1px solid #ccc', borderRadius: 8 }}>
      <h2>Entrada de Produto</h2>

      <label>Produto:</label>
      <input type="text" value={produto} onChange={e => setProduto(e.target.value)} />

      <label>Quantidade:</label>
      <input type="number" value={quantidade} onChange={e => setQuantidade(e.target.value)} />

      <label>Valor unitário (R$):</label>
      <input type="number" value={valorUnitario} onChange={e => setValorUnitario(e.target.value)} />

      <button onClick={registrarEntrada} disabled={carregando} style={{ marginTop: '1rem' }}>
        {carregando ? 'Registrando...' : 'Registrar entrada'}
      </button>

      {mensagem && <p style={{ marginTop: '1rem' }}>{mensagem}</p>}

      <style jsx>{`
        label {
          display: block;
          margin-top: 1rem;
        }
        input {
          width: 100%;
          padding: 0.5rem;
          margin-top: 0.25rem;
        }
        button {
          padding: 0.5rem 1rem;
          background: #0070f3;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }
        button:disabled {
          background: #999;
        }
      `}</style>
    </div>
  )
}
