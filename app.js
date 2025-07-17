document.getElementById('nightForm').addEventListener('submit', function(e) {
  e.preventDefault();

  const resultDiv = document.getElementById('result');
  resultDiv.textContent = '';
  resultDiv.className = 'result';

  const tripType = document.getElementById('tripType').value;
  const restBetween = parseInt(document.getElementById('restBetween').value);
  const dayOffAfter = document.getElementById('dayOffAfter').value;
  const postRest = parseInt(document.getElementById('postRest').value);

  const psvs = [
    { start: document.getElementById('start1').value, end: document.getElementById('end1').value },
    { start: document.getElementById('start2').value, end: document.getElementById('end2').value },
    { start: document.getElementById('start3').value, end: document.getElementById('end3').value },
  ];

  const zonaRojaInicio = "00:30";
  const zonaRojaFin = "05:30";
  const mediaNocheRef = "01:30";

  function toDate(timeStr) {
    const [h, m] = timeStr.split(':').map(Number);
    const d = new Date();
    d.setHours(h, m, 0, 0);
    return d;
  }

  function clasificarPSV(psv) {
    if (!psv.start || !psv.end) return "no_noche";
    const start = toDate(psv.start);
    let end = toDate(psv.end);
    if (end <= start) end.setDate(end.getDate() + 1);

    const zonaIni = toDate(zonaRojaInicio);
    const zonaFin = toDate(zonaRojaFin);
    if (start > zonaFin) zonaFin.setDate(zonaFin.getDate() + 1);

    const mediaRef = toDate(mediaNocheRef);
    if (start > mediaRef) mediaRef.setDate(mediaRef.getDate() + 1);

    const overlapStart = start > zonaIni ? start : zonaIni;
    const overlapEnd = end < zonaFin ? end : zonaFin;
    const zonaOverlap = Math.max(0, (overlapEnd - overlapStart) / 60000); // en minutos

    if (zonaOverlap === 0) return "no_noche";

    // Lógica oficial:
    // - noche_completa: si comienza antes de 00:30 y termina después de 01:30
    // - media_noche: si termina antes o igual a 01:30 o comienza después de 01:30
    if (start < zonaIni && end > mediaRef) return "noche_completa";
    if (end <= mediaRef || start >= mediaRef) return "media_noche";

    return "noche_completa"; // fallback conservador
  }

  const noches = psvs.map(clasificarPSV).filter(v => v !== "no_noche");

  if (noches.length > 2) {
    resultDiv.textContent = "❌ No cumple: Se exceden las 2 noches consecutivas permitidas.";
    resultDiv.classList.add('invalid');
  } else {
    resultDiv.textContent = "✅ Cumple: No se exceden las 2 noches consecutivas.";
    resultDiv.classList.add('valid');
  }
});
