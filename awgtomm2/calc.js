(function () {
  const minN = -3;
  const maxN = 40;
  let n = 12;
  let metric = false;

  const nameEl = document.getElementById("gauge-name");
  const areaEl = document.getElementById("area");
  const diameterEl = document.getElementById("diameter");
  const inchesEl = document.getElementById("inches");
  const milsEl = document.getElementById("mils");
  const matchEl = document.getElementById("match");
  const awgBox = document.getElementById("awg-controls");
  const metricBox = document.getElementById("metric-controls");
  const input = document.getElementById("metric");
  const modeAwg = document.getElementById("mode-awg");
  const modeMetric = document.getElementById("mode-metric");

  function gauge(index) {
    const diameter = 0.127 * Math.pow(92, (36 - index) / 39);
    const area = Math.PI * (diameter / 2) ** 2;
    return { n: index, diameter, area };
  }

  function name(index) {
    if (index === -3) return "4/0";
    if (index === -2) return "3/0";
    if (index === -1) return "2/0";
    if (index === 0) return "1/0";
    return index + " AWG";
  }

  function digits(value) {
    const abs = Math.abs(value);
    if (abs >= 100) return 1;
    if (abs >= 10) return 2;
    return 3;
  }

  function num(value, places) {
    return value.toLocaleString("en-US", {
      minimumFractionDigits: places,
      maximumFractionDigits: places,
    });
  }

  function paint(item, note) {
    const inches = item.diameter / 25.4;
    const mils = (inches * 1000) ** 2;
    nameEl.textContent = name(item.n);
    areaEl.textContent = num(item.area, digits(item.area)) + " mm²";
    diameterEl.textContent = num(item.diameter, 3) + " mm";
    inchesEl.textContent = num(inches, 4) + " in";
    milsEl.textContent = num(mils, 0);
    matchEl.hidden = !note;
    matchEl.textContent = note || "";
  }

  function nearest(value) {
    const first = gauge(minN);
    if (value > first.area) return { item: first, above: true };
    let best = gauge(minN);
    let bestDist = Math.abs(value - best.area);
    for (let i = minN + 1; i <= maxN; i++) {
      const item = gauge(i);
      const dist = Math.abs(value - item.area);
      if (dist < bestDist) {
        best = item;
        bestDist = dist;
      }
    }
    return { item: best, above: false };
  }

  function render() {
    if (!metric) {
      paint(gauge(n), "");
      return;
    }
    const raw = input.value.trim().replace(/,/g, ".");
    const value = Number(raw);
    if (!raw || !Number.isFinite(value) || value <= 0) {
      areaEl.textContent = "—";
      diameterEl.textContent = "—";
      inchesEl.textContent = "—";
      milsEl.textContent = "—";
      matchEl.hidden = false;
      matchEl.textContent = "Enter a number above 0.";
      return;
    }
    const found = nearest(value);
    n = found.item.n;
    const note = found.above
      ? "Above 4/0. The scale stays on 4/0."
      : "Nearest gauge on the scale.";
    paint(found.item, note);
  }

  function setMode(next) {
    metric = next;
    modeAwg.setAttribute("aria-pressed", String(!metric));
    modeMetric.setAttribute("aria-pressed", String(metric));
    awgBox.hidden = metric;
    metricBox.hidden = !metric;
    if (metric) {
      const item = gauge(n);
      input.value = item.area.toFixed(digits(item.area));
    }
    render();
  }

  document.getElementById("thinner").addEventListener("click", function () {
    n = Math.min(maxN, n + 1);
    render();
  });
  document.getElementById("thicker").addEventListener("click", function () {
    n = Math.max(minN, n - 1);
    render();
  });
  modeAwg.addEventListener("click", function () { setMode(false); });
  modeMetric.addEventListener("click", function () { setMode(true); });
  input.addEventListener("input", render);
  document.getElementById("calc").addEventListener("submit", function (event) {
    event.preventDefault();
  });
  render();
})();
