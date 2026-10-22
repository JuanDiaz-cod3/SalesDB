import { useEffect, useState } from 'react';
import { api } from '../api/client';
import PageHeader from '../components/PageHeader';

const emptyForm = { nit: '', nombre: '', direccion: '' };

export default function Proveedores() {
    const [proveedores, setProveedores] = useState([]);
    const [form, setForm] = useState(emptyForm);
    const [editing, setEditing] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [saving, setSaving] = useState(false);

    async function load() {
        try {
            setProveedores(await api.get('/proveedores'));
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
            if (editing) {
                await api.put(`/proveedores/${form.nit}`, form);
                setSuccess('Proveedor actualizado.');
            } else {
                await api.post('/proveedores', form);
                setSuccess('Proveedor creado.');
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

    function handleEdit(proveedor) {
        setForm({ nit: proveedor.nit, nombre: proveedor.nombre, direccion: proveedor.direccion || '' });
        setEditing(true);
    }

    function handleCancel() {
        setForm(emptyForm);
        setEditing(false);
    }

    async function handleDelete(proveedor) {
        if (!window.confirm(`¿Borrar al proveedor ${proveedor.nombre}? Esta acción no se puede deshacer.`)) {
            return;
        }
        setError(null);
        try {
            await api.delete(`/proveedores/${proveedor.nit}`);
            setSuccess('Proveedor eliminado.');
            load();
        } catch (err) {
            setError(err.message);
        }
    }

    return (
        <div>
            <PageHeader chip="Proveedores" title="Proveedores" />

            {error && <div className="error-banner" role="alert">{error}</div>}
            {success && <div className="success-banner" role="status">{success}</div>}

            <p className="form-note">* Campos obligatorios</p>

            <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 20, marginBottom: 40, alignItems: 'start' }}>
                <div className="field">
                    <label>NIT<span className="required">*</span></label>
                    <input name="nit" value={form.nit} onChange={handleChange} disabled={editing} required />
                    {editing && <div className="field__hint">No se puede modificar después de creado.</div>}
                </div>
                <div className="field">
                    <label>Nombre<span className="required">*</span></label>
                    <input name="nombre" value={form.nombre} onChange={handleChange} required />
                </div>
                <div className="field">
                    <label>Dirección</label>
                    <input name="direccion" value={form.direccion} onChange={handleChange} />
                </div>
                <div style={{ display: 'flex', gap: 12, alignSelf: 'end' }}>
                    <button type="submit" className="btn btn--solid" disabled={saving}>
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
                            <th>NIT</th>
                            <th>Nombre</th>
                            <th>Dirección</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {proveedores.map((p) => (
                            <tr key={p.nit}>
                                <td>{p.nit}</td>
                                <td>{p.nombre}</td>
                                <td>{p.direccion || '—'}</td>
                                <td style={{ display: 'flex', gap: 8 }}>
                                    <button className="btn btn--ghost" aria-label={`Editar proveedor ${p.nombre}`} onClick={() => handleEdit(p)}>Editar</button>
                                    <button className="btn btn--danger" aria-label={`Borrar proveedor ${p.nombre}`} onClick={() => handleDelete(p)}>Borrar</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {proveedores.length === 0 && <div className="empty-state">No hay proveedores registrados.</div>}
            </div>
        </div>
    );
}
