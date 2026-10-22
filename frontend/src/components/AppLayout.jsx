import { Outlet } from 'react-router-dom';
import NavBar from './NavBar';

export default function AppLayout() {
    return (
        <div>
            <NavBar />
            <main style={{ padding: 'clamp(24px, 3vw, 48px) var(--gutter)' }}>
                <Outlet />
            </main>
        </div>
    );
}
