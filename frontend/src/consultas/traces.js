// Convierte los datos reales de la base en los pasos de la animación de cada consulta.
// Cada paso: { lines: [índices del SQL resaltados], caption, panels: [...] }
// Cada panel: { id, title, columns, rows: [{ key, cells, state }], fresh? }
// Estados de fila: base | hit | null | out | new
//
// Los pasos intermedios se calculan desde las tablas base; el paso final muestra
// `resultado` (las filas que devolvió el SQL real), así el orden coincide siempre
// con la tabla de resultados aunque haya empates en el ORDER BY.

export const money = (v) => `$${Number(v).toLocaleString('es-CO')}`;
const plural = (n, uno, varios) => `${n} ${n === 1 ? uno : varios}`;

function clienteJoinCompra(clientes, compras) {
    const rows = [];
    for (const cl of clientes) {
        const suyas = compras.filter((c) => c.id_cliente === cl.id_cliente);
        if (suyas.length === 0) {
            rows.push({ key: `j-${cl.id_cliente}`, cells: [cl.id_cliente, cl.nombre, null, null], state: 'null' });
        } else {
            for (const c of suyas) {
                rows.push({ key: `j-${cl.id_cliente}-${c.id_compra}`, cells: [cl.id_cliente, cl.nombre, `#${c.id_compra}`, c.id_cliente], state: 'hit' });
            }
        }
    }
    return rows;
}

const clientePanel = (clientes) => ({
    id: 'cliente',
    title: 'cliente',
    columns: ['id_cliente', 'nombre', 'apellidos'],
    rows: clientes.map((cl) => ({ key: cl.id_cliente, cells: [cl.id_cliente, cl.nombre, cl.apellidos], state: 'base' })),
});

const compraPanel = (compras) => ({
    id: 'compra',
    title: 'compra',
    columns: ['id_compra', 'id_cliente', 'codigo_producto'],
    rows: compras.map((c) => ({ key: `c-${c.id_compra}`, cells: [`#${c.id_compra}`, c.id_cliente, c.codigo_producto], state: 'base' })),
});

const joinColumns = ['cl.id_cliente', 'cl.nombre', 'c.id_compra', 'c.id_cliente'];

function consulta1({ clientes, compras, resultado }) {
    const sql = [
        'SELECT cl.id_cliente, cl.nombre, cl.apellidos,',
        '       COUNT(c.*) AS cantidad_pedidos',
        'FROM cliente cl',
        'LEFT JOIN compra c ON c.id_cliente = cl.id_cliente',
        'GROUP BY cl.id_cliente, cl.nombre, cl.apellidos',
        'ORDER BY cantidad_pedidos DESC;',
    ];
    const joined = clienteJoinCompra(clientes, compras);
    const sinCompras = clientes.filter((cl) => !compras.some((c) => c.id_cliente === cl.id_cliente)).length;
    const grupos = clientes.map((cl) => {
        const ids = compras.filter((c) => c.id_cliente === cl.id_cliente).map((c) => `#${c.id_compra}`);
        return { cl, ids };
    });
    const conteo = grupos.map(({ cl, ids }) => ({ cl, n: ids.length }));

    return {
        sql,
        steps: [
            {
                lines: [2],
                caption: `FROM cliente: el punto de partida es la tabla completa, ${plural(clientes.length, 'fila', 'filas')}.`,
                panels: [clientePanel(clientes)],
            },
            {
                lines: [3],
                caption: 'Se trae compra para emparejar cada pedido con su cliente por id_cliente.',
                panels: [clientePanel(clientes), compraPanel(compras)],
            },
            {
                lines: [3],
                caption: sinCompras
                    ? `LEFT JOIN: cada cliente se une con sus compras. ${plural(sinCompras, 'cliente sin compras se conserva', 'clientes sin compras se conservan')} con NULL.`
                    : 'LEFT JOIN: cada cliente se une con cada una de sus compras.',
                panels: [{ id: 'join', title: 'cliente ⟕ compra', columns: joinColumns, rows: joined }],
            },
            {
                lines: [4],
                caption: 'GROUP BY: las filas del mismo cliente se juntan en una sola.',
                panels: [{
                    id: 'grupos',
                    title: 'agrupado por cliente',
                    columns: ['id_cliente', 'nombre', 'compras del grupo'],
                    rows: grupos.map(({ cl, ids }) => ({
                        key: `g-${cl.id_cliente}`,
                        cells: [cl.id_cliente, cl.nombre, ids.length ? ids.join('  ') : null],
                        state: ids.length ? 'base' : 'null',
                    })),
                }],
            },
            {
                lines: [1],
                caption: 'COUNT(c.*) cuenta las compras de cada grupo. Los NULL no cuentan, por eso quien no compró queda en 0.',
                panels: [{
                    id: 'grupos',
                    title: 'agrupado por cliente',
                    columns: ['id_cliente', 'nombre', 'cantidad_pedidos'],
                    fresh: 2,
                    rows: conteo.map(({ cl, n }) => ({ key: `g-${cl.id_cliente}`, cells: [cl.id_cliente, cl.nombre, String(n)], state: 'hit' })),
                }],
            },
            {
                lines: [0, 1, 5],
                caption: 'ORDER BY: de más a menos pedidos. Este es el resultado de la consulta.',
                panels: [{
                    id: 'resultado',
                    title: 'resultado',
                    columns: ['id_cliente', 'nombre', 'apellidos', 'cantidad_pedidos'],
                    rows: resultado.map((r) => ({ key: `r-${r.id_cliente}`, cells: [r.id_cliente, r.nombre, r.apellidos, String(r.cantidad_pedidos)], state: 'new' })),
                }],
            },
        ],
    };
}

