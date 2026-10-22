export default function PageHeader({ chip, title }) {
    return (
        <div className="page-header">
            <span className="chip">[ {chip} ]</span>
            <h1 className="page-title">{title}</h1>
        </div>
    );
}
