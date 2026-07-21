"use client";

import { useMemo, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { agregarPelicula, editarPelicula, eliminarPelicula } from "@/redux/slices/peliculasSlice";
import type { Pelicula } from "@/types/pelicula";
import Buscador from "./Buscador";
import Filtros from "./Filtros";
import FormularioPelicula from "./FormularioPelicula";
import TablaPeliculas from "./TablaPeliculas";

const filtrosIniciales = { genero: "", clasificacion: "", sala: "", estado: "" };

export default function GestionPeliculas() {
  const dispatch = useAppDispatch();
  const peliculas = useAppSelector((state) => state.peliculas.items);
  const funciones = useAppSelector((state) => state.funciones.items);
  const salas = useAppSelector((state) => state.salas.items);
  const [editar, setEditar] = useState<Pelicula | null>(null);
  const [busqueda, setBusqueda] = useState("");
  const [filtros, setFiltros] = useState(filtrosIniciales);
  const [mensaje, setMensaje] = useState("");

  const peliculasFiltradas = useMemo(() => {
    const termino = busqueda.trim().toLocaleLowerCase("es");
    return peliculas.filter((pelicula) => {
      const funcionesPelicula = funciones.filter((funcion) => funcion.peliculaCodigo === pelicula.codigo);
      const nombresSalas = funcionesPelicula.map((funcion) => salas.find(({ id }) => id === funcion.salaId)?.nombre ?? "");
      const coincideBusqueda = !termino || [pelicula.nombre, pelicula.genero, pelicula.clasificacion, ...nombresSalas].some((valor) => valor.toLocaleLowerCase("es").includes(termino));
      return coincideBusqueda && (!filtros.genero || pelicula.genero === filtros.genero) && (!filtros.clasificacion || pelicula.clasificacion === filtros.clasificacion) && (!filtros.sala || funcionesPelicula.some((funcion) => funcion.salaId === filtros.sala)) && (!filtros.estado || pelicula.estado === filtros.estado);
    });
  }, [busqueda, filtros, funciones, peliculas, salas]);

  const obtenerSalasProgramadas = (codigoPelicula: string) => {
    const ids = new Set(funciones.filter((funcion) => funcion.peliculaCodigo === codigoPelicula).map((funcion) => funcion.salaId));
    const nombres = [...ids].map((id) => salas.find((sala) => sala.id === id)?.nombre ?? id);
    return nombres.length ? nombres.join(", ") : "Sin funciones";
  };

  const guardar = (pelicula: Pelicula) => {
    dispatch(editar ? editarPelicula(pelicula) : agregarPelicula(pelicula));
    setMensaje(editar ? "Película actualizada correctamente." : "Película agregada correctamente.");
    setEditar(null);
  };

  const eliminar = (pelicula: Pelicula) => {
    if (funciones.some((funcion) => funcion.peliculaCodigo === pelicula.codigo)) {
      setMensaje("No se puede eliminar: la película tiene funciones registradas.");
      return;
    }
    if (window.confirm(`¿Eliminar “${pelicula.nombre}”?`)) {
      dispatch(eliminarPelicula(pelicula.codigo));
      setMensaje("Película eliminada.");
    }
  };

  return (
    <section className="modulo">
      <div className="titulo-seccion"><div><p className="eyebrow">Catálogo</p><h2>Gestión de películas</h2><p>Registra, actualiza y encuentra las películas del cine.</p></div><span className="contador">{peliculas.length} registradas</span></div>
      {mensaje && <div className="mensaje" role="status">{mensaje}<button onClick={() => setMensaje("")} aria-label="Cerrar mensaje">×</button></div>}
      <FormularioPelicula key={editar?.codigo ?? "nueva"} peliculaEditar={editar} codigosExistentes={peliculas.map((p) => p.codigo)} alGuardar={guardar} alCancelar={() => setEditar(null)} />
      <div className="panel">
        <Buscador valor={busqueda} alCambiar={setBusqueda} />
        <Filtros {...filtros} generos={[...new Set(peliculas.map((p) => p.genero))]} clasificaciones={[...new Set(peliculas.map((p) => p.clasificacion))]} salas={salas} alCambiar={(campo, valor) => setFiltros((actual) => ({ ...actual, [campo]: valor }))} alLimpiar={() => { setFiltros(filtrosIniciales); setBusqueda(""); }} />
        <TablaPeliculas peliculas={peliculasFiltradas} obtenerSalas={obtenerSalasProgramadas} alEditar={(pelicula) => { setEditar(pelicula); window.scrollTo({ top: 360, behavior: "smooth" }); }} alEliminar={eliminar} />
      </div>
    </section>
  );
}
