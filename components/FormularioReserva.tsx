"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { confirmarReserva } from "@/redux/slices/reservasSlice";
import { alternarSeleccionAsiento, limpiarSeleccion, ocuparAsientos } from "@/redux/slices/salasSlice";
import MapaAsientos from "./MapaAsientos";

export default function FormularioReserva() {
  const dispatch = useAppDispatch();
  const peliculas = useAppSelector((state) => state.peliculas.items);
  const funciones = useAppSelector((state) => state.funciones.items);
  const salas = useAppSelector((state) => state.salas.items);
  const reservas = useAppSelector((state) => state.reservas.items);
  const [peliculaCodigo, setPeliculaCodigo] = useState("");
  const [funcionId, setFuncionId] = useState("");
  const [cantidad, setCantidad] = useState(1);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");

  const pelicula = peliculas.find((p) => p.codigo === peliculaCodigo);
  const funcionesDisponibles = funciones.filter((f) => f.peliculaCodigo === peliculaCodigo);
  const funcion = funciones.find((f) => f.id === funcionId);
  const sala = salas.find((s) => s.id === funcion?.salaId);
  const seleccionados = sala?.asientos.filter((a) => a.estado === "seleccionado") ?? [];
  const total = (pelicula?.precio ?? 0) * cantidad;

  useEffect(() => {
    if (funcion?.salaId) dispatch(limpiarSeleccion(funcion.salaId));
  }, [cantidad, dispatch, funcion?.salaId]);

  const limpiarTodasLasSalas = () => {
    salas.forEach((salaActual) => dispatch(limpiarSeleccion(salaActual.id)));
  };

  const confirmar = (evento: FormEvent) => {
    evento.preventDefault();
    setError("");
    if (!pelicula || !funcion || !sala) return setError("Seleccione película y función.");
    if (seleccionados.length !== cantidad) return setError(`Seleccione exactamente ${cantidad} asiento(s).`);
    if (seleccionados.some((a) => a.estado === "ocupado")) return setError("Uno de los asientos ya está ocupado.");
    const asientosIds = seleccionados.map((a) => a.id);
    dispatch(confirmarReserva({ id: crypto.randomUUID(), peliculaCodigo, funcionId, salaId: sala.id, asientosIds, cantidadBoletos: cantidad, total, fechaCreacion: new Date().toISOString() }));
    dispatch(ocuparAsientos({ salaId: sala.id, asientosIds }));
    setMensaje(`Reserva confirmada: ${asientosIds.join(", ")} · Total $${total.toFixed(2)}`);
    setFuncionId("");
    setPeliculaCodigo("");
    setCantidad(1);
  };

  const historial = useMemo(() => [...reservas].reverse(), [reservas]);
  const nombrePelicula = (codigo: string) => peliculas.find((p) => p.codigo === codigo)?.nombre ?? codigo;
  const nombreSala = (id: string) => salas.find((s) => s.id === id)?.nombre ?? id;

  return (
    <section className="modulo">
      <div className="titulo-seccion"><div><p className="eyebrow">Taquilla</p><h2>Reserva de boletos</h2><p>Selecciona una función, elige los asientos y confirma la venta.</p></div><span className="contador">{reservas.length} reservas</span></div>
      {mensaje && <div className="mensaje" role="status">{mensaje}<button onClick={() => setMensaje("")}>×</button></div>}
      <form className="reserva-layout" onSubmit={confirmar}>
        <div className="formulario reserva-datos">
          <div className="encabezado-formulario"><div><p className="eyebrow">Paso 1</p><h3>Datos de la reserva</h3></div></div>
          {error && <p className="alerta-error" role="alert">{error}</p>}
          <label className="campo"><span>Película</span><select value={peliculaCodigo} onChange={(e) => { limpiarTodasLasSalas(); setPeliculaCodigo(e.target.value); setFuncionId(""); setError(""); }}><option value="">Seleccione</option>{peliculas.filter((p) => p.estado === "disponible").map((p) => <option value={p.codigo} key={p.codigo}>{p.nombre}</option>)}</select></label>
          <label className="campo"><span>Función</span><select disabled={!peliculaCodigo} value={funcionId} onChange={(e) => { limpiarTodasLasSalas(); setFuncionId(e.target.value); }}><option value="">Seleccione</option>{funcionesDisponibles.map((f) => <option value={f.id} key={f.id}>{f.fecha} · {f.hora} · {nombreSala(f.salaId)}</option>)}</select></label>
          <label className="campo"><span>Cantidad de boletos</span><input min="1" max="10" type="number" value={cantidad} onChange={(e) => setCantidad(Math.max(1, Math.min(10, Number(e.target.value))))} /></label>
          <div className="resumen-total"><span>Total a pagar</span><strong>${total.toFixed(2)}</strong><small>{cantidad} × ${(pelicula?.precio ?? 0).toFixed(2)}</small></div>
          <button className="boton-primario" disabled={!funcion || seleccionados.length !== cantidad} type="submit">Confirmar reserva</button>
        </div>
        <div className="panel asientos-panel">
          <div className="encabezado-formulario"><div><p className="eyebrow">Paso 2</p><h3>Selecciona {cantidad} asiento(s)</h3></div><strong>{seleccionados.length}/{cantidad}</strong></div>
          {sala ? <MapaAsientos asientos={sala.asientos} cantidadMaxima={cantidad} alAlternar={(asientoId) => dispatch(alternarSeleccionAsiento({ salaId: sala.id, asientoId }))} /> : <div className="estado-vacio"><span>💺</span><h3>Selecciona una función</h3><p>Aquí aparecerá el mapa de asientos de la sala.</p></div>}
        </div>
      </form>
      <div className="panel historial"><div className="encabezado-formulario"><div><p className="eyebrow">Actividad</p><h3>Reservas recientes</h3></div></div>{historial.length ? <div className="tabla-contenedor"><table><thead><tr><th>Película</th><th>Sala</th><th>Asientos</th><th>Boletos</th><th>Total</th><th>Fecha</th></tr></thead><tbody>{historial.map((r) => <tr key={r.id}><td><strong>{nombrePelicula(r.peliculaCodigo)}</strong></td><td>{nombreSala(r.salaId)}</td><td>{r.asientosIds.join(", ")}</td><td>{r.cantidadBoletos}</td><td>${r.total.toFixed(2)}</td><td>{new Date(r.fechaCreacion).toLocaleString("es-SV")}</td></tr>)}</tbody></table></div> : <p className="texto-muted">Todavía no se han confirmado reservas.</p>}</div>
    </section>
  );
}
