// nmx-interpreter.js
// Reusable client-side module to adapt the Ciceronian Interpreter
// to include Norma Mexicana de Plomería (NMX) awareness and produce
// technician-friendly Spanish outputs from messy client input.

(function(window){
  const NMX_GLOSSARY = {
    // common client words -> technician phrasing + guidance
    "fuga": {term: "fuga de agua", action: "Localizar origen (unión, junta, tubería fisurada)", parts: ["Cinta de teflón","Sellador de roscas","Junta de goma"], nmxNote: "Revisar conectores y uniones según NMX aplicable."},
    "tubería rota": {term: "tubería con fisura/ruptura", action: "Reemplazo de tramo afectado o reparación con acople", parts: ["Tramo de tubería PVC/CPVC/CP- conforme al tipo"], nmxNote: "Confirmar material y diámetro conforme a norma."},
    "goteo": {term: "goteo en grifo/llave", action: "Inspeccionar asiento y empaquetadura; cambiar arandelas o cartucho", parts: ["Empaquetadura","Cartucho de grifo"], nmxNote: "Verificar presión de línea si el goteo es por exceso."},
    "agua" : {term: "flujo/caudal/agua", action: "Verificar presión y caudal en la instalación", parts: ["Manómetro","Válvula reguladora de presión"], nmxNote: "Documentar presión (kPa) para cumplimiento NMX si aplica."},
    "mal olor": {term: "obstrucción o sifón seco", action: "Revisar trampas, sifones y desagües; limpiar o reemplazar", parts: ["Desatascador","Manguera de limpieza"], nmxNote: "Asegurar sello de agua en sifones según prácticas NMX."}
  };

  function safeText(s){
    return (s||"").toString().trim();
  }

  function sanitize(raw){
    if(!raw) return "";
    // basic cleanup: normalize whitespace, remove weird chars
    let t = raw.replace(/[\u200B-\u200F]/g, '').replace(/\s+/g,' ').trim();
    // remove excessive punctuation
    t = t.replace(/\.{2,}/g,'.').replace(/!{2,}/g,'!');
    return t;
  }

  function extractKeywords(text){
    const lowered = text.toLowerCase();
    const found = [];
    for(const k of Object.keys(NMX_GLOSSARY)){
      if(lowered.includes(k)) found.push(k);
    }
    return found;
  }

  function translateToTechnician(raw, options={useNMX:true}){
    const cleaned = sanitize(raw);
    const keywords = extractKeywords(cleaned);

    const summaryLines = [];
    summaryLines.push('Resumen técnico sugerido:');
    if(cleaned.length===0){
      summaryLines.push('- Sin texto de entrada. Pedir más detalles al cliente (ubicación, cuándo empezó, si hay fotos).');
    } else {
      summaryLines.push(`- Observación del cliente: "${cleaned}"`);
    }

    if(keywords.length===0){
      summaryLines.push('- Posible interpretación: revisar visualmente la instalación; pedir fotos y ubicación exacta.');
    } else {
      for(const k of keywords){
        const info = NMX_GLOSSARY[k];
        summaryLines.push(`- Posible causa: ${info.term}. Acción recomendada: ${info.action}.`);
        if(info.parts && info.parts.length) summaryLines.push(`  - Repuestos/materiales sugeridos: ${info.parts.join(', ')}.`);
        if(options.useNMX) summaryLines.push(`  - Nota NMX: ${info.nmxNote}`);
      }
    }

    // general checklist
    summaryLines.push('- Checklist técnico rápido:');
    summaryLines.push('  1) Cerrar línea y aislar la zona. 2) Evaluar presión y caudal. 3) Revisar uniones y juntas. 4) Fotografiar antes/después.');

    // severity heuristic
    const severity = (cleaned.match(/fuga|goteo|tubería rota|inundación|moho|humedad/gi)||[]).length;
    if(severity>=2) summaryLines.push('- Urgencia: ALTA — coordinar visita en <24h>');
    else summaryLines.push('- Urgencia: Normal — programar según agenda');

    // Communication to client (plain Spanish)
    const clientReply = [];
    clientReply.push('Gracias por el reporte. Necesitamos saber: ubicación exacta (piso/cuarto), desde cuándo ocurre, y si puede enviar fotos o video.');
    clientReply.push('Mientras tanto, cierre la llave principal si ve humedad o aumento del flujo.');

    return {
      cleaned,
      keywords,
      technicianText: summaryLines.join('\n'),
      clientReply: clientReply.join(' '),
      severity
    };
  }

  function extractLinks(text){
    if(!text) return [];
    return (text.match(/https?:\/\/\S+/g)||[]).map(s=>s.replace(/[.,;]$/,''));
  }

  function exportTicket(result, format='json'){
    if(!result) return;
    const ticket = {
      created_at: new Date().toISOString(),
      description: result.cleaned,
      technician_text: result.technicianText,
      client_reply: result.clientReply,
      keywords: result.keywords,
      severity: result.severity
    };
    if(format==='json'){
      const dataStr = JSON.stringify(ticket,null,2);
      const blob = new Blob([dataStr], {type:'application/json'});
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = `orden_${Date.now()}.json`; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
      return;
    }
    if(format==='csv'){
      const rows = [Object.keys(ticket), Object.values(ticket).map(v=>typeof v==='object'?JSON.stringify(v):v)];
      const csv = rows.map(r=>r.map(c=>`"${(''+c).replace(/"/g,'""')}"`).join(',')).join('\n');
      const blob = new Blob([csv], {type:'text/csv'});
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = `orden_${Date.now()}.csv`; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
      return;
    }
  }

  function copyClientReply(result){
    if(!result) return;
    if(navigator.clipboard){
      navigator.clipboard.writeText(result.clientReply).catch(()=>{});
    }
  }

  // Auto-integrate with existing page if IDs match the earlier interpreter
  function autoBind(){
    const raw = document.querySelector('#rawCicText');
    const btn = document.querySelector('#cicBtn');
    const clear = document.querySelector('#cicClear');
    const out = document.querySelector('#cicOutput');

    if(!raw || !btn || !out) return; // nothing to bind

    // add NMX toggle UI near buttons if not present
    let nmxWrap = document.querySelector('#nmxToggleWrap');
    if(!nmxWrap){
      nmxWrap = document.createElement('div');
      nmxWrap.id = 'nmxToggleWrap';
      nmxWrap.style.margin = '8px 0';
      nmxWrap.innerHTML = `<label style="font-size:0.95rem"><input type=checkbox id='useNMX' checked> Usar Norma Mexicana de Plomería</label>`;
      if(btn.parentNode) btn.parentNode.insertBefore(nmxWrap, btn);
    }

    btn.addEventListener('click', function(){
      const useNMX = document.querySelector('#useNMX')?.checked ?? true;
      const result = translateToTechnician(raw.value, {useNMX});
      // store last result for other UI buttons
      window.NMXInterpreter.lastResult = result;
      out.textContent = result.technicianText;
      // copy a ready-to-send message for technicians to clipboard
      const techClipboard = `TEXTO TÉCNICO:\n${result.technicianText}\n\nRESPUESTA CLIENTE:\n${result.clientReply}`;
      if(navigator.clipboard){
        navigator.clipboard.writeText(techClipboard).catch(()=>{});
      }
    });

    if(clear) clear.addEventListener('click', ()=>{ raw.value=''; out.textContent=''; });
  }

  // Export API
  window.NMXInterpreter = {
    sanitize,
    translateToTechnician,
    autoBind,
    glossary: NMX_GLOSSARY,
    extractLinks,
    exportTicket,
    copyClientReply,
    lastResult: null
  };

  // run autoBind on DOMContentLoaded
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', autoBind);
  else autoBind();

})(window);
