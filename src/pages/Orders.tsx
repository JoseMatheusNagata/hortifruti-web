import { Fragment, useCallback, useEffect, useState } from 'react';
import { ChevronDown, ChevronRight, RefreshCw } from 'lucide-react';
import { api } from '../api';
import { Order, OrderStatus } from '../types';
import { errorMessage, money, PAGAMENTO_LABEL, qty, STATUS_LABEL } from '../utils';

const STATUSES = Object.keys(STATUS_LABEL) as OrderStatus[];

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [status, setStatus] = useState<OrderStatus | ''>('');
  const [open, setOpen] = useState<string | null>(null);
  const [erro, setErro] = useState('');

  const load = useCallback(async () => {
    try {
      const { data } = await api.get<Order[]>('/orders', { params: status ? { status } : {} });
      setOrders(data);
      setErro('');
    } catch (e) {
      setErro(errorMessage(e));
    }
  }, [status]);

  useEffect(() => { load(); }, [load]);

  async function changeStatus(id: string, next: OrderStatus) {
    try {
      const { data } = await api.patch<Order>(`/orders/${id}/status`, { status: next });
      setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status: data.status } : o)));
    } catch (e) {
      setErro(errorMessage(e));
    }
  }

  return (
    <>
      <div className="page-head">
        <h2>Pedidos</h2>
        <button className="btn ghost" onClick={load}><RefreshCw size={16} /> Atualizar</button>
      </div>

      <div className="filters">
        <select value={status} onChange={(e) => setStatus(e.target.value as OrderStatus | '')}>
          <option value="">Todos os status</option>
          {STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
        </select>
      </div>

      {erro && <div className="alert">{erro}</div>}

      <div className="table-wrap card">
        <table>
          <thead>
            <tr><th /><th>Data</th><th>Cliente</th><th>Pagamento</th><th>Total</th><th>Status</th></tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <Fragment key={o.id}>
                <tr>
                  <td>
                    <button className="icon" onClick={() => setOpen(open === o.id ? null : o.id)}>
                      {open === o.id ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    </button>
                  </td>
                  <td>{new Date(o.data).toLocaleString('pt-BR')}</td>
                  <td>{o.user?.nome}<br /><small className="muted">{o.user?.email}</small></td>
                  <td>{PAGAMENTO_LABEL[o.formaPagamento]}</td>
                  <td><strong>{money(o.total)}</strong></td>
                  <td>
                    <select className={`status ${o.status}`} value={o.status} onChange={(e) => changeStatus(o.id, e.target.value as OrderStatus)}>
                      {STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
                    </select>
                  </td>
                </tr>
                {open === o.id && (
                  <tr className="detail">
                    <td />
                    <td colSpan={5}>
                      <p className="muted">
                        Entrega: {o.address.rua}, {o.address.numero} — {o.address.bairro} • CEP {o.address.cep}
                      </p>
                      <ul>
                        {o.items.map((i) => (
                          <li key={i.id}>
                            {i.product.nome}: {qty(i.quantidade, i.product.unidadeMedida)} × {money(i.precoUnitario)} = <strong>{money(i.subtotal)}</strong>
                          </li>
                        ))}
                      </ul>
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
            {orders.length === 0 && <tr><td colSpan={6} className="muted center">Nenhum pedido encontrado.</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
}
