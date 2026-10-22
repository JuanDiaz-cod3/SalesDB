import { useEffect, useState } from 'react';
import { api } from '../api/client';
import PageHeader from '../components/PageHeader';

const todayISO = () => new Date().toLocaleDateString('en-CA');
const emptyForm = { id_cliente: '', codigo_producto: '', cantidad: '', fecha_compra: todayISO() };

export default function Pedidos() {
    const [pedidos, setPedidos] = useState([]);
    const [clientes, setClientes] = useState([]);
    const [productos, setProductos] = useState([]);
    const [form, setForm] = useState(emptyForm);
    const [editingId, setEditingId] = useState(null);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [saving, setSaving] = useState(false);

    async function load() {
        try {
            const [comp, cli, prod] = await Promise.all([
                api.get('/compras'),
                api.get('/clientes'),
                api.get('/productos'),
            ]);
            setPedidos(comp);
            setClientes(cli);
            setProductos(prod);
        } catch (err) {
            setError(err.message);
        }
    }

    useEffect(() => {
        load();
    }, []);

    useEffect(() => {
        if (!success) return;
        const t = setTimeout(() => setSuccess(null), 3000);
        return () => clearTimeout(t);
    }, [success]);

    const faltanDependencias = clientes.length === 0 || productos.length === 0;

    function handleChange(e) {
        setForm({ ...form, [e.target.name]: e.target.value });
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setError(null);
        setSaving(true);
        try {
            if (editingId) {
                await api.put(`/compras/${editingId}`, {
                    cantidad: Number(form.cantidad),
                    fecha_compra: form.fecha_compra,
                });
                setSuccess('Pedido actualizado.');
            } else {
                await api.post('/compras', {
                    id_cliente: form.id_cliente,
                    codigo_producto: form.codigo_producto,
                    cantidad: Number(form.cantidad),
                    fecha_compra: form.fecha_compra,
                });
                setSuccess('Pedido registrado.');
            }
            setForm(emptyForm);
            setEditingId(null);
            load();
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    }

    function handleEdit(pedido) {
        setForm({
            id_cliente: pedido.id_cliente,
            codigo_producto: pedido.codigo_producto,
            cantidad: pedido.cantidad,
            fecha_compra: pedido.fecha_compra.slice(0, 10),
        });
        setEditingId(pedido.id_compra);
    }

    function handleCancel() {
        setForm(emptyForm);
        setEditingId(null);
    }

    async function handleDelete(pedido) {
        if (!window.confirm(`¿Borrar el pedido de ${pedido.nombre_cliente} (${pedido.nombre_producto})? Esta acción no se puede deshacer.`)) {
            return;
        }
        setError(null);
        try {
            await api.delete(`/compras/${pedido.id_compra}`);
            setSuccess('Pedido eliminado.');
            load();
        } catch (err) {
            setError(err.message);
        }
    }

    return (
        <div>
            <PageHeader chip="Pedidos" title="Pedidos" />

            {error && <div className="error-banner" role="alert">{error}</div>}
            {success && <div className="success-banner" role="status">{success}</div>}

            {faltanDependencias ? (
                <div className="empty-state" style={{ marginBottom: 20, border: '1px solid var(--line)' }}>
                    {clientes.length === 0 && productos.length === 0
                        ? 'Primero debes crear al menos un cliente y un producto.'
                        : clientes.length === 0
                            ? 'Primero debes crear al menos un cliente.'
                            : 'Primero debes crear al menos un producto.'}
                </div>
            ) : (
                <p className="form-note">* Campos obligatorios</p>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 20, marginBottom: 40, alignItems: 'start' }}>
                <div className="field">
                    <label>Cliente<span className="required">*</span></label>
                    <select name="id_cliente" value={form.id_cliente} onChange={handleChange} disabled={!!editingId} required>
                        <option value="" disabled>Selecciona...</option>
                        {clientes.map((c) => (
                            <option key={c.id_cliente} value={c.id_cliente}>{c.nombre} {c.apellidos}</option>
                        ))}
                    </select>
                    {editingId && <div className="field__hint">No se puede cambiar el cliente de un pedido ya hecho.</div>}
                </div>
                <div className="field">
                    <label>Producto<span className="required">*</span></label>
                    <select name="codigo_producto" value={form.codigo_producto} onChange={handleChange} disabled={!!editingId} required>
                        <option value="" disabled>Selecciona...</option>
                        {productos.map((p) => (
                            <option key={p.codigo} value={p.codigo}>{p.nombre} — ${Number(p.precio_unitario).toLocaleString('es-CO')}</option>
                        ))}
                    </select>
                    {editingId && <div className="field__hint">No se puede cambiar el producto de un pedido ya hecho.</div>}
                </div>
                <div className="field">
                    <label>Cantidad<span className="required">*</span></label>
                    <input type="number" min="1" name="cantidad" value={form.cantidad} onChange={handleChange} required />
                </div>
                <div className="field">
                    <label>Fecha<span className="required">*</span></label>
                    <input type="date" name="fecha_compra" value={form.fecha_compra} onChange={handleChange} required />
                </div>
                <div style={{ display: 'flex', gap: 12, alignSelf: 'end' }}>
                    <button type="submit" className="btn btn--solid" disabled={saving || (!editingId && faltanDependencias)}>
                        {saving ? 'Guardando…' : editingId ? 'Guardar' : 'Realizar pedido'}
                    </button>
                    {editingId && (
                        <button type="button" className="btn btn--ghost" onClick={handleCancel} disabled={saving}>Cancelar</button>
                    )}
                </div>
            </form>

            <div className="table-wrap">
                <table>
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Cliente</th>
                            <th>Producto</th>
                            <th>Cantidad</th>
                            <th>Precio unitario</th>
                            <th>Total</th>
                            <th>Fecha</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {pedidos.map((p) => (
                            <tr key={p.id_compra}>
                                <td>{p.id_compra}</td>
                                <td>{p.nombre_cliente}</td>
                                <td>{p.nombre_producto}</td>
                                <td>{p.cantidad}</td>
                                <td>${Number(p.precio_compra).toLocaleString('es-CO')}</td>
                                <td>${(Number(p.precio_compra) * Number(p.cantidad)).toLocaleString('es-CO')}</td>
                                <td>{p.fecha_compra.slice(0, 10)}</td>
                                <td style={{ display: 'flex', gap: 8 }}>
                                    <button className="btn btn--ghost" aria-label={`Editar pedido de ${p.nombre_cliente}`} onClick={() => handleEdit(p)}>Editar</button>
                                    <button className="btn btn--danger" aria-label={`Borrar pedido de ${p.nombre_cliente}`} onClick={() => handleDelete(p)}>Borrar</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {pedidos.length === 0 && <div className="empty-state">No hay pedidos registrados.</div>}
            </div>
        </div>
    );
}
