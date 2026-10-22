import { useEffect, useState } from 'react';
import { api } from '../api/client';
import PageHeader from '../components/PageHeader';

const emptyForm = { id_cliente: '', nombre: '', apellidos: '', direccion: '', fecha_nacimiento: '' };

export default function Clientes() {
    const [clientes, setClientes] = useState([]);
    const [form, setForm] = useState(emptyForm);
    const [editing, setEditing] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [saving, setSaving] = useState(false);

    async function load() {
        try {
            setClientes(await api.get('/clientes'));
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
                await api.put(`/clientes/${form.id_cliente}`, form);
                setSuccess('Cliente actualizado.');
            } else {
                await api.post('/clientes', form);
                setSuccess('Cliente creado.');
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

    function handleEdit(cliente) {
        setForm({
            id_cliente: cliente.id_cliente,
            nombre: cliente.nombre,
            apellidos: cliente.apellidos,
            direccion: cliente.direccion || '',
            fecha_nacimiento: cliente.fecha_nacimiento ? cliente.fecha_nacimiento.slice(0, 10) : '',
        });
        setEditing(true);
    }

    function handleCancel() {
        setForm(emptyForm);
        setEditing(false);
    }

    async function handleDelete(cliente) {
        if (!window.confirm(`¿Borrar al cliente ${cliente.nombre} ${cliente.apellidos}? Esta acción no se puede deshacer.`)) {
            return;
        }
        setError(null);
        try {
            await api.delete(`/clientes/${cliente.id_cliente}`);
            setSuccess('Cliente eliminado.');
            load();
        } catch (err) {
            setError(err.message);
        }
    }

    return (
        <div>
            <PageHeader chip="Clientes" title="Clientes" />

            {error && <div className="error-banner" role="alert">{error}</div>}
            {success && <div className="success-banner" role="status">{success}</div>}

            <p className="form-note">* Campos obligatorios</p>

            <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 20, marginBottom: 40, alignItems: 'start' }}>
                <div className="field">
                    <label>Identificación<span className="required">*</span></label>
                    <input name="id_cliente" value={form.id_cliente} onChange={handleChange} disabled={editing} required />
                    {editing && <div className="field__hint">No se puede modificar después de creado.</div>}
                </div>
                <div className="field">
                    <label>Nombre<span className="required">*</span></label>
                    <input name="nombre" value={form.nombre} onChange={handleChange} required />
                </div>
                <div className="field">
                    <label>Apellidos<span className="required">*</span></label>
                    <input name="apellidos" value={form.apellidos} onChange={handleChange} required />
                </div>
                <div className="field">
                    <label>Dirección</label>
                    <input name="direccion" value={form.direccion} onChange={handleChange} />
                </div>
                <div className="field">
                    <label>Fecha de nacimiento</label>
                    <input type="date" name="fecha_nacimiento" value={form.fecha_nacimiento} onChange={handleChange} />
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
                            <th>Identificación</th>
                            <th>Nombre</th>
                            <th>Apellidos</th>
                            <th>Dirección</th>
                            <th>Nacimiento</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {clientes.map((c) => (
                            <tr key={c.id_cliente}>
                                <td>{c.id_cliente}</td>
                                <td>{c.nombre}</td>
                                <td>{c.apellidos}</td>
                                <td>{c.direccion || '—'}</td>
                                <td>{c.fecha_nacimiento ? c.fecha_nacimiento.slice(0, 10) : '—'}</td>
                                <td style={{ display: 'flex', gap: 8 }}>
                                    <button className="btn btn--ghost" aria-label={`Editar cliente ${c.nombre} ${c.apellidos}`} onClick={() => handleEdit(c)}>Editar</button>
                                    <button className="btn btn--danger" aria-label={`Borrar cliente ${c.nombre} ${c.apellidos}`} onClick={() => handleDelete(c)}>Borrar</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {clientes.length === 0 && <div className="empty-state">No hay clientes registrados.</div>}
            </div>
        </div>
    );
}
