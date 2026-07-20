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
    </section>
  );
}
