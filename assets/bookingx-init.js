document.addEventListener('DOMContentLoaded', function () {
  var calEl = document.querySelector('#bx-calendar');
  var toggleBtn = document.getElementById('bx-date-toggle');
  var postDate = document.getElementById('bx-post-date');
  var range = document.getElementById('bx-guests-range');
  var bubble = document.getElementById('bx-guests-bubble');
  if (!calEl || typeof flatpickr === 'undefined') return;

  var today = new Date();
  var minMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);

  function fmtShort(d) {
    var m = d.toLocaleString('en-US', { month: 'short' });
    return m + ', ' + String(d.getDate());
  }

  // Initialize toggle button text with today
  if (toggleBtn) toggleBtn.textContent = fmtShort(today);

  var fp = flatpickr(calEl, {
    inline: true,
    disableMobile: true,
    defaultDate: today,
    minDate: minMonthStart,
    onChange: function (selectedDates) {
      if (!selectedDates || !selectedDates[0]) return;
      var d = selectedDates[0];
      if (toggleBtn) toggleBtn.textContent = fmtShort(d);
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

  // Guests slider bubble update
  function updateBubble() {
    if (!range || !bubble) return;
    var val = parseInt(range.value, 10);
    bubble.textContent = String(val);
    // Position bubble relative to range width
    var min = parseInt(range.min || '1', 10);
    var max = parseInt(range.max || '12', 10);
    var pct = (val - min) / (max - min);
    bubble.style.left = `calc(${pct * 100}% - 16px)`; // offset for bubble width
  }
  if (range) {
    range.addEventListener('input', function () {
      if (parseInt(range.value, 10) < 1) range.value = 1; // min guard
      updateBubble();
    });
    updateBubble();
  }
});