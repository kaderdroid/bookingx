function openModal() {
      const modal = document.getElementById('bookingxModal');
      modal.style.display = 'block';
      setTimeout(() => modal.classList.add('open'), 10); // Trigger smooth fade after display
  }

  function closeModal() {
      const modal = document.getElementById('bookingxModal');
      modal.classList.remove('open');
      setTimeout(() => modal.style.display = 'none', 300); // Hide after fade out
  }

  // Close modal if clicking outside of it
  window.onclick = function(event) {
      const modal = document.getElementById('bookingxModal');
      if (event.target === modal) {
          closeModal();
      }
  }

  // Optional: Close on Escape key
  document.addEventListener('keydown', function(event) {
      if (event.key === 'Escape') {
          closeModal();
      }
  });

  // Attach event listener to button by ID (no inline onclick)
  document.addEventListener('DOMContentLoaded', function() {
      const openBtn = document.getElementById('openBookingModalBtn');
      if (openBtn) {
          openBtn.addEventListener('click', openModal);
      }
  });

/****
 * 
 * END POPUP
 */

// Attach event listener to button by ID (no inline onclick)
document.addEventListener('DOMContentLoaded', function() {
  const openBtn = document.getElementById('openBookingXModalBtn');
  if (openBtn) {
      openBtn.addEventListener('click', openModal);
  }
});

