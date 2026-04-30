function calcularTiempoZonaRoja(inicio, fin) {
  const zonaRojaInicio = 30;  // 00:30
  const zonaRojaFin = 330;    // 05:30
  let tiempoZonaRoja = 0;

  if (fin < inicio) fin += 1440;

  for (let t = inicio; t < fin; t++) {
    const minutoDelDia = t % 1440;

    if (minutoDelDia >= zonaRojaInicio && minutoDelDia < zonaRojaFin) {
      tiempoZonaRoja++;
    }
  }

  return tiempoZonaRoja;
}

function determinarClasificacion(inicio, fin) {
  const tiempoZonaRoja = calcularTiempoZonaRoja(inicio, fin);
  const inicioD = inicio % 1440;
  const finD = fin % 1440;

  const dentroZonaRoja = tiempoZonaRoja > 0;

  const terminaEnODepues0130 = finD >= 90;
  const comienzaAntesOEn0130IncluyendoDiaPrevio = (inicioD <= 90 || inicio > fin);

  if (tiempoZonaRoja >= 300) {
    return { tipo: "Completa", icono: "🌙", texto: "Noche completa" };
  }

  if (dentroZonaRoja && terminaEnODepues0130 && comienzaAntesOEn0130IncluyendoDiaPrevio) {
    return { tipo: "Completa", icono: "🌙", texto: "Noche completa" };
  }

  if (dentroZonaRoja) {
    if (finD < 90 || inicioD > 90) {
      return { tipo: "Media", icono: "🌗", texto: "Media noche" };
    }
  }

  return { tipo: "—", icono: "☀️", texto: "Diurno" };
}

function minutosADisplay(min) {
  const h = Math.floor((min % 1440) / 60).toString().padStart(2, "0");
  const m = (min % 60).toString().padStart(2, "0");
  return `${h}:${m}`;
}

function mostrarResultado(index, inicio, fin) {
  const div = document.createElement("div");
  div.classList.add("resultado");

  const tiempoZona = calcularTiempoZonaRoja(inicio, fin);
  const clasif = determinarClasificacion(inicio, fin);

  let fondo = "#e5e7eb";
  let borde = "#9ca3af";

  if (clasif.tipo === "Completa") {
    fondo = "#d8f7d2";
    borde = "#2e7d32";
  } else if (clasif.tipo === "Media") {
    fondo = "#fff3cd";
    borde = "#d99a00";
  }

  div.style.background = fondo;
  div.style.borderLeft = `6px solid ${borde}`;
  div.style.borderRadius = "16px";
  div.style.padding = "14px 18px";
  div.style.boxShadow = "0 6px 16px rgba(0, 30, 60, 0.08)";

  div.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center; gap:12px; flex-wrap:wrap;">
      <strong style="font-size:17px; color:#003366;">PSV ${index}</strong>
      <span style="font-weight:800; color:#14213d;">
        ${clasif.icono} ${clasif.texto}
      </span>
    </div>

    <div style="margin-top:8px; display:flex; justify-content:space-between; gap:10px; flex-wrap:wrap; color:#1f2937;">
      <span>${minutosADisplay(inicio)} → ${minutosADisplay(fin)}</span>
      <span>Zona roja: <strong>${tiempoZona} min</strong></span>
    </div>
  `;

  return {
    div,
    esNoche: clasif.tipo === "Completa" || clasif.tipo === "Media",
    simbolo: clasif.icono
  };
}

function crearMensaje(texto, fondo, color) {
  const mensaje = document.createElement("div");
  mensaje.textContent = texto;
  mensaje.style.backgroundColor = fondo;
  mensaje.style.color = color;
  mensaje.style.padding = "14px 16px";
  mensaje.style.fontWeight = "800";
  mensaje.style.borderRadius = "14px";
  mensaje.style.boxShadow = "0 6px 14px rgba(0, 30, 60, 0.10)";
  return mensaje;
}

function validarProgramacion() {
  const detalle = document.getElementById("detalle");
  const resultado = document.getElementById("resultado");

  detalle.innerHTML = "";
  resultado.innerHTML = "";

  const psvs = [];

  for (let i = 1; i <= 3; i++) {
    const hIniValue = document.getElementById(`start${i}_hh`).value;
    const mIniValue = document.getElementById(`start${i}_mm`).value;
    const hFinValue = document.getElementById(`end${i}_hh`).value;
    const mFinValue = document.getElementById(`end${i}_mm`).value;

    const valores = [hIniValue, mIniValue, hFinValue, mFinValue];
    const estaVacio = valores.every(v => v === "");
    const estaParcial = valores.some(v => v === "") && !estaVacio;

    if (estaVacio) continue;

    if (estaParcial) {
      resultado.appendChild(
        crearMensaje(
          `⚠️ El PSV ${i} está incompleto. Debes ingresar inicio y término completos.`,
          "#fff3cd",
          "#856404"
        )
      );
      return;
    }

    const inicio = parseInt(hIniValue) * 60 + parseInt(mIniValue);
    const fin = parseInt(hFinValue) * 60 + parseInt(mFinValue);

    if (inicio === fin) {
      resultado.appendChild(
        crearMensaje(
          `⚠️ El PSV ${i} tiene duración 0. Revisa inicio y término.`,
          "#fff3cd",
          "#856404"
        )
      );
      return;
    }

    psvs.push({
      numero: i,
      inicio,
      fin
    });
  }

  if (psvs.length === 0) {
    resultado.appendChild(
      crearMensaje(
        "⚠️ Debes ingresar al menos un PSV.",
        "#fff3cd",
        "#856404"
      )
    );
    return;
  }

  let nochesConsecutivas = 0;
  let maxConsecutivas = 0;
  const secuencia = [];

  psvs.forEach((psv) => {
    const { div, esNoche, simbolo } = mostrarResultado(psv.numero, psv.inicio, psv.fin);
    detalle.appendChild(div);

    secuencia.push(simbolo);

    if (esNoche) {
      nochesConsecutivas++;
      maxConsecutivas = Math.max(maxConsecutivas, nochesConsecutivas);
    } else {
      nochesConsecutivas = 0;
    }
  });

  const mensaje = document.createElement("div");

  if (maxConsecutivas <= 2) {
    mensaje.innerHTML = `
      <div>✅ Programación válida</div>
      <div style="font-size:14px; font-weight:600; margin-top:4px;">
        Máximo: ${maxConsecutivas} noche(s) consecutiva(s) · Secuencia: ${secuencia.join(" ")}
      </div>
    `;
    mensaje.style.backgroundColor = "#d4fcd4";
    mensaje.style.color = "#006400";
  } else {
    mensaje.innerHTML = `
      <div>❌ Programación inválida</div>
      <div style="font-size:14px; font-weight:600; margin-top:4px;">
        ${maxConsecutivas} noches consecutivas detectadas · Máximo permitido: 2 · Secuencia: ${secuencia.join(" ")}
      </div>
    `;
    mensaje.style.backgroundColor = "#fcdada";
    mensaje.style.color = "#8b0000";
  }

  mensaje.style.padding = "14px 16px";
  mensaje.style.fontWeight = "800";
  mensaje.style.borderRadius = "14px";
  mensaje.style.boxShadow = "0 6px 14px rgba(0, 30, 60, 0.10)";

  resultado.appendChild(mensaje);
}
