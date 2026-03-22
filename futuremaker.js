

// Loading Screen
window.addEventListener('load', () => {
   const loadingScreen = document.getElementById('loadingScreen');
   if (!loadingScreen) return;

   setTimeout(() => {
      loadingScreen.classList.add('hidden');
   }, 1000);
});

const menuToggle = document.querySelector('.menu-toggle');
const siteNavigation = document.getElementById('siteNavigation');

if (menuToggle && siteNavigation) {
   const closeNavigation = () => {
      siteNavigation.classList.remove('is-open');
      menuToggle.setAttribute('aria-expanded', 'false');
      menuToggle.setAttribute('aria-label', 'Open navigation menu');
   };

   menuToggle.addEventListener('click', () => {
      const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
      siteNavigation.classList.toggle('is-open', !isOpen);
      menuToggle.setAttribute('aria-expanded', String(!isOpen));
      menuToggle.setAttribute('aria-label', !isOpen ? 'Close navigation menu' : 'Open navigation menu');
   });

   siteNavigation.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
         if (window.innerWidth <= 860) {
            closeNavigation();
         }
      });
   });

   window.addEventListener('resize', () => {
      if (window.innerWidth > 860) {
         closeNavigation();
      }
   });
}

// Menu Item Click Handler
const menuItems = document.querySelectorAll('.menu-item');
const contentSections = document.querySelectorAll('.content-section');
const menuGrid = document.getElementById('menuGrid');
const mainHeader = document.getElementById('mainHeader');
const mainFooter = document.getElementById('mainFooter');
let isTransitioning = false;

menuItems.forEach(item => {
   item.addEventListener('click', () => {
      if (isTransitioning) return;

      const sectionId = item.dataset.section;
      showSection(sectionId);
   });
});

function showSection(sectionId) {
   isTransitioning = true;

   // First, ensure all menu items are in visible state before transitioning
   menuItems.forEach((item) => {
      // Remove initial-load class
      item.classList.remove('initial-load');

      // Set to visible state explicitly
      item.style.opacity = '1';
      item.style.transform = 'translateY(0) scale(1)';
      item.style.animation = 'none';
   });

   // Force reflow to apply the visible state
   void menuGrid.offsetWidth;

   // Now apply staggered fade out transition
   menuItems.forEach((item, index) => {
      setTimeout(() => {
         item.style.transition = 'all 0.4s ease-out';
         item.style.opacity = '0';
         item.style.transform = 'translateY(40px) scale(0.9)';
      }, index * 50);
   });

   // Hide header and footer
   mainHeader.style.animation = 'none';
   mainHeader.style.opacity = '1';
   mainFooter.style.animation = 'none';
   mainFooter.style.opacity = '1';

   void mainHeader.offsetWidth;

   mainHeader.style.transition = 'opacity 0.4s ease';
   mainHeader.style.opacity = '0';
   mainFooter.style.transition = 'opacity 0.4s ease';
   mainFooter.style.opacity = '0';

   // Show content section after menu animation
   setTimeout(() => {
      menuGrid.style.display = 'none';
      mainHeader.style.display = 'none';
      mainFooter.style.display = 'none';

      // Reset menu item styles for next time
      menuItems.forEach(item => {
         item.style.transition = '';
         item.style.opacity = '';
         item.style.transform = '';
         item.classList.remove('exit-up', 'visible');
      });

      const section = document.getElementById(sectionId);
      section.classList.add('active');

      // Animate stats if introduction section
      if (sectionId === 'introduction') {
         setTimeout(animateStats, 500);
      }

      isTransitioning = false;
   }, 550);
}

