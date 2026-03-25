(function () {
   const authCard = document.getElementById('adminAuthCard');
   const dashboard = document.getElementById('adminDashboard');
   const loginForm = document.getElementById('adminLoginForm');
   const loginStatusElement = document.getElementById('adminLoginStatus');
   const logoutButton = document.getElementById('adminLogoutButton');
   const statusElement = document.getElementById('adminStatus');
   const contactTableBody = document.getElementById('contactTableBody');
   const registrationTableBody = document.getElementById('registrationTableBody');
   const teamUserTableBody = document.getElementById('teamUserTableBody');
   const lmsUpdateTableBody = document.getElementById('lmsUpdateTableBody');
   const teamUsersSection = document.getElementById('adminTeamUsersSection');
   const teamUsersPanel = document.getElementById('adminTeamUsersPanel');
   const teamUsersToggleBtn = document.getElementById('adminTeamUsersToggleBtn');
   const lmsUpdatesSection = document.getElementById('adminLmsUpdatesSection');
   const lmsUpdatesPanel = document.getElementById('adminLmsUpdatesPanel');
   const lmsUpdatesToggleBtn = document.getElementById('adminLmsUpdatesToggleBtn');

   let teamUserModal = null;
   let teamUserResetModal = null;
   let teamUserDeleteModal = null;
   let lmsUpdateModal = null;
   let currentEditUsername = null;
   let currentResetUsername = null;
   let currentDeleteUsername = null;
   let currentLmsUpdateId = null;

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

   function setTeamUsersPanelState(isOpen) {
      if (!teamUsersPanel || !teamUsersToggleBtn) {
         return;
      }

      teamUsersPanel.hidden = !isOpen;
      teamUsersToggleBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      teamUsersToggleBtn.textContent = isOpen ? 'Collapse' : 'Open';

      if (teamUsersSection) {
         teamUsersSection.classList.toggle('is-collapsed', !isOpen);
      }
   }

   function setLmsUpdatesPanelState(isOpen) {
      if (!lmsUpdatesPanel || !lmsUpdatesToggleBtn) {
         return;
      }

      lmsUpdatesPanel.hidden = !isOpen;
      lmsUpdatesToggleBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      lmsUpdatesToggleBtn.textContent = isOpen ? 'Collapse' : 'Open';

      if (lmsUpdatesSection) {
         lmsUpdatesSection.classList.toggle('is-collapsed', !isOpen);
      }
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

      await Promise.all([loadTeamUsers(), loadLmsUpdates()]);
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
            if (teamUserTableBody) renderEmptyRow(teamUserTableBody, 7, 'Login required.');
            if (lmsUpdateTableBody) renderEmptyRow(lmsUpdateTableBody, 7, 'Login required.');
         }
      });
   }

   if (teamUsersToggleBtn) {
      teamUsersToggleBtn.addEventListener('click', function () {
         const isOpen = teamUsersToggleBtn.getAttribute('aria-expanded') === 'true';
         setTeamUsersPanelState(!isOpen);
      });
      setTeamUsersPanelState(true);
   }

   if (lmsUpdatesToggleBtn) {
      lmsUpdatesToggleBtn.addEventListener('click', function () {
         const isOpen = lmsUpdatesToggleBtn.getAttribute('aria-expanded') === 'true';
         setLmsUpdatesPanelState(!isOpen);
      });
      setLmsUpdatesPanelState(true);
   }

   // ─── Team User Management ─────────────────────────────────────

   function initTeamModals() {
      if (typeof bootstrap === 'undefined') return;
      const tuEl = document.getElementById('teamUserModal');
      const resetEl = document.getElementById('teamUserResetModal');
      const delEl = document.getElementById('teamUserDeleteModal');
      const lmsEl = document.getElementById('lmsUpdateModal');
      if (tuEl) teamUserModal = new bootstrap.Modal(tuEl);
      if (resetEl) teamUserResetModal = new bootstrap.Modal(resetEl);
      if (delEl) teamUserDeleteModal = new bootstrap.Modal(delEl);
      if (lmsEl) lmsUpdateModal = new bootstrap.Modal(lmsEl);
   }

   function renderTeamUsers(users) {
      const meta = document.getElementById('adminTeamUserMeta');
      if (meta) meta.textContent = `${users.length} member${users.length === 1 ? '' : 's'}`;
      setSummaryText('adminTeamUserCount', users.length);
      if (!teamUserTableBody) return;

      if (!users.length) {
         renderEmptyRow(teamUserTableBody, 7, 'No team users found.');
         return;
      }

      teamUserTableBody.innerHTML = '';
      users.forEach(function (user) {
         const row = document.createElement('tr');
         row.appendChild(createCell(user.username));
         row.appendChild(createCell(user.fullName));
         row.appendChild(createCell(user.role));
         row.appendChild(createCell(user.department));
         row.appendChild(createCell(user.email));
         row.appendChild(createCell(user.focusArea));

         const actCell = document.createElement('td');
         actCell.style.whiteSpace = 'nowrap';

         const editBtn = document.createElement('button');
         editBtn.type = 'button';
         editBtn.textContent = 'Edit';
         editBtn.className = 'admin-outline-btn';
         editBtn.style.cssText = 'padding:.26rem .7rem;font-size:.78rem;margin-right:.35rem;cursor:pointer;';
         editBtn.addEventListener('click', function () { openEditTeamUserModal(user); });

         const resetBtn = document.createElement('button');
         resetBtn.type = 'button';
         resetBtn.textContent = 'Reset PW';
         resetBtn.className = 'admin-outline-btn';
         resetBtn.style.cssText = 'padding:.26rem .7rem;font-size:.78rem;margin-right:.35rem;cursor:pointer;';
         resetBtn.addEventListener('click', function () { openResetPasswordModal(user.username); });

         const delBtn = document.createElement('button');
         delBtn.type = 'button';
         delBtn.textContent = 'Delete';
         delBtn.className = 'admin-outline-btn admin-delete-btn';
         delBtn.style.cssText = 'padding:.26rem .7rem;font-size:.78rem;cursor:pointer;';
         delBtn.addEventListener('click', function () { openDeleteUserModal(user.username); });

         actCell.appendChild(editBtn);
         actCell.appendChild(resetBtn);
         actCell.appendChild(delBtn);
         row.appendChild(actCell);
         teamUserTableBody.appendChild(row);
      });
   }

   async function loadTeamUsers() {
      if (!teamUserTableBody) return;
      try {
         const result = await requestJson('/api/admin/team-users', {}, 'Unable to load team users.');
         renderTeamUsers(result.items || []);
      } catch (error) {
         renderEmptyRow(teamUserTableBody, 7, error.message || 'Unable to load team users.');
      }
   }

   function clearTUFormStatus() {
      const el = document.getElementById('adminTeamUserFormStatus');
      if (el) { el.textContent = ''; el.className = 'admin-status'; }
   }

   function setTUFormStatus(msg, isError) {
      const el = document.getElementById('adminTeamUserFormStatus');
      if (!el) return;
      el.textContent = msg;
      el.classList.toggle('is-error', Boolean(isError));
      el.classList.toggle('is-success', !isError);
   }

   function openAddTeamUserModal() {
      currentEditUsername = null;
      const form = document.getElementById('adminTeamUserForm');
      const label = document.getElementById('teamUserModalLabel');
      const pwWrap = document.getElementById('adminTUPasswordWrap');
      const unInput = document.getElementById('adminTUUsername');
      if (form) form.reset();
      if (label) label.textContent = 'Add Team User';
      if (pwWrap) pwWrap.style.display = '';
      if (unInput) unInput.removeAttribute('disabled');
      ['adminTUAssignedLeads', 'adminTUPendingActions', 'adminTUCompletedFollowUps'].forEach(function (id) {
         const el = document.getElementById(id);
         if (el) el.value = '0';
      });
      const priEl = document.getElementById('adminTUPriorityLevel');
      if (priEl) priEl.value = 'Normal';
      clearTUFormStatus();
      if (teamUserModal) teamUserModal.show();
   }

   function openEditTeamUserModal(user) {
      currentEditUsername = user.username;
      const form = document.getElementById('adminTeamUserForm');
      const label = document.getElementById('teamUserModalLabel');
      const pwWrap = document.getElementById('adminTUPasswordWrap');
      const unInput = document.getElementById('adminTUUsername');
      if (form) form.reset();
      if (label) label.textContent = 'Edit: ' + user.username;
      if (pwWrap) pwWrap.style.display = 'none';
      if (unInput) { unInput.value = user.username; unInput.setAttribute('disabled', 'disabled'); }
      clearTUFormStatus();

      const fieldMap = {
         adminTUFullName: user.fullName,
         adminTUEmail: user.email,
         adminTURole: user.role,
         adminTUDepartment: user.department,
         adminTUFocusArea: user.focusArea,
         adminTUWelcomeNote: user.welcomeNote
      };
      Object.keys(fieldMap).forEach(function (id) {
         const el = document.getElementById(id);
         if (el) el.value = fieldMap[id] || '';
      });

      const m = user.metrics || {};
      const metricMap = {
         adminTUAssignedLeads: m.assignedLeads !== undefined ? m.assignedLeads : 0,
         adminTUPendingActions: m.pendingActions !== undefined ? m.pendingActions : 0,
         adminTUCompletedFollowUps: m.completedFollowUps !== undefined ? m.completedFollowUps : 0,
         adminTUPriorityLevel: m.priorityLevel || 'Normal'
      };
      Object.keys(metricMap).forEach(function (id) {
         const el = document.getElementById(id);
         if (el) el.value = metricMap[id];
      });

      const permEl = document.getElementById('adminTUPermissions');
      if (permEl) permEl.value = Array.isArray(user.permissions) ? user.permissions.join('\n') : '';

      if (teamUserModal) teamUserModal.show();
   }

   function openResetPasswordModal(username) {
      currentResetUsername = username;
      const label = document.getElementById('adminResetUsernameLabel');
      const pwInput = document.getElementById('adminResetNewPassword');
      const statusEl = document.getElementById('adminResetPasswordStatus');
      if (label) label.textContent = username;
      if (pwInput) pwInput.value = '';
      if (statusEl) { statusEl.textContent = ''; statusEl.className = 'admin-status'; }
      if (teamUserResetModal) teamUserResetModal.show();
   }

   function openDeleteUserModal(username) {
      currentDeleteUsername = username;
      const label = document.getElementById('adminDeleteUsernameLabel');
      const statusEl = document.getElementById('adminDeleteUserStatus');
      if (label) label.textContent = username;
      if (statusEl) { statusEl.textContent = ''; statusEl.className = 'admin-status'; }
      if (teamUserDeleteModal) teamUserDeleteModal.show();
   }

   const addTeamUserBtn = document.getElementById('adminAddTeamUserBtn');
   if (addTeamUserBtn) {
      addTeamUserBtn.addEventListener('click', openAddTeamUserModal);
   }

   const saveTeamUserBtn = document.getElementById('adminTeamUserSaveBtn');
   if (saveTeamUserBtn) {
      saveTeamUserBtn.addEventListener('click', async function () {
         saveTeamUserBtn.disabled = true;
         setTUFormStatus('Saving…', false);

         const isEdit = Boolean(currentEditUsername);
         function val(id) {
            const el = document.getElementById(id);
            return el ? el.value.trim() : '';
         }

         const body = {
            fullName: val('adminTUFullName'),
            email: val('adminTUEmail'),
            role: val('adminTURole'),
            department: val('adminTUDepartment'),
            focusArea: val('adminTUFocusArea'),
            welcomeNote: val('adminTUWelcomeNote'),
            metrics: {
               assignedLeads: Number(val('adminTUAssignedLeads')) || 0,
               pendingActions: Number(val('adminTUPendingActions')) || 0,
               completedFollowUps: Number(val('adminTUCompletedFollowUps')) || 0,
               priorityLevel: val('adminTUPriorityLevel') || 'Normal'
            },
            permissions: val('adminTUPermissions')
               .split('\n')
               .map(function (s) { return s.trim(); })
               .filter(Boolean)
         };

         if (!isEdit) {
            body.username = val('adminTUUsername');
            body.password = val('adminTUPassword');
         }

         try {
            const url = isEdit
               ? '/api/admin/team-users/' + currentEditUsername
               : '/api/admin/team-users';
            const method = isEdit ? 'PUT' : 'POST';
            await requestJson(url, {
               method: method,
               headers: { 'Content-Type': 'application/json' },
               body: JSON.stringify(body)
            }, isEdit ? 'Unable to update team user.' : 'Unable to create team user.');

            if (teamUserModal) teamUserModal.hide();
            await loadTeamUsers();
         } catch (error) {
            setTUFormStatus(error.message || 'Unable to save team user.', true);
         } finally {
            saveTeamUserBtn.disabled = false;
         }
      });
   }

   const resetPWSaveBtn = document.getElementById('adminResetPasswordSaveBtn');
   if (resetPWSaveBtn) {
      resetPWSaveBtn.addEventListener('click', async function () {
         resetPWSaveBtn.disabled = true;
         const pwInput = document.getElementById('adminResetNewPassword');
         const statusEl = document.getElementById('adminResetPasswordStatus');
         const newPassword = pwInput ? pwInput.value.trim() : '';

         if (!newPassword || newPassword.length < 8) {
            if (statusEl) { statusEl.textContent = 'Password must be at least 8 characters.'; statusEl.className = 'admin-status is-error'; }
            resetPWSaveBtn.disabled = false;
            return;
         }

         if (statusEl) { statusEl.textContent = 'Resetting…'; statusEl.className = 'admin-status'; }

         try {
            await requestJson('/api/admin/team-users/' + currentResetUsername + '/reset-password', {
               method: 'POST',
               headers: { 'Content-Type': 'application/json' },
               body: JSON.stringify({ newPassword: newPassword })
            }, 'Unable to reset password.');

            if (teamUserResetModal) teamUserResetModal.hide();
         } catch (error) {
            if (statusEl) { statusEl.textContent = error.message || 'Unable to reset password.'; statusEl.className = 'admin-status is-error'; }
         } finally {
            resetPWSaveBtn.disabled = false;
         }
      });
   }

   const deleteConfirmBtn = document.getElementById('adminDeleteUserConfirmBtn');
   if (deleteConfirmBtn) {
      deleteConfirmBtn.addEventListener('click', async function () {
         deleteConfirmBtn.disabled = true;
         const statusEl = document.getElementById('adminDeleteUserStatus');
         if (statusEl) { statusEl.textContent = 'Deleting…'; statusEl.className = 'admin-status'; }

         try {
            await requestJson('/api/admin/team-users/' + currentDeleteUsername, {
               method: 'DELETE'
            }, 'Unable to delete team user.');

            if (teamUserDeleteModal) teamUserDeleteModal.hide();
            await loadTeamUsers();
         } catch (error) {
            if (statusEl) { statusEl.textContent = error.message || 'Unable to delete team user.'; statusEl.className = 'admin-status is-error'; }
         } finally {
            deleteConfirmBtn.disabled = false;
         }
      });
   }

   // ─── LMS Updates Management ───────────────────────────────────

   function clearLmsFormStatus() {
      const el = document.getElementById('adminLmsFormStatus');
      if (el) {
         el.textContent = '';
         el.className = 'admin-status';
      }
   }

   function setLmsFormStatus(message, isError) {
      const el = document.getElementById('adminLmsFormStatus');
      if (!el) return;
      el.textContent = message;
      el.classList.toggle('is-error', Boolean(isError));
      el.classList.toggle('is-success', !isError);
   }

   function openAddLmsUpdateModal() {
      currentLmsUpdateId = null;
      const form = document.getElementById('adminLmsUpdateForm');
      const label = document.getElementById('lmsUpdateModalLabel');
      if (form) form.reset();
      if (label) label.textContent = 'Add LMS Update';
      clearLmsFormStatus();
      if (lmsUpdateModal) lmsUpdateModal.show();
   }

   function openEditLmsUpdateModal(item) {
      currentLmsUpdateId = item.id;
      const label = document.getElementById('lmsUpdateModalLabel');
      if (label) label.textContent = 'Edit LMS Update';

      const titleEl = document.getElementById('adminLmsTitle');
      const summaryEl = document.getElementById('adminLmsSummary');
      const bodyEl = document.getElementById('adminLmsBody');
      const publishedEl = document.getElementById('adminLmsPublished');
      const pinnedEl = document.getElementById('adminLmsPinned');

      if (titleEl) titleEl.value = item.title || '';
      if (summaryEl) summaryEl.value = item.summary || '';
      if (bodyEl) bodyEl.value = item.body || '';
      if (publishedEl) publishedEl.checked = Boolean(item.isPublished);
      if (pinnedEl) pinnedEl.checked = Boolean(item.isPinned);

      clearLmsFormStatus();
      if (lmsUpdateModal) lmsUpdateModal.show();
   }

   function renderLmsUpdates(items) {
      const meta = document.getElementById('adminLmsUpdateMeta');
      if (meta) {
         meta.textContent = `${items.length} update${items.length === 1 ? '' : 's'}`;
      }
      setSummaryText('adminLmsUpdateCount', items.length);

      if (!lmsUpdateTableBody) {
         return;
      }

      if (!items.length) {
         renderEmptyRow(lmsUpdateTableBody, 7, 'No LMS updates yet.');
         return;
      }

      lmsUpdateTableBody.innerHTML = '';
      items.forEach(function (item) {
         const row = document.createElement('tr');
         row.appendChild(createCell(item.title));
         row.appendChild(createCell(item.summary));
         row.appendChild(createCell(item.isPublished ? 'Yes' : 'No'));
         row.appendChild(createCell(item.isPinned ? 'Yes' : 'No'));
         row.appendChild(createCell(formatDate(item.submittedAt)));
         row.appendChild(createCell(formatDate(item.updatedAt)));

         const actionCell = document.createElement('td');
         actionCell.style.whiteSpace = 'nowrap';

         const editBtn = document.createElement('button');
         editBtn.type = 'button';
         editBtn.textContent = 'Edit';
         editBtn.className = 'admin-outline-btn';
         editBtn.style.cssText = 'padding:.26rem .7rem;font-size:.78rem;margin-right:.35rem;cursor:pointer;';
         editBtn.addEventListener('click', function () { openEditLmsUpdateModal(item); });

         const deleteBtn = document.createElement('button');
         deleteBtn.type = 'button';
         deleteBtn.textContent = 'Delete';
         deleteBtn.className = 'admin-outline-btn admin-delete-btn';
         deleteBtn.style.cssText = 'padding:.26rem .7rem;font-size:.78rem;cursor:pointer;';
         deleteBtn.addEventListener('click', async function () {
            const ok = window.confirm('Delete this LMS update? This action cannot be undone.');
            if (!ok) {
               return;
            }

            deleteBtn.disabled = true;
            try {
               await requestJson('/api/admin/lms-updates/' + item.id, {
                  method: 'DELETE'
               }, 'Unable to delete LMS update.');
               await loadLmsUpdates();
            } catch (error) {
               setStatus(error.message || 'Unable to delete LMS update.', true);
            } finally {
               deleteBtn.disabled = false;
            }
         });

         actionCell.appendChild(editBtn);
         actionCell.appendChild(deleteBtn);
         row.appendChild(actionCell);
         lmsUpdateTableBody.appendChild(row);
      });
   }

   async function loadLmsUpdates() {
      if (!lmsUpdateTableBody) {
         return;
      }

      try {
         const result = await requestJson('/api/admin/lms-updates', {}, 'Unable to load LMS updates.');
         renderLmsUpdates(result.items || []);
      } catch (error) {
         renderEmptyRow(lmsUpdateTableBody, 7, error.message || 'Unable to load LMS updates.');
      }
   }

   const addLmsUpdateBtn = document.getElementById('adminAddLmsUpdateBtn');
   if (addLmsUpdateBtn) {
      addLmsUpdateBtn.addEventListener('click', openAddLmsUpdateModal);
   }

   const saveLmsUpdateBtn = document.getElementById('adminLmsSaveBtn');
   if (saveLmsUpdateBtn) {
      saveLmsUpdateBtn.addEventListener('click', async function () {
         saveLmsUpdateBtn.disabled = true;
         setLmsFormStatus('Saving…', false);

         function value(id) {
            const el = document.getElementById(id);
            return el ? el.value.trim() : '';
         }

         function checked(id) {
            const el = document.getElementById(id);
            return el ? el.checked : false;
         }

         const body = {
            title: value('adminLmsTitle'),
            summary: value('adminLmsSummary'),
            body: value('adminLmsBody'),
            isPublished: checked('adminLmsPublished'),
            isPinned: checked('adminLmsPinned')
         };

         const isEdit = Boolean(currentLmsUpdateId);

         try {
            const targetUrl = isEdit
               ? '/api/admin/lms-updates/' + currentLmsUpdateId
               : '/api/admin/lms-updates';
            const method = isEdit ? 'PUT' : 'POST';

            await requestJson(targetUrl, {
               method: method,
               headers: { 'Content-Type': 'application/json' },
               body: JSON.stringify(body)
            }, isEdit ? 'Unable to update LMS update.' : 'Unable to create LMS update.');

            if (lmsUpdateModal) lmsUpdateModal.hide();
            await loadLmsUpdates();
            setStatus('LMS update saved successfully.', false);
         } catch (error) {
            setLmsFormStatus(error.message || 'Unable to save LMS update.', true);
         } finally {
            saveLmsUpdateBtn.disabled = false;
         }
      });
   }

   initTeamModals();
   checkAdminSession();
})();