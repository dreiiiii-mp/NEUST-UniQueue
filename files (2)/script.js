function byId(id) {
  return document.getElementById(id);
}

function initScrollHeader() {
  var header = document.querySelector(".topnav");
  if (!header) return;
  var updateHeader = function () {
    header.classList.toggle("is-scrolled", window.scrollY > 80);
  };
  window.addEventListener("scroll", updateHeader, { passive: true });
  updateHeader();
}

function initFeatureTabs() {
  var tabs = document.querySelectorAll(".feature-tab");
  if (!tabs.length) return;
  tabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      var target = tab.getAttribute("data-target");
      document.querySelectorAll(".feature-tab").forEach(function (t) {
        t.classList.remove("active");
      });
      document.querySelectorAll(".feature-panel").forEach(function (p) {
        p.classList.remove("active");
      });
      tab.classList.add("active");
      byId(target).classList.add("active");
    });
  });
}

function initTabLinks() {
  document.querySelectorAll('a[href="#campus-life"]').forEach(function (a) {
    a.addEventListener("click", function (e) {
      e.preventDefault();
      var tab = document.querySelector('[data-target="panel-campus"]');
      if (tab) tab.click();
      byId("admissions").scrollIntoView({ behavior: "smooth" });
    });
  });
}

function initLiveQueue() {
  var els = document.querySelectorAll("[data-queue-now]");
  if (!els.length) return;
  var current = parseInt(els[0].textContent, 10) || 47;
  setInterval(function () {
    current += 1;
    els.forEach(function (el) {
      el.textContent = String(current).padStart(3, "0");
    });
  }, 15000);
}

function validateField(input, message) {
  var field = input.closest(".field");
  if (!input.value.trim()) {
    field.classList.add("has-error");
    field.querySelector(".error-msg").textContent = message;
    return false;
  }
  field.classList.remove("has-error");
  return true;
}

function initLoginForm() {
  var form = byId("loginForm");
  if (!form) return;
  var idInput = byId("studentId");
  var passInput = byId("studentPass");

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var idOk = validateField(idInput, "Enter your student ID number.");
    var idPattern = /^SUM\d{4}-\d{5}$/i;
    if (idOk && !idPattern.test(idInput.value.trim())) {
      idInput.closest(".field").classList.add("has-error");
      idInput.closest(".field").querySelector(".error-msg").textContent =
        "Use the format SUM2025-00001.";
      idOk = false;
    }
    var passOk = validateField(passInput, "Enter your password.");
    if (idOk && passOk) {
      window.location.href = "dashboard.html";
    }
  });
}

function initFeedbackForm() {
  var form = byId("feedbackForm");
  if (!form) return;
  var messageInput = byId("feedbackMessage");
  var messageField = messageInput.closest(".field");
  var messageError = byId("feedbackMessageError");

  messageInput.addEventListener("input", function () {
    if (messageInput.value.trim()) {
      messageField.classList.remove("has-error");
      messageError.textContent = "";
    }
  });

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    var name = byId("feedbackName").value.trim();
    var email = byId("feedbackEmail").value.trim();
    var topic = byId("feedbackTopic").value;
    var message = messageInput.value.trim();
    var status = byId("feedbackStatus");

    if (!message) {
      messageField.classList.add("has-error");
      messageError.textContent = "Please enter your feedback before submitting.";
      status.textContent = "";
      messageInput.focus();
      return;
    }

    messageField.classList.remove("has-error");
    messageError.textContent = "";
    var body = [
      "Feedback topic: " + topic,
      "Name: " + (name || "Not provided"),
      "Reply email: " + (email || "Not provided"),
      "",
      message,
    ].join("\n");
    var mailto =
      "mailto:registrar@neust.edu.ph?subject=" +
      encodeURIComponent("NEUST UniQueue feedback") +
      "&body=" +
      encodeURIComponent(body);
    var link = document.createElement("a");

    link.href = mailto;
    link.textContent = "Open prefilled email draft";
    status.textContent =
      "Your feedback is ready in an email draft. It has not been sent yet.";
    status.appendChild(document.createElement("br"));
    status.appendChild(link);
  });
}