function consulta2({ clientes, compras, resultado }) {
    const sql = [
        'SELECT cl.*',
        'FROM cliente cl',
        'LEFT JOIN compra c ON c.id_cliente = cl.id_cliente',
        'WHERE c.id_cliente IS NULL;',
    ];
    const joined = clienteJoinCompra(clientes, compras);

    return {
        sql,
        steps: [
            {
                lines: [1],
                caption: `FROM cliente: se parte de todos los clientes, ${plural(clientes.length, 'fila', 'filas')}.`,
                panels: [clientePanel(clientes)],
            },
            {
                lines: [2],
                caption: 'LEFT JOIN: cada cliente se une con sus compras. Si no tiene ninguna, las columnas de compra quedan en NULL.',
                panels: [{ id: 'join', title: 'cliente ⟕ compra', columns: joinColumns, rows: joined }],
            },
            {
                lines: [3],
                caption: 'WHERE c.id_cliente IS NULL: se descartan las filas que sí encontraron compra. Solo sobreviven las que quedaron en NULL.',
                panels: [{
                    id: 'join',
                    title: 'cliente ⟕ compra',
                    columns: joinColumns,
                    rows: joined.map((r) => ({ ...r, state: r.state === 'null' ? 'hit' : 'out' })),
                }],
            },
            {
                lines: [0],
                caption: resultado.length
                    ? `SELECT cl.*: de las filas que quedaron se muestran todas las columnas del cliente. ${plural(resultado.length, 'cliente', 'clientes')} sin pedidos.`
                    : 'SELECT cl.*: no quedó ninguna fila. Todos los clientes tienen al menos un pedido.',
                panels: [{
                    id: 'resultado',
                    title: 'resultado',
                    columns: ['id_cliente', 'nombre', 'apellidos', 'direccion', 'fecha_nacimiento'],
                    rows: resultado.map((cl) => ({
                        key: `r-${cl.id_cliente}`,
                        cells: [cl.id_cliente, cl.nombre, cl.apellidos, cl.direccion, cl.fecha_nacimiento],
                        state: 'new',
                    })),
                }],
            },
        ],
    };
}

