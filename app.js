document.getElementById('nightForm').addEventListener('submit', function (e) {
  e.preventDefault();

  const nightCount = parseInt(document.getElementById('nightCount').value);
  const tripType = document.getElementById('tripType').value;
  const restBetween = parseInt(document.getElementById('restBetween').value);
  const dayOffAfter = document.getElementById('dayOffAfter').value;

  let isValid = true;
  let messages = [];

  // Regla 1: No se permiten más de 3 noches consecutivas sin día libre
  if (nightCount === 3 && dayOffAfter === 'no') {
    isValid = false;
    messages.push("❌ No se permite volar 3 noches consecutivas sin un día libre posterior.");
  }

  // Regla 2: Descanso mínimo entre noches (versión simplificada)
  if (restBetween < 12) {
    isValid = false;
    messages.push("❌ El descanso entre noches debe ser al menos 12 horas.");
  }

  // Placeholder para lógica futura
  if (tripType === "simple") {
    messages.push("ℹ️ Tripulación simple seleccionada.");
  } else {
    messages.push("ℹ️ Tripulación reforzada seleccionada.");
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
