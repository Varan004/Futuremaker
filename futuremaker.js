

// Loading Screen
window.addEventListener('load', () => {
   const loadingScreen = document.getElementById('loadingScreen');
   if (!loadingScreen) return;

   setTimeout(() => {
      loadingScreen.classList.add('hidden');
   }, 1000);
});

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

// Contact Form to WhatsApp
(function () {
   const contactForm = document.getElementById('contactForm');
   if (!contactForm) return;

   contactForm.addEventListener('submit', function (e) {
      e.preventDefault();

      const targetNumber = (contactForm.dataset.whatsapp || '').trim();
      if (!targetNumber) return;

      const fullName = contactForm.fullName ? contactForm.fullName.value.trim() : '';
      const phone = contactForm.phone ? contactForm.phone.value.trim() : '';
      const email = contactForm.email ? contactForm.email.value.trim() : '';
      const subject = contactForm.subject ? contactForm.subject.value.trim() : '';
      const message = contactForm.message ? contactForm.message.value.trim() : '';

      const text = [
         'New message from FutureMakers website',
         '',
         'Name: ' + fullName,
         'Phone: ' + phone,
         'Email: ' + email,
         'Subject: ' + subject,
         'Message: ' + message
      ].join('\n');

      const whatsappUrl = 'https://wa.me/' + targetNumber + '?text=' + encodeURIComponent(text);
      window.open(whatsappUrl, '_blank');
   });
})();

// Register Form Website Payment
(function () {
   const registerForm = document.getElementById('registerForm');
   if (!registerForm) return;

   const programField = registerForm.querySelector('select[name="program"]');
   const paymentMethodFields = registerForm.querySelectorAll('input[name="paymentMethod"]');
   const cardFields = document.getElementById('cardFields');
   const bankFields = document.getElementById('bankFields');
   const programFee = document.getElementById('programFee');

   // Update these values with your real account details.
   const bankDetails = {
      bankName: 'Bank of Ceylon',
      accountName: 'U.Yethavran',
      accountNumber: '8502232',
      branchName: 'Jaffna'
   };

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

   function updateFee() {
      if (!programField || !programFee) return;
      const amount = feeMap[programField.value] || 0;
      programFee.textContent = formatLkr(amount);
   }

   function updateBankDetails() {
      const bankName = document.getElementById('bankName');
      const accountName = document.getElementById('accountName');
      const accountNumber = document.getElementById('accountNumber');
      const branchName = document.getElementById('branchName');

      if (bankName) bankName.textContent = bankDetails.bankName;
      if (accountName) accountName.textContent = bankDetails.accountName;
      if (accountNumber) accountNumber.textContent = bankDetails.accountNumber;
      if (branchName) branchName.textContent = bankDetails.branchName;
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

   paymentMethodFields.forEach((field) => {
      field.addEventListener('change', updatePaymentMode);
   });

   updateBankDetails();
   updateFee();
   updatePaymentMode();

   registerForm.addEventListener('submit', function (e) {
      e.preventDefault();

      if (!registerForm.reportValidity()) return;

      const selected = registerForm.querySelector('input[name="paymentMethod"]:checked');
      const isCard = selected && selected.value === 'card';
      const isBank = selected && selected.value === 'bank';

      if (isCard && !isCardDataValid()) {
         alert('Please enter valid card details to continue payment.');
         return;
      }

      const amount = feeMap[programField.value] || 0;
      if (isCard) {
         alert('Payment successful. Amount paid: ' + formatLkr(amount));
      } else if (isBank) {
         alert('Bank transfer details submitted. Please send your payment receipt and account number to our WhatsApp number: +94 70 568 1574. We will verify and confirm your registration. Amount: ' + formatLkr(amount));
      } else {
         alert('Registration submitted. Please pay at office. Amount due: ' + formatLkr(amount));
      }

      registerForm.reset();
      updateFee();
      updatePaymentMode();
   });
})();