function backToMenu() {
   if (isTransitioning) return;
   isTransitioning = true;

   const activeSection = document.querySelector('.content-section.active');
   if (activeSection) {
      // Get fixed elements that need to fade out
      const sectionHeaderSmall = activeSection.querySelector('.section-header-small');
      const backBtn = activeSection.querySelector('.back-btn');

      // Step 1: Cancel the forwards animation so we can control opacity
      activeSection.style.animation = 'none';
      activeSection.style.opacity = '1'; // Reset to visible state first

      // Force reflow to apply the animation cancel
      void activeSection.offsetWidth;

      // Step 2: Now apply fade out transition to ALL elements
      activeSection.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
      activeSection.style.opacity = '0';
      activeSection.style.transform = 'translateY(-20px)';

      if (sectionHeaderSmall) {
         sectionHeaderSmall.style.transition = 'opacity 0.5s ease';
         sectionHeaderSmall.style.opacity = '0';
      }
      if (backBtn) {
         backBtn.style.transition = 'opacity 0.5s ease';
         backBtn.style.opacity = '0';
      }

      // Step 3: Wait for complete fade out
      setTimeout(() => {
         // Hide section completely
         activeSection.classList.remove('active');
         activeSection.style.animation = '';
         activeSection.style.opacity = '';
         activeSection.style.transform = '';
         activeSection.style.transition = '';

         if (sectionHeaderSmall) {
            sectionHeaderSmall.style.opacity = '';
            sectionHeaderSmall.style.transition = '';
         }
         if (backBtn) {
            backBtn.style.opacity = '';
            backBtn.style.transition = '';
         }

         // Step 4: Prepare menu elements (hidden initially)
         menuGrid.style.display = 'grid';
         mainHeader.style.display = 'block';
         mainFooter.style.display = 'block';

         // Cancel CSS animations to prevent re-triggering
         mainHeader.style.animation = 'none';
         mainFooter.style.animation = 'none';

         mainHeader.style.opacity = '0';
         mainHeader.style.transform = 'translateY(20px)';
         mainFooter.style.opacity = '0';

         menuItems.forEach(item => {
            item.classList.remove('exit-up', 'initial-load', 'return', 'visible');
            item.style.opacity = '0';
            item.style.transform = 'translateY(30px) scale(0.9)';
         });

         // Step 5: Brief pause then fade in menu
         setTimeout(() => {
            // Fade in header
            mainHeader.style.transition = 'all 0.5s ease';
            mainHeader.style.opacity = '1';
            mainHeader.style.transform = 'translateY(0)';

            // Fade in footer
            mainFooter.style.transition = 'all 0.5s ease';
            mainFooter.style.opacity = '1';

            // Staggered fade in for menu items
            menuItems.forEach((item, index) => {
               setTimeout(() => {
                  item.style.transition = 'all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
                  item.style.opacity = '1';
                  item.style.transform = 'translateY(0) scale(1)';
               }, index * 80);
            });

            // Step 6: Clean up after all animations complete
            setTimeout(() => {
               mainHeader.style.transition = '';
               mainHeader.style.transform = '';
               mainFooter.style.transition = '';

               menuItems.forEach(item => {
                  item.style.transition = '';
                  item.style.opacity = '';
                  item.style.transform = '';
                  item.classList.add('visible');
               });

               isTransitioning = false;
            }, 600);
         }, 150);
      }, 550);
   }
}

// Animate Stats
function animateStats() {
   const metricValues = document.querySelectorAll('.metric-value[data-target]');
   metricValues.forEach((el, index) => {
      setTimeout(() => {
         const target = parseInt(el.dataset.target);
         let current = 0;
         const increment = target / 40;
         const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
               current = target;
               clearInterval(timer);
            }
            el.textContent = Math.floor(current);
         }, 30);
      }, index * 200);
   });
}

// Tab Switching
function switchTab(btn, tabId) {
   document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
   btn.classList.add('active');

   document.querySelectorAll('.tab-pane').forEach(pane => pane.classList.remove('active'));
   document.getElementById(tabId).classList.add('active');
}

// Gallery Filter
function filterGallery(category, btn) {
   document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
   btn.classList.add('active');

   const items = document.querySelectorAll('.gallery-item');
   items.forEach(item => {
      if (category === 'all' || item.dataset.category === category) {
         item.style.display = 'block';
         item.style.animation = 'tabFade 0.4s ease-out';
      } else {
         item.style.display = 'none';
      }
   });
}

