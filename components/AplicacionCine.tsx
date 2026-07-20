"use client";

import { useState } from "react";
import Dashboard from "./Dashboard";
import GestionFunciones from "./GestionFunciones";
import GestionPeliculas from "./GestionPeliculas";
import FormularioReserva from "./FormularioReserva";

type Seccion = "dashboard" | "peliculas" | "funciones" | "reservas";

const opciones: { id: Seccion; etiqueta: string; icono: string }[] = [
  { id: "dashboard", etiqueta: "Dashboard", icono: "▦" },
  { id: "peliculas", etiqueta: "Películas", icono: "🎬" },
  { id: "funciones", etiqueta: "Funciones", icono: "🕒" },
  { id: "reservas", etiqueta: "Reservas", icono: "🎟️" },
];

export default function AplicacionCine() {
  const [seccion, setSeccion] = useState<Seccion>("dashboard");

  return (
    <div className="app-shell">
      <header className="encabezado">
        <div className="marca">
          <span className="marca-icono" aria-hidden="true">🐼</span>
          <div>
            <p className="marca-kicker">Sistema de administración</p>
            <h1>Cine Panda</h1>
          </div>
        </div>
        <nav className="navegacion" aria-label="Secciones principales">
          {opciones.map((opcion) => (
            <button
              className={seccion === opcion.id ? "nav-activo" : ""}
              key={opcion.id}
              onClick={() => setSeccion(opcion.id)}
              type="button"
            >
              <span aria-hidden="true">{opcion.icono}</span> {opcion.etiqueta}
            </button>
          ))}
        </nav>
      </header>

      <main>
        {seccion === "dashboard" && <Dashboard />}
        {seccion === "peliculas" && <GestionPeliculas />}
        {seccion === "funciones" && <GestionFunciones />}
        {seccion === "reservas" && <FormularioReserva />}
      </main>

      <footer>Cine Panda · Estado global administrado con Redux Toolkit</footer>
    </div>
  );
}
