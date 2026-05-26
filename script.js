/**
 * Rio Solar Energy — Squeeze Page
 * Vanilla JS: Calculadora de ahorro, validación de formulario,
 * FAQ accordion, scroll animations, nav sticky
 */

(function () {
  'use strict';

  /* =========================================
     1. NAV — Scroll state
     ========================================= */
  const nav = document.getElementById('mainNav');
  if (nav) {
    const onScroll = () => {
      nav.classList.toggle('scrolled', window.scrollY > 20);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* =========================================
     2. INTERSECTION OBSERVER — Scroll animations
     ========================================= */
  const animatedEls = document.querySelectorAll('.animate-on-scroll');
  if ('IntersectionObserver' in window && animatedEls.length) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
    animatedEls.forEach((el) => observer.observe(el));
  } else {
    // Fallback: show all immediately
    animatedEls.forEach((el) => el.classList.add('is-visible'));
  }

  /* =========================================
     3. SAVINGS CALCULATOR
     ========================================= */
  const gasSlider = document.getElementById('gasSpend');
  const lightSlider = document.getElementById('lightSpend');
  const gasValue = document.getElementById('gasValue');
  const lightValue = document.getElementById('lightValue');
  const calcResult = document.getElementById('calcResult');
  const calcSub = document.getElementById('calcSub');
  const monthlySaving = document.getElementById('monthlySaving');
  const annualSaving = document.getElementById('annualSaving');
  const paybackTime = document.getElementById('paybackTime');

  // Simulate average system price for ROI calculation
  const SYSTEM_PRICE = 1080;
  const GAS_SAVING_RATE = 0.85;    // 85% of gas spend is saved
  const LIGHT_SAVING_RATE = 0.30;  // 30% of light bill saved with PV

  function updateCalculator() {
    const gas = parseInt(gasSlider.value);
    const light = parseInt(lightSlider.value);

    gasValue.textContent = `$${gas} / mes`;
    lightValue.textContent = `$${light} / mes`;

    // Update ARIA values
    gasSlider.setAttribute('aria-valuenow', gas);
    lightSlider.setAttribute('aria-valuenow', light);

    const monthly = Math.round((gas * GAS_SAVING_RATE) + (light * LIGHT_SAVING_RATE));
    const annual = monthly * 12;
    const payback = monthly > 0 ? Math.ceil(SYSTEM_PRICE / monthly) : 0;

    // Hero ROI display
    monthlySaving.textContent = `$${monthly}`;
    annualSaving.textContent = `$${annual.toLocaleString('es-EC')}`;
    paybackTime.textContent = `${payback} m`;

    // Calc card result
    calcResult.textContent = `$${monthly} / mes`;
    calcSub.textContent =
      payback > 0
        ? `Recuperas tu inversión en aproximadamente ${payback} meses`
        : 'Ingresa tus gastos para ver el cálculo';
  }

  if (gasSlider && lightSlider) {
    gasSlider.addEventListener('input', updateCalculator);
    lightSlider.addEventListener('input', updateCalculator);
    updateCalculator(); // init
  }

  /* =========================================
     4. FAQ ACCORDION
     ========================================= */
  const faqButtons = document.querySelectorAll('.faq-question');

  faqButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const isExpanded = btn.getAttribute('aria-expanded') === 'true';
      const answerId = btn.getAttribute('aria-controls');
      const answer = document.getElementById(answerId);

      // Close all first
      faqButtons.forEach((otherBtn) => {
        if (otherBtn !== btn) {
          otherBtn.setAttribute('aria-expanded', 'false');
          const otherId = otherBtn.getAttribute('aria-controls');
          const otherAnswer = document.getElementById(otherId);
          if (otherAnswer) otherAnswer.hidden = true;
        }
      });

      // Toggle current
      const newState = !isExpanded;
      btn.setAttribute('aria-expanded', String(newState));
      if (answer) answer.hidden = !newState;
    });

    // Keyboard: Enter and Space handled natively by <button>
  });

  /* =========================================
     5. LEAD FORM — Validation & Submission
     ========================================= */
  const form = document.getElementById('mainLeadForm');
  const formSuccess = document.getElementById('formSuccess');
  const submitBtn = document.getElementById('submitBtn');

  if (!form) return;

  /* Helpers */
  function showError(fieldId, msg) {
    const input = document.getElementById(fieldId);
    const error = document.getElementById(`${fieldId}-error`);
    if (input) input.classList.add('is-error');
    if (error) error.textContent = msg;
  }

  function clearError(fieldId) {
    const input = document.getElementById(fieldId);
    const error = document.getElementById(`${fieldId}-error`);
    if (input) { input.classList.remove('is-error'); input.classList.add('is-valid'); }
    if (error) error.textContent = '';
  }

  function resetValidation(fieldId) {
    const input = document.getElementById(fieldId);
    const error = document.getElementById(`${fieldId}-error`);
    if (input) { input.classList.remove('is-error', 'is-valid'); }
    if (error) error.textContent = '';
  }

  /* Real-time validation on blur */
  const nombre = document.getElementById('nombre');
  const whatsapp = document.getElementById('whatsapp');
  const ciudad = document.getElementById('ciudad');

  if (nombre) {
    nombre.addEventListener('blur', () => {
      if (!nombre.value.trim() || nombre.value.trim().length < 2) {
        showError('nombre', 'Por favor ingresa tu nombre completo.');
      } else {
        clearError('nombre');
      }
    });
    nombre.addEventListener('input', () => resetValidation('nombre'));
  }

  if (whatsapp) {
    whatsapp.addEventListener('blur', () => {
      const val = whatsapp.value.replace(/\D/g, '');
      if (!val || val.length < 9) {
        showError('whatsapp', 'Ingresa un número de WhatsApp válido (9-10 dígitos).');
      } else {
        clearError('whatsapp');
      }
    });
    whatsapp.addEventListener('input', () => resetValidation('whatsapp'));
  }

  if (ciudad) {
    ciudad.addEventListener('change', () => {
      if (!ciudad.value) {
        showError('ciudad', 'Selecciona tu ciudad.');
      } else {
        clearError('ciudad');
      }
    });
  }

  /* Validate all */
  function validateForm() {
    let valid = true;

    // Nombre
    if (!nombre || !nombre.value.trim() || nombre.value.trim().length < 2) {
      showError('nombre', 'Por favor ingresa tu nombre completo.');
      valid = false;
    } else {
      clearError('nombre');
    }

    // WhatsApp
    if (whatsapp) {
      const val = whatsapp.value.replace(/\D/g, '');
      if (!val || val.length < 9) {
        showError('whatsapp', 'Ingresa un número de WhatsApp válido.');
        valid = false;
      } else {
        clearError('whatsapp');
      }
    }

    // Ciudad
    if (ciudad && !ciudad.value) {
      showError('ciudad', 'Selecciona tu ciudad.');
      valid = false;
    } else if (ciudad) {
      clearError('ciudad');
    }

    // Producto
    const producto = form.querySelector('input[name="producto"]:checked');
    const productoError = document.getElementById('producto-error');
    if (!producto) {
      if (productoError) productoError.textContent = 'Selecciona un producto.';
      valid = false;
    } else {
      if (productoError) productoError.textContent = '';
    }

    return valid;
  }

  /* Build WhatsApp message from form data */
  function buildWhatsAppMsg(data) {
    const productos = {
      calentador: 'Calentador Solar',
      fotovoltaico: 'Paneles Fotovoltaicos',
      ambos: 'Calentador Solar + Paneles Fotovoltaicos',
    };
    return encodeURIComponent(
      `Hola, soy ${data.nombre} de ${data.ciudad}. Solicité una cotización en su página web.\n\nProducto de interés: ${productos[data.producto] || data.producto}\n\nMi número: +593${data.whatsapp}\n\nQuedo pendiente de su respuesta.`
    );
  }

  /* Submit handler */
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    // Loading state
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.querySelector('.btn-text').textContent = 'Enviando...';
    }

    const nombreVal = nombre ? nombre.value.trim() : '';
    const whatsappVal = whatsapp ? whatsapp.value.replace(/\D/g, '') : '';
    const ciudadVal = ciudad ? ciudad.options[ciudad.selectedIndex].text : '';
    const productoVal = form.querySelector('input[name="producto"]:checked')?.value || '';

    // Simulate async submission (replace with actual endpoint if needed)
    setTimeout(() => {
      // Update success state
      if (formSuccess) {
        const successTitle = formSuccess.querySelector('.success-title');
        if (successTitle) successTitle.textContent = `¡Perfecto, ${nombreVal}!`;

        const waLink = formSuccess.querySelector('a[href*="wa.me"]');
        if (waLink) {
          const msg = buildWhatsAppMsg({
            nombre: nombreVal,
            whatsapp: whatsappVal,
            ciudad: ciudadVal,
            producto: productoVal,
          });
          // PERSONALIZAR: reemplaza XXXXXXXXX con el número real de Rio Solar Energy
          waLink.href = `https://wa.me/593XXXXXXXXX?text=${msg}`;
        }

        form.hidden = true;
        formSuccess.hidden = false;

        // Smooth scroll to success
        formSuccess.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }

      // Optional: send to a webhook / CRM
      // fetch('/api/leads', { method: 'POST', body: JSON.stringify({...}) });
    }, 800);
  });

  /* =========================================
     6. SMOOTH SCROLL for anchor links
     ========================================= */
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href').slice(1);
      const target = document.getElementById(targetId);
      if (!target) return;
      e.preventDefault();
      const offset = 72; // nav height
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

  /* =========================================
     7. PRODUCT OPTION — visual feedback
     ========================================= */
  const productOptions = document.querySelectorAll('.product-option input[type="radio"]');
  productOptions.forEach((radio) => {
    radio.addEventListener('change', () => {
      // Clear product error on selection
      const productoError = document.getElementById('producto-error');
      if (productoError) productoError.textContent = '';
    });
  });

})();