function consulta3({ clientes, compras, productos, proveedores, resultado }) {
    const sql = [
        'SELECT cl.nombre AS nombre_cliente,',
        '       cl.apellidos AS apellidos_cliente,',
        '       p.nombre AS nombre_producto,',
        '       c.cantidad, c.precio_compra,',
        '       pr.nombre AS nombre_proveedor',
        'FROM compra c',
        'JOIN cliente cl ON cl.id_cliente = c.id_cliente',
        'JOIN producto p ON p.codigo = c.codigo_producto',
        'JOIN proveedor pr ON pr.nit = p.nit_proveedor',
        'ORDER BY c.fecha_compra DESC;',
    ];
    const filas = compras.map((c) => {
        const cl = clientes.find((x) => x.id_cliente === c.id_cliente) ?? {};
        const p = productos.find((x) => x.codigo === c.codigo_producto) ?? {};
        const pr = proveedores.find((x) => x.nit === p.nit_proveedor) ?? {};
        return { c, cl, p, pr };
    });

    return {
        sql,
        steps: [
            {
                lines: [5],
                caption: `FROM compra: cada pedido es una fila, ${plural(compras.length, 'pedido', 'pedidos')} en total.`,
                panels: [{
                    id: 'traza',
                    title: 'compra',
                    columns: ['id_compra', 'id_cliente', 'codigo_producto', 'cantidad', 'precio_compra'],
                    rows: filas.map(({ c }) => ({ key: `t-${c.id_compra}`, cells: [`#${c.id_compra}`, c.id_cliente, c.codigo_producto, String(c.cantidad), money(c.precio_compra)], state: 'base' })),
                }],
            },
            {
                lines: [6],
                caption: 'JOIN cliente: con el id_cliente de cada pedido se busca su cliente y se agrega su nombre.',
                panels: [{
                    id: 'traza',
                    title: 'compra ⋈ cliente',
                    columns: ['id_compra', 'c.id_cliente', 'cl.nombre'],
                    fresh: 2,
                    rows: filas.map(({ c, cl }) => ({ key: `t-${c.id_compra}`, cells: [`#${c.id_compra}`, c.id_cliente, `${cl.nombre ?? ''} ${cl.apellidos ?? ''}`.trim()], state: 'hit' })),
                }],
            },
            {
                lines: [7],
                caption: 'JOIN producto: con el codigo_producto se trae el nombre del producto y el NIT de su proveedor.',
                panels: [{
                    id: 'traza',
                    title: 'compra ⋈ cliente ⋈ producto',
                    columns: ['id_compra', 'cl.nombre', 'c.codigo_producto', 'p.nombre', 'p.nit_proveedor'],
                    fresh: 3,
                    rows: filas.map(({ c, cl, p }) => ({ key: `t-${c.id_compra}`, cells: [`#${c.id_compra}`, cl.nombre, c.codigo_producto, p.nombre, p.nit_proveedor], state: 'hit' })),
                }],
            },
            {
                lines: [8],
                caption: 'JOIN proveedor: con el NIT del producto se llega al proveedor que lo suministra.',
                panels: [{
                    id: 'traza',
                    title: '… ⋈ proveedor',
                    columns: ['id_compra', 'cl.nombre', 'p.nombre', 'p.nit_proveedor', 'pr.nombre'],
                    fresh: 4,
                    rows: filas.map(({ c, cl, p, pr }) => ({ key: `t-${c.id_compra}`, cells: [`#${c.id_compra}`, cl.nombre, p.nombre, p.nit_proveedor, pr.nombre], state: 'hit' })),
                }],
            },
            {
                lines: [0, 1, 2, 3, 4, 9],
                caption: 'SELECT se queda con las columnas pedidas y ORDER BY pone primero las compras más recientes. Este es el resultado.',
                panels: [{
                    id: 'resultado',
                    title: 'resultado',
                    columns: ['nombre_cliente', 'producto', 'cantidad', 'precio_compra', 'proveedor'],
                    rows: resultado.map((r, i) => ({
                        key: `r-${i}`,
                        cells: [`${r.nombre_cliente} ${r.apellidos_cliente}`, r.nombre_producto, String(r.cantidad), money(r.precio_compra), r.nombre_proveedor],
                        state: 'new',
                    })),
                }],
            },
        ],
    };
}

