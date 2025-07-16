document.getElementById('nightForm').addEventListener('submit', function (e) {
  e.preventDefault();

  const nightCount = parseInt(document.getElementById('nightCount').value);
  const tripType = document.getElementById('tripType').value;
  const restBetween = parseInt(document.getElementById('restBetween').value);
  const dayOffAfter = document.getElementById('dayOffAfter').value;

  let isValid = true;
  let messages = [];

  // Regla 1: Tripulación de 2 pilotos no puede volar 3 noches seguidas
  if (tripType === "2pilotos" && nightCount === 3) {
    isValid = false;
    messages.push("❌ Las tripulaciones de 2 pilotos no pueden volar 3 noches consecutivas.");
  }

  // Regla 2: Tripulación de 3 o 4 pilotos requiere día libre después de 3 noches
  if (tripType === "3o4pilotos" && nightCount === 3 && dayOffAfter === 'no') {
    isValid = false;
    messages.push("❌ Las tripulaciones de 3 o 4 pilotos deben tener un día libre posterior si vuelan 3 noches consecutivas.");
  }

  // Regla 3: Descanso mínimo entre noches
  if (restBetween < 12) {
    isValid = false;
    messages.push("❌ El descanso entre noches debe ser al menos de 12 horas.");
  }

  // Informativo
  if (tripType === "2pilotos") {
    messages.push("ℹ️ Tripulación de 2 pilotos seleccionada.");
  } else {
    messages.push("ℹ️ Tripulación de 3 o 4 pilotos seleccionada.");
  }

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
