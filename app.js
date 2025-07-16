document.getElementById('nightForm').addEventListener('submit', function (e) {
  e.preventDefault();

  const jornadas = [
    { start: document.getElementById('start1').value, end: document.getElementById('end1').value },
    { start: document.getElementById('start2').value, end: document.getElementById('end2').value },
    { start: document.getElementById('start3').value, end: document.getElementById('end3').value }
  ];

  const tripType = document.getElementById('tripType').value;
  const restBetween = parseInt(document.getElementById('restBetween').value);
  const dayOffAfter = document.getElementById('dayOffAfter').value;
  const postRest = parseInt(document.getElementById('postRest').value);

  let nochesZonaRoja = 0;
  let isValid = true;
  let messages = [];

  // Función que evalúa si la jornada toca la zona roja (00:30–05:30)
  function tocaZonaRoja(start, end) {
    const zonaRojaIni = "00:30";
    const zonaRojaFin = "05:30";

    if (!start || !end) return false;

    if (start < end) {
      return (start < zonaRojaFin && end > zonaRojaIni);
    }

    return (start < zonaRojaFin || end > zonaRojaIni);
  }

  // Evaluar cuántas jornadas entran en zona roja
  jornadas.forEach((j, i) => {
    if (tocaZonaRoja(j.start, j.end)) {
      nochesZonaRoja++;
      messages.push(`✅ Jornada ${i + 1} incluye tiempo en zona roja (00:30–05:30).`);
    } else if (j.start && j.end) {
      messages.push(`ℹ️ Jornada ${i + 1} no entra en zona roja.`);
    }
  });

  // Validación legal: máximo 2 noches en zona roja
  if (nochesZonaRoja > 2) {
    isValid = false;
    messages.push("❌ No se permiten más de 2 noches consecutivas dentro de la zona roja (00:30 a 05:30), según convenio colectivo.");
  }

  // Regla: tripulación 2 pilotos no puede 3 noches (independiente de zona roja)
  if (tripType === "2pilotos" && nochesZonaRoja >= 3) {
    isValid = false;
    messages.push("❌ Las tripulaciones de 2 pilotos no pueden volar 3 noches consecutivas, incluso si cumplen otros requisitos.");
  }

  // Regla: 3/4 pilotos + 3 noches → requiere día libre
  if (tripType === "3o4pilotos" && nochesZonaRoja === 3 && dayOffAfter === "no") {
    isValid = false;
    messages.push("❌ Las tripulaciones de 3 o 4 pilotos deben tener un día libre posterior si vuelan 3 noches.");
  }

  // Regla: descanso posterior mínimo de 36h si hay 3 noches y día libre
  if (tripType === "3o4pilotos" && nochesZonaRoja === 3 && dayOffAfter === "si" && postRest < 36) {
    isValid = false;
    messages.push("❌ El descanso posterior tras 3 noches debe ser mínimo de 36 horas.");
  }

  // Regla: descanso mínimo entre noches si hay más de 1 jornada
  if (nochesZonaRoja > 1 && restBetween < 12) {
    isValid = false;
    messages.push("❌ El descanso entre noches debe ser al menos de 12 horas.");
  }

  // Mensaje informativo
  messages.push(`🔎 Total de noches en zona roja detectadas: ${nochesZonaRoja}`);

  const result = document.getElementById('result');
  result.classList.remove('valid', 'invalid');

  if (isValid) {
    result.classList.add('valid');
    result.innerHTML = `✅ Programación válida.<br><br>${messages.join("<br>")}`;
  } else {
    result.classList.add('invalid');
    result.innerHTML = `❌ Programación inválida.<br><br>${messages.join("<br>")}`;
  }
});
