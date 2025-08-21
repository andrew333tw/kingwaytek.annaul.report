(async function () {
  const res = await fetch('data/reportData.json', { cache: 'no-store' });
  const data = await res.json();

  // KPI cards
  const kpiGrid = document.getElementById('kpi-grid');
  const inv = data.kpi.investor;
  kpiGrid.innerHTML = Object.entries(inv).map(([k, v]) => `
    <div class="kpi-card card">
      <div class="kpi-title">${v.label}</div>
      <div class="kpi-value">${v.value}${v.unit || ''}</div>
      <div class="kpi-change ${v.change >= 0 ? 'up' : 'down'}">
        ${v.change >= 0 ? '▲' : '▼'} ${Math.abs(v.change)}%
      </div>
    </div>
  `).join('');

  // 圓環圖 + 點擊詳情
  const donut = new Chart(document.getElementById('businessDonut'), {
    type: 'doughnut',
    data: {
      labels: data.mix.map(d => d.name),
      datasets: [{
        data: data.mix.map(d => d.share),
        backgroundColor: data.mix.map(d => d.color),
        borderWidth: 3
      }]
    },
    options: {
      plugins: { legend: { display: false } },
      onClick: (_, els) => {
        if (!els.length) return;
        const i = els[0].index, d = data.mix[i];
        document.getElementById('donutDetail').innerHTML = `
          <h4>${d.name}（${d.share}%）</h4>
          <p><b>113年營收：</b>${d.revenue_text}</p>
          <p><b>去年亮點：</b>${d.highlight}</p>
          <p><b>今年 KPI：</b>${d.kpi}</p>`;
      }
    }
  });

  // ✅ 圓環 legend（顏色對應直接顯示）
  const legend = document.getElementById('businessLegend');
  legend.innerHTML = data.mix.map((d, i) => `
    <span class="legend-item">
      <i class="swatch" style="background:${d.color}"></i>${d.name}
    </span>
  `).join('');

  // ✅ 112/113 詳細財務數字表
  const table = document.getElementById('kpiTable');
  const rows = data.kpi_table; // 來自 JSON
  table.innerHTML = `
    <thead><tr><th>指標</th><th>112 年</th><th>113 年</th><th>單位/說明</th></tr></thead>
    <tbody>
      ${rows.map(r => `<tr><td>${r.label}</td><td>${r.y112}</td><td>${r.y113}</td><td>${r.note}</td></tr>`).join('')}
    </tbody>`;

  // ✅ 三大生態圈：Tab + 共用輸出框
  const output = document.getElementById('ecosystemOutput');
  const tabs = document.querySelectorAll('.ecosys-tab');
  function renderEco(key) {
    const e = data.future[key];
    output.innerHTML = `
      <h4>${e.title}</h4>
      <div class="eco-grid">
        <div class="eco-block"><h5>外部驅動</h5><ul>${e.drivers.map(x=>`<li>${x}</li>`).join('')}</ul></div>
        <div class="eco-block"><h5>公司策略</h5><ul>${e.strategy.map(x=>`<li>${x}</li>`).join('')}</ul></div>
        <div class="eco-block"><h5>行動計畫</h5><ul>${e.actions.map(x=>`<li>${x}</li>`).join('')}</ul></div>
        <div class="eco-block"><h5>代表專案/產品</h5><ul>${(e.projects||[]).map(p=>`<li><b>${p.name}</b>：${p.desc}</li>`).join('')}</ul></div>
      </div>
      <div class="eco-kpi">建議 KPI：${e.kpi.join('、')}</div>`;
    tabs.forEach(b => b.classList.toggle('active', b.dataset.key === key));
  }
  tabs.forEach(b => b.addEventListener('click', () => renderEco(b.dataset.key)));
  tabs[0].click(); // 預設載入第一個

  // 政策時間軸
  const time = document.getElementById('policyTimeline');
  time.innerHTML = data.policies.map(p => `
    <div class="timeline-item">
      <div class="timeline-dot" title="${p.name}"></div>
      <div class="timeline-content">
        <h4>${p.name}（${p.year}）</h4>
        <p>對應：${p.fit.join('、')}</p>
        <p>${p.details}</p>
      </div>
    </div>`).join('');

  // ✅ 策略亮點 × 關鍵決策議程（合併卡片）
  const agenda = document.getElementById('agendaGrid');
  agenda.innerHTML = data.agenda.map(c => `
    <div class="combined-card">
      <h4>${c.title}</h4>
      <p>${c.desc}</p>
    </div>`).join('');
})();
