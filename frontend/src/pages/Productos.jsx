import { useEffect, useState } from 'react';
import { api } from '../api/client';
import PageHeader from '../components/PageHeader';

const emptyForm = { codigo: '', nombre: '', precio_unitario: '', nit_proveedor: '' };

export default function Productos() {
    const [productos, setProductos] = useState([]);
    const [proveedores, setProveedores] = useState([]);
    const [form, setForm] = useState(emptyForm);
    const [editing, setEditing] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [saving, setSaving] = useState(false);

    async function load() {
        try {
            const [prods, provs] = await Promise.all([
                api.get('/productos'),
                api.get('/proveedores'),
            ]);
            setProductos(prods);
            setProveedores(provs);
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

    function handleChange(e) {
        setForm({ ...form, [e.target.name]: e.target.value });
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setError(null);
        setSaving(true);
        try {
            const payload = { ...form, precio_unitario: Number(form.precio_unitario) };
            if (editing) {
                await api.put(`/productos/${form.codigo}`, payload);
                setSuccess('Producto actualizado.');
            } else {
                await api.post('/productos', payload);
                setSuccess('Producto creado.');
            }
            setForm(emptyForm);
            setEditing(false);
            load();
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    }

    function handleEdit(producto) {
        setForm({
            codigo: producto.codigo,
            nombre: producto.nombre,
            precio_unitario: producto.precio_unitario,
            nit_proveedor: producto.nit_proveedor,
        });
        setEditing(true);
    }

    function handleCancel() {
        setForm(emptyForm);
        setEditing(false);
    }

    async function handleDelete(producto) {
        if (!window.confirm(`¿Borrar el producto ${producto.nombre}? Esta acción no se puede deshacer.`)) {
            return;
        }
        setError(null);
        try {
            await api.delete(`/productos/${producto.codigo}`);
            setSuccess('Producto eliminado.');
            load();
        } catch (err) {
            setError(err.message);
        }
    }

    return (
        <div>
            <PageHeader chip="Productos" title="Productos" />

            {error && <div className="error-banner" role="alert">{error}</div>}
            {success && <div className="success-banner" role="status">{success}</div>}

            {proveedores.length === 0 ? (
                <div className="empty-state" style={{ marginBottom: 20, border: '1px solid var(--line)' }}>
                    Primero debes crear al menos un proveedor.
                </div>
            ) : (
                <p className="form-note">* Campos obligatorios</p>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 20, marginBottom: 40, alignItems: 'start' }}>
                <div className="field">
                    <label>Código<span className="required">*</span></label>
                    <input name="codigo" value={form.codigo} onChange={handleChange} disabled={editing} required />
                    {editing && <div className="field__hint">No se puede modificar después de creado.</div>}
                </div>
                <div className="field">
                    <label>Nombre<span className="required">*</span></label>
                    <input name="nombre" value={form.nombre} onChange={handleChange} required />
                </div>
                <div className="field">
                    <label>Precio unitario<span className="required">*</span></label>
                    <input type="number" step="0.01" min="0" name="precio_unitario" value={form.precio_unitario} onChange={handleChange} required />
                </div>
                <div className="field">
                    <label>Proveedor<span className="required">*</span></label>
                    <select name="nit_proveedor" value={form.nit_proveedor} onChange={handleChange} required>
                        <option value="" disabled>Selecciona...</option>
                        {proveedores.map((p) => (
                            <option key={p.nit} value={p.nit}>{p.nombre} ({p.nit})</option>
                        ))}
                    </select>
                </div>
                <div style={{ display: 'flex', gap: 12, alignSelf: 'end' }}>
                    <button type="submit" className="btn btn--solid" disabled={saving || proveedores.length === 0}>
                        {saving ? 'Guardando…' : editing ? 'Guardar' : 'Crear'}
                    </button>
                    {editing && (
                        <button type="button" className="btn btn--ghost" onClick={handleCancel} disabled={saving}>Cancelar</button>
                    )}
                </div>
            </form>

            <div className="table-wrap">
                <table>
                    <thead>
                        <tr>
                            <th>Código</th>
                            <th>Nombre</th>
                            <th>Precio</th>
                            <th>Proveedor</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {productos.map((p) => (
                            <tr key={p.codigo}>
                                <td>{p.codigo}</td>
                                <td>{p.nombre}</td>
                                <td>${Number(p.precio_unitario).toLocaleString('es-CO')}</td>
                                <td>{p.nombre_proveedor}</td>
                                <td style={{ display: 'flex', gap: 8 }}>
                                    <button className="btn btn--ghost" aria-label={`Editar producto ${p.nombre}`} onClick={() => handleEdit(p)}>Editar</button>
                                    <button className="btn btn--danger" aria-label={`Borrar producto ${p.nombre}`} onClick={() => handleDelete(p)}>Borrar</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {productos.length === 0 && <div className="empty-state">No hay productos registrados.</div>}
            </div>
        </div>
    );
}