function consulta4({ productos, proveedores, resultado }) {
    const sql = [
        'SELECT pr.nit, pr.nombre AS nombre_proveedor, p.codigo,',
        '       p.nombre AS nombre_producto, p.precio_unitario',
        'FROM proveedor pr',
        'LEFT JOIN producto p ON p.nit_proveedor = pr.nit',
        'ORDER BY pr.nombre, p.nombre;',
    ];
    const joined = [];
    for (const pr of proveedores) {
        const suyos = productos.filter((p) => p.nit_proveedor === pr.nit);
        if (suyos.length === 0) {
            joined.push({ pr, p: null });
        } else {
            for (const p of suyos) joined.push({ pr, p });
        }
    }
    const sinProductos = proveedores.filter((pr) => !productos.some((p) => p.nit_proveedor === pr.nit)).length;

    const row = ({ pr, p }, prefix, state) => ({
        key: `${prefix}-${pr.nit}-${p?.codigo ?? 'null'}`,
        cells: [pr.nit, pr.nombre, p?.codigo ?? null, p?.nombre ?? null, p ? money(p.precio_unitario) : null],
        state: p ? state : 'null',
    });

    return {
        sql,
        steps: [
            {
                lines: [2],
                caption: `FROM proveedor: se parte de todos los proveedores, ${plural(proveedores.length, 'fila', 'filas')}.`,
                panels: [{
                    id: 'proveedor',
                    title: 'proveedor',
                    columns: ['nit', 'nombre'],
                    rows: proveedores.map((pr) => ({ key: pr.nit, cells: [pr.nit, pr.nombre], state: 'base' })),
                }],
            },
            {
                lines: [3],
                caption: 'Se trae producto: cada producto guarda en nit_proveedor quién lo suministra.',
                panels: [
                    {
                        id: 'proveedor',
                        title: 'proveedor',
                        columns: ['nit', 'nombre'],
                        rows: proveedores.map((pr) => ({ key: pr.nit, cells: [pr.nit, pr.nombre], state: 'base' })),
                    },
                    {
                        id: 'producto',
                        title: 'producto',
                        columns: ['codigo', 'nombre', 'nit_proveedor'],
                        rows: productos.map((p) => ({ key: `p-${p.codigo}`, cells: [p.codigo, p.nombre, p.nit_proveedor], state: 'base' })),
                    },
                ],
            },
            {
                lines: [3],
                caption: sinProductos
                    ? `LEFT JOIN: cada proveedor se une con sus productos. ${plural(sinProductos, 'proveedor sin productos se conserva', 'proveedores sin productos se conservan')} con NULL.`
                    : 'LEFT JOIN: cada proveedor se une con cada producto que suministra.',
                panels: [{
                    id: 'join',
                    title: 'proveedor ⟕ producto',
                    columns: ['pr.nit', 'pr.nombre', 'p.codigo', 'p.nombre', 'p.precio_unitario'],
                    rows: joined.map((j) => row(j, 'j', 'hit')),
                }],
            },
            {
                lines: [0, 1, 4],
                caption: 'ORDER BY: primero por nombre de proveedor y luego por nombre de producto. Este es el resultado.',
                panels: [{
                    id: 'resultado',
                    title: 'resultado',
                    columns: ['nit', 'nombre_proveedor', 'codigo', 'nombre_producto', 'precio_unitario'],
                    rows: resultado.map((r, i) => ({
                        key: `r-${i}`,
                        cells: [r.nit, r.nombre_proveedor, r.codigo, r.nombre_producto, r.precio_unitario == null ? null : money(r.precio_unitario)],
                        state: r.codigo == null ? 'null' : 'new',
                    })),
                }],
            },
        ],
    };
}

export const TRACES = {
    'clientes-pedidos': consulta1,
    'clientes-sin-pedidos': consulta2,
    'detalle-compras': consulta3,
    'proveedores-productos': consulta4,
};