var dashTitles = {
  viewProfile: "Profile",
  viewId: "School ID",
  viewRequest: "Request Document",
  viewSchedule: "Schedule Calendar",
  viewReceipts: "Receipts",
};

function initDashboardNav() {
  var buttons = document.querySelectorAll(".dash-nav button");
  if (!buttons.length) return;
  var side = document.querySelector(".dash-side");
  var menuToggle = byId("dashMenuToggle");

  function closeMenu() {
    if (!side || !menuToggle) return;
    side.classList.remove("menu-open");
    menuToggle.setAttribute("aria-expanded", "false");
  }

  if (side && menuToggle) {
    menuToggle.addEventListener("click", function () {
      var isOpen = side.classList.toggle("menu-open");
      menuToggle.setAttribute("aria-expanded", String(isOpen));
    });
    document.addEventListener("click", function (event) {
      if (!side.contains(event.target)) closeMenu();
    });
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") closeMenu();
    });
  }

  buttons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var target = btn.getAttribute("data-view");
      document.querySelectorAll(".dash-nav button").forEach(function (b) {
        b.classList.remove("active");
      });
      document.querySelectorAll(".dash-view").forEach(function (v) {
        v.classList.remove("active");
      });
      btn.classList.add("active");
      byId(target).classList.add("active");
      closeMenu();
      if (byId("dashTitle") && dashTitles[target])
        byId("dashTitle").textContent = dashTitles[target];
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  });
}

var requestState = {
  document: null,
  fee: 0,
  processing: "",
  date: null,
  time: null,
  payment: "gcash",
};

function initDocumentPicker() {
  var buttons = document.querySelectorAll("[data-doc-select]");
  if (!buttons.length) return;
  buttons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      requestState.document = btn.getAttribute("data-doc-name");
      requestState.fee = parseFloat(btn.getAttribute("data-doc-fee"));
      requestState.processing = btn.getAttribute("data-doc-processing");
      goToStep(2);
    });
  });
}

function goToStep(stepNumber) {
  document.querySelectorAll(".request-step").forEach(function (step) {
    step.classList.remove("active");
  });
  byId("reqStep" + stepNumber).classList.add("active");

  document.querySelectorAll(".stepper .step").forEach(function (step, index) {
    step.classList.remove("current", "done");
    if (index + 1 < stepNumber) step.classList.add("done");
    if (index + 1 === stepNumber) step.classList.add("current");
  });

  if (stepNumber === 2) renderScheduleSummary();
  if (stepNumber === 3) renderPaymentSummary();
}

function renderScheduleSummary() {
  var box = byId("scheduleDocSummary");
  if (!box) return;
  box.innerHTML =
    '<div class="flex-between"><strong>' +
    requestState.document +
    "</strong>" +
    "<span>\u20B1" +
    requestState.fee.toFixed(2) +
    "</span></div>";
}

function initDateTimePicker() {
  var dateCards = document.querySelectorAll("[data-slot-date]");
  var timeCards = document.querySelectorAll("[data-slot-time]");
  if (!dateCards.length) return;

  dateCards.forEach(function (card) {
    card.addEventListener("click", function () {
      if (card.classList.contains("full")) return;
      dateCards.forEach(function (c) {
        c.classList.remove("selected");
      });
      card.classList.add("selected");
      requestState.date = card.getAttribute("data-slot-date");
    });
  });

  timeCards.forEach(function (card) {
    card.addEventListener("click", function () {
      timeCards.forEach(function (c) {
        c.classList.remove("selected");
      });
      card.classList.add("selected");
      requestState.time = card.getAttribute("data-slot-time");
    });
  });

  var continueBtn = byId("toPaymentBtn");
  if (continueBtn) {
    continueBtn.addEventListener("click", function () {
      if (!requestState.date || !requestState.time) {
        byId("scheduleWarning").style.display = "block";
        return;
      }
      byId("scheduleWarning").style.display = "none";
      goToStep(3);
    });
  }
}