/* ===== Image Lightbox JS ===== */
(function(){
   const lightbox = document.getElementById('imageLightbox');
   const lightboxImage = document.getElementById('lightboxImage');
   const caption = document.getElementById('lightboxCaption');
   const closeBtn = lightbox ? lightbox.querySelector('.image-lightbox-close') : null;

   function openLightbox(src, alt){
      if(!lightbox) return;
      lightbox.classList.add('open');
      lightbox.setAttribute('aria-hidden','false');
      lightboxImage.src = src;
      lightboxImage.alt = alt || '';
      caption.textContent = alt || '';
      document.body.style.overflow = 'hidden';
      if(closeBtn) closeBtn.focus();
   }

   function closeLightbox(){
      if(!lightbox) return;
      lightbox.classList.remove('open');
      lightbox.setAttribute('aria-hidden','true');
      // small timeout to allow CSS transition before clearing src
      setTimeout(() => {
         lightboxImage.src = '';
         caption.textContent = '';
      }, 200);
      document.body.style.overflow = '';
   }

   const imageViewSelectors = '.service-row-icon img, .chance-live-media img, .chance-card-media img, .hero-feature-media img, .student-media img';

   // Delegated click/touch handler for supported gallery images
   document.addEventListener('click', function(e){
      const img = e.target.closest && e.target.closest(imageViewSelectors);
      if(img){
         openLightbox(img.src, img.alt);
      }
   }, false);

   document.addEventListener('touchstart', function(e){
      const img = e.target.closest && e.target.closest(imageViewSelectors);
      if(img){
         openLightbox(img.src, img.alt);
      }
   }, {passive:true});

   // Close handlers: overlay, close button, Escape key
   document.addEventListener('click', function(e){
      if(e.target && e.target.hasAttribute('data-close')) closeLightbox();
      if(e.target && e.target.classList && e.target.classList.contains('image-lightbox-close')) closeLightbox();
   });

   document.addEventListener('keydown', function(e){
      if(e.key === 'Escape') closeLightbox();
   });
})();

// Announcement Modal Functions
function toggleAnnouncement() {
   const modal = document.getElementById('announcementModal');
   if (modal.style.display === 'none') {
      modal.style.display = 'flex';
   } else {
      modal.style.display = 'none';
   }
}

function closeAnnouncement() {
   document.getElementById('announcementModal').style.display = 'none';
}

// Close announcement modal when clicking outside
document.addEventListener('click', function(e) {
   const modal = document.getElementById('announcementModal');
   if (e.target === modal) {
      modal.style.display = 'none';
   }
});

