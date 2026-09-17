const App = {
  pingCount: 0,
  commandCount: 0,

  async fetchJSON(url) {
    const res = await fetch(url);
    return res.json();
  },

  getPrompt() {
    return '<span class="console-prompt"><span class="user">cuchipu</span><span class="at">@</span><span class="host">cloud</span><span class="path"> ~</span><span class="sym"> $ </span></span>';
  },

  addCommandLine(cmd) {
    const history = document.getElementById('consoleHistory');
    if (!history) return;
    const line = document.createElement('div');
    line.className = 'console-line';
    line.innerHTML = this.getPrompt() + '<span class="console-input">' + cmd + '</span>';
    history.appendChild(line);
  },

  addOutput(html) {
    const history = document.getElementById('consoleHistory');
    if (!history) return;
    const out = document.createElement('div');
    out.className = 'console-output';
    out.innerHTML = html;
    history.appendChild(out);
  },

  addSeparator() {
    const history = document.getElementById('consoleHistory');
    if (!history) return;
    const sep = document.createElement('div');
    sep.className = 'console-separator';
    sep.innerHTML = '---';
    history.appendChild(sep);
  },

  scrollConsole() {
    const body = document.getElementById('consoleBody');
    if (body) body.scrollTop = body.scrollHeight;
  },

  updateCounter() {
    const el = document.getElementById('consoleCount');
    if (el) el.textContent = this.commandCount + ' comandos ejecutados';
  },

  async delay(ms) {
    return new Promise(r => setTimeout(r, ms));
  },

  async typeText(container, text, speed) {
    for (let i = 0; i < text.length; i++) {
      container.textContent += text[i];
      this.scrollConsole();
      await this.delay(speed || 30);
    }
  },

  async ping() {
    const history = document.getElementById('consoleHistory');
    if (!history) return;

    this.addCommandLine('curl -s /api/ping');
    this.scrollConsole();

    this.addOutput('<span class="tag">Conectando a /api/ping...</span>');
    this.scrollConsole();

    try {
      const data = await this.fetchJSON('/api/ping');
      await this.delay(200);

      this.addOutput(
        '<span class="ok">&#10003;</span> <span class="key">status:</span>    <span class="val">' + data.status + '</span><br>' +
        '<span class="ok">&#10003;</span> <span class="key">timestamp:</span> <span class="val">' + data.timestamp + '</span><br>' +
        '<span class="ok">&#10003;</span> <span class="key">uptime:</span>   <span class="val">' + data.uptime + '</span><br>' +
        '<span class="ok">&#10003;</span> <span class="key">region:</span>   <span class="val">' + data.region + '</span>'
      );

      this.addOutput('<span class="ok">&#9679; 200 OK</span> &mdash; <span class="tag">Respuesta recibida correctamente</span>');

      this.pingCount++;
      this.commandCount++;
      this.updateCounter();
      const sidebarCount = document.getElementById('pingCount');
      if (sidebarCount) sidebarCount.textContent = this.pingCount;
    } catch (err) {
      this.addOutput('<span class="err">&#10007; Error de conexion:</span> <span class="val">' + err.message + '</span>');
      this.commandCount++;
      this.updateCounter();
    }

    this.addSeparator();
    this.scrollConsole();
  },

  async consoleCmd(cmd) {
    const history = document.getElementById('consoleHistory');
    if (!history) return;

    if (cmd === 'clear') {
      history.innerHTML = '';
      this.commandCount++;
      this.updateCounter();
      return;
    }

    this.addCommandLine(cmd);
    this.scrollConsole();

    if (cmd === 'stats') {
      this.addOutput('<span class="tag">Obteniendo metricas del servidor...</span>');
      this.scrollConsole();

      try {
        const data = await this.fetchJSON('/api/stats');
        await this.delay(150);

        this.addOutput(
          '<span class="key">cpu:</span>      <span class="val">' + data.cpu + '</span><br>' +
          '<span class="key">memory:</span>   <span class="val">' + data.memory + '</span><br>' +
          '<span class="key">requests:</span> <span class="val">' + data.requests + '</span><br>' +
          '<span class="key">errors:</span>   <span class="val">' + data.errors + '</span><br>' +
          '<span class="key">latency:</span>  <span class="val">' + data.latency + '</span>'
        );
        this.addOutput('<span class="ok">&#9679; 200 OK</span>');
      } catch (err) {
        this.addOutput('<span class="err">&#10007; Error:</span> ' + err.message);
      }
    }

    if (cmd === 'services') {
      this.addOutput('<span class="tag">Listando servicios desplegados...</span>');
      this.scrollConsole();

      try {
        const services = await this.fetchJSON('/api/services');
        await this.delay(150);

        let html = '';
        services.forEach(s => {
          const statusClass = s.status === 'active' ? 'ok' : 'tag';
          const icon = s.status === 'active' ? '&#9679;' : '&#9675;';
          html += '<span class="' + statusClass + '">' + icon + '</span> <span class="val">' + s.name.padEnd(16) + '</span> <span class="tag">' + s.region.padEnd(12) + '</span> <span class="key">' + s.uptime + '</span><br>';
        });
        this.addOutput(html);
        this.addOutput('<span class="ok">&#9679; 200 OK</span> &mdash; <span class="tag">' + services.length + ' servicios encontrados</span>');
      } catch (err) {
        this.addOutput('<span class="err">&#10007; Error:</span> ' + err.message);
      }
    }

    if (cmd === 'help') {
      this.addOutput(
        '<span class="key">Comandos disponibles:</span><br><br>' +
        '  <span class="val">ping</span>       &mdash; <span class="tag">Verifica estado del servidor</span><br>' +
        '  <span class="val">stats</span>      &mdash; <span class="tag">Metricas de rendimiento</span><br>' +
        '  <span class="val">services</span>   &mdash; <span class="tag">Lista de servicios activos</span><br>' +
        '  <span class="val">clear</span>      &mdash; <span class="tag">Limpiar historial</span><br>' +
        '  <span class="val">help</span>       &mdash; <span class="tag">Mostrar esta ayuda</span>'
      );
    }

    this.commandCount++;
    this.updateCounter();
    this.addSeparator();
    this.scrollConsole();
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
  },

  initConsoleInput() {
    const body = document.getElementById('consoleBody');
    if (!body) return;

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const inputLine = body.querySelector('.console-input-line');
        if (!inputLine) return;

        const existingInput = inputLine.querySelector('.typed-input');
        if (existingInput) {
          const cmd = existingInput.textContent.trim().toLowerCase();
          if (cmd) {
            inputLine.remove();
            this.consoleCmd(cmd);
          }
        }
      }
    });
  }
};
