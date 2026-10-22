import { useEffect, useState } from 'react';
import './QueryTrace.css';

const STEP_MS = 3200;

const prefersReducedMotion = () =>
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function Icon({ name }) {
    const paths = {
        play: <path d="M5 3.5v9l7.5-4.5z" />,
        pause: <><path d="M5 3.5v9" /><path d="M11 3.5v9" /></>,
        prev: <><path d="M4 3.5v9" /><path d="M12.5 3.5 6.5 8l6 4.5z" /></>,
        next: <><path d="M12 3.5v9" /><path d="M3.5 3.5 9.5 8l-6 4.5z" /></>,
        restart: <><path d="M3.5 8a4.5 4.5 0 1 0 1.4-3.3" /><path d="M3.5 2.5v3h3" /></>,
    };
    return (
        <svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinejoin="round" aria-hidden="true">
            {paths[name]}
        </svg>
    );
}

function Cell({ value, fresh, delay }) {
    const style = fresh ? { animationDelay: `${delay}ms` } : undefined;
    return (
        <td className={fresh ? 'trace-cell--fresh' : undefined} style={style}>
            {value == null ? <span className="trace-null">NULL</span> : value}
        </td>
    );
}

function Panel({ panel }) {
    return (
        <section className="trace-panel">
            <header className="trace-panel__head">
                <span>{panel.title}</span>
                <span>{panel.rows.length} {panel.rows.length === 1 ? 'fila' : 'filas'}</span>
            </header>
            <div className="trace-panel__body">
                <table className="trace-table">
                    <thead>
                        <tr>
                            {panel.columns.map((col, i) => (
                                <th key={col} className={i === panel.fresh ? 'trace-col--fresh' : undefined}>{col}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {panel.rows.map((row, r) => (
                            <tr key={row.key} className={`trace-row trace-row--${row.state}`}>
                                {row.cells.map((value, i) => (
                                    <Cell key={panel.columns[i]} value={value} fresh={i === panel.fresh} delay={Math.min(r * 70, 420)} />
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
                {panel.rows.length === 0 && <div className="trace-empty">Sin filas.</div>}
            </div>
        </section>
    );
}

export default function QueryTrace({ trace }) {
    const [step, setStep] = useState(0);
    const [playing, setPlaying] = useState(() => !prefersReducedMotion());
    const [runId, setRunId] = useState(0);

    const last = trace.steps.length - 1;
    const current = trace.steps[step];

    useEffect(() => {
        if (!playing) return;
        if (step >= last) {
            setPlaying(false);
            return;
        }
        const t = setTimeout(() => setStep((s) => s + 1), STEP_MS);
        return () => clearTimeout(t);
    }, [playing, step, last, runId]);

    useEffect(() => {
        const onVisibility = () => {
            if (document.hidden) setPlaying(false);
        };
        document.addEventListener('visibilitychange', onVisibility);
        return () => document.removeEventListener('visibilitychange', onVisibility);
    }, []);

    function play() {
        if (step >= last) setStep(0);
        setRunId((n) => n + 1);
        setPlaying(true);
    }

    function goTo(n) {
        setPlaying(false);
        setStep(Math.max(0, Math.min(last, n)));
    }

    return (
        <div className="trace" aria-label="Cómo se resuelve la consulta">
            <div className="trace__top">
                <h2 className="trace__title">Cómo se resuelve</h2>
                <span className="trace__count">Paso {step + 1} de {trace.steps.length}</span>
            </div>

            <div className={`trace-progress${playing && step < last ? ' is-playing' : ''}`} aria-hidden="true">
                {trace.steps.map((_, i) => (
                    <span key={i} className={`trace-progress__seg${i < step ? ' is-done' : ''}${i === step ? ' is-current' : ''}`}>
                        {i === step && playing && step < last && (
                            <span key={`${step}-${runId}`} className="trace-progress__fill" style={{ animationDuration: `${STEP_MS}ms` }} />
                        )}
                    </span>
                ))}
            </div>

            <pre className="trace-sql">
                {trace.sql.map((line, i) => (
                    <span key={i} className={`trace-sql__line${current.lines.includes(i) ? ' is-active' : ''}`}>
                        <span className="trace-sql__num">{String(i + 1).padStart(2, '0')}</span>
                        {line}
                    </span>
                ))}
            </pre>

            <p className="trace__caption" aria-live="polite">{current.caption}</p>

            <div className="trace__stage">
                {current.panels.map((panel) => (
                    <Panel key={panel.id} panel={panel} />
                ))}
            </div>

            <div className="trace__controls">
                <button type="button" className="trace-btn" onClick={() => goTo(step - 1)} disabled={step === 0} aria-label="Paso anterior">
                    <Icon name="prev" />
                </button>
                {playing ? (
                    <button type="button" className="trace-btn trace-btn--main" onClick={() => setPlaying(false)} aria-label="Pausar">
                        <Icon name="pause" />
                    </button>
                ) : (
                    <button type="button" className="trace-btn trace-btn--main" onClick={play} aria-label={step >= last ? 'Repetir desde el inicio' : 'Reproducir'}>
                        <Icon name={step >= last ? 'restart' : 'play'} />
                    </button>
                )}
                <button type="button" className="trace-btn" onClick={() => goTo(step + 1)} disabled={step === last} aria-label="Paso siguiente">
                    <Icon name="next" />
                </button>
            </div>
        </div>
    );
}
