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

  let nocturnas = 0;
  let isValid = true;
  let messages = [];

  // Determinar cuántas jornadas cruzan la medianoche
  jornadas.forEach((j, index) => {
    if (j.start && j.end && j.start > j.end) {
      nocturnas++;
      messages.push(`✅ Jornada ${index + 1} cruza la medianoche.`);
    } else if (j.start && j.end) {
      messages.push(`ℹ️ Jornada ${index + 1} no cruza la medianoche.`);
    }
  });

  // Validaciones por tipo de tripulación y número de noches
  if (tripType === "2pilotos" && nocturnas >= 3) {
    isValid = false;
    messages.push("❌ Las tripulaciones de 2 pilotos no pueden volar 3 noches consecutivas.");
  }

  if (tripType === "3o4pilotos" && nocturnas >= 3 && dayOffAfter === 'no') {
    isValid = false;
    messages.push("❌ Las tripulaciones de 3 o 4 pilotos deben tener un día libre posterior si vuelan 3 noches consecutivas.");
  }

  if (tripType === "3o4pilotos" && nocturnas >= 3 && dayOffAfter === 'si' && postRest < 36) {
    isValid = false;
    messages.push("❌ El descanso posterior tras 3 noches debe ser mínimo de 36 horas.");
  }

  // Descanso mínimo entre noches
  if (nocturnas > 1 && restBetween < 12) {
    isValid = false;
    messages.push("❌ El descanso entre noches debe ser de al menos 12 horas.");
  }

  // Mensaje final
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
