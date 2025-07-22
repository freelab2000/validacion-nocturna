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

  // ✅ NUEVA CONDICIÓN: Noche completa si el tramo incluye el minuto 90 (01:30)
  if ((fin - inicio > 0) && ((inicioD <= 90 && finD > 90) || (inicioD > 90 && fin > (inicio + (1440 - inicioD) + 90)))) {
    return { tipo: 'Completa', icono: '🌙' };
  }

  // Media noche si ambos puntos antes de 01:30 y hay zona roja
  if (inicioD <= 90 && finD <= 90 && inicio < fin && tiempoZonaRoja > 0) {
    return { tipo: 'Media', icono: '✅' };
  }

  // Media noche si comienza después de 01:30 dentro de zona roja
  if (inicioD > 90 && inicioD < 330 && tiempoZonaRoja > 0) {
    return { tipo: 'Media', icono: '✅' };
  }

  return { tipo: '—', icono: '☀️' };
}

function minutosADisplay(min) {
  const h = Math.floor(min / 60).toString().padStart(2, '0');
  const m = (min % 60).toString().padStart(2, '0');
  return `${h}:${m}`;
}

function mostrarResultado(index, inicio, fin) {
  const div = document.createElement("div");
  div.classList.add("resultado");

  const tiempoZona = calcularTiempoZonaRoja(inicio, fin);
  const clasif = determinarClasificacion(inicio, fin);

  let fondo = "#e0e0e0";
  if (clasif.tipo !== '—') fondo = "#d7f8d0";

  let contenido = `
    <strong>PSV ${index}</strong>
    <ul>
      <li><span>▸ Inicio:</span> ${minutosADisplay(inicio)}</li>
      <li><span>▸ Término:</span> ${minutosADisplay(fin)}</li>
      <li><span>▸ Tiempo en zona roja:</span> ${tiempoZona} min</li>`;

  if (clasif.tipo === 'Completa') {
    contenido += `<li><span>▸ Noche:</span> Completa ${clasif.icono}</li>`;
  } else if (clasif.tipo === 'Media') {
    contenido += `<li><span>▸ Media noche:</span> ${clasif.icono}</li>`;
  } else {
    contenido += `<li><span>▸ Noche:</span> — ${clasif.icono}</li>`;
  }

  contenido += `</ul>`;
  div.innerHTML = contenido;
  div.style.backgroundColor = fondo;

  return { div, esNoche: clasif.tipo === 'Completa' };
}

function validarProgramacion() {
  const detalle = document.getElementById("detalle");
  const resultado = document.getElementById("resultado");
  detalle.innerHTML = "";
  resultado.innerHTML = "";

  const psvs = [];

  for (let i = 1; i <= 3; i++) {
    const hIni = parseInt(document.getElementById(`start${i}_hh`).value);
    const mIni = parseInt(document.getElementById(`start${i}_mm`).value);
    const hFin = parseInt(document.getElementById(`end${i}_hh`).value);
    const mFin = parseInt(document.getElementById(`end${i}_mm`).value);

    const inicio = hIni * 60 + mIni;
    const fin = hFin * 60 + mFin;

    psvs.push({ inicio, fin });
  }

  let nochesConsecutivas = 0;
  let maxConsecutivas = 0;

  psvs.forEach((psv, i) => {
    const { div, esNoche } = mostrarResultado(i + 1, psv.inicio, psv.fin);
    detalle.appendChild(div);

    if (esNoche) {
      nochesConsecutivas++;
      maxConsecutivas = Math.max(maxConsecutivas, nochesConsecutivas);
    } else {
      nochesConsecutivas = 0;
    }
  });

  const mensaje = document.createElement("div");
  if (maxConsecutivas <= 2) {
    mensaje.textContent = `✅ Programación válida: ${maxConsecutivas} noche(s) consecutiva(s)`;
    mensaje.style.backgroundColor = "#d4fcd4";
    mensaje.style.color = "#006400";
  } else {
    mensaje.textContent = `❌ Programación inválida: ${maxConsecutivas} noches consecutivas (máx. 2 permitidas)`;
    mensaje.style.backgroundColor = "#fcdada";
    mensaje.style.color = "#8b0000";
  }
  mensaje.style.padding = "10px";
  mensaje.style.fontWeight = "600";
  mensaje.style.borderRadius = "8px";
  resultado.appendChild(mensaje);
}
