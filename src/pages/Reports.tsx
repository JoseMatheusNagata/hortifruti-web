import { useCallback, useEffect, useState } from 'react';
import { api } from '../api';
import { SalesReport } from '../types';
import { errorMessage, money, qty } from '../utils';

export default function Reports() {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [report, setReport] = useState<SalesReport | null>(null);
  const [erro, setErro] = useState('');

  const load = useCallback(async () => {
    try {
      const { data } = await api.get<SalesReport>('/reports/sales', {
        params: {
          top: 10,
          ...(from && { from: `${from}T00:00:00` }),
          ...(to && { to: `${to}T23:59:59` }),
        },
      });
      setReport(data);
      setErro('');
    } catch (e) {
      setErro(errorMessage(e));
    }
  }, [from, to]);

  useEffect(() => { load(); }, [load]);

  const max = Math.max(...(report?.ranking.map((r) => Number(r.faturamento)) ?? [0]), 1);

  return (
    <>
      <div className="page-head"><h2>Relatório de vendas</h2></div>

      <div className="filters">
        <label className="inline">De <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} /></label>
        <label className="inline">Até <input type="date" value={to} onChange={(e) => setTo(e.target.value)} /></label>
      </div>

      {erro && <div className="alert">{erro}</div>}

      {report && (
        <>
          <div className="stats">
            <div className="card stat"><span>Total faturado</span><strong>{money(report.totalFaturado)}</strong></div>
            <div className="card stat"><span>Pedidos pagos</span><strong>{report.totalPedidos}</strong></div>
            <div className="card stat">
              <span>Ticket médio</span>
              <strong>{money(report.totalPedidos ? Number(report.totalFaturado) / report.totalPedidos : 0)}</strong>
            </div>
          </div>

          <div className="card table-wrap">
            <h3 style={{ padding: '16px 16px 0' }}>Produtos mais vendidos</h3>
            <table>
              <thead><tr><th>#</th><th>Produto</th><th>Qtd. vendida</th><th>Faturamento</th><th style={{ width: '30%' }} /></tr></thead>
              <tbody>
                {report.ranking.map((r) => (
                  <tr key={r.posicao}>
                    <td>{r.posicao}</td>
                    <td><strong>{r.produto}</strong></td>
                    <td>{qty(r.quantidadeVendida, r.unidadeMedida)}</td>
                    <td>{money(r.faturamento)}</td>
                    <td><div className="bar"><div style={{ width: `${(Number(r.faturamento) / max) * 100}%` }} /></div></td>
                  </tr>
                ))}
                {report.ranking.length === 0 && <tr><td colSpan={5} className="muted center">Sem vendas no período.</td></tr>}
              </tbody>
            </table>
          </div>
          <p className="muted">Considera faturados os pedidos fora de “Aguardando Pagamento”.</p>
        </>
      )}
    </>
  );
}
