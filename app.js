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

function esMediaNoche(inicio, fin) {
  return (inicio <= 90 || fin >= 90);
}

function determinarClasificacion(tiempoZonaRoja, incluyeMediaNoche) {
  if (tiempoZonaRoja >= 150 || incluyeMediaNoche) {
    if (tiempoZonaRoja >= 150 && incluyeMediaNoche) {
      return { tipo: 'Completa', icono: '🌙' };
    } else {
      return { tipo: 'Parcial', icono: '🌗' };
    }
  }
  return { tipo: '—', icono: '☀️' };
}

function minutosADisplay(minutos) {
  const h = Math.floor(minutos / 60).toString().padStart(2, '0');
  const m = (minutos % 60).toString().padStart(2, '0');
  return `${h}:${m}`;
}

function mostrarResultado(psv, index) {
  const resultadoDiv = document.createElement("div");
  resultadoDiv.classList.add("resultado");

  const tiempoZonaRoja = calcularTiempoZonaRoja(psv.inicio, psv.fin);
  const incluyeMedia = esMediaNoche(psv.inicio, psv.fin);
  const clasificacion = determinarClasificacion(tiempoZonaRoja, incluyeMedia);

  resultadoDiv.innerHTML = `
    <strong>PSV ${index + 1}</strong>
    <ul>
      <li><span>▸ Inicio:</span> ${minutosADisplay(psv.inicio)}</li>
      <li><span>▸ Término:</span> ${minutosADisplay(psv.fin)}</li>
      <li><span>▸ Tiempo en zona roja:</span> ${tiempoZonaRoja} min</li>
      <li><span>▸ Media noche:</span> ${incluyeMedia ? "✅" : "❌"}</li>
      <li><span>▸ Noche:</span> ${clasificacion.tipo} ${clasificacion.icono}</li>
    </ul>
  `;

  resultadoDiv.style.backgroundColor =
    clasificacion.tipo === '—' ? "#e0e0e0" : "#d7f8d0";

  return { resultadoDiv, esNoche: clasificacion.tipo !== '—' };
}

function validarProgramacion() {
  const inputs = document.querySelectorAll(".psv");
  const resultados = document.getElementById("resultados");
  resultados.innerHTML = "";

  const psvs = [];

  inputs.forEach((psv) => {
    const inicio = parseInt(psv.querySelector(".inicio-horas").value) * 60 +
                   parseInt(psv.querySelector(".inicio-minutos").value);
    const fin = parseInt(psv.querySelector(".fin-horas").value) * 60 +
                parseInt(psv.querySelector(".fin-minutos").value);
    psvs.push({ inicio, fin });
  });

  let nochesConsecutivas = 0;
  let maxConsecutivas = 0;

  const detalles = [];

  for (let i = 0; i < psvs.length; i++) {
    const { resultadoDiv, esNoche } = mostrarResultado(psvs[i], i);
    resultados.appendChild(resultadoDiv);

    if (esNoche) {
      nochesConsecutivas++;
      if (nochesConsecutivas > maxConsecutivas) {
        maxConsecutivas = nochesConsecutivas;
      }
    } else {
      nochesConsecutivas = 0;
    }
  }

  const validacionFinal = document.createElement("div");
  validacionFinal.classList.add("mensaje-validacion");

  if (maxConsecutivas <= 2) {
    validacionFinal.innerHTML = `✅ Programación válida: ${maxConsecutivas} noche(s) consecutiva(s)`;
    validacionFinal.style.backgroundColor = "#d4f4d7";
    validacionFinal.style.color = "#1b5e20";
  } else {
    validacionFinal.innerHTML = `❌ Programación inválida: ${maxConsecutivas} noches consecutivas (máx. 2 permitidas)`;
    validacionFinal.style.backgroundColor = "#fddede";
    validacionFinal.style.color = "#b71c1c";
  }

  resultados.prepend(validacionFinal);
}
