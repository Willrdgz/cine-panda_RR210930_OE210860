"use client";

import { useAppSelector } from "@/redux/hooks";

export default function Dashboard() {
  const peliculas = useAppSelector((state) => state.peliculas.items);
  const funciones = useAppSelector((state) => state.funciones.items);
  const reservas = useAppSelector((state) => state.reservas.items);

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
    </section>
  );
}
