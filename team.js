(function () {
   const authCard = document.getElementById('teamAuthCard');
   const dashboard = document.getElementById('teamDashboard');
   const authTitle = document.getElementById('teamAuthTitle');
   const authSubtitle = document.getElementById('teamAuthSubtitle');
   const authLoginTab = document.getElementById('teamAuthLoginTab');
   const authRegisterTab = document.getElementById('teamAuthRegisterTab');
   const authForgotTab = document.getElementById('teamAuthForgotTab');
   const loginForm = document.getElementById('teamLoginForm');
   const forgotForm = document.getElementById('teamForgotForm');
   const registerForm = document.getElementById('teamRegisterForm');
   const loginStatusElement = document.getElementById('teamLoginStatus');
   const teamStatusElement = document.getElementById('teamStatus');
   const editProfileForm = document.getElementById('teamEditProfileForm');
   const profileStatusElement = document.getElementById('teamProfileStatus');
   const paymentDetailsForm = document.getElementById('teamPaymentDetailsForm');
   const paymentStatusElement = document.getElementById('teamPaymentStatus');
   const logoutButton = document.getElementById('teamLogoutButton');
   const taskList = document.getElementById('teamTaskList');
   const permissionList = document.getElementById('teamPermissionList');
   const activityList = document.getElementById('teamActivityList');
   let authMode = 'login';

   if (!authCard || !dashboard || !authTitle || !authSubtitle || !authLoginTab || !authRegisterTab || !authForgotTab || !loginForm || !forgotForm || !registerForm || !loginStatusElement || !teamStatusElement || !editProfileForm || !profileStatusElement || !paymentDetailsForm || !paymentStatusElement || !taskList || !permissionList || !activityList) {
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

   function formatDate(value) {
      if (!value) return '-';

      const date = new Date(value);
      if (Number.isNaN(date.getTime())) return value;

      return date.toLocaleString();
   }

   function setText(id, value) {
      const element = document.getElementById(id);
      if (element) {
         element.textContent = value == null || value === '' ? '-' : String(value);
      }
   }

   function setStateMessage(element, message, isError) {
      element.textContent = message;
      element.classList.toggle('is-error', Boolean(isError));
      element.classList.toggle('is-success', !isError);
   }

   async function requestJson(url, options, fallbackError) {
      let response;

      try {
         response = await fetch(resolveApiUrl(url), options || {});
      } catch (_networkError) {
         throw new Error('Unable to reach backend API. Start Node server and open this site from that server URL.');
      }

      const contentType = response.headers.get('content-type') || '';

      if (!contentType.includes('application/json')) {
         throw new Error('Backend is not returning JSON. Start this site with Node server and open the same server URL.');
      }

      const payload = await response.json();

      if (!response.ok) {
         throw new Error(payload.error || fallbackError || 'Request failed.');
      }

      return payload;
   }

   function showAuthCard() {
      authCard.hidden = false;
      dashboard.hidden = true;
   }

   function showDashboard() {
      authCard.hidden = true;
      dashboard.hidden = false;
   }

   function setAuthMode(mode) {
      authMode = ['login', 'register', 'forgot'].includes(mode) ? mode : 'login';
      const isLogin = authMode === 'login';
      const isRegister = authMode === 'register';
      const isForgot = authMode === 'forgot';

      if (isLogin) {
         authTitle.textContent = 'Login to your personal team dashboard';
         authSubtitle.textContent = 'Each team member gets a personalized view with their role, tasks, permissions, and workspace activity.';
      } else if (isRegister) {
         authTitle.textContent = 'Create your team account';
         authSubtitle.textContent = 'Register your team user account with username and password, then start using your personal dashboard.';
      } else {
         authTitle.textContent = 'Reset your team password';
         authSubtitle.textContent = 'Use your username and registered email to create a new password.';
      }

      loginForm.hidden = !isLogin;
      registerForm.hidden = !isRegister;
      forgotForm.hidden = !isForgot;

      authLoginTab.classList.toggle('active', isLogin);
      authRegisterTab.classList.toggle('active', isRegister);
      authForgotTab.classList.toggle('active', isForgot);
      authLoginTab.setAttribute('aria-selected', isLogin ? 'true' : 'false');
      authRegisterTab.setAttribute('aria-selected', isRegister ? 'true' : 'false');
      authForgotTab.setAttribute('aria-selected', isForgot ? 'true' : 'false');
   }

   function renderTasks(tasks) {
      const meta = document.getElementById('teamTasksMeta');
      if (meta) {
         meta.textContent = `${tasks.length} task${tasks.length === 1 ? '' : 's'}`;
      }

      taskList.innerHTML = '';

      if (!tasks.length) {
         const empty = document.createElement('p');
         empty.className = 'team-empty-state';
         empty.textContent = 'No tasks assigned right now.';
         taskList.appendChild(empty);
         return;
      }

      tasks.forEach((task) => {
         const card = document.createElement('article');
         card.className = 'team-task-card';
         card.innerHTML = `
            <div>
               <h3>${task.title || '-'}</h3>
               <p>${task.status || '-'}</p>
            </div>
            <span>${task.deadline || '-'}</span>
         `;
         taskList.appendChild(card);
      });
   }

   function renderPermissions(items) {
      const meta = document.getElementById('teamPermissionsMeta');
      if (meta) {
         meta.textContent = `${items.length} item${items.length === 1 ? '' : 's'}`;
      }

      permissionList.innerHTML = '';

      if (!items.length) {
         const empty = document.createElement('li');
         empty.className = 'team-empty-state';
         empty.textContent = 'No permissions configured.';
         permissionList.appendChild(empty);
         return;
      }

      items.forEach((item) => {
         const listItem = document.createElement('li');
         listItem.textContent = item;
         permissionList.appendChild(listItem);
      });
   }

   function renderActivity(contacts, registrations) {
      activityList.innerHTML = '';
      const combined = [];

      contacts.forEach((item) => {
         combined.push({
            label: item.fullName,
            detail: item.subject,
            time: item.submittedAt,
            type: 'Contact'
         });
      });

      registrations.forEach((item) => {
         combined.push({
            label: item.fullName,
            detail: `${item.programLabel} · ${item.status}${item.applicationCode ? ` · ${item.applicationCode}` : ''}`,
            time: item.submittedAt,
            type: 'Registration'
         });
      });

      combined.sort((left, right) => new Date(right.time).getTime() - new Date(left.time).getTime());
      const latestItems = combined.slice(0, 6);

      if (!latestItems.length) {
         const empty = document.createElement('p');
         empty.className = 'team-empty-state';
         empty.textContent = 'No recent workspace activity.';
         activityList.appendChild(empty);
         return;
      }

      latestItems.forEach((item) => {
         const row = document.createElement('article');
         row.className = 'team-activity-item';
         row.innerHTML = `
            <div>
               <strong>${item.type}</strong>
               <p>${item.label}</p>
               <span>${item.detail}</span>
            </div>
            <time>${formatDate(item.time)}</time>
         `;
         activityList.appendChild(row);
      });
   }

   function populateEditProfileForm(user) {
      editProfileForm.fullName.value = (user && user.fullName) || '';
      editProfileForm.email.value = (user && user.email) || '';
      editProfileForm.role.value = (user && user.role) || '';
      editProfileForm.department.value = (user && user.department) || '';
      editProfileForm.focusArea.value = (user && user.focusArea) || '';
      editProfileForm.welcomeNote.value = (user && user.welcomeNote) || '';
   }

   function populatePaymentDetailsForm(details) {
      paymentDetailsForm.bankName.value = (details && details.bankName) || '';
      paymentDetailsForm.accountName.value = (details && details.accountName) || '';
      paymentDetailsForm.accountNumber.value = (details && details.accountNumber) || '';
      paymentDetailsForm.branchName.value = (details && details.branchName) || '';
      paymentDetailsForm.paymentNote.value = (details && details.paymentNote) || '';
   }

   function populateDashboard(payload) {
      const user = payload.user || {};
      const metrics = user.metrics || {};
      const workspace = payload.workspace || {};

      setText('teamWelcomeTitle', `Welcome, ${user.fullName || user.username || 'Team User'}`);
      setText('teamWelcomeNote', user.welcomeNote || 'Your personalized dashboard is ready.');
      setText('teamFullName', user.fullName);
      setText('teamRole', user.role);
      setText('teamDepartment', user.department);
      setText('teamFocusArea', user.focusArea);

      setText('teamAssignedLeads', metrics.assignedLeads || 0);
      // setText('teamPendingActions', metrics.pendingActions || 0); // Removed: no more pending actions metric
      setText('teamCompletedFollowUps', metrics.completedFollowUps || 0);
      setText('teamPriorityLevel', metrics.priorityLevel || '-');

      setText('teamWorkspaceContacts', workspace.contactSubmissions || 0);
      setText('teamWorkspaceRegistrations', workspace.registrations || 0);
      setText('teamLatestContact', formatDate(workspace.latestContact));
      setText('teamLatestRegistration', formatDate(workspace.latestRegistration));

      populateEditProfileForm(user);
      populatePaymentDetailsForm(user.paymentDetails || {});

      renderTasks(Array.isArray(user.tasks) ? user.tasks : []);
      renderPermissions(Array.isArray(user.permissions) ? user.permissions : []);
      renderActivity(payload.recentContacts || [], payload.recentRegistrations || []);
   }

   async function loadDashboard() {
      const result = await requestJson('/api/team/dashboard', {}, 'Unable to load team dashboard.');

      populateDashboard(result);
      setStateMessage(teamStatusElement, 'Personal dashboard loaded successfully.', false);
   }

   async function checkSession() {
      try {
         const result = await requestJson('/api/team/session', {}, 'Unable to check team session.');

         if (!result.authenticated) {
            showAuthCard();
            setAuthMode('login');
            setStateMessage(loginStatusElement, 'Enter your team username and password.', false);
            return;
         }

         showDashboard();
         setStateMessage(loginStatusElement, `Signed in as ${result.user ? result.user.username : 'team user'}.`, false);
         await loadDashboard();
      } catch (error) {
         showAuthCard();
         setAuthMode('login');
         setStateMessage(loginStatusElement, error.message || 'Unable to check team session.', true);
      }
   }

   authLoginTab.addEventListener('click', function () {
      setAuthMode('login');
      setStateMessage(loginStatusElement, 'Enter your team username and password.', false);
   });

   authRegisterTab.addEventListener('click', function () {
      setAuthMode('register');
      setStateMessage(loginStatusElement, 'Fill the form to create a new team account.', false);
   });

   authForgotTab.addEventListener('click', function () {
      setAuthMode('forgot');
      setStateMessage(loginStatusElement, 'Reset your password with username and registered email.', false);
   });

   loginForm.addEventListener('submit', async function (event) {
      event.preventDefault();

      const usernameField = loginForm.querySelector('input[name="username"]');
      const passwordField = loginForm.querySelector('input[name="password"]');
      const submitButton = loginForm.querySelector('button[type="submit"]');
      const username = usernameField ? usernameField.value.trim() : '';
      const password = passwordField ? passwordField.value.trim() : '';

      if (!username || !password) {
         setStateMessage(loginStatusElement, 'Username and password are required.', true);
         return;
      }

      if (submitButton) {
         submitButton.disabled = true;
      }

      setStateMessage(loginStatusElement, 'Signing in...', false);

      try {
         const result = await requestJson('/api/team/login', {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
         }, 'Unable to login.');

         loginForm.reset();
         showDashboard();
         setStateMessage(loginStatusElement, result.message || 'Team login successful.', false);
         await loadDashboard();
      } catch (error) {
         showAuthCard();
          setAuthMode('login');
         setStateMessage(loginStatusElement, error.message || 'Unable to login.', true);
      } finally {
         if (submitButton) {
            submitButton.disabled = false;
         }
      }
   });

   registerForm.addEventListener('submit', async function (event) {
      event.preventDefault();

      const submitButton = registerForm.querySelector('button[type="submit"]');
      const fullName = (registerForm.fullName ? registerForm.fullName.value : '').trim();
      const username = (registerForm.username ? registerForm.username.value : '').trim();
      const email = (registerForm.email ? registerForm.email.value : '').trim();
      const role = (registerForm.role ? registerForm.role.value : '').trim();
      const department = (registerForm.department ? registerForm.department.value : '').trim();
      const focusArea = (registerForm.focusArea ? registerForm.focusArea.value : '').trim();
      const password = (registerForm.password ? registerForm.password.value : '').trim();

      if (!fullName || !username || !email || !password) {
         setStateMessage(loginStatusElement, 'Full name, username, email, and password are required.', true);
         return;
      }

      if (password.length < 8) {
         setStateMessage(loginStatusElement, 'Password must be at least 8 characters.', true);
         return;
      }

      if (submitButton) {
         submitButton.disabled = true;
      }

      setStateMessage(loginStatusElement, 'Creating account...', false);

      try {
         const result = await requestJson('/api/team/register', {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json'
            },
            body: JSON.stringify({
               fullName,
               username,
               email,
               role,
               department,
               focusArea,
               password
            })
         }, 'Unable to create account.');

         registerForm.reset();
         showDashboard();
         setStateMessage(loginStatusElement, result.message || 'Team account created successfully.', false);
         await loadDashboard();
      } catch (error) {
         showAuthCard();
         setAuthMode('register');
         setStateMessage(loginStatusElement, error.message || 'Unable to create account.', true);
      } finally {
         if (submitButton) {
            submitButton.disabled = false;
         }
      }
   });

   forgotForm.addEventListener('submit', async function (event) {
      event.preventDefault();

      const submitButton = forgotForm.querySelector('button[type="submit"]');
      const username = (forgotForm.username ? forgotForm.username.value : '').trim();
      const email = (forgotForm.email ? forgotForm.email.value : '').trim();
      const newPassword = (forgotForm.newPassword ? forgotForm.newPassword.value : '').trim();
      const confirmPassword = (forgotForm.confirmPassword ? forgotForm.confirmPassword.value : '').trim();

      if (!username || !email || !newPassword || !confirmPassword) {
         setStateMessage(loginStatusElement, 'Username, email, and new password fields are required.', true);
         return;
      }

      if (newPassword.length < 8) {
         setStateMessage(loginStatusElement, 'New password must be at least 8 characters.', true);
         return;
      }

      if (newPassword !== confirmPassword) {
         setStateMessage(loginStatusElement, 'New password and confirm password must match.', true);
         return;
      }

      if (submitButton) {
         submitButton.disabled = true;
      }

      setStateMessage(loginStatusElement, 'Resetting password...', false);

      try {
         const response = await fetch(resolveApiUrl('/api/team/forgot-password'), {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json'
            },
            body: JSON.stringify({
               username,
               email,
               newPassword
            })
         });
         const result = await response.json();

         if (!response.ok) {
            throw new Error(result.error || 'Unable to reset password.');
         }

         forgotForm.reset();
         setAuthMode('login');
         setStateMessage(loginStatusElement, result.message || 'Password reset successful. Please login.', false);
      } catch (error) {
         showAuthCard();
         setAuthMode('forgot');
         setStateMessage(loginStatusElement, error.message || 'Unable to reset password.', true);
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
            await fetch(resolveApiUrl('/api/team/logout'), {
               method: 'POST'
            });
         } finally {
            logoutButton.disabled = false;
            showAuthCard();
            setAuthMode('login');
            setStateMessage(loginStatusElement, 'You have been logged out.', false);
            setStateMessage(teamStatusElement, 'Login required to view your dashboard.', true);
            setStateMessage(paymentStatusElement, 'Login required to update bank details.', true);
         }
      });
   }

   editProfileForm.addEventListener('submit', async function (event) {
      event.preventDefault();

      if (!editProfileForm.reportValidity()) {
         return;
      }

      const submitButton = editProfileForm.querySelector('button[type="submit"]');
      if (submitButton) {
         submitButton.disabled = true;
      }

      setStateMessage(profileStatusElement, 'Saving profile...', false);

      try {
         const result = await requestJson('/api/team/profile', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
               fullName: editProfileForm.fullName.value.trim(),
               email: editProfileForm.email.value.trim(),
               role: editProfileForm.role.value.trim(),
               department: editProfileForm.department.value.trim(),
               focusArea: editProfileForm.focusArea.value.trim(),
               welcomeNote: editProfileForm.welcomeNote.value.trim()
            })
         }, 'Unable to update profile.');

         populateEditProfileForm(result.user || {});
         setText('teamFullName', result.user && result.user.fullName);
         setText('teamRole', result.user && result.user.role);
         setText('teamDepartment', result.user && result.user.department);
         setText('teamFocusArea', result.user && result.user.focusArea);
         setText('teamWelcomeTitle', `Welcome, ${(result.user && result.user.fullName) || 'Team User'}`);
         setText('teamWelcomeNote', result.user && result.user.welcomeNote);
         setStateMessage(profileStatusElement, result.message || 'Profile updated successfully.', false);
      } catch (error) {
         setStateMessage(profileStatusElement, error.message || 'Unable to update profile.', true);
      } finally {
         if (submitButton) {
            submitButton.disabled = false;
         }
      }
   });

   paymentDetailsForm.addEventListener('submit', async function (event) {
      event.preventDefault();

      if (!paymentDetailsForm.reportValidity()) {
         return;
      }

      const submitButton = paymentDetailsForm.querySelector('button[type="submit"]');
      if (submitButton) {
         submitButton.disabled = true;
      }

      setStateMessage(paymentStatusElement, 'Saving bank details...', false);

      try {
         const response = await fetch(resolveApiUrl('/api/team/payment-details'), {
            method: 'PUT',
            headers: {
               'Content-Type': 'application/json'
            },
            body: JSON.stringify({
               bankName: paymentDetailsForm.bankName.value.trim(),
               accountName: paymentDetailsForm.accountName.value.trim(),
               accountNumber: paymentDetailsForm.accountNumber.value.trim(),
               branchName: paymentDetailsForm.branchName.value.trim(),
               paymentNote: paymentDetailsForm.paymentNote.value.trim()
            })
         });

         const result = await response.json();
         if (!response.ok) {
            throw new Error(result.error || 'Unable to update bank details.');
         }

         populatePaymentDetailsForm(result.paymentDetails || {});
         setStateMessage(paymentStatusElement, result.message || 'Bank details updated successfully.', false);
      } catch (error) {
         setStateMessage(paymentStatusElement, error.message || 'Unable to update bank details.', true);
      } finally {
         if (submitButton) {
            submitButton.disabled = false;
         }
      }
   });

   setAuthMode('login');
   checkSession();
})();