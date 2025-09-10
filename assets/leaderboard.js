// Simple leaderboard loader & sorter
async function loadData() {
  const resp = await fetch('data/models.json?' + Date.now());
  const models = await resp.json();
  return models;
}

function toNumber(x) {
  if (x === null || x === undefined) return null;
  const n = Number(x);
  return Number.isFinite(n) ? n : null;
}

function renderTable(rows) {
  const tbody = document.getElementById('lb-body');
  tbody.innerHTML = '';
  rows.forEach((r, i) => {
    const tr = document.createElement('tr');
    tr.className = 'hover:bg-neutral-900/40';
    const cfgLink = r.config_url ? `<a class="underline" href="${r.config_url}" target="_blank">view</a>` : '—';
    tr.innerHTML = `
      <td class="px-3 py-2">${i + 1}</td>
      <td class="px-3 py-2">${r.model}</td>
      <td class="px-3 py-2">${r.organization || '—'}</td>
      <td class="px-3 py-2">${r.framework || '—'}</td>
      <td class="px-3 py-2">${r.completion != null ? (r.completion*100).toFixed(1) + '%' : '—'}</td>
      <td class="px-3 py-2">${r.pass != null ? (r.pass*100).toFixed(1) + '%' : '—'}</td>
      <td class="px-3 py-2">${r.alpha != null ? r.alpha.toFixed(3) : '—'}</td>
      <td class="px-3 py-2">${r.cost != null ? '$' + r.cost.toFixed(2) : '—'}</td>
      <td class="px-3 py-2">${r.commit_date || ''}</td>
      <td class="px-3 py-2">${cfgLink}</td>
    `;
    tbody.appendChild(tr);
  });
}

function rank(rows) {
  // Default sort by pass desc, then completion desc, then alpha desc (nulls last), cost asc
  const sorted = rows.slice().sort((a,b) => {
    const passA = toNumber(a.pass), passB = toNumber(b.pass);
    if (passA !== passB) return (passB ?? -1) - (passA ?? -1);
    const compA = toNumber(a.completion), compB = toNumber(b.completion);
    if (compA !== compB) return (compB ?? -1) - (compA ?? -1);
    const aAlpha = toNumber(a.alpha), bAlpha = toNumber(b.alpha);
    if (aAlpha !== bAlpha) return (bAlpha ?? -1) - (aAlpha ?? -1);
    const costA = toNumber(a.cost), costB = toNumber(b.cost);
    if (costA !== costB) return (costA ?? Infinity) - (costB ?? Infinity);
    return 0;
  });
  return sorted;
}

function attachSorting(rows) {
  const headers = document.querySelectorAll('th.sortable');
  headers.forEach(th => {
    let asc = false;
    th.addEventListener('click', () => {
      const key = th.dataset.key;
      asc = !asc;
      const sorted = rows.slice().sort((a,b) => {
        const av = a[key], bv = b[key];
        const na = toNumber(av), nb = toNumber(bv);
        const A = (na ?? av ?? ''), B = (nb ?? bv ?? '');
        if (A < B) return asc ? -1 : 1;
        if (A > B) return asc ? 1 : -1;
        return 0;
      });
      renderTable(sorted);
    });
  });
}

function filterRows(rows) {
  const q = document.getElementById('search').value.trim().toLowerCase();
  const startDate = document.getElementById('startDate').value;
  const endDate = document.getElementById('endDate').value;
  
  return rows.filter(r => {
    const hit = (r.model + ' ' + (r.organization || '') + ' ' + (r.framework || '')).toLowerCase().includes(q);
    
    // Date filtering logic
    let dateOk = true;
    if (startDate || endDate) {
      const rowDate = r.commit_date ? new Date(r.commit_date) : null;
      if (rowDate) {
        if (startDate) {
          const start = new Date(startDate);
          dateOk = dateOk && rowDate >= start;
        }
        if (endDate) {
          const end = new Date(endDate);
          dateOk = dateOk && rowDate <= end;
        }
      } else {
        // If row has no date but date filter is applied, exclude it
        dateOk = false;
      }
    }
    
    return hit && dateOk;
  });
}

(async function init() {
  let rows = await loadData();
  let ranked = rank(rows);
  renderTable(ranked);
  attachSorting(ranked);
  const search = document.getElementById('search');
  const startDate = document.getElementById('startDate');
  const endDate = document.getElementById('endDate');
  
  // Set end date to current date by default
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  endDate.value = todayStr;
  
  function refresh() { renderTable(rank(filterRows(rows))); }
  search.addEventListener('input', refresh);
  startDate.addEventListener('change', refresh);
  endDate.addEventListener('change', refresh);
})();