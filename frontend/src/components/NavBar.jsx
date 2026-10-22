import { NavLink } from 'react-router-dom';
import './NavBar.css';

const links = [
    { to: '/app', label: 'Inicio', end: true },
    { to: '/app/clientes', label: 'Clientes' },
    { to: '/app/productos', label: 'Productos' },
    { to: '/app/proveedores', label: 'Proveedores' },
    { to: '/app/pedidos', label: 'Pedidos' },
    { to: '/app/consultas', label: 'Consultas' },
];

export default function NavBar() {
    return (
        <nav className="appnav">
            <NavLink to="/" className="appnav__logo">
                SALESDB
            </NavLink>
            <div className="appnav__links">
                {links.map((link) => (
                    <NavLink
                        key={link.to}
                        to={link.to}
                        end={link.end}
                        className={({ isActive }) =>
                            'appnav__link' + (isActive ? ' appnav__link--active' : '')
                        }
                    >
                        {link.label}
                    </NavLink>
                ))}
            </div>
        </nav>
    );
}
