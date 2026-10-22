import { Link } from 'react-router-dom';
import './Landing.css';

export default function Landing() {
    return (
        <section className="hero">
            <div className="hero__media" aria-hidden="true">
                <video
                    className="hero__video"
                    src="/video.wall.mp4"
                    poster="/photo.wall.png"
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="auto"
                />
                <div className="hero__scrim" />
            </div>

            <header className="hero__nav">
                <span className="hero__logo">SALESDB</span>
            </header>

            <div className="hero__body">
                <div className="panel">
                    <span className="chip">[ Laboratorio 01 ]</span>

                    <h1 className="hero__title">SALESDB</h1>

                    <p className="hero__tagline">
                        Clientes, productos, proveedores y pedidos en un solo lugar.
                    </p>

                    <Link to="/app" className="btn btn--solid hero__cta">
                        Entrar al sistema
                    </Link>
                </div>
            </div>

            <footer className="hero__footer">
                Bases de Datos — Laboratorio 01 — Modelo relacional + API + interfaz web.
            </footer>
        </section>
    );
}
