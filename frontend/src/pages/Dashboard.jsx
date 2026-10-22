import { Link } from 'react-router-dom';
import PageHeader from '../components/PageHeader';

const items = [
    { to: '/app/clientes', label: 'Clientes', desc: 'Insertar, actualizar y borrar clientes.' },
    { to: '/app/productos', label: 'Productos', desc: 'Insertar, actualizar y borrar productos.' },
    { to: '/app/proveedores', label: 'Proveedores', desc: 'Insertar, actualizar y borrar proveedores.' },
    { to: '/app/pedidos', label: 'Pedidos', desc: 'Un cliente realiza pedidos de productos.' },
    { to: '/app/consultas', label: 'Consultas', desc: 'Reportes sobre clientes, pedidos y proveedores.' },
];

export default function Dashboard() {
    return (
        <div>
            <PageHeader chip="Menú" title="¿Qué quieres hacer?" />

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20 }}>
                {items.map((item) => (
                    <Link
                        key={item.to}
                        to={item.to}
                        style={{
                            display: 'block',
                            border: '1px solid var(--line)',
                            padding: '28px 24px',
                            transition: 'border-color 0.25s ease, background 0.25s ease',
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--line-strong)'; e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--line)'; e.currentTarget.style.background = 'transparent'; }}
                    >
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--text-dim)' }}>
                            {item.label}
                        </div>
                        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 300, fontSize: 16, marginTop: 10, color: 'var(--text)' }}>
                            {item.desc}
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
