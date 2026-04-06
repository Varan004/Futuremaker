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
   const lmsCourseTableBody = document.getElementById('lmsCourseTableBody');
   const lmsResourceTableBody = document.getElementById('lmsResourceTableBody');
   const lmsCoursesSection = document.getElementById('adminLmsCoursesSection');
   const lmsCoursesPanel = document.getElementById('adminLmsCoursesPanel');
   const lmsCoursesToggleBtn = document.getElementById('adminLmsCoursesToggleBtn');
   const lmsResourcesSection = document.getElementById('adminLmsResourcesSection');
   const lmsResourcesPanel = document.getElementById('adminLmsResourcesPanel');
   const lmsResourcesToggleBtn = document.getElementById('adminLmsResourcesToggleBtn');
   const applicantAccessTableBody = document.getElementById('applicantAccessTableBody');
   const applicantAccessSection = document.getElementById('adminApplicantAccessSection');
   const applicantAccessPanel = document.getElementById('adminApplicantAccessPanel');
   const applicantAccessToggleBtn = document.getElementById('adminApplicantAccessToggleBtn');
   const testimonialsTableBody = document.getElementById('testimonialsTableBody');
   const testimonialsSection = document.getElementById('adminTestimonialsSection');
   const testimonialsPanel = document.getElementById('adminTestimonialsPanel');
   const testimonialsToggleBtn = document.getElementById('adminTestimonialsToggleBtn');
   const opportunityTableBody = document.getElementById('opportunityTableBody');
   const opportunityApplicationTableBody = document.getElementById('opportunityApplicationTableBody');
   const opportunitiesSection = document.getElementById('adminOpportunitiesSection');
   const opportunitiesPanel = document.getElementById('adminOpportunitiesPanel');
   const opportunitiesToggleBtn = document.getElementById('adminOpportunitiesToggleBtn');
   const opportunityApplicationsSection = document.getElementById('adminOpportunityApplicationsSection');
   const opportunityApplicationsPanel = document.getElementById('adminOpportunityApplicationsPanel');
   const opportunityApplicationsToggleBtn = document.getElementById('adminOpportunityApplicationsToggleBtn');

   let teamUserModal = null;
   let teamUserResetModal = null;
   let teamUserDeleteModal = null;
   let lmsUpdateModal = null;
   let lmsCourseModal = null;
   let lmsResourceModal = null;
   let opportunityModal = null;
   let opportunityApplicationModal = null;
   let currentEditUsername = null;
   let currentResetUsername = null;
   let currentDeleteUsername = null;
   let currentLmsUpdateId = null;
   let currentLmsCourseId = null;
   let currentLmsResourceId = null;
   let currentEditOpportunityId = null;
   let currentApplicationId = null;

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
      const requestOptions = {
         credentials: 'same-origin',
         ...(options || {})
      };

      try {
         response = await fetch(resolveApiUrl(url), requestOptions);
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

   function setLmsCoursesPanelState(isOpen) {
      if (!lmsCoursesPanel || !lmsCoursesToggleBtn) {
         return;
      }

      lmsCoursesPanel.hidden = !isOpen;
      lmsCoursesToggleBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      lmsCoursesToggleBtn.textContent = isOpen ? 'Collapse' : 'Open';

      if (lmsCoursesSection) {
         lmsCoursesSection.classList.toggle('is-collapsed', !isOpen);
      }
   }

   function setLmsResourcesPanelState(isOpen) {
      if (!lmsResourcesPanel || !lmsResourcesToggleBtn) {
         return;
      }

      lmsResourcesPanel.hidden = !isOpen;
      lmsResourcesToggleBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      lmsResourcesToggleBtn.textContent = isOpen ? 'Collapse' : 'Open';

      if (lmsResourcesSection) {
         lmsResourcesSection.classList.toggle('is-collapsed', !isOpen);
      }
   }

   function setApplicantAccessPanelState(isOpen) {
      if (!applicantAccessPanel || !applicantAccessToggleBtn) {
         return;
      }

      applicantAccessPanel.hidden = !isOpen;
      applicantAccessToggleBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      applicantAccessToggleBtn.textContent = isOpen ? 'Collapse' : 'Open';

      if (applicantAccessSection) {
         applicantAccessSection.classList.toggle('is-collapsed', !isOpen);
      }
   }

   function setTestimonialsPanelState(isOpen) {
      if (!testimonialsPanel || !testimonialsToggleBtn) {
         return;
      }

      testimonialsPanel.hidden = !isOpen;
      testimonialsToggleBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      testimonialsToggleBtn.textContent = isOpen ? 'Collapse' : 'Open';

      if (testimonialsSection) {
         testimonialsSection.classList.toggle('is-collapsed', !isOpen);
      }
   }

   function setOpportunitiesPanelState(isOpen) {
      if (!opportunitiesPanel || !opportunitiesToggleBtn) return;
      opportunitiesPanel.hidden = !isOpen;
      opportunitiesToggleBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      opportunitiesToggleBtn.textContent = isOpen ? 'Collapse' : 'Open';
      if (opportunitiesSection) opportunitiesSection.classList.toggle('is-collapsed', !isOpen);
   }

   function setOpportunityApplicationsPanelState(isOpen) {
      if (!opportunityApplicationsPanel || !opportunityApplicationsToggleBtn) return;
      opportunityApplicationsPanel.hidden = !isOpen;
      opportunityApplicationsToggleBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      opportunityApplicationsToggleBtn.textContent = isOpen ? 'Collapse' : 'Open';
      if (opportunityApplicationsSection) opportunityApplicationsSection.classList.toggle('is-collapsed', !isOpen);
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
         renderApplicantAccess(result.registrations || []);
         setStatus('Submission data loaded successfully.', false);
      } catch (error) {
         renderEmptyRow(contactTableBody, 7, 'Unable to load contact submissions.');
         renderEmptyRow(registrationTableBody, 13, 'Unable to load registrations.');
         setStatus(error.message || 'Unable to load admin data.', true);
         if (error.message === 'Admin login required.') {
            showAuthCard();
         }
      }

      await Promise.all([loadTeamUsers(), loadLmsUpdates(), loadLmsCourses(), loadLmsResources(), loadTestimonials(), loadOpportunities(), loadOpportunityApplications()]);
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
            if (lmsCourseTableBody) renderEmptyRow(lmsCourseTableBody, 7, 'Login required.');
            if (lmsResourceTableBody) renderEmptyRow(lmsResourceTableBody, 6, 'Login required.');
            if (applicantAccessTableBody) renderEmptyRow(applicantAccessTableBody, 5, 'Login required.');
            if (testimonialsTableBody) renderEmptyRow(testimonialsTableBody, 7, 'Login required.');
            if (opportunityTableBody) renderEmptyRow(opportunityTableBody, 7, 'Login required.');
            if (opportunityApplicationTableBody) renderEmptyRow(opportunityApplicationTableBody, 8, 'Login required.');
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

   if (lmsCoursesToggleBtn) {
      lmsCoursesToggleBtn.addEventListener('click', function () {
         const isOpen = lmsCoursesToggleBtn.getAttribute('aria-expanded') === 'true';
         setLmsCoursesPanelState(!isOpen);
      });
      setLmsCoursesPanelState(true);
   }

   if (lmsResourcesToggleBtn) {
      lmsResourcesToggleBtn.addEventListener('click', function () {
         const isOpen = lmsResourcesToggleBtn.getAttribute('aria-expanded') === 'true';
         setLmsResourcesPanelState(!isOpen);
      });
      setLmsResourcesPanelState(true);
   }

   if (applicantAccessToggleBtn) {
      applicantAccessToggleBtn.addEventListener('click', function () {
         const isOpen = applicantAccessToggleBtn.getAttribute('aria-expanded') === 'true';
         setApplicantAccessPanelState(!isOpen);
      });
      setApplicantAccessPanelState(true);
   }

   if (testimonialsToggleBtn) {
      testimonialsToggleBtn.addEventListener('click', function () {
         const isOpen = testimonialsToggleBtn.getAttribute('aria-expanded') === 'true';
         setTestimonialsPanelState(!isOpen);
      });
      setTestimonialsPanelState(true);
   }

   if (opportunitiesToggleBtn) {
      opportunitiesToggleBtn.addEventListener('click', function () {
         const isOpen = opportunitiesToggleBtn.getAttribute('aria-expanded') === 'true';
         setOpportunitiesPanelState(!isOpen);
      });
      setOpportunitiesPanelState(true);
   }

   if (opportunityApplicationsToggleBtn) {
      opportunityApplicationsToggleBtn.addEventListener('click', function () {
         const isOpen = opportunityApplicationsToggleBtn.getAttribute('aria-expanded') === 'true';
         setOpportunityApplicationsPanelState(!isOpen);
      });
      setOpportunityApplicationsPanelState(true);
   }

   // ─── Team User Management ─────────────────────────────────────

   // ─── Opportunities Management ─────────────────────────────────

   function clearOpportunityFormStatus() {
      const el = document.getElementById('adminOpportunityFormStatus');
      if (el) { el.textContent = ''; el.className = 'admin-status'; }
   }

   function setOpportunityFormStatus(msg, isError) {
      const el = document.getElementById('adminOpportunityFormStatus');
      if (!el) return;
      el.textContent = msg;
      el.classList.toggle('is-error', Boolean(isError));
      el.classList.toggle('is-success', !isError);
   }

   function clearOppImageUploadState() {
      const fileInput = document.getElementById('adminOppImageFile');
      const statusEl = document.getElementById('adminOppImageUploadStatus');
      if (fileInput) fileInput.value = '';
      if (statusEl) { statusEl.textContent = ''; statusEl.className = 'admin-status'; }
   }

   function openAddOpportunityModal() {
      currentEditOpportunityId = null;
      const form = document.getElementById('adminOpportunityForm');
      const label = document.getElementById('opportunityModalLabel');
      if (form) form.reset();
      if (label) label.textContent = 'Add Opportunity';
      const statusEl = document.getElementById('adminOppStatus');
      if (statusEl) statusEl.value = 'open';
      clearOpportunityFormStatus();
      clearOppImageUploadState();
      if (opportunityModal) opportunityModal.show();
   }

   function openEditOpportunityModal(item) {
      currentEditOpportunityId = item.id;
      const label = document.getElementById('opportunityModalLabel');
      if (label) label.textContent = 'Edit: ' + item.title;

      const fields = {
         adminOppTitle: item.title,
         adminOppDescription: item.description,
         adminOppType: item.type,
         adminOppDeadline: item.deadline,
         adminOppLocation: item.location,
         adminOppRequirements: item.requirements,
         adminOppImageUrl: item.imageUrl
      };
      Object.keys(fields).forEach(function (id) {
         const el = document.getElementById(id);
         if (el) el.value = fields[id] || '';
      });

      const statusEl = document.getElementById('adminOppStatus');
      if (statusEl) statusEl.value = item.status || 'open';
      const featuredEl = document.getElementById('adminOppFeatured');
      if (featuredEl) featuredEl.checked = Boolean(item.isFeatured);

      clearOpportunityFormStatus();
      if (opportunityModal) opportunityModal.show();
   }

   function renderOpportunities(items) {
      const meta = document.getElementById('adminOpportunityMeta');
      if (meta) meta.textContent = `${items.length} opportunit${items.length === 1 ? 'y' : 'ies'}`;
      setSummaryText('adminOpportunityCount', items.length);
      setSummaryText('adminOpportunityOpenCount', items.filter(function (i) { return i.status === 'open'; }).length);

      if (!opportunityTableBody) return;

      if (!items.length) {
         renderEmptyRow(opportunityTableBody, 7, 'No opportunities yet.');
         return;
      }

      opportunityTableBody.innerHTML = '';
      items.forEach(function (item) {
         const row = document.createElement('tr');
         row.appendChild(createCell(item.title));
         row.appendChild(createCell(item.type));

         const statusCell = document.createElement('td');
         statusCell.textContent = item.status;
         statusCell.style.color = item.status === 'open' ? '#4ade80' : '#f87171';
         statusCell.style.fontWeight = '600';
         row.appendChild(statusCell);

         row.appendChild(createCell(item.deadline || '-'));
         row.appendChild(createCell(item.location || '-'));
         row.appendChild(createCell(item.isFeatured ? 'Yes' : 'No'));

         const actionCell = document.createElement('td');
         actionCell.style.whiteSpace = 'nowrap';

         const editBtn = document.createElement('button');
         editBtn.type = 'button';
         editBtn.textContent = 'Edit';
         editBtn.className = 'admin-outline-btn';
         editBtn.style.cssText = 'padding:.26rem .7rem;font-size:.78rem;margin-right:.35rem;cursor:pointer;';
         editBtn.addEventListener('click', function () { openEditOpportunityModal(item); });

         const deleteBtn = document.createElement('button');
         deleteBtn.type = 'button';
         deleteBtn.textContent = 'Delete';
         deleteBtn.className = 'admin-outline-btn admin-delete-btn';
         deleteBtn.style.cssText = 'padding:.26rem .7rem;font-size:.78rem;cursor:pointer;';
         deleteBtn.addEventListener('click', async function () {
            if (!window.confirm('Delete this opportunity? This cannot be undone.')) return;
            deleteBtn.disabled = true;
            try {
               await requestJson('/api/admin/opportunities/' + item.id, { method: 'DELETE' }, 'Unable to delete opportunity.');
               await loadOpportunities();
            } catch (error) {
               setStatus(error.message || 'Unable to delete opportunity.', true);
            } finally {
               deleteBtn.disabled = false;
            }
         });

         actionCell.appendChild(editBtn);
         actionCell.appendChild(deleteBtn);
         row.appendChild(actionCell);
         opportunityTableBody.appendChild(row);
      });
   }

   async function loadOpportunities() {
      if (!opportunityTableBody) return;
      try {
         const result = await requestJson('/api/admin/opportunities', {}, 'Unable to load opportunities.');
         renderOpportunities(result.items || []);
      } catch (error) {
         renderEmptyRow(opportunityTableBody, 7, error.message || 'Unable to load opportunities.');
      }
   }

   const addOpportunityBtn = document.getElementById('adminAddOpportunityBtn');
   if (addOpportunityBtn) {
      addOpportunityBtn.addEventListener('click', openAddOpportunityModal);
   }

   const saveOpportunityBtn = document.getElementById('adminOpportunitySaveBtn');
   if (saveOpportunityBtn) {
      saveOpportunityBtn.addEventListener('click', async function () {
         saveOpportunityBtn.disabled = true;
         setOpportunityFormStatus('Saving…', false);

         function val(id) {
            const el = document.getElementById(id);
            return el ? el.value.trim() : '';
         }

         const body = {
            title: val('adminOppTitle'),
            description: val('adminOppDescription'),
            type: val('adminOppType') || 'opportunity',
            status: val('adminOppStatus') || 'open',
            deadline: val('adminOppDeadline'),
            location: val('adminOppLocation'),
            requirements: val('adminOppRequirements'),
            imageUrl: val('adminOppImageUrl'),
            isFeatured: (function () { const el = document.getElementById('adminOppFeatured'); return el ? el.checked : false; })()
         };

         const isEdit = Boolean(currentEditOpportunityId);
         const url = isEdit ? '/api/admin/opportunities/' + currentEditOpportunityId : '/api/admin/opportunities';
         const method = isEdit ? 'PUT' : 'POST';

         try {
            await requestJson(url, {
               method: method,
               headers: { 'Content-Type': 'application/json' },
               body: JSON.stringify(body)
            }, isEdit ? 'Unable to update opportunity.' : 'Unable to create opportunity.');

            if (opportunityModal) opportunityModal.hide();
            await loadOpportunities();
            setStatus('Opportunity saved successfully.', false);
         } catch (error) {
            setOpportunityFormStatus(error.message || 'Unable to save opportunity.', true);
         } finally {
            saveOpportunityBtn.disabled = false;
         }
      });
   }

   // ─── Opportunity Applications ─────────────────────────────────

   function openApplicationDetailModal(item) {
      currentApplicationId = item.id;
      const body = document.getElementById('opportunityApplicationModalBody');
      if (body) {
         body.innerHTML = '';

         function addRow(label, value) {
            const p = document.createElement('p');
            p.style.margin = '0 0 .5rem';
            p.innerHTML = `<strong style="color:#c4abff;min-width:120px;display:inline-block;">${label}:</strong> ${value || '-'}`;
            body.appendChild(p);
         }

         addRow('Name', item.fullName);
         addRow('Email', item.email);
         addRow('Phone', item.phone);
         addRow('Opportunity', item.opportunityTitle || item.opportunityId);
         addRow('Status', item.status);
         addRow('Submitted', item.submittedAt ? new Date(item.submittedAt).toLocaleString() : '-');
         if (item.message) {
            const msgWrap = document.createElement('div');
            msgWrap.style.cssText = 'margin-top:.8rem;padding:.75rem;background:rgba(196,171,255,.07);border-radius:.5rem;border:1px solid rgba(196,171,255,.15);';
            msgWrap.innerHTML = `<strong style="color:#c4abff;">Message:</strong><br><span style="white-space:pre-wrap;">${item.message}</span>`;
            body.appendChild(msgWrap);
         }
      }

      const select = document.getElementById('adminAppStatusSelect');
      if (select) select.value = item.status || 'pending';

      const saveStatusEl = document.getElementById('adminAppStatusSaveStatus');
      if (saveStatusEl) { saveStatusEl.textContent = ''; saveStatusEl.className = 'admin-status'; }

      if (opportunityApplicationModal) opportunityApplicationModal.show();
   }

   function renderOpportunityApplications(items) {
      const meta = document.getElementById('adminOpportunityApplicationMeta');
      const pending = items.filter(function (i) { return i.status === 'pending'; }).length;
      if (meta) meta.textContent = `${pending} pending`;
      setSummaryText('adminOpportunityApplicationCount', pending);

      if (!opportunityApplicationTableBody) return;

      if (!items.length) {
         renderEmptyRow(opportunityApplicationTableBody, 8, 'No opportunity applications yet.');
         return;
      }

      opportunityApplicationTableBody.innerHTML = '';
      items.forEach(function (item) {
         const row = document.createElement('tr');
         row.appendChild(createCell(item.fullName));
         row.appendChild(createCell(item.email));
         row.appendChild(createCell(item.phone));
         row.appendChild(createCell(item.opportunityTitle || item.opportunityId));
         const msgCell = document.createElement('td');
         const msg = item.message || '';
         msgCell.textContent = msg.length > 40 ? msg.substring(0, 40) + '…' : msg || '-';
         msgCell.style.maxWidth = '160px';
         msgCell.style.overflow = 'hidden';
         msgCell.style.textOverflow = 'ellipsis';
         msgCell.style.whiteSpace = 'nowrap';
         row.appendChild(msgCell);

         const statusCell = document.createElement('td');
         statusCell.textContent = item.status;
         const statusColors = { pending: '#facc15', reviewed: '#60a5fa', accepted: '#4ade80', rejected: '#f87171' };
         statusCell.style.color = statusColors[item.status] || 'inherit';
         statusCell.style.fontWeight = '600';
         row.appendChild(statusCell);

         row.appendChild(createCell(formatDate(item.submittedAt)));

         const actionCell = document.createElement('td');
         actionCell.style.whiteSpace = 'nowrap';
         const viewBtn = document.createElement('button');
         viewBtn.type = 'button';
         viewBtn.textContent = 'View';
         viewBtn.className = 'admin-outline-btn';
         viewBtn.style.cssText = 'padding:.26rem .7rem;font-size:.78rem;cursor:pointer;';
         viewBtn.addEventListener('click', function () { openApplicationDetailModal(item); });
         actionCell.appendChild(viewBtn);
         row.appendChild(actionCell);
         opportunityApplicationTableBody.appendChild(row);
      });
   }

   async function loadOpportunityApplications() {
      if (!opportunityApplicationTableBody) return;
      try {
         const result = await requestJson('/api/admin/opportunity-applications', {}, 'Unable to load opportunity applications.');
         renderOpportunityApplications(result.items || []);
      } catch (error) {
         renderEmptyRow(opportunityApplicationTableBody, 8, error.message || 'Unable to load applications.');
      }
   }

   const appStatusSaveBtn = document.getElementById('adminAppStatusSaveBtn');
   if (appStatusSaveBtn) {
      appStatusSaveBtn.addEventListener('click', async function () {
         if (!currentApplicationId) return;
         appStatusSaveBtn.disabled = true;
         const select = document.getElementById('adminAppStatusSelect');
         const saveStatusEl = document.getElementById('adminAppStatusSaveStatus');
         const newStatus = select ? select.value : 'pending';

         if (saveStatusEl) { saveStatusEl.textContent = 'Saving…'; saveStatusEl.className = 'admin-status'; }

         try {
            await requestJson('/api/admin/opportunity-applications/' + currentApplicationId, {
               method: 'PUT',
               headers: { 'Content-Type': 'application/json' },
               body: JSON.stringify({ status: newStatus })
            }, 'Unable to update application status.');

            if (saveStatusEl) { saveStatusEl.textContent = 'Status updated.'; saveStatusEl.className = 'admin-status is-success'; }
            await loadOpportunityApplications();
         } catch (error) {
            if (saveStatusEl) { saveStatusEl.textContent = error.message || 'Unable to update status.'; saveStatusEl.className = 'admin-status is-error'; }
         } finally {
            appStatusSaveBtn.disabled = false;
         }
      });
   }

   // ─────────────────────────────────────────────────────────────

   function initTeamModals() {
      if (typeof bootstrap === 'undefined') return;
      const tuEl = document.getElementById('teamUserModal');
      const resetEl = document.getElementById('teamUserResetModal');
      const delEl = document.getElementById('teamUserDeleteModal');
      const lmsEl = document.getElementById('lmsUpdateModal');
      const lmsCourseEl = document.getElementById('lmsCourseModal');
      const lmsResourceEl = document.getElementById('lmsResourceModal');
      const oppEl = document.getElementById('opportunityModal');
      const oppAppEl = document.getElementById('opportunityApplicationModal');
      if (tuEl) teamUserModal = new bootstrap.Modal(tuEl);
      if (resetEl) teamUserResetModal = new bootstrap.Modal(resetEl);
      if (delEl) teamUserDeleteModal = new bootstrap.Modal(delEl);
      if (lmsEl) lmsUpdateModal = new bootstrap.Modal(lmsEl);
      if (lmsCourseEl) lmsCourseModal = new bootstrap.Modal(lmsCourseEl);
      if (lmsResourceEl) lmsResourceModal = new bootstrap.Modal(lmsResourceEl);
      if (oppEl) opportunityModal = new bootstrap.Modal(oppEl);
      if (oppAppEl) opportunityApplicationModal = new bootstrap.Modal(oppAppEl);
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

   // ─── LMS Courses Management ───────────────────────────────────

   function clearLmsCourseFormStatus() {
      const el = document.getElementById('adminLmsCourseFormStatus');
      if (el) {
         el.textContent = '';
         el.className = 'admin-status';
      }
   }

   function setLmsCourseFormStatus(message, isError) {
      const el = document.getElementById('adminLmsCourseFormStatus');
      if (!el) return;
      el.textContent = message;
      el.classList.toggle('is-error', Boolean(isError));
      el.classList.toggle('is-success', !isError);
   }

   function openAddLmsCourseModal() {
      currentLmsCourseId = null;
      const form = document.getElementById('adminLmsCourseForm');
      const label = document.getElementById('lmsCourseModalLabel');
      if (form) form.reset();
      if (label) label.textContent = 'Add LMS Course';
      clearLmsCourseFormStatus();
      if (lmsCourseModal) lmsCourseModal.show();
   }

   function openEditLmsCourseModal(item) {
      currentLmsCourseId = item.id;
      const label = document.getElementById('lmsCourseModalLabel');
      if (label) label.textContent = 'Edit LMS Course';

      const titleEl = document.getElementById('adminCourseTitle');
      const summaryEl = document.getElementById('adminCourseSummary');
      const levelEl = document.getElementById('adminCourseLevel');
      const durationEl = document.getElementById('adminCourseDuration');
      const tagsEl = document.getElementById('adminCourseTags');
      const publishedEl = document.getElementById('adminCoursePublished');
      const featuredEl = document.getElementById('adminCourseFeatured');

      const programSlugs = ['orientation', 'future-ai', 'career-guidance'];
      const existingTags = Array.isArray(item.tags) ? item.tags : [];
      const programTagsInUse = existingTags.filter((t) => programSlugs.includes(t));
      const extraTags = existingTags.filter((t) => !programSlugs.includes(t));

      if (titleEl) titleEl.value = item.title || '';
      if (summaryEl) summaryEl.value = item.summary || '';
      if (levelEl) levelEl.value = item.level || '';
      if (durationEl) durationEl.value = item.duration || '';
      if (tagsEl) tagsEl.value = extraTags.join(', ');
      if (publishedEl) publishedEl.checked = Boolean(item.isPublished);
      if (featuredEl) featuredEl.checked = Boolean(item.isFeatured);

      const orientEl = document.getElementById('adminCourseTagOrientation');
      const aiEl = document.getElementById('adminCourseTagFutureAi');
      const cgEl = document.getElementById('adminCourseTagCareerGuidance');
      if (orientEl) orientEl.checked = programTagsInUse.includes('orientation');
      if (aiEl) aiEl.checked = programTagsInUse.includes('future-ai');
      if (cgEl) cgEl.checked = programTagsInUse.includes('career-guidance');

      clearLmsCourseFormStatus();
      if (lmsCourseModal) lmsCourseModal.show();
   }

   function renderLmsCourses(items) {
      const meta = document.getElementById('adminLmsCourseMeta');
      if (meta) {
         meta.textContent = `${items.length} course${items.length === 1 ? '' : 's'}`;
      }
      setSummaryText('adminLmsCourseCount', items.length);

      if (!lmsCourseTableBody) {
         return;
      }

      if (!items.length) {
         renderEmptyRow(lmsCourseTableBody, 7, 'No LMS courses yet.');
         return;
      }

      lmsCourseTableBody.innerHTML = '';
      items.forEach(function (item) {
         const row = document.createElement('tr');
         row.appendChild(createCell(item.title));
         row.appendChild(createCell(item.summary));
         row.appendChild(createCell(item.level));
         row.appendChild(createCell(item.duration));
         row.appendChild(createCell(item.isPublished ? 'Yes' : 'No'));
         row.appendChild(createCell(item.isFeatured ? 'Yes' : 'No'));

         const actionCell = document.createElement('td');
         actionCell.style.whiteSpace = 'nowrap';

         const editBtn = document.createElement('button');
         editBtn.type = 'button';
         editBtn.textContent = 'Edit';
         editBtn.className = 'admin-outline-btn';
         editBtn.style.cssText = 'padding:.26rem .7rem;font-size:.78rem;margin-right:.35rem;cursor:pointer;';
         editBtn.addEventListener('click', function () { openEditLmsCourseModal(item); });

         const deleteBtn = document.createElement('button');
         deleteBtn.type = 'button';
         deleteBtn.textContent = 'Delete';
         deleteBtn.className = 'admin-outline-btn admin-delete-btn';
         deleteBtn.style.cssText = 'padding:.26rem .7rem;font-size:.78rem;cursor:pointer;';
         deleteBtn.addEventListener('click', async function () {
            const ok = window.confirm('Delete this LMS course? This action cannot be undone.');
            if (!ok) {
               return;
            }

            deleteBtn.disabled = true;
            try {
               await requestJson('/api/admin/lms-courses/' + item.id, {
                  method: 'DELETE'
               }, 'Unable to delete LMS course.');
               await loadLmsCourses();
            } catch (error) {
               setStatus(error.message || 'Unable to delete LMS course.', true);
            } finally {
               deleteBtn.disabled = false;
            }
         });

         actionCell.appendChild(editBtn);
         actionCell.appendChild(deleteBtn);
         row.appendChild(actionCell);
         lmsCourseTableBody.appendChild(row);
      });
   }

   async function loadLmsCourses() {
      if (!lmsCourseTableBody) {
         return;
      }

      try {
         const result = await requestJson('/api/admin/lms-courses', {}, 'Unable to load LMS courses.');
         renderLmsCourses(result.items || []);
      } catch (error) {
         renderEmptyRow(lmsCourseTableBody, 7, error.message || 'Unable to load LMS courses.');
      }
   }

   const addLmsCourseBtn = document.getElementById('adminAddLmsCourseBtn');
   if (addLmsCourseBtn) {
      addLmsCourseBtn.addEventListener('click', openAddLmsCourseModal);
   }

   const saveLmsCourseBtn = document.getElementById('adminLmsCourseSaveBtn');
   if (saveLmsCourseBtn) {
      saveLmsCourseBtn.addEventListener('click', async function () {
         saveLmsCourseBtn.disabled = true;
         setLmsCourseFormStatus('Saving…', false);

         function value(id) {
            const el = document.getElementById(id);
            return el ? el.value.trim() : '';
         }

         function checked(id) {
            const el = document.getElementById(id);
            return el ? el.checked : false;
         }

         const body = {
            title: value('adminCourseTitle'),
            summary: value('adminCourseSummary'),
            level: value('adminCourseLevel'),
            duration: value('adminCourseDuration'),
            tags: (function () {
               const textTags = value('adminCourseTags')
                  .split(',')
                  .map(function (tag) { return tag.trim(); })
                  .filter(Boolean);
               const programMap = [
                  { id: 'adminCourseTagOrientation', slug: 'orientation' },
                  { id: 'adminCourseTagFutureAi', slug: 'future-ai' },
                  { id: 'adminCourseTagCareerGuidance', slug: 'career-guidance' }
               ];
               const programTags = programMap
                  .filter(function (p) { return checked(p.id); })
                  .map(function (p) { return p.slug; });
               const merged = programTags.concat(
                  textTags.filter(function (t) { return !programTags.includes(t); })
               );
               return merged;
            })(),
            isPublished: checked('adminCoursePublished'),
            isFeatured: checked('adminCourseFeatured')
         };

         const isEdit = Boolean(currentLmsCourseId);

         try {
            const targetUrl = isEdit
               ? '/api/admin/lms-courses/' + currentLmsCourseId
               : '/api/admin/lms-courses';
            const method = isEdit ? 'PUT' : 'POST';

            await requestJson(targetUrl, {
               method: method,
               headers: { 'Content-Type': 'application/json' },
               body: JSON.stringify(body)
            }, isEdit ? 'Unable to update LMS course.' : 'Unable to create LMS course.');

            if (lmsCourseModal) lmsCourseModal.hide();
            await loadLmsCourses();
            setStatus('LMS course saved successfully.', false);
         } catch (error) {
            setLmsCourseFormStatus(error.message || 'Unable to save LMS course.', true);
         } finally {
            saveLmsCourseBtn.disabled = false;
         }
      });
   }

   function renderApplicantAccess(registrations) {
      const meta = document.getElementById('adminApplicantAccessMeta');
      if (meta) {
         meta.textContent = `${registrations.length} applicant${registrations.length === 1 ? '' : 's'}`;
      }

      if (!applicantAccessTableBody) return;

      if (!registrations.length) {
         renderEmptyRow(applicantAccessTableBody, 5, 'No registrations yet.');
         return;
      }

      applicantAccessTableBody.innerHTML = '';
      registrations.forEach(function (item) {
         const row = document.createElement('tr');
         row.appendChild(createCell(item.fullName));
         row.appendChild(createCell(item.applicationCode));
         row.appendChild(createCell(item.programLabel || item.program));
         row.appendChild(createCell(item.program));
         row.appendChild(createCell(formatDate(item.submittedAt)));
         applicantAccessTableBody.appendChild(row);
      });
   }

   function renderTestimonials(items) {
      const meta = document.getElementById('adminTestimonialsMeta');
      const pending = items.filter((item) => item.status === 'pending').length;
      if (meta) {
         meta.textContent = `${pending} pending`;
      }

      setSummaryText('adminTestimonialsCount', pending);
      if (!testimonialsTableBody) return;

      if (!items.length) {
         renderEmptyRow(testimonialsTableBody, 7, 'No testimonials yet.');
         return;
      }

      testimonialsTableBody.innerHTML = '';
      items.forEach(function (item) {
         const row = document.createElement('tr');
         row.appendChild(createCell(item.fullName));
         row.appendChild(createCell(item.rating + '/5'));
         row.appendChild(createCell(item.program || '-'));
         const msgCell = document.createElement('td');
         msgCell.textContent = (item.message || '').substring(0, 50) + (item.message && item.message.length > 50 ? '…' : '');
         msgCell.style.maxWidth = '200px';
         msgCell.style.overflow = 'hidden';
         msgCell.style.textOverflow = 'ellipsis';
         msgCell.style.whiteSpace = 'nowrap';
         row.appendChild(msgCell);
         row.appendChild(createCell(item.status || 'pending'));
         row.appendChild(createCell(formatDate(item.submittedAt)));

         const actionCell = document.createElement('td');
         actionCell.style.whiteSpace = 'nowrap';

         if (item.status === 'pending') {
            const approveBtn = document.createElement('button');
            approveBtn.type = 'button';
            approveBtn.textContent = 'Approve';
            approveBtn.className = 'admin-outline-btn';
            approveBtn.style.cssText = 'padding:.26rem .7rem;font-size:.78rem;margin-right:.35rem;cursor:pointer;';
            approveBtn.addEventListener('click', async function () {
               approveBtn.disabled = true;
               try {
                  await requestJson('/api/admin/testimonials/' + item.id, {
                     method: 'PUT',
                     headers: { 'Content-Type': 'application/json' },
                     body: JSON.stringify({ status: 'approved' })
                  }, 'Unable to approve testimonial.');
                  await loadTestimonials();
                  setStatus('Testimonial approved successfully.', false);
               } catch (error) {
                  setStatus(error.message || 'Unable to approve testimonial.', true);
               } finally {
                  approveBtn.disabled = false;
               }
            });
            actionCell.appendChild(approveBtn);
         }

         const deleteBtn = document.createElement('button');
         deleteBtn.type = 'button';
         deleteBtn.textContent = 'Delete';
         deleteBtn.className = 'admin-outline-btn admin-delete-btn';
         deleteBtn.style.cssText = 'padding:.26rem .7rem;font-size:.78rem;cursor:pointer;';
         deleteBtn.addEventListener('click', async function () {
            const ok = window.confirm('Delete this testimonial? This action cannot be undone.');
            if (!ok) return;

            deleteBtn.disabled = true;
            try {
               await requestJson('/api/admin/testimonials/' + item.id, {
                  method: 'DELETE'
               }, 'Unable to delete testimonial.');
               await loadTestimonials();
               setStatus('Testimonial deleted successfully.', false);
            } catch (error) {
               setStatus(error.message || 'Unable to delete testimonial.', true);
            } finally {
               deleteBtn.disabled = false;
            }
         });
         actionCell.appendChild(deleteBtn);
         row.appendChild(actionCell);
         testimonialsTableBody.appendChild(row);
      });
   }

   async function loadTestimonials() {
      if (!testimonialsTableBody) return;
      try {
         const result = await requestJson('/api/admin/testimonials', {}, 'Unable to load testimonials.');
         renderTestimonials(result.items || []);
      } catch (error) {
         renderEmptyRow(testimonialsTableBody, 7, error.message || 'Unable to load testimonials.');
      }
   }

   // ─── LMS Resources Management ───────────────────────────────

   function clearLmsResourceFormStatus() {
      const el = document.getElementById('adminLmsResourceFormStatus');
      if (el) {
         el.textContent = '';
         el.className = 'admin-status';
      }
   }

   function setLmsResourceFormStatus(message, isError) {
      const el = document.getElementById('adminLmsResourceFormStatus');
      if (!el) return;
      el.textContent = message;
      el.classList.toggle('is-error', Boolean(isError));
      el.classList.toggle('is-success', !isError);
   }

   function clearResourceUploadState() {
      const fileInput = document.getElementById('adminResourceFile');
      const statusEl = document.getElementById('adminResourceUploadStatus');
      if (fileInput) fileInput.value = '';
      if (statusEl) { statusEl.textContent = ''; statusEl.className = 'admin-status'; }
   }

   function openAddLmsResourceModal() {
      currentLmsResourceId = null;
      const form = document.getElementById('adminLmsResourceForm');
      const label = document.getElementById('lmsResourceModalLabel');
      if (form) form.reset();
      if (label) label.textContent = 'Add LMS Resource';
      const orientEl = document.getElementById('adminResourceTagOrientation');
      const aiEl = document.getElementById('adminResourceTagFutureAi');
      const cgEl = document.getElementById('adminResourceTagCareerGuidance');
      if (orientEl) orientEl.checked = false;
      if (aiEl) aiEl.checked = false;
      if (cgEl) cgEl.checked = false;
      clearLmsResourceFormStatus();
      clearResourceUploadState();
      if (lmsResourceModal) lmsResourceModal.show();
   }

   function openEditLmsResourceModal(item) {
      currentLmsResourceId = item.id;
      const label = document.getElementById('lmsResourceModalLabel');
      if (label) label.textContent = 'Edit LMS Resource';

      const titleEl = document.getElementById('adminResourceTitle');
      const typeEl = document.getElementById('adminResourceType');
      const urlEl = document.getElementById('adminResourceUrl');
      const descEl = document.getElementById('adminResourceDescription');
      const pubEl = document.getElementById('adminResourcePublished');

      if (titleEl) titleEl.value = item.title || '';
      if (typeEl) typeEl.value = item.type || 'file';
      if (urlEl) urlEl.value = item.url || '';
      if (descEl) descEl.value = item.description || '';
      if (pubEl) pubEl.checked = Boolean(item.isPublished);

      const existingTags = Array.isArray(item.tags) ? item.tags : [];
      const orientEl = document.getElementById('adminResourceTagOrientation');
      const aiEl = document.getElementById('adminResourceTagFutureAi');
      const cgEl = document.getElementById('adminResourceTagCareerGuidance');
      if (orientEl) orientEl.checked = existingTags.includes('orientation');
      if (aiEl) aiEl.checked = existingTags.includes('future-ai');
      if (cgEl) cgEl.checked = existingTags.includes('career-guidance');

      clearLmsResourceFormStatus();
      clearResourceUploadState();
      if (lmsResourceModal) lmsResourceModal.show();
   }

   function renderLmsResources(items) {
      const meta = document.getElementById('adminLmsResourceMeta');
      if (meta) {
         meta.textContent = `${items.length} resource${items.length === 1 ? '' : 's'}`;
      }

      if (!lmsResourceTableBody) {
         return;
      }

      if (!items.length) {
         renderEmptyRow(lmsResourceTableBody, 6, 'No LMS resources yet.');
         return;
      }

      lmsResourceTableBody.innerHTML = '';
      items.forEach(function (item) {
         const row = document.createElement('tr');
         row.appendChild(createCell(item.title));
         row.appendChild(createCell(item.type));
         row.appendChild(createCell(item.description));
         row.appendChild(createCell(item.url));
         row.appendChild(createCell(item.isPublished ? 'Yes' : 'No'));

         const actionCell = document.createElement('td');
         actionCell.style.whiteSpace = 'nowrap';

         const editBtn = document.createElement('button');
         editBtn.type = 'button';
         editBtn.textContent = 'Edit';
         editBtn.className = 'admin-outline-btn';
         editBtn.style.cssText = 'padding:.26rem .7rem;font-size:.78rem;margin-right:.35rem;cursor:pointer;';
         editBtn.addEventListener('click', function () { openEditLmsResourceModal(item); });

         const deleteBtn = document.createElement('button');
         deleteBtn.type = 'button';
         deleteBtn.textContent = 'Delete';
         deleteBtn.className = 'admin-outline-btn admin-delete-btn';
         deleteBtn.style.cssText = 'padding:.26rem .7rem;font-size:.78rem;cursor:pointer;';
         deleteBtn.addEventListener('click', async function () {
            const ok = window.confirm('Delete this LMS resource? This action cannot be undone.');
            if (!ok) {
               return;
            }

            deleteBtn.disabled = true;
            try {
               await requestJson('/api/admin/lms-resources/' + item.id, {
                  method: 'DELETE'
               }, 'Unable to delete LMS resource.');
               await loadLmsResources();
            } catch (error) {
               setStatus(error.message || 'Unable to delete LMS resource.', true);
            } finally {
               deleteBtn.disabled = false;
            }
         });

         actionCell.appendChild(editBtn);
         actionCell.appendChild(deleteBtn);
         row.appendChild(actionCell);
         lmsResourceTableBody.appendChild(row);
      });
   }

   async function loadLmsResources() {
      if (!lmsResourceTableBody) {
         return;
      }

      try {
         const result = await requestJson('/api/admin/lms-resources', {}, 'Unable to load LMS resources.');
         renderLmsResources(result.items || []);
      } catch (error) {
         renderEmptyRow(lmsResourceTableBody, 6, error.message || 'Unable to load LMS resources.');
      }
   }

   const addLmsResourceBtn = document.getElementById('adminAddLmsResourceBtn');
   if (addLmsResourceBtn) {
      addLmsResourceBtn.addEventListener('click', openAddLmsResourceModal);
   }

   const resourceUploadBtn = document.getElementById('adminResourceUploadBtn');
   if (resourceUploadBtn) {
      resourceUploadBtn.addEventListener('click', async function () {
         const fileInput = document.getElementById('adminResourceFile');
         const urlInput = document.getElementById('adminResourceUrl');
         const statusEl = document.getElementById('adminResourceUploadStatus');

         if (!fileInput || !fileInput.files || !fileInput.files[0]) {
            if (statusEl) { statusEl.textContent = 'Select a file first.'; statusEl.className = 'admin-status is-error'; }
            return;
         }

         const file = fileInput.files[0];
         const allowedMimeTypes = [
            'video/mp4', 'video/webm', 'video/ogg', 'video/avi', 'video/quicktime', 'video/x-matroska',
            'application/pdf',
            'image/jpeg', 'image/png', 'image/gif', 'image/webp',
            'application/zip', 'application/x-zip-compressed',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-powerpoint',
            'application/vnd.openxmlformats-officedocument.presentationml.presentation'
         ];

         if (file.type && !allowedMimeTypes.includes(file.type)) {
            if (statusEl) {
               statusEl.textContent = `Unsupported file type: ${file.type}. Use PDF, image, video, Office document, or ZIP.`;
               statusEl.className = 'admin-status is-error';
            }
            return;
         }

         const formData = new FormData();
         formData.append('file', file);

         resourceUploadBtn.disabled = true;
         if (statusEl) { statusEl.textContent = 'Uploading…'; statusEl.className = 'admin-status'; }

         try {
            let response;
            try {
               response = await fetch(resolveApiUrl('/api/admin/lms-upload'), {
                  method: 'POST',
                  credentials: 'same-origin',
                  body: formData
               });
            } catch (_networkError) {
               throw new Error('Unable to reach backend API.');
            }

            let result = {};
            try { result = await response.json(); } catch (_) { result = {}; }

            if (!response.ok) {
               if (response.status === 401) {
                  throw new Error('Admin session expired. Log in again and retry the upload.');
               }
               throw new Error(result.error || 'Upload failed.');
            }

            if (urlInput) urlInput.value = result.url || '';
            if (fileInput) fileInput.value = '';
            const kb = Math.round((result.size || 0) / 1024);
            if (statusEl) {
               statusEl.textContent = `Uploaded: ${result.filename} (${kb} KB). URL filled in below.`;
               statusEl.className = 'admin-status is-success';
            }
         } catch (error) {
            if (statusEl) { statusEl.textContent = error.message || 'Upload failed.'; statusEl.className = 'admin-status is-error'; }
         } finally {
            resourceUploadBtn.disabled = false;
         }
      });
   }

   const saveLmsResourceBtn = document.getElementById('adminLmsResourceSaveBtn');
   if (saveLmsResourceBtn) {
      saveLmsResourceBtn.addEventListener('click', async function () {
         saveLmsResourceBtn.disabled = true;
         setLmsResourceFormStatus('Saving…', false);

         function value(id) {
            const el = document.getElementById(id);
            return el ? el.value.trim() : '';
         }

         function checked(id) {
            const el = document.getElementById(id);
            return el ? el.checked : false;
         }

         const programMap = [
            { id: 'adminResourceTagOrientation', slug: 'orientation' },
            { id: 'adminResourceTagFutureAi', slug: 'future-ai' },
            { id: 'adminResourceTagCareerGuidance', slug: 'career-guidance' }
         ];

         const body = {
            title: value('adminResourceTitle'),
            type: value('adminResourceType') || 'file',
            url: value('adminResourceUrl'),
            description: value('adminResourceDescription'),
            tags: programMap
               .filter(function (p) { return checked(p.id); })
               .map(function (p) { return p.slug; }),
            isPublished: checked('adminResourcePublished')
         };

         const isEdit = Boolean(currentLmsResourceId);

         try {
            const targetUrl = isEdit
               ? '/api/admin/lms-resources/' + currentLmsResourceId
               : '/api/admin/lms-resources';
            const method = isEdit ? 'PUT' : 'POST';

            await requestJson(targetUrl, {
               method: method,
               headers: { 'Content-Type': 'application/json' },
               body: JSON.stringify(body)
            }, isEdit ? 'Unable to update LMS resource.' : 'Unable to create LMS resource.');

            if (lmsResourceModal) lmsResourceModal.hide();
            await loadLmsResources();
            setStatus('LMS resource saved successfully.', false);
         } catch (error) {
            setLmsResourceFormStatus(error.message || 'Unable to save LMS resource.', true);
         } finally {
            saveLmsResourceBtn.disabled = false;
         }
      });
   }

   initTeamModals();
   checkAdminSession();
})();