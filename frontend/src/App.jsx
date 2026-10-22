import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import AppLayout from './components/AppLayout';
import Dashboard from './pages/Dashboard';
import Clientes from './pages/Clientes';
import Productos from './pages/Productos';
import Proveedores from './pages/Proveedores';
import Pedidos from './pages/Pedidos';
import Consultas from './pages/Consultas';

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/app" element={<AppLayout />}>
                    <Route index element={<Dashboard />} />
                    <Route path="clientes" element={<Clientes />} />
                    <Route path="productos" element={<Productos />} />
                    <Route path="proveedores" element={<Proveedores />} />
                    <Route path="pedidos" element={<Pedidos />} />
                    <Route path="consultas" element={<Consultas />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}
