function calcularTiempoZonaRoja(inicio, fin) {
  const zonaRojaInicio = 30;  // 00:30
  const zonaRojaFin = 330;    // 05:30
  let tiempoZonaRoja = 0;

  if (fin < inicio) fin += 1440; // Cruza medianoche

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

  // DEFINICIÓN OFICIAL:
  // - Noche completa solo si el PSV cruza 01:30 desde antes.
  // - Si el PSV comienza después de 01:30, es media noche,
  //   aunque permanezca varias horas dentro de zona roja.
  const terminaEnODepues0130 = finD >= 90;
  const comienzaAntesOEn0130IncluyendoDiaPrevio = (inicioD <= 90 || inicio > fin);

  if (tiempoZonaRoja >= 300) {
    return { tipo: 'Completa', icono: '🌙' };
  }

  if (dentroZonaRoja && terminaEnODepues0130 && comienzaAntesOEn0130IncluyendoDiaPrevio) {
    return { tipo: 'Completa', icono: '🌙' };
  }

  if (dentroZonaRoja) {
    if (finD < 90 || inicioD > 90) {
      return { tipo: 'Media', icono: '✅' };
    }
  }

  return { tipo: '—', icono: '☀️' };
}

function minutosADisplay(min) {
  const h = Math.floor((min % 1440) / 60).toString().padStart(2, '0');
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
    contenido += `<li><span>▸ Noche:</span> Diurno (sin zona roja) ${clasif.icono}</li>`;
  }

  contenido += `</ul>`;
  div.innerHTML = contenido;
  div.style.backgroundColor = fondo;

  return {
    div,
    esNoche: clasif.tipo === 'Completa' || clasif.tipo === 'Media'
  };
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

    // Si el PSV está completamente vacío, se ignora
    if (estaVacio) {
      continue;
    }

    // Si el PSV está parcialmente lleno, se detiene y avisa
    if (estaParcial) {
      const mensajeError = document.createElement("div");
      mensajeError.textContent = `⚠️ El PSV ${i} está incompleto. Debes ingresar inicio y término completos.`;
      mensajeError.style.backgroundColor = "#fff3cd";
      mensajeError.style.color = "#856404";
      mensajeError.style.padding = "10px";
      mensajeError.style.fontWeight = "600";
      mensajeError.style.borderRadius = "8px";
      resultado.appendChild(mensajeError);
      return;
    }

    const hIni = parseInt(hIniValue);
    const mIni = parseInt(mIniValue);
    const hFin = parseInt(hFinValue);
    const mFin = parseInt(mFinValue);

    const inicio = hIni * 60 + mIni;
    const fin = hFin * 60 + mFin;

    psvs.push({
      numero: i,
      inicio,
      fin
    });
  }

  if (psvs.length === 0) {
    const mensajeError = document.createElement("div");
    mensajeError.textContent = "⚠️ Debes ingresar al menos un PSV.";
    mensajeError.style.backgroundColor = "#fff3cd";
    mensajeError.style.color = "#856404";
    mensajeError.style.padding = "10px";
    mensajeError.style.fontWeight = "600";
    mensajeError.style.borderRadius = "8px";
    resultado.appendChild(mensajeError);
    return;
  }

  let nochesConsecutivas = 0;
  let maxConsecutivas = 0;

  psvs.forEach((psv) => {
    const { div, esNoche } = mostrarResultado(psv.numero, psv.inicio, psv.fin);
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