function setFormStatus(element, message, type) {
   if (!element) return;

   element.textContent = message || '';
   element.classList.remove('is-success', 'is-error');

   if (type === 'success') {
      element.classList.add('is-success');
   }

   if (type === 'error') {
      element.classList.add('is-error');
   }
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

async function submitJsonForm(url, payload) {
   let response;

   try {
      response = await fetch(resolveApiUrl(url), {
         method: 'POST',
         headers: {
            'Content-Type': 'application/json'
         },
         body: JSON.stringify(payload)
      });
   } catch (_networkError) {
      throw new Error('Unable to reach the backend API. Start Node server and open this site from that server URL.');
   }

   let result = {};

   try {
      result = await response.json();
   } catch (_error) {
      result = {};
   }

   if (!response.ok) {
      throw new Error(result.error || 'Unable to submit the form right now.');
   }

   return result;
}

// Contact Form API submission
(function () {
   const contactForm = document.getElementById('contactForm');
   if (!contactForm) return;

   const statusElement = document.getElementById('contactFormStatus');
   const submitButton = contactForm.querySelector('button[type="submit"]');

   contactForm.addEventListener('submit', async function (e) {
      e.preventDefault();

      if (!contactForm.reportValidity()) return;

      const apiUrl = contactForm.dataset.api || contactForm.getAttribute('action') || '/api/contact';
      const payload = {
         fullName: contactForm.fullName ? contactForm.fullName.value.trim() : '',
         phone: contactForm.phone ? contactForm.phone.value.trim() : '',
         email: contactForm.email ? contactForm.email.value.trim() : '',
         subject: contactForm.subject ? contactForm.subject.value.trim() : '',
         message: contactForm.message ? contactForm.message.value.trim() : ''
      };

      setFormStatus(statusElement, 'Sending your message...', 'success');
      if (submitButton) submitButton.disabled = true;

      try {
         const result = await submitJsonForm(apiUrl, payload);
         setFormStatus(statusElement, result.message || 'Your message has been sent.', 'success');
         contactForm.reset();
      } catch (error) {
         setFormStatus(statusElement, error.message, 'error');
      } finally {
         if (submitButton) submitButton.disabled = false;
      }
   });
})();

// Register Form API submission
(function () {
   const registerForm = document.getElementById('registerForm');
   if (!registerForm) return;

   const statusElement = document.getElementById('registerFormStatus');
   const submitButton = registerForm.querySelector('button[type="submit"]');
   const programField = registerForm.querySelector('select[name="program"]');
   const paymentMethodFields = registerForm.querySelectorAll('input[name="paymentMethod"]');
   const cardFields = document.getElementById('cardFields');
   const bankFields = document.getElementById('bankFields');
   const teamUserBankCard = document.getElementById('teamUserBankCard');
   const programFee = document.getElementById('programFee');
   const teamUserField = registerForm.querySelector('select[name="teamUser"]');

   const fallbackBankDetails = {
      bankName: 'Bank of Ceylon',
      accountName: 'FutureMakers Enrollment',
      accountNumber: '8502232',
      branchName: 'Jaffna',
      paymentNote: 'Use your application code as the transfer reference.'
   };

   const teamUsersByUsername = new Map();

   const feeMap = {
      orientation: 1000,
      'future-ai': 1500,
      'career-guidance': 1200
   };

   function formatLkr(value) {
      return 'LKR ' + value.toLocaleString(undefined, {
         minimumFractionDigits: 2,
         maximumFractionDigits: 2
      });
   }

   function getPaymentMethodLabel(method) {
      if (method === 'card') return 'Card Payment';
      if (method === 'bank') return 'Direct Bank Transfer';
      return 'Pay Later (At Office)';
   }

   function updateFee() {
      if (!programField || !programFee) return;
      const amount = feeMap[programField.value] || 0;
      programFee.textContent = formatLkr(amount);
   }

   function updateBankDetails() {
      const selectedUsername = teamUserField ? teamUserField.value : '';
      const selectedUser = selectedUsername ? teamUsersByUsername.get(selectedUsername) : null;
      const hasTeamUserSelection = Boolean(selectedUsername);
      const details = selectedUser && selectedUser.paymentDetails ? selectedUser.paymentDetails : fallbackBankDetails;
      const bankName = document.getElementById('bankName');
      const accountName = document.getElementById('accountName');
      const accountNumber = document.getElementById('accountNumber');
      const branchName = document.getElementById('branchName');
      const paymentHelp = registerForm.querySelector('.payment-help');

      if (teamUserBankCard) {
         teamUserBankCard.classList.toggle('hidden', !hasTeamUserSelection);
      }

      if (bankName) bankName.textContent = details.bankName || fallbackBankDetails.bankName;
      if (accountName) accountName.textContent = details.accountName || fallbackBankDetails.accountName;
      if (accountNumber) accountNumber.textContent = details.accountNumber || fallbackBankDetails.accountNumber;
      if (branchName) branchName.textContent = details.branchName || fallbackBankDetails.branchName;
      if (paymentHelp) {
         paymentHelp.textContent = (details.paymentNote || fallbackBankDetails.paymentNote) + ' After payment, send your receipt and account number to our WhatsApp number: +94 70 568 1574 so we can verify and approve your registration.';
      }
   }

   async function loadTeamUsers() {
      if (!teamUserField) return;

      try {
          const response = await fetch(resolveApiUrl('/api/team/public-users'));
         const result = await response.json();
         if (!response.ok) {
            throw new Error(result.error || 'Unable to load team users.');
         }

         const users = Array.isArray(result.items) ? result.items : [];
         teamUsersByUsername.clear();

         const currentValue = teamUserField.value;
         teamUserField.innerHTML = '<option value="" disabled selected>Select a team user</option>';

         users.forEach((user) => {
            if (!user || !user.username) return;

            const username = String(user.username).trim().toLowerCase();
            teamUsersByUsername.set(username, user);

            const option = document.createElement('option');
            option.value = username;
            option.textContent = `${user.fullName || username} (${user.role || 'Team Member'})`;
            teamUserField.appendChild(option);
         });

         if (currentValue && teamUsersByUsername.has(currentValue)) {
            teamUserField.value = currentValue;
         }

         updateBankDetails();
      } catch (_error) {
            console.error('Unable to load team users', error);
            setFormStatus(statusElement, error.message || 'Unable to connect to backend API.', 'error');
         updateBankDetails();
      }
   }

   function updatePaymentMode() {
      const selected = registerForm.querySelector('input[name="paymentMethod"]:checked');
      const isCard = selected && selected.value === 'card';
      const isBank = selected && selected.value === 'bank';

      if (cardFields) {
         cardFields.classList.toggle('hidden', !isCard);
      }

      if (bankFields) {
         bankFields.classList.toggle('hidden', !isBank);
      }

      const cardRequiredFields = ['cardNumber', 'cardName', 'expMonth', 'expYear', 'cvv'];
      cardRequiredFields.forEach((name) => {
         const field = registerForm.elements[name];
         if (field) {
            field.required = Boolean(isCard);
         }
      });

      const bankRequiredFields = ['transferReference', 'payerName'];
      bankRequiredFields.forEach((name) => {
         const field = registerForm.elements[name];
         if (field) {
            field.required = Boolean(isBank);
         }
      });
   }

   function isCardDataValid() {
      const cardNumber = (registerForm.cardNumber.value || '').replace(/\s+/g, '');
      const expMonth = registerForm.expMonth.value || '';
      const expYear = registerForm.expYear.value || '';
      const cvv = registerForm.cvv.value || '';

      if (!/^\d{13,19}$/.test(cardNumber)) return false;
      if (!/^(0[1-9]|1[0-2])$/.test(expMonth)) return false;
      if (!/^\d{4}$/.test(expYear)) return false;
      if (!/^\d{3,4}$/.test(cvv)) return false;

      return true;
   }

   if (programField) {
      programField.addEventListener('change', updateFee);
   }

   if (teamUserField) {
      teamUserField.addEventListener('change', updateBankDetails);
   }

   paymentMethodFields.forEach((field) => {
      field.addEventListener('change', updatePaymentMode);
   });

   updateBankDetails();
   updateFee();
   updatePaymentMode();
   loadTeamUsers();

   registerForm.addEventListener('submit', async function (e) {
      e.preventDefault();

      if (!registerForm.reportValidity()) return;

      const selected = registerForm.querySelector('input[name="paymentMethod"]:checked');
      const paymentMethod = selected ? selected.value : 'cash';
      const isCard = paymentMethod === 'card';
      const amount = feeMap[programField.value] || 0;
      const apiUrl = registerForm.dataset.api || registerForm.getAttribute('action') || '/api/registrations';

      if (isCard && !isCardDataValid()) {
         setFormStatus(statusElement, 'Please enter valid card details to continue payment.', 'error');
         return;
      }

      const payload = {
         firstName: registerForm.firstName ? registerForm.firstName.value.trim() : '',
         lastName: registerForm.lastName ? registerForm.lastName.value.trim() : '',
         email: registerForm.email ? registerForm.email.value.trim() : '',
         phone: registerForm.phone ? registerForm.phone.value.trim() : '',
         program: registerForm.program ? registerForm.program.value : '',
         teamUser: registerForm.teamUser ? registerForm.teamUser.value : '',
         city: registerForm.city ? registerForm.city.value.trim() : '',
         goal: registerForm.goal ? registerForm.goal.value.trim() : '',
         paymentMethod: paymentMethod,
         cardNumber: registerForm.cardNumber ? registerForm.cardNumber.value.trim() : '',
         cardName: registerForm.cardName ? registerForm.cardName.value.trim() : '',
         expMonth: registerForm.expMonth ? registerForm.expMonth.value.trim() : '',
         expYear: registerForm.expYear ? registerForm.expYear.value.trim() : '',
         transferReference: registerForm.transferReference ? registerForm.transferReference.value.trim() : '',
         payerName: registerForm.payerName ? registerForm.payerName.value.trim() : ''
      };

      setFormStatus(statusElement, 'Submitting your registration...', 'success');
      if (submitButton) submitButton.disabled = true;

      try {
         const result = await submitJsonForm(apiUrl, payload);
         const paymentSummary = amount > 0 ? ' Amount: ' + formatLkr(amount) + '.' : '';
         const methodSummary = ' Payment method: ' + getPaymentMethodLabel(paymentMethod) + '.';
         const applicationCodeSummary = result.applicationCode ? ' Application code: ' + result.applicationCode + '.' : '';
         const teamSummary = result.assignedTeamUserName ? ' Assigned team user: ' + result.assignedTeamUserName + '.' : '';
         const mailSummary = result.mail && result.mail.sent
            ? ' Confirmation email sent.'
            : ' Registration saved. Email is pending from server configuration.';
         setFormStatus(statusElement, (result.message || 'Registration submitted successfully.') + paymentSummary + methodSummary + applicationCodeSummary + teamSummary + mailSummary, 'success');
         registerForm.reset();
         updateFee();
         updatePaymentMode();
         loadTeamUsers();
      } catch (error) {
         setFormStatus(statusElement, error.message, 'error');
      } finally {
         if (submitButton) submitButton.disabled = false;
      }
   });
})();