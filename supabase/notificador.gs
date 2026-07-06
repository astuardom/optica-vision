/**
 * NOTIFICADOR DE ÓPTICA VISIÓN
 * Recibe webhooks de Supabase y envía emails de notificación a Gmail.
 * 
 * CONFIGURACIÓN: Cambia esta variable con tu correo
 */
const CORREO_DESTINO = 'TU_CORREO@gmail.com'; // <-- CAMBIA ESTO

/**
 * Función principal que recibe los webhooks POST de Supabase
 */
function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);
    const tabla = body.table;        // 'appointments', 'quotes', 'messages'
    const tipo = body.type;          // 'INSERT'
    const registro = body.record;    // Los datos del nuevo registro

    // Solo procesamos inserciones nuevas
    if (tipo !== 'INSERT' || !registro) {
      return ContentService.createTextOutput('OK');
    }

    let asunto = '';
    let mensaje = '';

    if (tabla === 'appointments') {
      asunto = `📅 Nueva Cita — ${registro.paciente}`;
      mensaje = `
        <h2 style="color:#137fec">Nueva Cita Agendada</h2>
        <table style="border-collapse:collapse;width:100%">
          <tr><td style="padding:8px;font-weight:bold">Paciente</td><td style="padding:8px">${registro.paciente}</td></tr>
          <tr style="background:#f5f5f5"><td style="padding:8px;font-weight:bold">Fecha</td><td style="padding:8px">${registro.fecha}</td></tr>
          <tr><td style="padding:8px;font-weight:bold">Hora</td><td style="padding:8px">${registro.hora}</td></tr>
          <tr style="background:#f5f5f5"><td style="padding:8px;font-weight:bold">Tipo Atención</td><td style="padding:8px">${registro.tipoAtencion}</td></tr>
          <tr><td style="padding:8px;font-weight:bold">Teléfono</td><td style="padding:8px">${registro.telefono || 'No indicado'}</td></tr>
          <tr style="background:#f5f5f5"><td style="padding:8px;font-weight:bold">Email</td><td style="padding:8px">${registro.email || 'No indicado'}</td></tr>
          <tr><td style="padding:8px;font-weight:bold">Notas</td><td style="padding:8px">${registro.notas || '—'}</td></tr>
        </table>
      `;
    } else if (tabla === 'quotes') {
      asunto = `🔵 Nueva Cotización — ${registro.nombre} (${registro.folio})`;
      mensaje = `
        <h2 style="color:#137fec">Nueva Cotización Recibida</h2>
        <table style="border-collapse:collapse;width:100%">
          <tr><td style="padding:8px;font-weight:bold">Nombre</td><td style="padding:8px">${registro.nombre}</td></tr>
          <tr style="background:#f5f5f5"><td style="padding:8px;font-weight:bold">Folio</td><td style="padding:8px">${registro.folio}</td></tr>
          <tr><td style="padding:8px;font-weight:bold">Teléfono</td><td style="padding:8px">${registro.telefono || 'No indicado'}</td></tr>
          <tr style="background:#f5f5f5"><td style="padding:8px;font-weight:bold">Email</td><td style="padding:8px">${registro.email || 'No indicado'}</td></tr>
          <tr><td style="padding:8px;font-weight:bold">Tipo Lente</td><td style="padding:8px">${registro.tipoLente || '—'}</td></tr>
          <tr style="background:#f5f5f5"><td style="padding:8px;font-weight:bold">Material</td><td style="padding:8px">${registro.material || '—'}</td></tr>
          <tr><td style="padding:8px;font-weight:bold">OD Esfera/Cil/Eje</td><td style="padding:8px">${registro.od_esfera || '—'} / ${registro.od_cilindro || '—'} / ${registro.od_eje || '—'}</td></tr>
          <tr style="background:#f5f5f5"><td style="padding:8px;font-weight:bold">OI Esfera/Cil/Eje</td><td style="padding:8px">${registro.oi_esfera || '—'} / ${registro.oi_cilindro || '—'} / ${registro.oi_eje || '—'}</td></tr>
        </table>
      `;
    } else if (tabla === 'messages') {
      asunto = `✉️ Nuevo Mensaje — ${registro.nombre}`;
      mensaje = `
        <h2 style="color:#137fec">Nuevo Mensaje de Contacto</h2>
        <table style="border-collapse:collapse;width:100%">
          <tr><td style="padding:8px;font-weight:bold">Nombre</td><td style="padding:8px">${registro.nombre}</td></tr>
          <tr style="background:#f5f5f5"><td style="padding:8px;font-weight:bold">Email</td><td style="padding:8px">${registro.email}</td></tr>
          <tr><td style="padding:8px;font-weight:bold">Mensaje</td><td style="padding:8px">${registro.mensaje}</td></tr>
        </table>
      `;
    } else {
      return ContentService.createTextOutput('Tabla no reconocida');
    }

    // Enviar el email
    const htmlBody = `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;border:1px solid #e0e0e0;border-radius:12px;overflow:hidden">
        <div style="background:#137fec;padding:20px;text-align:center">
          <h1 style="color:white;margin:0;font-size:20px">👁️ Óptica Visión</h1>
          <p style="color:rgba(255,255,255,0.8);margin:4px 0 0">Sistema de Notificaciones</p>
        </div>
        <div style="padding:24px">
          ${mensaje}
          <hr style="margin:24px 0;border:none;border-top:1px solid #eee"/>
          <p style="color:#999;font-size:12px;text-align:center">
            Notificación automática — Óptica Visión Chile<br/>
            ${new Date().toLocaleString('es-CL')}
          </p>
        </div>
      </div>
    `;

    GmailApp.sendEmail(CORREO_DESTINO, asunto, '', { htmlBody });

    return ContentService.createTextOutput('OK');
  } catch (error) {
    Logger.log('Error: ' + error.toString());
    return ContentService.createTextOutput('Error: ' + error.toString());
  }
}
