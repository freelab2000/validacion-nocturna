function calcularTiempoZonaRoja(inicio, fin) {
  const zonaRojaInicio = 30;   // 00:30
  const zonaRojaFin = 330;     // 05:30
  let tiempoZonaRoja = 0;

  if (fin < inicio) fin += 1440; // día siguiente

  for (let t = inicio; t < fin; t++) {
    let minutoDelDia = t % 1440;
    if (minutoDelDia >= zonaRojaInicio && minutoDelDia < zonaRojaFin) {
      tiempoZonaRoja++;
    }
  }

  return tiempoZonaRoja;
}

function determinarClasificacion(inicio, fin, tiempoZonaRoja) {
  const incluyeZonaRoja = tiempoZonaRoja > 0;

  // Reglas de media noche según convenio:
  const esMediaNoche = (inicio < 90 || fin <= 90 || inicio >= 90); // siempre aplica si toca el umbral
  const cruza130 = inicio < 90 && fin > 90; // noche completa si atraviesa la 01:30

  if (incluyeZonaRoja && cruza130) {
    return { tipo: 'Completa', icono: '🌙', esNoche: true, mediaNoche: true };
  } else if (incluyeZonaRoja && esMediaNoche) {
    return { tipo: 'Parcial', icono: '🌗', esNoche: true, mediaNoche: true };
  }

  return { tipo: '—', icono: '☀️', esNoche: false, mediaNoche: false };
}

function minutosADisplay(minutos) {
  const h = Math.floor(minutos / 60).toString().padStart(2, '0');
  const m = (minutos % 60).toString().padStart(2, '0');
  return `${h}:${m}`;
}

function obtenerMinutos(id_hh, id_mm) {
  const hh = parseInt(document.getElementById(id_hh).value);
  const mm = parseInt(document.getElementById(id_mm).value);
  return hh * 60 + mm;
}

function mostrarResultado(index, inicioMin, finMin) {
  const div = document.createElement("div");
  div.classList.add("result");

  const tiempoZR = calcularTiempoZonaRoja(inicioMin, finMin);
  const clasificacion = determinarClasificacion(inicioMin, finMin, tiempoZR);

  div.innerHTML = `
    <strong>PSV ${index}</strong>
    <ul>
      <li><span>▸ Inicio:</span> ${minutosADisplay(inicioMin)}</li>
      <li><span>▸ Término:</span> ${minutosADisplay(finMin)}</li>
      <li><span>▸ Tiempo en zona roja:</span> ${tiempoZR} min</li>
      <li><span>▸ Media noche:</span> ${clasificacion.mediaNoche ? '✅' : '❌'}</li>
      <li><span>▸ Noche:</span> ${clasificacion.tipo} ${clasificacion.icono}</li>
    </ul>
  `;

  div.style.backgroundColor = clasificacion.tipo === '—' ? "#e0e0e0" : "#d7f8d0";

  return { div, esNoche: clasificacion.esNoche };
}

document.getElementById("nightForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const resultado = document.getElementById("resultado");
  const detalle = document.getElementById("detalle");
  resultado.innerHTML = "";
  detalle.innerHTML = "";

  const psvs = [];

  for (let i = 1; i <= 3; i++) {
    const inicio = obtenerMinutos(`start${i}_hh`, `start${i}_mm`);
    const fin = obtenerMinutos(`end${i}_hh`, `end${i}_mm`);
    psvs.push({ inicio, fin });
  }

  let nochesConsecutivas = 0;
  let maxConsecutivas = 0;

  psvs.forEach((psv, i) => {
    const { div, esNoche } = mostrarResultado(i + 1, psv.inicio, psv.fin);
    detalle.appendChild(div);

    if (esNoche) {
      nochesConsecutivas++;
      if (nochesConsecutivas > maxConsecutivas) {
        maxConsecutivas = nochesConsecutivas;
      }
    } else {
      nochesConsecutivas = 0;
    }
  });

  const validacion = document.createElement("div");
  if (maxConsecutivas <= 2) {
    validacion.classList.add("valid");
    validacion.innerHTML = `✅ Programación válida: ${maxConsecutivas} noche(s) consecutiva(s)`;
  } else {
    validacion.classList.add("invalid");
    validacion.innerHTML = `❌ Programación inválida: ${maxConsecutivas} noches consecutivas (máx. 2 permitidas)`;
  }

  resultado.appendChild(validacion);
});
