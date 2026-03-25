(function () {
  const updatesGrid = document.getElementById('updatesGrid');
  const updatesStatus = document.getElementById('updatesStatus');
  const updatesCountMeta = document.getElementById('updatesCountMeta');

  if (!updatesGrid || !updatesStatus || !updatesCountMeta) {
    return;
  }

  function resolveApiUrl(url) {
    const configuredBase = (window.FUTUREMAKERS_API_BASE || '').trim();
    const fallbackBase = window.location.protocol === 'file:' ? 'http://localhost:3000' : '';
    const base = (configuredBase || fallbackBase).replace(/\/$/, '');

    if (!url) return base;
    if (/^https?:\/\//i.test(url)) return url;

    const normalizedPath = url.startsWith('/') ? url : `/${url}`;
    return `${base}${normalizedPath}`;
  }

  function formatDate(value) {
    if (!value) return '-';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleString();
  }

  function setStatus(message, isError) {
    updatesStatus.textContent = message;
    updatesStatus.classList.toggle('is-error', Boolean(isError));
    updatesStatus.classList.toggle('is-success', !isError);
  }

  function renderEmpty(message) {
    updatesGrid.innerHTML = '';
    const card = document.createElement('article');
    card.className = 'update-card';
    const title = document.createElement('h3');
    title.textContent = 'No updates';
    const text = document.createElement('p');
    text.textContent = message;
    card.appendChild(title);
    card.appendChild(text);
    updatesGrid.appendChild(card);
  }

  function renderUpdates(items) {
    updatesCountMeta.textContent = `${items.length} update${items.length === 1 ? '' : 's'}`;

    if (!items.length) {
      renderEmpty('No published LMS updates yet.');
      return;
    }

    updatesGrid.innerHTML = '';

    items.forEach((item) => {
      const card = document.createElement('article');
      card.className = 'update-card';

      const head = document.createElement('div');
      head.className = 'update-head';

      if (item.isPinned) {
        const pin = document.createElement('span');
        pin.className = 'update-badge';
        pin.textContent = 'Pinned';
        head.appendChild(pin);
      }

      const time = document.createElement('span');
      time.className = 'update-time';
      time.textContent = formatDate(item.updatedAt || item.submittedAt);
      head.appendChild(time);

      const title = document.createElement('h3');
      title.textContent = item.title || 'Untitled update';

      const summary = document.createElement('p');
      summary.className = 'update-summary';
      summary.textContent = item.summary || '-';

      const body = document.createElement('p');
      body.className = 'update-body';
      body.textContent = item.body || '-';

      card.appendChild(head);
      card.appendChild(title);
      card.appendChild(summary);
      card.appendChild(body);

      updatesGrid.appendChild(card);
    });
  }

  async function loadUpdates() {
    setStatus('Loading updates...', false);

    try {
      const response = await fetch(resolveApiUrl('/api/lms-updates'));
      let result = {};

      try {
        result = await response.json();
      } catch (_parseError) {
        result = {};
      }

      if (!response.ok) {
        throw new Error(result.error || 'Unable to load updates.');
      }

      renderUpdates(result.items || []);
      setStatus('Updates loaded successfully.', false);
    } catch (error) {
      renderEmpty('Unable to load LMS updates right now. Please try again later.');
      setStatus(error.message || 'Unable to load updates.', true);
    }
  }

  loadUpdates();
})();
