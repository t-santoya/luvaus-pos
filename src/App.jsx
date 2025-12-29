import { useState, useEffect } from "react";
import { productos } from "./data/productos";

function App() {
  /* ================= FECHA ================= */
  const hoy = new Date().toISOString().slice(0, 10);

  /* ================= ESTADOS ================= */
  const [metodoPago, setMetodoPago] = useState("");
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [busqueda, setBusqueda] = useState("");
  const [lineaSeleccionada, setLineaSeleccionada] = useState("Todas");
  const [fechaSeleccionada, setFechaSeleccionada] = useState(hoy);

  const [ventas, setVentas] = useState(() =>
    JSON.parse(localStorage.getItem("ventas")) || []
  );

  const [diasCerrados, setDiasCerrados] = useState(() =>
    JSON.parse(localStorage.getItem("diasCerrados")) || []
  );

  const [mostrarHistorial, setMostrarHistorial] = useState(false);
  const [historialAbierto, setHistorialAbierto] = useState(null);
  const [mostrarResumenMes, setMostrarResumenMes] = useState(false);

  /* ================= PERSISTENCIA ================= */
  useEffect(() => {
    localStorage.setItem("ventas", JSON.stringify(ventas));
  }, [ventas]);

  useEffect(() => {
    localStorage.setItem("diasCerrados", JSON.stringify(diasCerrados));
  }, [diasCerrados]);

  /* ================= DIA CERRADO ================= */
  const diaCerrado = diasCerrados.includes(fechaSeleccionada);

  /* ================= LINEAS ================= */
  const obtenerLinea = (producto) => {
    const n = producto.nombre.toLowerCase();

    if (n.includes("bioelixir")) return "Bioelixir";
    if (n.includes("plexipro")) return "Plexipro";
    if (n.includes("crexiforte")) return "Crexiforte";
    if (n.includes("derma b")) return "Derma-B";

    if (
      n.includes("acid hialur") ||
      n.includes("ampolla") ||
      n.includes("spray desenr") ||
      n.includes("crema intensiva")
    ) return "Ácido Hialurónico";

    if (n.includes("rizos")) return "Rizos";

    if (
      n.includes("6 oleos") ||
      n.includes("6 óleos") ||
      n.includes("hair gloss") ||
      n.includes("silicona")
    ) return "6 Óleos";

    if (n.includes("anticaspa")) return "Anticaspa";
    if (n.includes("cebolla")) return "Cebolla";

    return "Gel Frío";
  };

  const lineas = ["Todas", ...new Set(productos.map(obtenerLinea))];

  /* ================= FILTROS ================= */
  const productosFiltrados = productos.filter((p) => {
    const okLinea =
      lineaSeleccionada === "Todas" ||
      obtenerLinea(p) === lineaSeleccionada;

    const okBusqueda = p.nombre
      .toLowerCase()
      .includes(busqueda.toLowerCase());

    return okLinea && okBusqueda;
  });

  const productosAgrupados = productosFiltrados.reduce((acc, p) => {
    const linea = obtenerLinea(p);
    if (!acc[linea]) acc[linea] = [];
    acc[linea].push(p);
    return acc;
  }, {});

  /* ================= VENTAS ================= */
  const registrarVenta = () => {
    if (diaCerrado) {
      alert("🔒 Este día está cerrado");
      return;
    }

    if (!productoSeleccionado || !metodoPago) {
      alert("Selecciona producto y método de pago");
      return;
    }

    const nuevaVenta = {
      id: Date.now(),
      fecha: fechaSeleccionada,
      item: productoSeleccionado.item,
      linea: obtenerLinea(productoSeleccionado),
      nombre: productoSeleccionado.nombre,
      precio: productoSeleccionado.precio,
      metodoPago,
    };

    setVentas([...ventas, nuevaVenta]);
    setProductoSeleccionado(null);
    setMetodoPago("");
  };

  const eliminarVenta = (id) => {
    if (!window.confirm("¿Eliminar esta venta?")) return;
    setVentas(ventas.filter((v) => v.id !== id));
  };

  const ventasDelDia = ventas.filter(
    (v) => v.fecha === fechaSeleccionada
  );

  const totalDia = ventasDelDia.reduce(
    (s, v) => s + v.precio,
    0
  );

  /* ================= EXCEL ================= */
  const exportarExcel = () => {
    if (ventasDelDia.length === 0) {
      alert("No hay ventas para exportar");
      return;
    }

    let csv =
      "\uFEFFFecha;Item;Linea;Producto;Metodo;Precio\n";

    ventasDelDia.forEach((v) => {
      csv += `${v.fecha};${v.item};${v.linea};"${v.nombre}";${v.metodoPago};${v.precio}\n`;
    });

    csv += `\n;;;;TOTAL;${totalDia}`;

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `ventas_LUVAUS_${fechaSeleccionada}.csv`;
    link.click();
  };

  const exportarExcelPorFecha = (fecha, lista) => {
    let total = lista.reduce((s, v) => s + v.precio, 0);

    let csv =
      "\uFEFFFecha;Item;Linea;Producto;Metodo;Precio\n";

    lista.forEach((v) => {
      csv += `${v.fecha};${v.item};${v.linea};"${v.nombre}";${v.metodoPago};${v.precio}\n`;
    });

    csv += `\n;;;;TOTAL;${total}`;

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `ventas_LUVAUS_${fecha}.csv`;
    link.click();
  };

  /* ================= WHATSAPP ================= */
  const enviarWhatsApp = () => {
    let msg = `📊 *Ventas LUVAUS*\n📅 ${fechaSeleccionada}\n\n`;

    ventasDelDia.forEach((v) => {
      msg += `• ${v.item} - ${v.nombre}\n${v.metodoPago} $${v.precio}\n\n`;
    });

    msg += `💰 *Total:* $${totalDia}`;

    window.open(
      `https://wa.me/?text=${encodeURIComponent(msg)}`,
      "_blank"
    );
  };

  /* ================= RESUMEN MENSUAL ================= */
  const mesSeleccionado = fechaSeleccionada.slice(0, 7);

  const ventasMes = ventas.filter((v) =>
    v.fecha.startsWith(mesSeleccionado)
  );

  const totalMes = ventasMes.reduce(
    (s, v) => s + v.precio,
    0
  );

  const resumenPorMetodo = ventasMes.reduce((acc, v) => {
    acc[v.metodoPago] = (acc[v.metodoPago] || 0) + v.precio;
    return acc;
  }, {});

  /* ================= CERRAR DIA ================= */
  const cerrarDia = () => {
    if (ventasDelDia.length === 0) {
      alert("No hay ventas para cerrar este día");
      return;
    }

    if (diaCerrado) {
      alert("Este día ya está cerrado");
      return;
    }

    setDiasCerrados([...diasCerrados, fechaSeleccionada]);

    const mañana = new Date(fechaSeleccionada);
    mañana.setDate(mañana.getDate() + 1);
    setFechaSeleccionada(mañana.toISOString().slice(0, 10));

    alert("Día cerrado correctamente");
  };

  /* ================= UI ================= */
  return (
    <>
      <header className="header">
        <h1 className="logo">LUVAUS</h1>
      </header>

      <main className="contenido">
        {/* NUEVA VENTA */}
        <div className="card">
          <h2>Nueva venta</h2>

          <input
            type="date"
            value={fechaSeleccionada}
            onChange={(e) => setFechaSeleccionada(e.target.value)}
          />

          <div className={`estado-dia ${diaCerrado ? "cerrado" : "abierto"}`}>
            {diaCerrado ? "🔒 Día cerrado" : "🟢 Día abierto"}
          </div>

          <div className="metodos-pago">
            {["Efectivo", "Transferencia", "Datáfono"].map((m) => (
              <button
                key={m}
                className={`metodo ${metodoPago === m ? "activo" : ""}`}
                onClick={() => setMetodoPago(m)}
              >
                {m}
              </button>
            ))}
          </div>

          <div className="filtro-lineas">
            {lineas.map((l) => (
              <button
                key={l}
                className={`linea-btn ${lineaSeleccionada === l ? "activo" : ""}`}
                onClick={() => setLineaSeleccionada(l)}
              >
                {l}
              </button>
            ))}
          </div>

          <input
            className="buscador"
            placeholder="Buscar producto..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />

          {Object.entries(productosAgrupados).map(([linea, lista]) => (
            <div key={linea}>
              <h3>{linea}</h3>
              <div className="lista-productos">
                {lista.map((p) => (
                  <div
                    key={p.item}
                    className={`producto ${
                      productoSeleccionado?.item === p.item ? "activo" : ""
                    }`}
                    onClick={() => !diaCerrado && setProductoSeleccionado(p)}
                  >
                    <p className="nombre">{p.nombre}</p>
                    <p className="precio">${p.precio}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}

          <button
            className="btn-principal"
            onClick={registrarVenta}
            disabled={diaCerrado}
          >
            Registrar venta
          </button>
        </div>

        {/* REPORTE */}
        <div className="card">
          <h2>Reporte del día</h2>

          {ventasDelDia.map((v) => (
            <div key={v.id} className="venta">
              <div>
                <p>{v.item} – {v.nombre}</p>
                <p>{v.metodoPago} ${v.precio}</p>
              </div>
              <button
                className="btn-eliminar"
                disabled={diaCerrado}
                onClick={() => eliminarVenta(v.id)}
              >
                ❌
              </button>
            </div>
          ))}

          <h3>Total: ${totalDia}</h3>

          <button className="btn-secundario" onClick={exportarExcel}>
            📄 Exportar Excel
          </button>

          <button className="btn-secundario" onClick={enviarWhatsApp}>
            📲 WhatsApp
          </button>

          <button className="btn-secundario" onClick={cerrarDia}>
            🔒 Cerrar día
          </button>
        </div>

        {/* RESUMEN MENSUAL */}
        <div className="card">
          <div
            className="toggle-titulo"
            onClick={() => setMostrarResumenMes(!mostrarResumenMes)}
          >
            📆 Resumen mensual {mostrarResumenMes ? "▲" : "▼"}
          </div>

          {mostrarResumenMes && (
            <div className="resumen">
              <p><strong>Mes:</strong> {mesSeleccionado}</p>
              <p><strong>Total:</strong> ${totalMes}</p>

              {Object.entries(resumenPorMetodo).map(([m, t]) => (
                <p key={m}>• {m}: ${t}</p>
              ))}
            </div>
          )}
        </div>

        {/* HISTORIAL */}
        <div className="card">
          <div
            className="toggle-titulo"
            onClick={() => setMostrarHistorial(!mostrarHistorial)}
          >
            📚 Historial {mostrarHistorial ? "▲" : "▼"}
          </div>

          {mostrarHistorial &&
            Object.entries(
              ventas.reduce((acc, v) => {
                if (!acc[v.fecha]) acc[v.fecha] = [];
                acc[v.fecha].push(v);
                return acc;
              }, {})
            )
              .sort((a, b) => b[0].localeCompare(a[0]))
              .map(([fecha, lista]) => {
                const total = lista.reduce((s, v) => s + v.precio, 0);
                const abierto = historialAbierto === fecha;

                return (
                  <div key={fecha} className="historial-dia">
                    <div
                      className="historial-header"
                      onClick={() =>
                        setHistorialAbierto(abierto ? null : fecha)
                      }
                    >
                      📅 {fecha} – 💰 ${total}
                    </div>

                    {abierto && (
                      <div className="historial-detalle">
                        {lista.map((v) => (
                          <div key={v.id} className="historial-item">
                            <span>{v.item} – {v.nombre}</span>
                            <span>{v.metodoPago} ${v.precio}</span>
                          </div>
                        ))}

                        <button
                          className="btn-principal"
                          onClick={() =>
                            exportarExcelPorFecha(fecha, lista)
                          }
                        >
                          📄 Exportar Excel
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
        </div>
      </main>
    </>
  );
}

export default App;
