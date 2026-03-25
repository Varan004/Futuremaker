(function () {
  const lmsGrid = document.getElementById('lmsGrid');
  const lmsStatus = document.getElementById('lmsStatus');
  const lmsCourseMeta = document.getElementById('lmsCourseMeta');

  if (!lmsGrid || !lmsStatus || !lmsCourseMeta) {
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

  function setStatus(message, isError) {
    lmsStatus.textContent = message;
    lmsStatus.classList.toggle('is-error', Boolean(isError));
    lmsStatus.classList.toggle('is-success', !isError);
  }

  function renderEmpty(message) {
    lmsGrid.innerHTML = '';
    const card = document.createElement('article');
    card.className = 'lms-card';

    const title = document.createElement('h3');
    title.textContent = 'No courses';

    const text = document.createElement('p');
    text.textContent = message;

    card.appendChild(title);
    card.appendChild(text);
    lmsGrid.appendChild(card);
  }

  function renderCourses(items) {
    lmsCourseMeta.textContent = `${items.length} course${items.length === 1 ? '' : 's'}`;

    if (!items.length) {
      renderEmpty('No published LMS courses yet. Please check updates later.');
      return;
    }

    lmsGrid.innerHTML = '';

    items.forEach((item) => {
      const card = document.createElement('article');
      card.className = 'lms-card';

      const top = document.createElement('div');
      top.className = 'lms-card-top';

      if (item.isFeatured) {
        const badge = document.createElement('span');
        badge.className = 'lms-badge';
        badge.textContent = 'Featured';
        top.appendChild(badge);
      }

      const level = document.createElement('span');
      level.className = 'lms-level';
      level.textContent = item.level || 'Beginner';
      top.appendChild(level);

      const title = document.createElement('h3');
      title.textContent = item.title || 'Untitled course';

      const summary = document.createElement('p');
      summary.className = 'lms-summary';
      summary.textContent = item.summary || '-';

      const foot = document.createElement('div');
      foot.className = 'lms-card-foot';

      const duration = document.createElement('span');
      duration.className = 'lms-duration';
      duration.textContent = item.duration || 'Self paced';
      foot.appendChild(duration);

      if (Array.isArray(item.tags) && item.tags.length) {
        const tags = document.createElement('span');
        tags.className = 'lms-tags';
        tags.textContent = item.tags.join(' | ');
        foot.appendChild(tags);
      }

      card.appendChild(top);
      card.appendChild(title);
      card.appendChild(summary);
      card.appendChild(foot);
      lmsGrid.appendChild(card);
    });
  }

  async function loadCourses() {
    setStatus('Loading courses...', false);

    try {
      const response = await fetch(resolveApiUrl('/api/lms-courses'));
      let result = {};

      try {
        result = await response.json();
      } catch (_parseError) {
        result = {};
      }

      if (!response.ok) {
        throw new Error(result.error || 'Unable to load LMS courses.');
      }

      renderCourses(result.items || []);
      setStatus('Courses loaded successfully.', false);
    } catch (error) {
      renderEmpty('Unable to load LMS courses right now. Please try again later.');
      setStatus(error.message || 'Unable to load LMS courses.', true);
    }
  }

  loadCourses();
})();