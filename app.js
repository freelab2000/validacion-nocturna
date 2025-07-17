document.getElementById("nightForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const start1 = document.getElementById("start1").value;
  const end1 = document.getElementById("end1").value;
  const start2 = document.getElementById("start2").value;
  const end2 = document.getElementById("end2").value;
  const start3 = document.getElementById("start3").value;
  const end3 = document.getElementById("end3").value;

  const resultDiv = document.getElementById("result");
  resultDiv.textContent = "";
  resultDiv.className = "result";

  const clasificaciones_finales = [];

  function clasificarPSV(start, end) {
    if (!start || !end) return "no_noche";

    const fmt = "1970-01-01T";
    const zona_ini = new Date(fmt + "00:30");
    const zona_fin = new Date(fmt + "05:30");
    const media_ref = new Date(fmt + "01:30");

    let start_dt = new Date(fmt + start);
    let end_dt = new Date(fmt + end);
    if (end_dt <= start_dt) end_dt.setDate(end_dt.getDate() + 1);

    let zona_ini_dt = new Date(zona_ini);
    let zona_fin_dt = new Date(zona_fin);
    let media_ref_dt = new Date(media_ref);

    if (end_dt < zona_ini_dt) {
      zona_ini_dt.setDate(zona_ini_dt.getDate() - 1);
      zona_fin_dt.setDate(zona_fin_dt.getDate() - 1);
    } else if (start_dt > zona_fin_dt) {
      zona_ini_dt.setDate(zona_ini_dt.getDate() + 1);
      zona_fin_dt.setDate(zona_fin_dt.getDate() + 1);
    }

    if (start_dt > media_ref_dt) {
      media_ref_dt.setDate(media_ref_dt.getDate() + 1);
    }

    const overlap_start = start_dt > zona_ini_dt ? start_dt : zona_ini_dt;
    const overlap_end = end_dt < zona_fin_dt ? end_dt : zona_fin_dt;
    const overlap_minutes = (overlap_end - overlap_start) / 60000;

    if (overlap_minutes <= 0) return "no_noche";
    if (start_dt < zona_ini_dt && end_dt > media_ref_dt) return "noche_completa";
    if (end_dt <= media_ref_dt || start_dt >= media_ref_dt) return "media_noche";

    return "noche_completa";
  }

  const noches = [];
  [ [start1, end1], [start2, end2], [start3, end3] ].forEach((psv) => {
    const tipo = clasificarPSV(psv[0], psv[1]);
    clasificaciones_finales.push(tipo);
    if (tipo !== "no_noche") noches.push(tipo);
  });

  if (noches.length > 2) {
    resultDiv.textContent = "❌ No cumple: Se exceden las 2 noches consecutivas permitidas.";
    resultDiv.classList.add('invalid');
  } else {
    resultDiv.textContent = "✅ Cumple: No se exceden las 2 noches consecutivas.";
    resultDiv.classList.add('valid');
  }

  const detalleDiv = document.getElementById('detalle');
  let detalleHtml = "<h3>🧭 Clasificación por PSV:</h3><ul>";
  clasificaciones_finales.forEach((tipo, i) => {
    let color = tipo === "noche_completa" ? "🟩" : tipo === "media_noche" ? "🟨" : "⬜️";
    let texto = tipo.replace("_", " ");
    detalleHtml += `<li>PSV ${i + 1}: ${color} ${texto}</li>`;
  });
  detalleHtml += "</ul>";
  detalleDiv.innerHTML = detalleHtml;
});
