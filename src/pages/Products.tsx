import { FormEvent, useCallback, useEffect, useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { api } from '../api';
import { Category, Product, Unidade } from '../types';
import { errorMessage, money, qty } from '../utils';

interface FormState {
  nome: string;
  categoryId: string;
  unidadeMedida: Unidade;
  precoVarejo: string;
  precoAtacado: string;
  qtdMinAtacado: string;
}

const emptyForm = (categoryId = ''): FormState => ({
  nome: '', categoryId, unidadeMedida: 'KG', precoVarejo: '', precoAtacado: '', qtdMinAtacado: '',
});

const num = (s: string) => Number(s.replace(',', '.'));

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryId, setCategoryId] = useState('');
  const [search, setSearch] = useState('');
  const [erro, setErro] = useState('');
  const [editing, setEditing] = useState<Product | 'new' | null>(null);

  const loadProducts = useCallback(async () => {
    try {
      const { data } = await api.get<{ data: Product[] }>('/products', {
        params: { perPage: 100, ...(categoryId && { categoryId }), ...(search && { search }) },
      });
      setProducts(data.data);
      setErro('');
    } catch (e) {
      setErro(errorMessage(e));
    }
  }, [categoryId, search]);

  const loadCategories = useCallback(async () => {
    const { data } = await api.get<Category[]>('/categories');
    setCategories(data);
  }, []);

  useEffect(() => { loadCategories().catch((e) => setErro(errorMessage(e))); }, [loadCategories]);
  useEffect(() => {
    const t = setTimeout(loadProducts, 250); // debounce da busca
    return () => clearTimeout(t);
  }, [loadProducts]);

  async function remove(p: Product) {
    if (!confirm(`Desativar "${p.nome}"? Ele some do catálogo, mas o histórico de pedidos é preservado.`)) return;
    try {
      await api.delete(`/products/${p.id}`);
      loadProducts();
    } catch (e) {
      setErro(errorMessage(e));
    }
  }

  return (
    <>
      <div className="page-head">
        <h2>Produtos</h2>
        <button className="btn primary" onClick={() => setEditing('new')}><Plus size={16} /> Novo produto</button>
      </div>

      <div className="filters">
        <input placeholder="Buscar produto..." value={search} onChange={(e) => setSearch(e.target.value)} />
        <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
          <option value="">Todas as categorias</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
        </select>
      </div>

      {erro && <div className="alert">{erro}</div>}

      <div className="table-wrap card">
        <table>
          <thead>
            <tr>
              <th>Produto</th><th>Categoria</th><th>Unid.</th><th>Varejo</th><th>Atacado</th><th>Mín. atacado</th><th />
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id}>
                <td><strong>{p.nome}</strong></td>
                <td>{p.category?.nome}</td>
                <td>{p.unidadeMedida === 'KG' ? 'kg' : 'un'}</td>
                <td>{money(p.precoVarejo)}</td>
                <td>{p.precoAtacado ? money(p.precoAtacado) : '—'}</td>
                <td>{p.qtdMinAtacado ? qty(p.qtdMinAtacado, p.unidadeMedida) : '—'}</td>
                <td className="actions">
                  <button className="icon" title="Editar" onClick={() => setEditing(p)}><Pencil size={16} /></button>
                  <button className="icon danger" title="Desativar" onClick={() => remove(p)}><Trash2 size={16} /></button>
                </td>
              </tr>
            ))}
            {products.length === 0 && <tr><td colSpan={7} className="muted center">Nenhum produto encontrado.</td></tr>}
          </tbody>
        </table>
      </div>

      {editing && (
        <ProductModal
          product={editing === 'new' ? null : editing}
          categories={categories}
          onCategoryCreated={loadCategories}
          onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); loadProducts(); }}
        />
      )}
    </>
  );
}

interface ModalProps {
  product: Product | null;
  categories: Category[];
  onCategoryCreated: () => Promise<void>;
  onClose: () => void;
  onSaved: () => void;
}

function ProductModal({ product, categories, onCategoryCreated, onClose, onSaved }: ModalProps) {
  const [form, setForm] = useState<FormState>(
    product
      ? {
          nome: product.nome,
          categoryId: product.categoryId,
          unidadeMedida: product.unidadeMedida,
          precoVarejo: String(Number(product.precoVarejo)),
          precoAtacado: product.precoAtacado ? String(Number(product.precoAtacado)) : '',
          qtdMinAtacado: product.qtdMinAtacado ? String(Number(product.qtdMinAtacado)) : '',
        }
      : emptyForm(categories[0]?.id),
  );
  const [erro, setErro] = useState('');
  const [saving, setSaving] = useState(false);
  const set = (k: keyof FormState) => (e: { target: { value: string } }) => setForm({ ...form, [k]: e.target.value });

  async function newCategory() {
    const nome = prompt('Nome da nova categoria:')?.trim();
    if (!nome) return;
    try {
      const { data } = await api.post<Category>('/categories', { nome });
      await onCategoryCreated();
      setForm((f) => ({ ...f, categoryId: data.id }));
    } catch (e) {
      setErro(errorMessage(e));
    }
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    setErro('');
    setSaving(true);
    const payload = {
      nome: form.nome,
      categoryId: form.categoryId,
      unidadeMedida: form.unidadeMedida,
      precoVarejo: num(form.precoVarejo),
      precoAtacado: form.precoAtacado ? num(form.precoAtacado) : null,
      qtdMinAtacado: form.qtdMinAtacado ? num(form.qtdMinAtacado) : null,
    };
    try {
      if (product) await api.put(`/products/${product.id}`, payload);
      else await api.post('/products', payload);
      onSaved();
    } catch (err) {
      setErro(errorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  const unit = form.unidadeMedida === 'KG' ? 'kg' : 'un';

  return (
    <div className="overlay" onClick={onClose}>
      <form className="card modal" onClick={(e) => e.stopPropagation()} onSubmit={submit}>
        <h3>{product ? 'Editar produto' : 'Novo produto'}</h3>

        <label>Nome
          <input value={form.nome} onChange={set('nome')} required minLength={2} />
        </label>

        <div className="row">
          <label>Categoria
            <select value={form.categoryId} onChange={set('categoryId')} required>
              <option value="" disabled>Selecione...</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
            </select>
          </label>
          <button type="button" className="btn ghost" onClick={newCategory}>+ Categoria</button>
        </div>

        <label>Unidade de medida
          <select value={form.unidadeMedida} onChange={set('unidadeMedida')}>
            <option value="KG">Quilo (kg)</option>
            <option value="UNIT">Unidade</option>
          </select>
        </label>

        <div className="row">
          <label>Preço varejo (R$/{unit})
            <input inputMode="decimal" value={form.precoVarejo} onChange={set('precoVarejo')} required />
          </label>
          <label>Preço atacado (R$/{unit})
            <input inputMode="decimal" value={form.precoAtacado} onChange={set('precoAtacado')} placeholder="opcional" />
          </label>
          <label>Mín. p/ atacado ({unit})
            <input inputMode="decimal" value={form.qtdMinAtacado} onChange={set('qtdMinAtacado')} placeholder="opcional" />
          </label>
        </div>
        <small className="muted">O preço de atacado é aplicado automaticamente quando a quantidade atinge o mínimo.</small>

        {erro && <div className="alert">{erro}</div>}

        <div className="modal-actions">
          <button type="button" className="btn ghost" onClick={onClose}>Cancelar</button>
          <button className="btn primary" disabled={saving}>{saving ? 'Salvando...' : 'Salvar'}</button>
        </div>
      </form>
    </div>
  );
}
