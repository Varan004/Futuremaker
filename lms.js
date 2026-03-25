(function () {
  const lmsGrid = document.getElementById('lmsGrid');
  const lmsStatus = document.getElementById('lmsStatus');
  const lmsCourseMeta = document.getElementById('lmsCourseMeta');
  const lmsAuthCard = document.getElementById('lmsAuthCard');
  const lmsApplicantCard = document.getElementById('lmsApplicantCard');
  const lmsLoginForm = document.getElementById('lmsLoginForm');
  const lmsAuthStatus = document.getElementById('lmsAuthStatus');
  const lmsSessionStatus = document.getElementById('lmsSessionStatus');
  const lmsApplicantName = document.getElementById('lmsApplicantName');
  const lmsApplicantMeta = document.getElementById('lmsApplicantMeta');
  const lmsLogoutBtn = document.getElementById('lmsLogoutBtn');

  if (!lmsGrid || !lmsStatus || !lmsCourseMeta || !lmsLoginForm || !lmsAuthStatus || !lmsSessionStatus || !lmsApplicantName || !lmsApplicantMeta || !lmsLogoutBtn || !lmsAuthCard || !lmsApplicantCard) {
    return;
  }

  let applicantSession = null;

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

  function setAuthStatus(message, isError) {
    lmsAuthStatus.textContent = message;
    lmsAuthStatus.classList.toggle('is-error', Boolean(isError));
    lmsAuthStatus.classList.toggle('is-success', !isError);
  }

  function setSessionStatus(message, isError) {
    lmsSessionStatus.textContent = message;
    lmsSessionStatus.classList.toggle('is-error', Boolean(isError));
    lmsSessionStatus.classList.toggle('is-success', !isError);
  }

  function showApplicantCard(applicant) {
    applicantSession = applicant;
    lmsAuthCard.hidden = true;
    lmsApplicantCard.hidden = false;
    lmsApplicantName.textContent = applicant.fullName || 'Applicant';
    lmsApplicantMeta.textContent = `${applicant.program || 'Program'} | ${applicant.applicationCode || '-'}`;
    setSessionStatus('You can now update your course progress.', false);
  }

  function showAuthCard() {
    applicantSession = null;
    lmsAuthCard.hidden = false;
    lmsApplicantCard.hidden = true;
    setAuthStatus('Enter your applicant credentials to continue.', false);
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

  async function updateProgress(courseId, statusValue, triggerButton) {
    if (!applicantSession) {
      setSessionStatus('Please login as an applicant first.', true);
      return;
    }

    if (triggerButton) {
      triggerButton.disabled = true;
    }

    setSessionStatus('Updating progress...', false);

    try {
      const response = await fetch(resolveApiUrl(`/api/applicant/lms/progress/${encodeURIComponent(courseId)}`), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: statusValue })
      });

      let result = {};
      try {
        result = await response.json();
      } catch (_parseError) {
        result = {};
      }

      if (!response.ok) {
        throw new Error(result.error || 'Unable to update progress.');
      }

      setSessionStatus('Progress updated.', false);
      await loadCourses();
    } catch (error) {
      setSessionStatus(error.message || 'Unable to update progress.', true);
    } finally {
      if (triggerButton) {
        triggerButton.disabled = false;
      }
    }
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

      let progressWrap = null;
      if (applicantSession) {
        progressWrap = document.createElement('div');
        progressWrap.className = 'lms-progress-wrap';

        const currentStatus = document.createElement('span');
        currentStatus.className = 'lms-progress-status';
        currentStatus.textContent = `Status: ${item.progressStatus || 'not-started'}`;
        progressWrap.appendChild(currentStatus);

        const controls = document.createElement('div');
        controls.className = 'lms-progress-controls';

        const statuses = [
          { value: 'not-started', label: 'Reset' },
          { value: 'in-progress', label: 'In Progress' },
          { value: 'completed', label: 'Completed' }
        ];

        statuses.forEach((entry) => {
          const btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'lms-progress-btn';
          btn.textContent = entry.label;
          if ((item.progressStatus || 'not-started') === entry.value) {
            btn.classList.add('is-active');
          }

          btn.addEventListener('click', function () {
            updateProgress(item.id, entry.value, btn);
          });
          controls.appendChild(btn);
        });

        progressWrap.appendChild(controls);
      }

      card.appendChild(top);
      card.appendChild(title);
      card.appendChild(summary);
      card.appendChild(foot);
      if (progressWrap) {
        card.appendChild(progressWrap);
      }
      lmsGrid.appendChild(card);
    });
  }

  async function loadCourses() {
    setStatus('Loading courses...', false);

    try {
      const endpoint = applicantSession ? '/api/applicant/lms' : '/api/lms-courses';
      const response = await fetch(resolveApiUrl(endpoint));
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

  async function checkApplicantSession() {
    setAuthStatus('Checking applicant session...', false);

    try {
      const response = await fetch(resolveApiUrl('/api/applicant/session'));
      let result = {};
      try {
        result = await response.json();
      } catch (_parseError) {
        result = {};
      }

      if (!response.ok) {
        throw new Error(result.error || 'Unable to check applicant session.');
      }

      if (result.authenticated && result.applicant) {
        showApplicantCard(result.applicant);
      } else {
        showAuthCard();
      }
    } catch (error) {
      showAuthCard();
      setAuthStatus(error.message || 'Unable to check applicant session.', true);
    }
  }

  lmsLoginForm.addEventListener('submit', async function (event) {
    event.preventDefault();

    const submitBtn = lmsLoginForm.querySelector('button[type="submit"]');
    const applicationCodeInput = document.getElementById('lmsApplicationCode');
    const emailInput = document.getElementById('lmsApplicantEmail');

    const applicationCode = applicationCodeInput ? applicationCodeInput.value.trim().toUpperCase() : '';
    const email = emailInput ? emailInput.value.trim().toLowerCase() : '';

    if (!applicationCode || !email) {
      setAuthStatus('Application code and email are required.', true);
      return;
    }

    if (submitBtn) {
      submitBtn.disabled = true;
    }

    setAuthStatus('Signing in...', false);

    try {
      const response = await fetch(resolveApiUrl('/api/applicant/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applicationCode, email })
      });

      let result = {};
      try {
        result = await response.json();
      } catch (_parseError) {
        result = {};
      }

      if (!response.ok) {
        throw new Error(result.error || 'Unable to login.');
      }

      showApplicantCard(result.applicant || {});
      setAuthStatus('Applicant login successful.', false);
      await loadCourses();
    } catch (error) {
      setAuthStatus(error.message || 'Unable to login.', true);
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
      }
    }
  });

  lmsLogoutBtn.addEventListener('click', async function () {
    lmsLogoutBtn.disabled = true;
    setSessionStatus('Signing out...', false);

    try {
      await fetch(resolveApiUrl('/api/applicant/logout'), { method: 'POST' });
      showAuthCard();
      await loadCourses();
    } finally {
      lmsLogoutBtn.disabled = false;
    }
  });

  checkApplicantSession().then(loadCourses);
})();