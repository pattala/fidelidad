// modules/data.js (Panel Admin – limpio y sin import circular)

import { db } from './firebase.js';
import * as UI from './ui.js';
import { mostrarFichaCliente } from './clientes.js';

// ===== Modelo central =====
export let appData = {
  clientes: [],
  premios: [],
  bonos: [],
  campanas: [],
  plantillas: {},
  config: {
    tasaConversion: 100,
    multiplicadorEfectivo: 1,
    reglasCaducidad: [],
    bono_bienvenida_activo: false,
    bono_bienvenida_puntos: 0,

    apiBase: '',
    publicPanelToken: ''
  }
};

export let premioEnEdicionId = null;
export function setPremioEnEdicionId(id) { premioEnEdicionId = id; }

export let bonoEnEdicionId = null;
export function setBonoEnEdicionId(id) { bonoEnEdicionId = id; }

export let campanaEnEdicionId = null;
export function setCampanaEnEdicionId(id) { campanaEnEdicionId = id; }

// ===== Nuevos registros (badge/parpadeo) =====
export function gestionarNotificacionNuevosRegistros() {
  const clientesPWA = appData.clientes.filter(c => c.authUID);
  const idsClientesPWA = clientesPWA.map(c => c.id).sort();

  const idsVistos = JSON.parse(localStorage.getItem('nuevosRegistrosVistos') || '[]');
  const nuevosNoVistos = idsClientesPWA.filter(id => !idsVistos.includes(id));

  const contadorBadge = document.getElementById('contador-nuevos-registros');
  const tabButton = document.querySelector('.tablinks[data-tab="nuevos-registros"]');

  if (!contadorBadge || !tabButton) return;

  if (nuevosNoVistos.length > 0) {
    contadorBadge.textContent = String(nuevosNoVistos.length);
    contadorBadge.style.display = 'inline-block';
    tabButton.classList.add('parpadeo');
  } else {
    contadorBadge.style.display = 'none';
    tabButton.classList.remove('parpadeo');
  }
}

export function marcarNuevosRegistrosComoVistos() {
  const clientesPWA = appData.clientes.filter(c => c.authUID);
  const idsClientesPWA = clientesPWA.map(c => c.id).sort();
  localStorage.setItem('nuevosRegistrosVistos', JSON.stringify(idsClientesPWA));
  gestionarNotificacionNuevosRegistros();
}

// ===== Suscripciones / snapshots =====
export function iniciarEscuchasFirestore() {

  // Config
  db.collection('configuracion').doc('principal').onSnapshot((doc) => {
    if (doc.exists) {
      appData.config = { ...appData.config, ...doc.data() };
      UI.renderizarConfiguracion?.(appData.config);
    }
  }, (error) => console.error("Error escuchando configuración:", error));

  // Plantillas (solo admin en reglas)
  db.collection('plantillas_mensajes').onSnapshot((snapshot) => {
    appData.plantillas = {};
    snapshot.forEach(doc => { appData.plantillas[doc.id] = doc.data(); });
    UI.cargarSelectorPlantillas?.();

    const selector = document.getElementById('plantilla-selector');
    const actual = selector ? selector.value : '';
    if (actual) UI.mostrarPlantillaParaEdicion?.(actual);
  }, (error) => console.error("Error escuchando plantillas:", error));

  // Clientes (usa número de socio para ordenar)
  db.collection('clientes').orderBy("numeroSocio").onSnapshot((snapshot) => {
    appData.clientes = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    UI.renderizarTablaClientes?.();
    UI.renderizarTablaNuevosRegistros?.();
    UI.actualizarContadorSuscritos?.();
    UI.verificarCumpleanos?.();
UI.buildSearchIndex?.(appData.clientes);

    gestionarNotificacionNuevosRegistros();

    const fichaContenido = document.getElementById('ficha-contenido');
    const fichaIdActual = document.getElementById('ficha-numero-socio')?.textContent || '';
    if (fichaContenido && fichaContenido.style.display !== 'none' && fichaIdActual) {
      mostrarFichaCliente(fichaIdActual);
    }
  }, (error) => console.error("Error escuchando clientes:", error));

  // Premios
  db.collection('premios').onSnapshot((snapshot) => {
    appData.premios = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
    UI.actualizarTablaPremiosAdmin?.();
  }, (error) => console.error("Error escuchando premios:", error));

  // Bonos
  db.collection('bonos').onSnapshot((snapshot) => {
    appData.bonos = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
    UI.actualizarTablaBonosAdmin?.();
  }, (error) => console.error("Error escuchando bonos:", error));

  // Campañas
  db.collection('campanas').orderBy("fechaCreacion", "desc").onSnapshot((snapshot) => {
    appData.campanas = snapshot.docs.map(doc => {
      const data = doc.data();
      const fechaCreacionISO = data.fechaCreacion?.toDate
        ? data.fechaCreacion.toDate().toISOString()
        : new Date().toISOString();
      return { id: doc.id, ...data, fechaCreacion: fechaCreacionISO };
    });
    UI.renderizarTablaCampanas?.();
  }, (error) => console.error("Error escuchando campañas:", error));
}
