document.getElementById("nightForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const zonaRojaInicio = toMinutes("00:30");
  const zonaRojaFin = toMinutes("05:30");
  const mediaNocheInicio = toMinutes("01:30");

  const resultados = [];
  const detalles = [];

  for (let i = 1; i <= 3; i++) {
    const hStart = document.getElementById(`start${i}_hh`).value;
    const mStart = document.getElementById(`start${i}_mm`).value;
    const hEnd = document.getElementById(`end${i}_hh`).value;
    const mEnd = document.getElementById(`end${i}_mm`).value;

    if (!hStart || !mStart || !hEnd || !mEnd) continue;

    const start = `${hStart}:${mStart}`;
    const end = `${hEnd}:${mEnd}`;

    const startMin = toMinutes(start);
    let endMin = toMinutes(end);
    if (endMin <= startMin) endMin += 1440; // cruza medianoche

    let tiempoEnZonaRoja = 0;
    for (let t = startMin; t < endMin; t++) {
      const tMod = t % 1440;
      if (tMod >= zonaRojaInicio && tMod < zonaRojaFin) {
        tiempoEnZonaRoja++;
      }
    }

    const incluyeZonaRoja = tiempoEnZonaRoja > 0;
    const incluyeMediaNoche = (toMinutes(start) >= mediaNocheInicio || toMinutes(end) <= mediaNocheInicio);

    const esNocturno = (incluyeZonaRoja && incluyeMediaNoche) || (tiempoEnZonaRoja >= 150);
    resultados.push(esNocturno ? 1 : 0);

    const colorFondo = esNocturno ? '#d9fdd3' : '#f0f0f0';
    const colorTexto = esNocturno ? '#155724' : '#333';

    detalles.push(`
      <div style="background-color: ${colorFondo}; color: ${colorTexto}; padding: 12px; border-radius: 8px; margin-bottom: 10px;">
        <strong>PSV ${i}</strong><br>
        ▸ Inicio: ${start}<br>
        ▸ Término: ${end}<br>
        ▸ Tiempo en zona roja: ${tiempoEnZonaRoja} min<br>
        ▸ Incluye media noche: ${incluyeMediaNoche ? '✅ Sí' : '❌ No'}<br>
        ▸ Clasificado como <strong>${esNocturno ? '🌙 NOCTURNO' : '☀️ DIURNO'}</strong>
      </div>
    `);
  }

  const totalNoches = resultados.filter(r => r === 1).length;
  const valido = totalNoches <= 2;

  const resumen = valido
    ? `<div class="valid">✅ Programación válida: ${totalNoches} noche(s) consecutiva(s)</div>`
    : `<div class="invalid">❌ Error: Se superan las 2 noches consecutivas permitidas (${totalNoches})</div>`;

  document.getElementById("resultado").innerHTML = resumen;
  document.getElementById("detalle").innerHTML = detalles.join("");
});

function toMinutes(hhmm) {
  const [hh, mm] = hhmm.split(":").map(Number);
  return hh * 60 + mm;
}