function renderPaymentSummary() {
  byId("paySummaryDoc").textContent = requestState.document;
  byId("paySummaryFee").textContent = "\u20B1" + requestState.fee.toFixed(2);
  byId("paySummaryTotal").textContent = "\u20B1" + requestState.fee.toFixed(2);
  byId("paySummaryWhen").textContent =
    requestState.date + " \u00B7 " + requestState.time;
}

function initPaymentMethods() {
  var methods = document.querySelectorAll("[data-pay-method]");
  if (!methods.length) return;
  methods.forEach(function (method) {
    method.addEventListener("click", function () {
      methods.forEach(function (m) {
        m.classList.remove("selected");
      });
      method.classList.add("selected");
      requestState.payment = method.getAttribute("data-pay-method");
      byId("gcashPanel").style.display =
        requestState.payment === "cash" ? "none" : "block";
    });
  });
}

function generateQueueNumber() {
  var base = 60 + Math.floor(Math.random() * 30);
  return String(base).padStart(3, "0");
}

function initConfirmPayment() {
  var confirmBtn = byId("confirmPaymentBtn");
  if (!confirmBtn) return;
  confirmBtn.addEventListener("click", function () {
    var refInput = byId("referenceNumber");
    if (requestState.payment !== "cash") {
      var refPattern = /^\d{13}$/;
      if (!refPattern.test(refInput.value.trim())) {
        refInput.closest(".field").classList.add("has-error");
        return;
      }
      refInput.closest(".field").classList.remove("has-error");
    }
    var qnum = generateQueueNumber();
    byId("finalQueueNumber").textContent = qnum;
    byId("finalDocName").textContent = requestState.document;
    byId("finalPickup").textContent =
      requestState.date + ", " + requestState.time;
    goToStep(4);
  });
}

function initResetRequest() {
  var resetBtn = byId("newRequestBtn");
  if (!resetBtn) return;
  resetBtn.addEventListener("click", function () {
    requestState = {
      document: null,
      fee: 0,
      processing: "",
      date: null,
      time: null,
      payment: "gcash",
    };
    document
      .querySelectorAll(
        ".slot-card.selected, .time-card.selected, .pay-method.selected",
      )
      .forEach(function (el) {
        el.classList.remove("selected");
      });
    var gcashDefault = document.querySelector('[data-pay-method="gcash"]');
    if (gcashDefault) gcashDefault.classList.add("selected");
    var gcashPanel = byId("gcashPanel");
    if (gcashPanel) gcashPanel.style.display = "block";
    goToStep(1);
  });
}

var scheduleData = {
  Mon: { total: 28, slots: [4, 6, 2, 5, 7, 3, 1] },
  Tue: { total: 42, slots: [7, 9, 5, 8, 6, 4, 3] },
  Wed: { total: 55, slots: [9, 10, 8, 7, 11, 6, 4] },
  Thu: { total: 13, slots: [2, 1, 3, 2, 2, 2, 1] },
  Fri: { total: 32, slots: [5, 6, 4, 6, 5, 4, 2] },
};
var slotLabels = [
  "08:00 AM",
  "09:00 AM",
  "10:00 AM",
  "11:00 AM",
  "01:00 PM",
  "02:00 PM",
  "03:00 PM",
];

function levelForCount(count) {
  if (count >= 9) return { css: "bar-high", text: "High" };
  if (count >= 5) return { css: "bar-mod", text: "Moderate" };
  return { css: "bar-low", text: "Low" };
}

function renderScheduleDay(day) {
  var data = scheduleData[day];
  var container = byId("scheduleBars");
  if (!container) return;
  container.innerHTML = "";
  var max = 12;
  data.slots.forEach(function (count, index) {
    var level = levelForCount(count);
    var row = document.createElement("div");
    row.className = "bar-row";
    row.innerHTML =
      "<span>" +
      slotLabels[index] +
      "</span>" +
      '<div class="bar-track"><div class="bar-fill ' +
      level.css +
      '" style="width:' +
      Math.min(100, (count / max) * 100) +
      '%"></div></div>' +
      "<span>" +
      count +
      "</span>";
    container.appendChild(row);
  });
  byId("scheduleDayLabel").textContent = day;
}

