const App = {
  pingCount: 0,

  async fetchJSON(url) {
    const res = await fetch(url);
    return res.json();
  },

  async ping() {
    const body = document.getElementById('terminalBody');
    const counter = document.getElementById('pingCount');
    if (!body) return;

    body.innerHTML = '';

    this.addTermLine(body, '$ <span class="t-cmd">curl -s /api/ping</span>');
    this.addTermLine(body, '<span class="t-dim">Conectando...</span>');

    try {
      const data = await this.fetchJSON('/api/ping');
      await this.delay(300);

      this.addTermLine(body, '<span class="t-ok">✓ status:</span> <span class="t-val">' + data.status + '</span>');
      this.addTermLine(body, '<span class="t-ok">✓ time:</span> <span class="t-val">' + data.timestamp + '</span>');
      this.addTermLine(body, '<span class="t-ok">✓ uptime:</span> <span class="t-val">' + data.uptime + '</span>');
      this.addTermLine(body, '<span class="t-ok">✓ region:</span> <span class="t-val">' + data.region + '</span>');
      this.addTermLine(body, '<span class="t-dim">--- 200 OK ---</span>');

      this.pingCount++;
      if (counter) counter.textContent = this.pingCount;
    } catch (err) {
      this.addTermLine(body, '<span class="t-dim">✗ error: ' + err.message + '</span>');
    }
  },

  async loadStats() {
    try {
      const data = await this.fetchJSON('/api/stats');
      const map = { cpu: 'statCpu', memory: 'statMem', requests: 'statReq', latency: 'statLat' };
      for (const [key, id] of Object.entries(map)) {
        const el = document.getElementById(id);
        if (el) el.textContent = data[key];
      }
    } catch (_) {}
  },

  async loadServices() {
    try {
      const services = await this.fetchJSON('/api/services');
      const tbody = document.getElementById('servicesBody');
      if (!tbody) return;

      tbody.innerHTML = '';
      services.forEach(s => {
        const tr = document.createElement('tr');
        tr.innerHTML =
          '<td>' + s.name + '</td>' +
          '<td><span class="status-pill ' + s.status + '"><span class="dot-sm"></span>' + s.status + '</span></td>' +
          '<td>' + s.region + '</td>' +
          '<td>' + s.uptime + '</td>';
        tbody.appendChild(tr);
      });
    } catch (_) {}
  },

  addTermLine(body, html) {
    const div = document.createElement('div');
    div.className = 'terminal-line';
    div.innerHTML = html;
    body.appendChild(div);
  },

  delay(ms) {
    return new Promise(r => setTimeout(r, ms));
  },

  initNav(currentPage) {
    document.querySelectorAll('nav a').forEach(a => {
      a.classList.toggle('active', a.getAttribute('href') === currentPage);
    });
  },

  initTabs() {
    document.querySelectorAll('.tab').forEach(tab => {
      tab.addEventListener('click', () => {
        const group = tab.closest('.tab-group');
        group.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        group.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        tab.classList.add('active');
        document.getElementById(tab.dataset.target).classList.add('active');
      });
    });
  }
};
