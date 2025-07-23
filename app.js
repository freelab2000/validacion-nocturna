function calcularTiempoZonaRoja(inicio, fin) {
  const zonaRojaInicio = 30;  // 00:30
  const zonaRojaFin = 330;   // 05:30
  let tiempoZonaRoja = 0;

  if (fin < inicio) fin += 1440; // cruza medianoche

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
  const terminaDespues0130 = finD > 90;
  const comienzaAntes0130IncluyendoDiaPrevio = (inicioD <= 90 || inicio > fin);

  if (tiempoZonaRoja >= 300) {
    return { tipo: 'Completa', icono: '🌙' };
  }

  if (dentroZonaRoja && terminaDespues0130 && comienzaAntes0130IncluyendoDiaPrevio) {
    return { tipo: 'Completa', icono: '🌙' };
  }

  if (dentroZonaRoja) {
    if (finD <= 90 || inicioD > 90) {
      return { tipo: 'Media', icono: '✅' };
    }
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
    contenido += `<li><span>▸ Noche:</span> Diurno (sin zona roja) ${clasif.icono}</li>`;
  }

  contenido += `</ul>`;
  div.innerHTML = contenido;
  div.style.backgroundColor = fondo;

  return { div, esNoche: clasif.tipo === 'Completa' || clasif.tipo === 'Media' };
}

function dibujarGraficoZonaRoja(psvs) {
  const contenedor = document.getElementById("zonaVisual");
  contenedor.innerHTML = "";

  const totalMinutos = 1440;
  const escala = 0.25; // 1 minuto = 0.25 px → gráfico de 360px

  const zonaRojaInicio = 30;
  const zonaRojaFin = 330;

  const linea = document.createElement("div");
  linea.style.position = "relative";
  linea.style.width = `${totalMinutos * escala}px`;
  linea.style.height = "30px";
  linea.style.background = "#eee";
  linea.style.border = "1px solid #ccc";
  linea.style.marginTop = "20px";
  linea.style.borderRadius = "6px";

  // Zona roja
  const rojo = document.createElement("div");
  rojo.style.position = "absolute";
  rojo.style.left = `${zonaRojaInicio * escala}px`;
  rojo.style.width = `${(zonaRojaFin - zonaRojaInicio) * escala}px`;
  rojo.style.height = "100%";
  rojo.style.background = "#ffc9c9";
  rojo.title = "Zona roja (00:30–05:30)";
  rojo.style.borderRadius = "4px";
  linea.appendChild(rojo);

  // PSV visuales
  psvs.forEach((psv, i) => {
    const { inicio, fin } = psv;
    const bloque = document.createElement("div");
    const color = "#7ec4ff";
    const left = (inicio % 1440) * escala;
    const duracion = fin >= inicio ? fin - inicio : fin + 1440 - inicio;
    const width = duracion * escala;

    bloque.style.position = "absolute";
    bloque.style.left = `${left}px`;
    bloque.style.width = `${width}px`;
    bloque.style.height = "100%";
    bloque.style.background = color;
    bloque.style.opacity = "0.85";
    bloque.style.border = "1px solid #444";
    bloque.title = `PSV ${i + 1}: ${minutosADisplay(inicio)} - ${minutosADisplay(fin)}`;

    linea.appendChild(bloque);
  });

  contenedor.appendChild(linea);
}

function validarProgramacion() {
  const detalle = document.getElementById("detalle");
  const resultado = document.getElementById("resultado");
  const zonaVisual = document.getElementById("zonaVisual");
  detalle.innerHTML = "";
  resultado.innerHTML = "";
  zonaVisual.innerHTML = "";

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

  // 🎯 Dibujar gráfico zona roja
  dibujarGraficoZonaRoja(psvs);
}