function initScheduleCalendar() {
  var dayCards = document.querySelectorAll("[data-cal-day]");
  if (!dayCards.length) return;
  dayCards.forEach(function (card) {
    card.addEventListener("click", function () {
      dayCards.forEach(function (c) {
        c.classList.remove("selected");
      });
      card.classList.add("selected");
      renderScheduleDay(card.getAttribute("data-cal-day"));
    });
  });
  renderScheduleDay("Mon");
}

function initReceiptSort() {
  var headers = document.querySelectorAll("#receiptsTable th.sortable");
  if (!headers.length) return;
  headers.forEach(function (header) {
    header.addEventListener("click", function () {
      var table = byId("receiptsTable");
      var tbody = table.querySelector("tbody");
      var rows = Array.prototype.slice.call(tbody.querySelectorAll("tr"));
      var key = header.getAttribute("data-sort-key");
      var columnIndex = Array.prototype.indexOf.call(
        header.parentElement.children,
        header,
      );
      var ascending = header.getAttribute("data-order") !== "asc";

      rows.sort(function (a, b) {
        var aVal =
          a.children[columnIndex].getAttribute("data-value") ||
          a.children[columnIndex].textContent;
        var bVal =
          b.children[columnIndex].getAttribute("data-value") ||
          b.children[columnIndex].textContent;
        if (key === "amount") {
          aVal = parseFloat(aVal);
          bVal = parseFloat(bVal);
        }
        if (aVal < bVal) return ascending ? -1 : 1;
        if (aVal > bVal) return ascending ? 1 : -1;
        return 0;
      });

      headers.forEach(function (h) {
        h.removeAttribute("data-order");
      });
      header.setAttribute("data-order", ascending ? "asc" : "desc");
      rows.forEach(function (row) {
        tbody.appendChild(row);
      });
    });
  });
}

var kioskState = { document: null, fee: 0 };

function initKiosk() {
  var docButtons = document.querySelectorAll("[data-kiosk-doc]");
  if (!docButtons.length) return;
  docButtons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      docButtons.forEach(function (b) {
        b.classList.remove("selected");
      });
      btn.classList.add("selected");
      kioskState.document = btn.getAttribute("data-kiosk-name");
      kioskState.fee = btn.getAttribute("data-kiosk-fee");
      byId("kioskContinue").disabled = false;
    });
  });

  byId("kioskContinue").addEventListener("click", function () {
    if (!kioskState.document) return;
    byId("kioskView1").classList.remove("active");
    byId("kioskView2").classList.add("active");
    byId("kioskSelectedDoc").textContent = kioskState.document;
    byId("kioskSelectedFee").textContent = "\u20B1" + kioskState.fee;
  });

  byId("kioskConfirm").addEventListener("click", function () {
    var qnum = generateQueueNumber();
    byId("kioskQueueNumber").textContent = qnum;
    byId("kioskView2").classList.remove("active");
    byId("kioskView3").classList.add("active");
  });

  byId("kioskRestart").addEventListener("click", function () {
    kioskState = { document: null, fee: 0 };
    docButtons.forEach(function (b) {
      b.classList.remove("selected");
    });
    byId("kioskContinue").disabled = true;
    byId("kioskView3").classList.remove("active");
    byId("kioskView1").classList.add("active");
  });
}

document.addEventListener("DOMContentLoaded", function () {
  initScrollHeader();
  initFeatureTabs();
  initTabLinks();
  initLiveQueue();
  initLoginForm();
  initFeedbackForm();
  initDashboardNav();
  initDocumentPicker();
  initDateTimePicker();
  initPaymentMethods();
  initConfirmPayment();
  initResetRequest();
  initScheduleCalendar();
  initReceiptSort();
  initKiosk();
});
