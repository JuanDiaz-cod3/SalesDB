import { useState } from 'react';
import { api } from '../api/client';
import PageHeader from '../components/PageHeader';

const money = (v) => `$${Number(v).toLocaleString('es-CO')}`;

const CONSULTAS = [
    {
        key: 'clientes-pedidos',
        titulo: 'Clientes y cantidad de pedidos',
        path: '/consultas/clientes-pedidos',
        columns: [
            { key: 'id_cliente', label: 'Identificación' },
            { key: 'nombre', label: 'Nombre' },
            { key: 'apellidos', label: 'Apellidos' },
            { key: 'cantidad_pedidos', label: 'Pedidos' },
        ],
    },
    {
        key: 'clientes-sin-pedidos',
        titulo: 'Clientes sin pedidos',
        path: '/consultas/clientes-sin-pedidos',
        columns: [
            { key: 'id_cliente', label: 'Identificación' },
            { key: 'nombre', label: 'Nombre' },
            { key: 'apellidos', label: 'Apellidos' },
        ],
    },
    {
        key: 'detalle-compras',
        titulo: 'Cliente, producto, cantidad, precio y proveedor',
        path: '/consultas/detalle-compras',
        columns: [
            { key: 'nombre_cliente', label: 'Cliente' },
            { key: 'nombre_producto', label: 'Producto' },
            { key: 'cantidad', label: 'Cantidad' },
            { key: 'precio_compra', label: 'Precio unitario', format: money },
            { key: 'total', label: 'Total', compute: (row) => money(row.precio_compra * row.cantidad) },
            { key: 'nombre_proveedor', label: 'Proveedor' },
        ],
    },
    {
        key: 'proveedores-productos',
        titulo: 'Proveedores con sus productos',
        path: '/consultas/proveedores-productos',
        columns: [
            { key: 'nombre_proveedor', label: 'Proveedor' },
            { key: 'nombre_producto', label: 'Producto' },
            { key: 'precio_unitario', label: 'Precio', format: money },
        ],
    },
];

export default function Consultas() {
    const [activeKey, setActiveKey] = useState(null);
    const [rows, setRows] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    async function runConsulta(consulta) {
        setError(null);
        setActiveKey(consulta.key);
        setLoading(true);
        try {
            setRows(await api.get(consulta.path));
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    const active = CONSULTAS.find((c) => c.key === activeKey);

    return (
        <div>
            <PageHeader chip="Consultas" title="Consultas" />

            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 32 }}>
                {CONSULTAS.map((c) => (
                    <button
                        key={c.key}
                        className={`btn ${activeKey === c.key ? 'btn--solid' : 'btn--ghost'}`}
                        onClick={() => runConsulta(c)}
                        disabled={loading}
                    >
                        {c.titulo}
                    </button>
                ))}
            </div>

            {error && <div className="error-banner" role="alert">{error}</div>}

            {loading && <div className="empty-state">Cargando…</div>}

            {!loading && active && (
                <div className="table-wrap">
                    <table>
                        <thead>
                            <tr>
                                {active.columns.map((col) => (
                                    <th key={col.key}>{col.label}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((row, i) => (
                                <tr key={i}>
                                    {active.columns.map((col) => (
                                        <td key={col.key}>
                                            {col.compute
                                                ? col.compute(row)
                                                : row[col.key] == null ? '—' : col.format ? col.format(row[col.key]) : row[col.key]}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {rows.length === 0 && <div className="empty-state">Sin resultados.</div>}
                </div>
            )}

            {!loading && !active && (
                <div className="empty-state" style={{ border: '1px solid var(--line)' }}>
                    Selecciona una consulta para ver los resultados.
                </div>
            )}
        </div>
    );
}
