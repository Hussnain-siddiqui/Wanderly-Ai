/* Wanderly AI - page behaviour (form validation, Formspree, planner preview) */
(function () {
  'use strict';

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  /* ---------- Helpers ---------- */
  const escapeHtml = (s) =>
    String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  // Flowbite-style alert
  function showAlert(box, type, title, text) {
    if (!box) return;
    const ok = type === 'success';
    const colors = ok ? 'text-green-800 bg-green-50 border-green-300' : 'text-red-800 bg-red-50 border-red-300';
    const icon = ok
      ? '<path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.7 7.7-4.4 5a1 1 0 0 1-.7.3 1 1 0 0 1-.7-.3l-2-2a1 1 0 1 1 1.4-1.4l1.3 1.3 3.7-4.3a1 1 0 0 1 1.5 1.4Z"/>'
      : '<path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM10 15a1 1 0 1 1 0-2 1 1 0 0 1 0 2Zm1-4a1 1 0 0 1-2 0V6a1 1 0 0 1 2 0v5Z"/>';
    box.innerHTML =
      '<div class="flex items-start gap-3 p-4 mb-4 text-sm border rounded-lg ' + colors + '" role="alert">' +
      '<svg class="w-4 h-4 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">' + icon + '</svg>' +
      '<div><span class="font-semibold">' + title + '</span> ' + text + '</div></div>';
  }

  /* ---------- Form validation ---------- */
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  function messageFor(el) {
    const isCheck = el.type === 'checkbox';
    const value = isCheck ? el.checked : el.value.trim();
    const label = el.dataset.label || 'This field';

    if (el.required && (isCheck ? !value : value === '')) {
      if (isCheck) return el.dataset.requiredMsg || 'Please tick this box to continue.';
      return el.tagName === 'SELECT' ? 'Choose an option from the list.' : label + ' is required.';
    }
    if (isCheck || value === '') return '';

    if (el.type === 'email' && !EMAIL_RE.test(value)) return 'Enter a valid email address, like name@example.com.';
    if (el.dataset.minlength && value.length < Number(el.dataset.minlength)) {
      return label + ' needs at least ' + el.dataset.minlength + ' characters.';
    }
    if (el.dataset.pattern && !new RegExp(el.dataset.pattern).test(value)) {
      return el.dataset.patternMsg || label + ' is not in the right format.';
    }
    if (el.dataset.strong && !(value.length >= 8 && /[a-z]/.test(value) && /[A-Z]/.test(value) && /\d/.test(value))) {
      return 'Use at least 8 characters with an upper case letter, a lower case letter and a number.';
    }
    if (el.dataset.match) {
      const other = $(el.dataset.match);
      if (other && other.value !== el.value) return 'Passwords do not match.';
    }
    return '';
  }

  function paint(el, msg) {
    el.classList.toggle('border-red-500', !!msg);
    el.classList.toggle('border-slate-300', !msg);
    el.setAttribute('aria-invalid', msg ? 'true' : 'false');
    const err = document.getElementById(el.id + '-error');
    if (err) {
      err.textContent = msg;
      err.classList.toggle('hidden', !msg);
    }
  }

  function fieldsOf(form) {
    return $$('input, select, textarea', form).filter(
      (el) => el.id && !['hidden', 'submit', 'button'].includes(el.type) && el.name !== '_gotcha'
    );
  }

  function validateForm(form) {
    let first = null;
    fieldsOf(form).forEach((el) => {
      const msg = messageFor(el);
      paint(el, msg);
      if (msg && !first) first = el;
    });
    if (first) first.focus();
    return !first;
  }

  function clearErrors(form) {
    fieldsOf(form).forEach((el) => paint(el, ''));
  }

  // Live validation once a field has been visited
  $$('form[novalidate]').forEach((form) => {
    fieldsOf(form).forEach((el) => {
      el.addEventListener('blur', () => { el.dataset.touched = '1'; paint(el, messageFor(el)); });
      const live = () => { if (el.dataset.touched) paint(el, messageFor(el)); };
      el.addEventListener('input', live);
      el.addEventListener('change', live);
    });
  });

  // Confirm-password re-check when the first password changes
  const pw = $('#su-password'), pw2 = $('#su-confirm');
  if (pw && pw2) pw.addEventListener('input', () => { if (pw2.dataset.touched) paint(pw2, messageFor(pw2)); });

  /* ---------- Show / hide password ---------- */
  $$('[data-toggle-password]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const input = $(btn.dataset.togglePassword);
      const show = input.type === 'password';
      input.type = show ? 'text' : 'password';
      btn.textContent = show ? 'Hide' : 'Show';
      btn.setAttribute('aria-pressed', String(show));
    });
  });

  /* ---------- Password strength meter (sign up) ---------- */
  const bars = $$('[data-strength-bar]');
  const strengthLabel = $('#su-strength-label');
  if (pw && bars.length) {
    const colors = ['#ef4444', '#f97316', '#eab308', '#16a34a'];
    const names = ['Weak', 'Fair', 'Good', 'Strong'];
    pw.addEventListener('input', () => {
      const v = pw.value;
      let score = 0;
      if (v.length >= 8) score++;
      if (/[a-z]/.test(v) && /[A-Z]/.test(v)) score++;
      if (/\d/.test(v)) score++;
      if (/[^A-Za-z0-9]/.test(v) || v.length >= 12) score++;
      const filled = v ? Math.max(score, 1) : 0;
      bars.forEach((b, i) => { b.style.backgroundColor = i < filled ? colors[filled - 1] : ''; });
      if (strengthLabel) {
        strengthLabel.textContent = v ? 'Password strength: ' + names[filled - 1] : 'Use upper and lower case letters and a number.';
      }
    });
  }

  /* ---------- Contact form -> Formspree ---------- */
  const contactForm = $('#contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const box = $('#contact-alert');
      if (!validateForm(contactForm)) return;

      if (contactForm.getAttribute('action').includes('YOUR_FORM_ID')) {
        showAlert(box, 'error', 'Formspree is not connected yet.', 'Replace YOUR_FORM_ID in the form action with your own Formspree form ID (see the README).');
        return;
      }

      const btn = $('#contact-submit');
      const label = btn.textContent;
      btn.disabled = true;
      btn.textContent = 'Sending...';
      try {
        const res = await fetch(contactForm.action, {
          method: 'POST',
          body: new FormData(contactForm),
          headers: { Accept: 'application/json' },
        });
        if (res.ok) {
          showAlert(box, 'success', 'Message sent.', "Thanks, we'll reply within one working day.");
          contactForm.reset();
          $$('input, select, textarea', contactForm).forEach((el) => delete el.dataset.touched);
          clearErrors(contactForm);
        } else {
          const data = await res.json().catch(() => ({}));
          const detail = data.errors ? data.errors.map((x) => x.message).join(', ') : 'Please try again in a moment.';
          showAlert(box, 'error', 'Message not sent.', detail);
        }
      } catch (err) {
        showAlert(box, 'error', 'Message not sent.', 'Check your connection and try again.');
      } finally {
        btn.disabled = false;
        btn.textContent = label;
      }
    });
  }

  /* ---------- Sign up (front-end demo, no server) ---------- */
  const signupForm = $('#signup-form');
  if (signupForm) {
    signupForm.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!validateForm(signupForm)) return;
      showAlert($('#signup-alert'), 'success', 'Account created.', 'Taking you to Sign In...');
      setTimeout(() => { window.location.href = 'signin.html'; }, 1500);
    });
  }

  /* ---------- Sign in (front-end demo, no server) ---------- */
  const signinForm = $('#signin-form');
  if (signinForm) {
    signinForm.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!validateForm(signinForm)) return;
      showAlert($('#signin-alert'), 'success', 'Signed in.', 'This is a front-end demo, so no account data is stored.');
    });
  }

  const forgotForm = $('#forgot-form');
  if (forgotForm) {
    forgotForm.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!validateForm(forgotForm)) return;
      showAlert($('#forgot-alert'), 'success', 'Check your inbox.', 'If that email has an account, a reset link is on its way.');
    });
  }

  /* ---------- Newsletter ---------- */
  const newsForm = $('#newsletter-form');
  if (newsForm) {
    newsForm.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!validateForm(newsForm)) return;
      showAlert($('#newsletter-alert'), 'success', "You're on the list.", 'Your first trip idea arrives next week.');
      newsForm.reset();
      $$('input', newsForm).forEach((el) => delete el.dataset.touched);
    });
  }

  /* ---------- Home: planner preview (runs entirely in the browser) ---------- */
  const plannerForm = $('#planner-form');
  if (plannerForm) {
    const out = $('#planner-output');
    const daysInput = $('#planner-days');
    const daysOut = $('#planner-days-out');
    const destInput = $('#planner-dest');

    daysInput.addEventListener('input', () => { daysOut.textContent = daysInput.value + ' days'; });

    // "Plan this trip" links on the destination cards fill in the form
    $$('[data-plan-dest]').forEach((link) => {
      link.addEventListener('click', () => {
        destInput.value = link.dataset.planDest;
        delete destInput.dataset.touched;
        paint(destInput, '');
      });
    });

    // [slot, text] where slot 0 = morning, 1 = midday, 2 = afternoon, 3 = evening
    const POOLS = {
      food: [
        [0, 'Breakfast at a busy neighborhood bakery'],
        [1, 'Market lunch built around local specialties'],
        [2, 'Guided tasting of regional dishes'],
        [2, 'Street-food walk between two districts'],
        [3, 'Long dinner at a restaurant locals actually book'],
      ],
      culture: [
        [0, 'Main history museum, before the tour groups arrive'],
        [1, 'Walk the old town and its landmark squares'],
        [2, 'Local gallery or artist quarter'],
        [2, 'Guided tour of one landmark instead of five'],
        [3, 'Evening concert or cultural show'],
      ],
      outdoors: [
        [0, 'Early walk to the best viewpoint'],
        [1, 'Picnic in the largest city park'],
        [2, 'Half-day trail or coastal path'],
        [2, 'Bike or boat outing'],
        [3, 'Twilight stroll along the water or main promenade'],
      ],
      nightlife: [
        [3, 'Drinks at a rooftop or waterfront bar'],
        [3, 'Live music venue after dinner'],
        [3, 'Late-night snack crawl'],
        [3, 'Locals-only bar recommended by your host'],
      ],
      slow: [
        [0, 'Slow cafe morning with nothing planned'],
        [1, 'Long, unhurried lunch'],
        [2, 'Rest window back at your stay'],
        [3, 'Free evening to wander wherever you like'],
      ],
    };
    const TIMES = ['09:30', '13:00', '16:30', '20:00'];
    const THEMES = ['Get your bearings', 'Go deep on the highlights', 'Follow your curiosity', 'Take it slow', 'Local favorites', 'Hidden corners', 'Best of the trip', 'Last look around'];
    const DAILY = { budget: 70, comfort: 140, treat: 300 };

    // Pick an activity that fits the time slot, preferring chosen interests and unused ideas
    function pick(keys, d, s, used) {
      const others = Object.keys(POOLS).filter((k) => keys.indexOf(k) === -1);
      const rotated = keys.map((_k, i) => keys[(d + s + i) % keys.length]);
      const attempts = [[rotated, true], [rotated, false], [others, true], [others, false]];
      for (const [list, freshOnly] of attempts) {
        for (const k of list) {
          const options = POOLS[k].filter((x) => x[0] === s && (!freshOnly || !used.has(x[1])));
          if (options.length) {
            const text = options[d % options.length][1];
            used.add(text);
            return text;
          }
        }
      }
      return 'Free time to explore';
    }

    function buildPlan(dest, days, tier, interests) {
      const keys = interests.length ? interests : ['food', 'culture'];
      const used = new Set();
      const plan = [];
      for (let d = 0; d < days; d++) {
        const slots = d === days - 1 ? 3 : 4;
        const items = [];
        for (let s = 0; s < slots; s++) items.push({ time: TIMES[s], text: pick(keys, d, s, used) });
        plan.push({ theme: THEMES[d % THEMES.length], items: items });
      }
      // small deterministic variation so days don't all cost exactly the same
      const total = plan.reduce((sum, _day, i) => sum + DAILY[tier] + (i % 3) * 8, 0);
      return { plan: plan, total: total };
    }

    function render(dest, days, tier, interests) {
      const result = buildPlan(dest, days, tier, interests);
      const tierName = { budget: 'Shoestring', comfort: 'Comfortable', treat: 'Treat yourself' }[tier];
      let html =
        '<div class="flex flex-wrap items-center gap-2 pb-4 mb-4 border-b border-slate-200">' +
        '<h3 class="mr-2 font-display text-2xl font-bold text-ink">' + days + ' days in ' + escapeHtml(dest) + '</h3>' +
        '<span class="px-2.5 py-0.5 text-xs font-semibold text-emerald-800 bg-emerald-100 rounded">About $' + result.total.toLocaleString('en-US') + ' total</span>' +
        '<span class="px-2.5 py-0.5 text-xs font-semibold text-brand-800 bg-brand-100 rounded">' + tierName + '</span></div>' +
        '<div class="space-y-6">';
      result.plan.forEach((day, i) => {
        html += '<section><h4 class="mb-2 font-display text-lg font-semibold text-ink">Day ' + (i + 1) + ': ' + day.theme + '</h4><ul class="space-y-2 text-sm">';
        day.items.forEach((it) => {
          html += '<li class="flex gap-3"><span class="w-12 font-semibold shrink-0 text-brand-700">' + it.time + '</span><span>' + escapeHtml(it.text) + '</span></li>';
        });
        html += '</ul></section>';
      });
      html += '</div><p class="mt-6 text-xs text-slate-500">Sample plan for demonstration. Prices and opening times are not live yet.</p>';
      out.innerHTML = html;
    }

    plannerForm.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!validateForm(plannerForm)) return;
      const interests = $$('input[name="interest"]:checked', plannerForm).map((c) => c.value);
      const dest = destInput.value.trim();
      out.innerHTML =
        '<div class="flex items-center gap-3 text-slate-600" role="status">' +
        '<svg class="w-5 h-5 animate-spin text-brand-600" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-opacity=".25" stroke-width="3"/><path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" stroke-width="3" stroke-linecap="round"/></svg>' +
        'Planning your days in ' + escapeHtml(dest) + '...</div>';
      setTimeout(() => render(dest, Number(daysInput.value), $('#planner-budget').value, interests), 900);
    });
  }
})();