document.addEventListener('DOMContentLoaded', function () {
  function setupBookingX(root) {
    var scope = root || document;
    var calEl = scope.querySelector('#bx-calendar');
    if (!calEl || typeof flatpickr === 'undefined') return false;
    if (calEl.getAttribute('data-bx-init') === '1') return true;
    calEl.setAttribute('data-bx-init', '1');

    var toggleBtn = scope.querySelector('#bx-date-toggle');
    var postDate = scope.querySelector('#bx-post-date');
    var bubble = scope.querySelector('#bx-guests-bubble');
    var track = scope.querySelector('#bx-guest-track');

    var today = new Date();
    // Use date-only (midnight) to prevent selecting any past date
    var todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    function fmtShort(d) {
      var m = d.toLocaleString('en-US', { month: 'short' });
      return m + ', ' + String(d.getDate());
    }

    if (toggleBtn) toggleBtn.textContent = fmtShort(today);

    var fp = flatpickr(calEl, {
      inline: true,
      disableMobile: true,
      defaultDate: todayStart,
      minDate: todayStart,
      onChange: function (selectedDates) {
        if (!selectedDates || !selectedDates[0]) return;
        var d = selectedDates[0];
        if (toggleBtn) toggleBtn.textContent = fmtShort(d);
        // Update date range below based on new start date
        try { updateDateRange(); } catch (e) {}
        // Hide calendar and show post-date sections
        var calPanel = calEl.querySelector('.flatpickr-calendar');
        document.querySelector('.flatpickr-calendar').classList.add('bx-hidden');
        if (calPanel) calPanel.classList.add('bx-hidden');
        if (toggleBtn) toggleBtn.setAttribute('aria-expanded', 'false');
        if (postDate) postDate.classList.remove('bx-hidden');
        console.log(calEl);
      },
    });

  // Toggle calendar show/hide
  if (toggleBtn) {
    toggleBtn.addEventListener('click', function () {
      var calPanel = document.querySelector('.flatpickr-calendar');
      var isHidden = calEl.classList.contains('bx-hidden') || (calPanel && calPanel.classList.contains('bx-hidden'));
      if (isHidden) {
        calEl.classList.remove('bx-hidden');
        if (calPanel) calPanel.classList.remove('bx-hidden');
        toggleBtn.setAttribute('aria-expanded', 'true');
        if (postDate) postDate.classList.add('bx-hidden');
      } else {
        calEl.classList.add('bx-hidden');
        if (calPanel) calPanel.classList.add('bx-hidden');
        toggleBtn.setAttribute('aria-expanded', 'false');
        if (postDate) postDate.classList.remove('bx-hidden');
      }
    });
  }

  // Guests slider: draggable bubble on a track
  function clamp(n, min, max) { return Math.max(min, Math.min(max, n)); }
  function setBubbleFromPct(pct) {
    if (!bubble || !track) return;
    var min = parseInt(track.getAttribute('data-min') || '1', 10);
    var max = parseInt(track.getAttribute('data-max') || '60', 10);
    pct = clamp(pct, 0, 1);
    var val = Math.round(min + pct * (max - min));
    if (val < min) val = min;
    bubble.textContent = String(val);
    bubble.setAttribute('aria-valuenow', String(val));
    bubble.style.left = `calc(${pct * 100}% - 13px)`;
  }
  function pctFromClientX(clientX) {
    var rect = track.getBoundingClientRect();
    var x = clamp(clientX - rect.left, 0, rect.width);
    return rect.width ? x / rect.width : 0;
  }
  function startDrag(e) {
    bubble.classList.add('dragging');
    var clientX = e.touches ? e.touches[0].clientX : e.clientX;
    setBubbleFromPct(pctFromClientX(clientX));
    function move(ev) {
      var cx = ev.touches ? ev.touches[0].clientX : ev.clientX;
      setBubbleFromPct(pctFromClientX(cx));
    }
    function end() {
      bubble.classList.remove('dragging');
      document.removeEventListener('mousemove', move);
      document.removeEventListener('mouseup', end);
      document.removeEventListener('touchmove', move);
      document.removeEventListener('touchend', end);
    }
    document.addEventListener('mousemove', move);
    document.addEventListener('mouseup', end);
    document.addEventListener('touchmove', move, { passive: true });
    document.addEventListener('touchend', end);
  }
  if (track && bubble) {
    // Initialize at 6 (middle-ish)
    setBubbleFromPct((6 - parseInt(track.getAttribute('data-min') || '1', 10)) / (parseInt(track.getAttribute('data-max') || '12', 10) - parseInt(track.getAttribute('data-min') || '1', 10)));
    bubble.addEventListener('mousedown', startDrag);
    bubble.addEventListener('touchstart', startDrag, { passive: true });
    track.addEventListener('click', function (e) { setBubbleFromPct(pctFromClientX(e.clientX)); });
    // Keyboard support
    bubble.addEventListener('keydown', function (e) {
      var min = parseInt(track.getAttribute('data-min') || '1', 10);
      var max = parseInt(track.getAttribute('data-max') || '12', 10);
      var now = parseInt(bubble.getAttribute('aria-valuenow') || String(min), 10);
      if (e.key === 'ArrowRight') now = clamp(now + 1, min, max);
      if (e.key === 'ArrowLeft') now = clamp(now - 1, min, max);
      var pct = (now - min) / (max - min);
      setBubbleFromPct(pct);
    });
  }

  // ----- Duration, Dates, and Time selection logic -----
  var durationBtns = Array.prototype.slice.call(scope.querySelectorAll('.bx-duration-btn'));
  var durationContainer = scope.querySelector('.bx-duration-section') || scope.querySelector('.bx-duration-group');
  var selectBtn = scope.querySelector('#bx-select-btn');
  var timeSection = scope.querySelector('#bx-time-section');
  var timeGrid = scope.querySelector('#bx-time-grid');
  var dateRangeEl = scope.querySelector('#bx-date-range');
  var datesRow = dateRangeEl ? dateRangeEl.closest('.bx-row') : null;
  var daysMinus = scope.querySelector('#bx-days-minus');
  var daysPlus = scope.querySelector('#bx-days-plus');
  var footerAmount = scope.querySelector('.bx-amount');
  var continueBtn = scope.querySelector('.bx-continue');
  var footerDurationText = (function(){
    var d = scope.querySelector('.bx-duration');
    return d ? d.querySelector('span') : null; // first span holds the text (before caret)
  })();
  // Resolve the correct BookingX container (handles multiple instances and popups)
  var rootContainer = calEl ? calEl.closest('.bookingx-container') : (scope.querySelector('.bookingx-container') || document.querySelector('.bookingx-container'));
  var currencySymbol = (rootContainer && rootContainer.getAttribute('data-currency-symbol')) ? rootContainer.getAttribute('data-currency-symbol') : '$';

  var currentDuration = 'multi'; // '4' | '8' | 'multi'
  var daysCount = 2; // minimum 2 days: selected date + 1 day
  var selectedTimeLabel = '';

  function fmtFull(d) {
    return d.toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }
  function startDate() {
    var d = fp && fp.selectedDates && fp.selectedDates[0] ? fp.selectedDates[0] : today;
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  }
  function addDays(date, n) {
    var copy = new Date(date.getTime());
    copy.setDate(copy.getDate() + n);
    return copy;
  }
  function updateDateRange() {
    var s = startDate();
    var e = addDays(s, daysCount - 1);
    if (dateRangeEl) dateRangeEl.textContent = fmtFull(s) + ' to ' + fmtFull(e);
  }
  updateDateRange();

  function setSelectLabel() {
    if (!selectBtn) return;
    var labelLeft = currentDuration === 'multi' ? (daysCount + ' days') : (currentDuration + ' hrs');
    var time = selectedTimeLabel ? (' / ' + selectedTimeLabel) : '';
    selectBtn.textContent = selectedTimeLabel ? (labelLeft + time) : 'Select';
  }
  setSelectLabel();

  function formatNumber(val) {
    var n = parseFloat(val);
    if (isNaN(n)) return val || '';
    return n.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 });
  }
  function updateFooter(label, price) {
    if (footerAmount && price != null) footerAmount.textContent = currencySymbol + formatNumber(price);
    if (footerDurationText && label) footerDurationText.textContent = 'per ' + label;
  }
  // Initialize footer from the active or first button
  (function initFromActive(){
    var activeBtn = scope.querySelector('.bx-duration-btn.active') || durationBtns[0];
    if (activeBtn) {
      currentDuration = activeBtn.getAttribute('data-duration') || currentDuration;
      var label = (activeBtn.textContent || '').trim();
      var price = activeBtn.getAttribute('data-variation-price');
      updateFooter(label, price);
      setSelectLabel();
    }
  })();

  // Duration switching
  durationBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      durationBtns.forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      currentDuration = btn.getAttribute('data-duration');
      if (datesRow) {
        if (currentDuration === 'multi') datesRow.classList.remove('bx-hidden');
        else datesRow.classList.add('bx-hidden');
      }
      selectedTimeLabel = '';
      setSelectLabel();
      // Update footer immediately
      var label = (btn.textContent || '').trim();
      var price = btn.getAttribute('data-variation-price');
      updateFooter(label, price);
    });
  });

  // Days controls with min 2 days
  if (daysMinus) {
    daysMinus.addEventListener('click', function () {
      daysCount = Math.max(2, daysCount - 1);
      updateDateRange();
      setSelectLabel();
    });
  }
  if (daysPlus) {
    daysPlus.addEventListener('click', function () {
      daysCount = daysCount + 1;
      updateDateRange();
      setSelectLabel();
    });
  }

  function generateTimes() {
    if (!timeGrid) return;
    timeGrid.innerHTML = '';
    var startHour = 6; // 6:00 AM
    var endHour = 22;  // 10:00 PM
    for (var h = startHour; h <= endHour; h++) {
      for (var m = 0; m < 60; m += 30) {
        var dt = new Date(1970, 0, 1, h, m);
        var label = dt.toLocaleString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
        var el = document.createElement('button');
        el.type = 'button';
        el.className = 'bx-time';
        el.textContent = label;
        el.addEventListener('click', function (ev) {
          selectedTimeLabel = ev.currentTarget.textContent.replace(/\s/g, ''); // normalize spacing like 7:30AM
          if (timeSection) timeSection.classList.add('bx-hidden');
          if (durationContainer) durationContainer.classList.add('bx-hidden');
          if (datesRow) datesRow.classList.add('bx-hidden');
          setSelectLabel();
          // Enable CONTINUE button once a time has been picked
          if (continueBtn) {
            continueBtn.removeAttribute('disabled');
          }
        });
        timeGrid.appendChild(el);
      }
    }
  }

  // Show time picker when clicking Select
  if (selectBtn) {
    selectBtn.addEventListener('click', function () {
      if (timeSection && timeSection.classList.contains('bx-hidden')) {
        generateTimes();
        timeSection.classList.remove('bx-hidden');
        if (durationContainer) durationContainer.classList.remove('bx-hidden');
        if (datesRow) {
          if (currentDuration === 'multi') datesRow.classList.remove('bx-hidden');
          else datesRow.classList.add('bx-hidden');
        }
      } else if (timeSection) {
        timeSection.classList.add('bx-hidden');
        if (durationContainer) durationContainer.classList.add('bx-hidden');
        if (datesRow) datesRow.classList.add('bx-hidden');
      }
    });
  }
    return true;
  }

  // Run once on DOM ready
  setupBookingX(document);

  // Elementor Popup support: jQuery event
  if (window.jQuery) {
    window.jQuery(document).on('elementor/popup/show', function () {
      setupBookingX(document);
    });
  }
  // Elementor frontend hooks if available
  if (window.elementorFrontend && elementorFrontend.hooks && typeof elementorFrontend.hooks.addAction === 'function') {
    try {
      elementorFrontend.hooks.addAction('popup:open', function () {
        setupBookingX(document);
      });
    } catch (e) {}
  }
  // Fallback: observe DOM for injected bookingx content
  try {
    var mo = new MutationObserver(function (mutations) {
      mutations.forEach(function (m) {
        m.addedNodes.forEach(function (node) {
          if (node && node.nodeType === 1) {
            var root = node.matches && node.matches('.bookingx-container') ? node : (node.querySelector && node.querySelector('.bookingx-container'));
            if (root) setupBookingX(root);
            else if (node.querySelector && node.querySelector('#bx-calendar')) setupBookingX(node);
          }
        });
      });
    });
    mo.observe(document.body, { childList: true, subtree: true });
  } catch (e) {}
});