"use client";

import { useAppSelector } from "@/redux/hooks";

const instanteInicial = Date.now();

export default function Dashboard() {
  const peliculas = useAppSelector((state) => state.peliculas.items);
  const funciones = useAppSelector((state) => state.funciones.items);
  const reservas = useAppSelector((state) => state.reservas.items);
  const salas = useAppSelector((state) => state.salas.items);

  const boletosVendidos = reservas.reduce(
    (total, reserva) => total + reserva.cantidadBoletos,
    0,
  );
  const ingresos = reservas.reduce((total, reserva) => total + reserva.total, 0);
  const asientos = funciones.flatMap((funcion) => funcion.asientos);
  const disponibles = asientos.filter(
    (asiento) => asiento.estado === "disponible",
  ).length;
  const ocupados = asientos.filter(
    (asiento) => asiento.estado === "ocupado",
  ).length;

  const conteoPorPelicula = reservas.reduce<Record<string, number>>(
    (conteo, reserva) => {
      conteo[reserva.peliculaCodigo] =
        (conteo[reserva.peliculaCodigo] ?? 0) + reserva.cantidadBoletos;
      return conteo;
    },
    {},
  );
  const codigoMasReservado = Object.entries(conteoPorPelicula).sort(
    ([, cantidadA], [, cantidadB]) => cantidadB - cantidadA,
  )[0]?.[0];
  const masReservada =
    peliculas.find((pelicula) => pelicula.codigo === codigoMasReservado)?.nombre ??
    "Sin reservas";

  const ventasPorPelicula = Object.entries(
    reservas.reduce<Record<string, { boletos: number; ingresos: number }>>(
      (ventas, reserva) => {
        const actual = ventas[reserva.peliculaCodigo] ?? {
          boletos: 0,
          ingresos: 0,
        };
        ventas[reserva.peliculaCodigo] = {
          boletos: actual.boletos + reserva.cantidadBoletos,
          ingresos: actual.ingresos + reserva.total,
        };
        return ventas;
      },
      {},
    ),
  )
    .map(([codigo, venta]) => ({
      ...venta,
      codigo,
      nombre:
        peliculas.find((pelicula) => pelicula.codigo === codigo)?.nombre ?? codigo,
    }))
    .sort((ventaA, ventaB) => ventaB.boletos - ventaA.boletos)
    .slice(0, 6);
  const mayorVenta = Math.max(
    1,
    ...ventasPorPelicula.map((venta) => venta.boletos),
  );

  const proximasFunciones = funciones
    .filter(
      (funcion) =>
        Date.parse(`${funcion.fecha}T${funcion.hora}`) >= instanteInicial,
    )
    .toSorted(
      (funcionA, funcionB) =>
        `${funcionA.fecha}T${funcionA.hora}`.localeCompare(
          `${funcionB.fecha}T${funcionB.hora}`,
        ),
    )
    .slice(0, 4);

  const nombrePelicula = (codigo: string) =>
    peliculas.find((pelicula) => pelicula.codigo === codigo)?.nombre ?? codigo;
  const nombreSala = (id: string) =>
    salas.find((sala) => sala.id === id)?.nombre ?? id;
  const ventasRecientes = [...reservas]
    .sort((reservaA, reservaB) =>
      reservaB.fechaCreacion.localeCompare(reservaA.fechaCreacion),
    )
    .slice(0, 8);

  const tarjetas = [
    ["Películas", peliculas.length, "🎞️"],
    ["Funciones", funciones.length, "🕒"],
    ["Boletos vendidos", boletosVendidos, "🎟️"],
    ["Asientos disponibles", disponibles, "✓"],
    ["Asientos ocupados", ocupados, "●"],
    ["Ingresos", `$${ingresos.toFixed(2)}`, "💰"],
    ["Más reservada", masReservada, "★"],
  ];

  return (
    <section aria-labelledby="dashboard-titulo" className="dashboard">
      <div className="titulo-seccion compacto">
        <div>
          <p className="eyebrow">Resumen en tiempo real</p>
          <h2 id="dashboard-titulo">Dashboard</h2>
        </div>
      </div>
      <div className="tarjetas-dashboard">
        {tarjetas.map(([etiqueta, valor, icono]) => (
          <article className="tarjeta-estadistica" key={etiqueta}>
            <span className="estadistica-icono" aria-hidden="true">{icono}</span>
            <div>
              <p>{etiqueta}</p>
              <strong>{valor}</strong>
            </div>
          </article>
        ))}
      </div>
      <div className="dashboard-detalle-grid">
        <article className="grafica-ventas" aria-labelledby="grafica-ventas-titulo">
          <div className="grafica-encabezado">
            <div>
              <p className="eyebrow">Rendimiento comercial</p>
              <h3 id="grafica-ventas-titulo">Boletos vendidos por película</h3>
            </div>
            <span>Top {Math.max(ventasPorPelicula.length, 1)}</span>
          </div>

          {ventasPorPelicula.length ? (
            <div
              className="barras-ventas"
              role="img"
              aria-label="Gráfica horizontal de boletos vendidos e ingresos por película"
            >
              {ventasPorPelicula.map((venta) => (
                <div className="fila-venta" key={venta.codigo}>
                  <div className="etiqueta-venta">
                    <strong>{venta.nombre}</strong>
                    <small>${venta.ingresos.toFixed(2)} en ingresos</small>
                  </div>
                  <div className="carril-venta">
                    <div
                      className="barra-venta"
                      style={{ width: `${(venta.boletos / mayorVenta) * 100}%` }}
                    />
                  </div>
                  <strong className="valor-venta">
                    {venta.boletos} {venta.boletos === 1 ? "boleto" : "boletos"}
                  </strong>
                </div>
              ))}
            </div>
          ) : (
            <div className="grafica-vacia">
              <span aria-hidden="true">▥</span>
              <div>
                <strong>La gráfica aparecerá con la primera venta</strong>
                <p>Las reservas confirmadas se agruparán automáticamente por película.</p>
              </div>
            </div>
          )}
        </article>

        <article
          className="proximas-funciones"
          aria-labelledby="proximas-funciones-titulo"
        >
          <div className="grafica-encabezado">
            <div>
              <p className="eyebrow">Agenda</p>
              <h3 id="proximas-funciones-titulo">Próximas funciones</h3>
            </div>
            <span>{funciones.length} total</span>
          </div>

          {proximasFunciones.length ? (
            <ol className="lista-proximas-funciones">
              {proximasFunciones.map((funcion) => {
                const asientosLibres = funcion.asientos.filter(
                  (asiento) => asiento.estado !== "ocupado",
                ).length;
                return (
                  <li key={funcion.id}>
                    <time dateTime={`${funcion.fecha}T${funcion.hora}`}>
                      <strong>
                        {new Date(`${funcion.fecha}T12:00:00`).toLocaleDateString(
                          "es-SV",
                          { day: "2-digit", month: "short" },
                        )}
                      </strong>
                      <span>{funcion.hora}</span>
                    </time>
                    <div>
                      <strong>{nombrePelicula(funcion.peliculaCodigo)}</strong>
                      <small>{nombreSala(funcion.salaId)} · {asientosLibres} libres</small>
                    </div>
                  </li>
                );
              })}
            </ol>
          ) : (
            <div className="funciones-vacias">
              <span aria-hidden="true">🕒</span>
              <strong>No hay funciones programadas</strong>
              <p>Las próximas funciones aparecerán aquí.</p>
            </div>
          )}
        </article>
      </div>

      <article className="historial-ventas-dashboard" aria-labelledby="historial-ventas-titulo">
        <div className="grafica-encabezado">
          <div>
            <p className="eyebrow">Registro comercial</p>
            <h3 id="historial-ventas-titulo">Historial de ventas</h3>
          </div>
          <span>{reservas.length} ventas</span>
        </div>

        {ventasRecientes.length ? (
          <div className="tabla-contenedor">
            <table>
              <thead>
                <tr><th>Cliente</th><th>Película</th><th>Boletos</th><th>Asientos</th><th>Total</th><th>Fecha</th></tr>
              </thead>
              <tbody>
                {ventasRecientes.map((venta) => (
                  <tr key={venta.id}>
                    <td>
                      <strong>{venta.cliente?.nombre ?? "Cliente no registrado"}</strong>
                      <small>{venta.cliente?.email ?? venta.cliente?.telefono}</small>
                    </td>
                    <td>{nombrePelicula(venta.peliculaCodigo)}</td>
                    <td>{venta.cantidadBoletos}</td>
                    <td>{venta.asientosIds.join(", ")}</td>
                    <td><strong>${venta.total.toFixed(2)}</strong></td>
                    <td>{new Date(venta.fechaCreacion).toLocaleString("es-SV")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="historial-vacio">
            <span aria-hidden="true">🧾</span>
            <div>
              <strong>Aún no hay ventas registradas</strong>
              <p>Las reservas confirmadas aparecerán aquí con los datos del cliente.</p>
            </div>
          </div>
        )}
      </article>
    </section>
  );
}
