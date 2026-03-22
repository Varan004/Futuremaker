(function () {
   const authCard = document.getElementById('adminAuthCard');
   const dashboard = document.getElementById('adminDashboard');
   const loginForm = document.getElementById('adminLoginForm');
   const loginStatusElement = document.getElementById('adminLoginStatus');
   const logoutButton = document.getElementById('adminLogoutButton');
   const statusElement = document.getElementById('adminStatus');
   const contactTableBody = document.getElementById('contactTableBody');
   const registrationTableBody = document.getElementById('registrationTableBody');

   if (!authCard || !dashboard || !loginForm || !loginStatusElement || !statusElement || !contactTableBody || !registrationTableBody) {
      return;
   }

   function resolveApiUrl(url) {
      const configuredBase = (window.FUTUREMAKERS_API_BASE || '').trim();
      const fallbackBase = window.location.protocol === 'file:' ? 'http://localhost:3000' : '';
      const base = (configuredBase || fallbackBase).replace(/\/$/, '');

      if (!url) {
         return base;
      }

      if (/^https?:\/\//i.test(url)) {
         return url;
      }

      const normalizedPath = url.startsWith('/') ? url : `/${url}`;
      return `${base}${normalizedPath}`;
   }

   async function requestJson(url, options, fallbackError) {
      let response;

      try {
         response = await fetch(resolveApiUrl(url), options || {});
      } catch (_networkError) {
         throw new Error('Unable to reach backend API. Start Node server and open this site from that server URL.');
      }

      let result = {};

      try {
         result = await response.json();
      } catch (_parseError) {
         result = {};
      }

      if (!response.ok) {
         throw new Error(result.error || fallbackError || 'Request failed.');
      }

      return result;
   }

   function formatDate(value) {
      if (!value) return '-';

      const date = new Date(value);
      if (Number.isNaN(date.getTime())) return value;

      return date.toLocaleString();
   }

   function setSummaryText(id, value) {
      const element = document.getElementById(id);
      if (element) {
         element.textContent = value;
      }
   }

   function setStatus(message, isError) {
      statusElement.textContent = message;
      statusElement.classList.toggle('is-error', Boolean(isError));
      statusElement.classList.toggle('is-success', !isError);
   }

   function setLoginStatus(message, isError) {
      loginStatusElement.textContent = message;
      loginStatusElement.classList.toggle('is-error', Boolean(isError));
      loginStatusElement.classList.toggle('is-success', !isError);
   }

   function showAuthCard() {
      authCard.hidden = false;
      dashboard.hidden = true;
   }

   function showDashboard() {
      authCard.hidden = true;
      dashboard.hidden = false;
   }

   function createCell(content) {
      const cell = document.createElement('td');
      cell.textContent = content == null || content === '' ? '-' : String(content);
      return cell;
   }

   function renderEmptyRow(tableBody, columnCount, message) {
      tableBody.innerHTML = '';
      const row = document.createElement('tr');
      const cell = document.createElement('td');
      cell.colSpan = columnCount;
      cell.textContent = message;
      row.appendChild(cell);
      tableBody.appendChild(row);
   }

   function renderContacts(items) {
      const meta = document.getElementById('adminContactMeta');
      if (meta) {
         meta.textContent = `${items.length} record${items.length === 1 ? '' : 's'}`;
      }

      if (!items.length) {
         renderEmptyRow(contactTableBody, 7, 'No contact submissions yet.');
         return;
      }

      contactTableBody.innerHTML = '';
      items.forEach((item) => {
         const row = document.createElement('tr');
         row.appendChild(createCell(item.id));
         row.appendChild(createCell(formatDate(item.submittedAt)));
         row.appendChild(createCell(item.fullName));
         row.appendChild(createCell(item.phone));
         row.appendChild(createCell(item.email));
         row.appendChild(createCell(item.subject));
         row.appendChild(createCell(item.message));
         contactTableBody.appendChild(row);
      });
   }

   function renderRegistrations(items) {
      const meta = document.getElementById('adminRegistrationMeta');
      if (meta) {
         meta.textContent = `${items.length} record${items.length === 1 ? '' : 's'}`;
      }

      if (!items.length) {
         renderEmptyRow(registrationTableBody, 13, 'No registrations yet.');
         return;
      }

      registrationTableBody.innerHTML = '';
      items.forEach((item) => {
         const paymentDetails = item.paymentDetails || {};
         const paymentMeta = item.paymentMeta || {};
         const row = document.createElement('tr');
         row.appendChild(createCell(item.id));
         row.appendChild(createCell(formatDate(item.submittedAt)));
         row.appendChild(createCell(item.status));
         row.appendChild(createCell(item.fullName));
         row.appendChild(createCell(item.email));
         row.appendChild(createCell(item.phone));
         row.appendChild(createCell(item.programLabel || item.program));
         row.appendChild(createCell(item.city));
         row.appendChild(createCell(item.goal));
         row.appendChild(createCell(item.paymentMethod));
         row.appendChild(createCell(item.amount));
         row.appendChild(createCell(paymentMeta.transferReference || paymentDetails.transferReference));
         row.appendChild(createCell(paymentMeta.payerName || paymentDetails.payerName));
         registrationTableBody.appendChild(row);
      });
   }

   async function loadDashboard() {
      try {
         const result = await requestJson('/api/admin/submissions', {}, 'Unable to load admin data.');

         setSummaryText('adminContactCount', result.summary.contacts);
         setSummaryText('adminRegistrationCount', result.summary.registrations);
         setSummaryText('adminLatestContact', formatDate(result.summary.latestContact));
         setSummaryText('adminLatestRegistration', formatDate(result.summary.latestRegistration));

         renderContacts(result.contactSubmissions || []);
         renderRegistrations(result.registrations || []);
         setStatus('Submission data loaded successfully.', false);
      } catch (error) {
         renderEmptyRow(contactTableBody, 7, 'Unable to load contact submissions.');
         renderEmptyRow(registrationTableBody, 13, 'Unable to load registrations.');
         setStatus(error.message || 'Unable to load admin data.', true);
         if (error.message === 'Admin login required.') {
            showAuthCard();
         }
      }
   }

   async function checkAdminSession() {
      try {
         const result = await requestJson('/api/admin/session', {}, 'Unable to check admin session.');

         if (result.authenticated) {
            showDashboard();
            setLoginStatus('Admin session active.', false);
            await loadDashboard();
            return;
         }

         showAuthCard();
         setLoginStatus('Enter the admin password to continue.', false);
      } catch (error) {
         showAuthCard();
         setLoginStatus(error.message || 'Unable to check admin session.', true);
      }
   }

   loginForm.addEventListener('submit', async function (event) {
      event.preventDefault();

      const passwordField = loginForm.querySelector('input[name="password"]');
      const submitButton = loginForm.querySelector('button[type="submit"]');
      const password = passwordField ? passwordField.value.trim() : '';

      if (!password) {
         setLoginStatus('Password is required.', true);
         return;
      }

      if (submitButton) {
         submitButton.disabled = true;
      }

      setLoginStatus('Signing in...', false);

      try {
         const result = await requestJson('/api/admin/login', {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json'
            },
            body: JSON.stringify({ password })
         }, 'Unable to login.');

         loginForm.reset();
         showDashboard();
         setLoginStatus(result.message || 'Admin login successful.', false);
         await loadDashboard();
      } catch (error) {
         showAuthCard();
         setLoginStatus(error.message || 'Unable to login.', true);
      } finally {
         if (submitButton) {
            submitButton.disabled = false;
         }
      }
   });

   if (logoutButton) {
      logoutButton.addEventListener('click', async function () {
         logoutButton.disabled = true;

         try {
            await fetch(resolveApiUrl('/api/admin/logout'), {
               method: 'POST'
            });
         } finally {
            logoutButton.disabled = false;
            showAuthCard();
            setLoginStatus('You have been logged out.', false);
            setStatus('Login required to view admin data.', true);
            renderEmptyRow(contactTableBody, 7, 'Login required.');
            renderEmptyRow(registrationTableBody, 13, 'Login required.');
         }
      });
   }

   checkAdminSession();
})();