// ──────────────────────────────────────────────────────────────
// T&C Centralizado (Carga rápida e independiente)
// ──────────────────────────────────────────────────────────────

// Texto centralizado de los términos
const TERMS_CONTENT_HTML = `
  <p><strong>1. Generalidades:</strong> El programa de fidelización "Club RAMPET" es un beneficio exclusivo para nuestros clientes. La participación en el programa es gratuita e implica la aceptación total de los presentes términos y condiciones.</p>
  <p><strong>2. Consentimiento de comunicaciones y ofertas cercanas: </strong> Al registrarte y/o aceptar los términos, autorizás a RAMPET a enviarte comunicaciones transaccionales y promocionales (por ejemplo, avisos de puntos, canjes, promociones, vencimientos). Si activás la función “beneficios cerca tuyo”, la aplicación podrá usar los permisos del dispositivo y del navegador para detectar tu zona general con el único fin de mostrarte ofertas relevantes de comercios cercanos. Podés administrar o desactivar estas opciones desde los ajustes del navegador o del dispositivo cuando quieras.</p>   
  <p><strong>3. Acumulación de Puntos:</strong> Los puntos se acumularán según la tasa de conversión vigente establecida por RAMPET. Los puntos no tienen valor monetario, no son transferibles a otras personas ni canjeables por dinero en efectivo.</p>
  <p><strong>4. Canje de Premios:</strong> El canje de premios se realiza exclusivamente en el local físico y será procesado por un administrador del sistema. La PWA sirve como un catálogo para consultar los premios disponibles y los puntos necesarios. Para realizar un canje, el cliente debe presentar una identificación válida.</p>
  <p><strong>5. Validez y Caducidad:</strong> Los puntos acumulados tienen una fecha de caducidad que se rige por las reglas definidas en el sistema. El cliente será notificado de los vencimientos próximos a través de los canales de comunicación aceptados para que pueda utilizarlos a tiempo.</p>
  <p><strong>6. Modificaciones del Programa:</strong> RAMPET se reserva el derecho de modificar los términos y condiciones, la tasa de conversión, el catálogo de premios o cualquier otro aspecto del programa de fidelización, inclusive su finalización, en cualquier momento y sin previo aviso.</p>
`;

// Función global disponible inmediatmente
window.openTermsModal = function (showAcceptButton = false) {
    console.log('[T&C] Abriendo modal centralizado...');

    // 1. Buscar o Crear modal
    let m = document.getElementById('terms-modal');
    if (!m) {
        m = document.createElement('div');
        m.id = 'terms-modal';
        m.style.cssText = 'display:none; position:fixed; inset:0; z-index:20000; background:rgba(0,0,0,0.5); align-items:center; justify-content:center;';
        m.innerHTML = `
      <div style="max-width:720px; width:90%; background:#fff; border-radius:12px; padding:16px; max-height:85vh; display:flex; flex-direction:column; box-shadow:0 4px 20px rgba(0,0,0,0.2);">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; flex-shrink:0;">
          <h3 style="margin:0; font-size:18px;">Términos y Condiciones</h3>
          <button id="close-terms-modal-dynamic" class="secondary-btn" style="padding:4px 8px; font-size:18px; line-height:1; min-width:32px;" aria-label="Cerrar">✕</button>
        </div>
        <div id="terms-text" style="flex:1; overflow-y:auto; padding-right:4px;"></div>
        <div style="margin-top:12px; text-align:right; flex-shrink:0;">
           <button id="accept-terms-btn-modal" class="primary-btn" style="display:none; width:100%;">Aceptar y Continuar</button>
        </div>
      </div>
    `;
        document.body.appendChild(m);

        // Listeners
        m.addEventListener('click', (ev) => { if (ev.target === m) m.style.display = 'none'; });
        const btnClose = m.querySelector('#close-terms-modal-dynamic');
        if (btnClose) btnClose.onclick = () => m.style.display = 'none';
    }

    // 2. Inyectar contenido (siempre fresco)
    const contentEl = m.querySelector('#terms-text');
    if (contentEl) {
        contentEl.innerHTML = TERMS_CONTENT_HTML;
    }

    // 3. Mostrar botón "Aceptar" solo si se pide
    const btnAccept = document.getElementById('accept-terms-btn-modal');
    if (btnAccept) {
        btnAccept.style.display = showAcceptButton ? 'inline-block' : 'none';
    }

    // 4. Mostrar modal
    m.style.display = 'flex';
};

// Alias de compatibilidad
window.openTermsModalCatchAll = window.openTermsModal;

// Listener global de respaldo (por si app.js falla)
document.addEventListener('click', (e) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const trigger = e.target.closest('#show-terms-link, #show-terms-link-banner, #footer-terms-link');
    if (!trigger) return;

    // Si tiene onclick inline, dejamos que eso maneje. Si no, manejamos acá.
    if (trigger.onclick) return;

    e.preventDefault();
    window.openTermsModal(false);
}, true);
