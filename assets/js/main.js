/* ==========================================================================
   Cup of Coffee Korean — main.js
   - Sticky header state & mobile navigation
   - Romanization show / hide toggle (persisted)
   - Korean pronunciation playback (Web Speech API, 1.0x / 0.8x)
   - 3-question mini quizzes with instant grading
   - Newsletter sign-up: posts the email to the Kit form, handles loading, success and failure
   - Scroll reveal
   ========================================================================== */
(function () {
  "use strict";

  var STORAGE_KEY = "cok-roman-hidden";

  /* Live integrations. Keep in sync with site_build/lib.py. */
  var KIT_ENDPOINT = "https://app.kit.com/forms/9209507/subscriptions";
  var GUMROAD = "https://coffeekorean.gumroad.com/l/newsletter";
  var LANDING = "https://cup-of-coffee-korean.netlify.app";
  var INSTAGRAM = "https://www.instagram.com/cupofcoffee_korean/";

  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }

  /* ---------------------------------------------------------------- 1. Header */
  function initHeader() {
    var header = $(".site-header");
    if (header) {
      var onScroll = function () {
        header.classList.toggle("is-stuck", window.scrollY > 8);
      };
      onScroll();
      window.addEventListener("scroll", onScroll, { passive: true });
    }

    var toggle = $(".nav-toggle");
    var nav = $("#site-nav");
    if (toggle && nav) {
      toggle.addEventListener("click", function () {
        var open = toggle.getAttribute("aria-expanded") === "true";
        toggle.setAttribute("aria-expanded", String(!open));
        nav.classList.toggle("is-open", !open);
      });
      nav.addEventListener("click", function (e) {
        if (e.target.closest("a")) {
          nav.classList.remove("is-open");
          toggle.setAttribute("aria-expanded", "false");
        }
      });
      window.addEventListener("keydown", function (e) {
        if (e.key === "Escape" && nav.classList.contains("is-open")) {
          nav.classList.remove("is-open");
          toggle.setAttribute("aria-expanded", "false");
          toggle.focus();
        }
      });
    }
  }

  /* ------------------------------------------------- 2. Romanization toggle */
  function initRomanization() {
    var buttons = $$("[data-roman-toggle]");
    if (!buttons.length) return;

    var hidden = false;
    try { hidden = window.localStorage.getItem(STORAGE_KEY) === "1"; } catch (err) { hidden = false; }

    function apply(isHidden) {
      document.body.classList.toggle("roman-hidden", isHidden);
      buttons.forEach(function (btn) {
        btn.setAttribute("aria-pressed", String(isHidden));
        var label = btn.querySelector("[data-roman-label]");
        if (label) {
          label.textContent = isHidden ? "Show romanization" : "Hide romanization";
        } else {
          btn.textContent = isHidden ? "Show romanization" : "Hide romanization";
        }
      });
    }

    apply(hidden);

    buttons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        hidden = !document.body.classList.contains("roman-hidden");
        apply(hidden);
        try { window.localStorage.setItem(STORAGE_KEY, hidden ? "1" : "0"); } catch (err) { /* private mode */ }
      });
    });
  }

  /* ------------------------------------------------------- 3. Pronunciation */
  var speech = {
    supported: typeof window.speechSynthesis !== "undefined" && typeof window.SpeechSynthesisUtterance !== "undefined",
    rate: 1.0,
    voice: null,
    voicesReady: false
  };

  function pickKoreanVoice() {
    if (!speech.supported) return null;
    var voices = window.speechSynthesis.getVoices() || [];
    if (!voices.length) return null;
    var ko = voices.filter(function (v) { return /^ko([-_]|$)/i.test(v.lang || ""); });
    if (!ko.length) return null;
    var preferred = ko.find(function (v) { return /Yuna|Sora|Korean|Google/i.test(v.name || ""); });
    return preferred || ko[0];
  }

  function showSpeechNotice(message) {
    var host = $("[data-tts-status]");
    if (!host) {
      var bar = $(".reader-bar");
      if (!bar) return;
      host = document.createElement("p");
      host.setAttribute("data-tts-status", "");
      host.className = "no-js-note";
      host.style.margin = "10px 0 0";
      host.style.fontSize = "0.82rem";
      bar.insertAdjacentElement("afterend", host);
    }
    host.textContent = message;
    host.hidden = false;
  }

  function stopSpeaking() {
    if (!speech.supported) return;
    try { window.speechSynthesis.cancel(); } catch (err) { /* noop */ }
    $$(".is-playing").forEach(function (el) { el.classList.remove("is-playing"); });
  }

  function speak(text, trigger) {
    if (!text) return;
    if (!speech.supported) {
      showSpeechNotice("Your browser does not support speech playback. Try Chrome, Edge, or Safari on desktop, or the latest Chrome on Android.");
      return;
    }

    var wasPlaying = trigger && trigger.classList.contains("is-playing");
    stopSpeaking();
    if (wasPlaying) return;

    var utter = new window.SpeechSynthesisUtterance(text);
    utter.lang = "ko-KR";
    utter.rate = speech.rate;
    utter.pitch = 1;

    var voice = speech.voice || pickKoreanVoice();
    if (voice) {
      speech.voice = voice;
      utter.voice = voice;
    }

    utter.onstart = function () {
      if (trigger) trigger.classList.add("is-playing");
      if (trigger) trigger.setAttribute("aria-pressed", "true");
    };
    utter.onend = function () {
      if (trigger) { trigger.classList.remove("is-playing"); trigger.setAttribute("aria-pressed", "false"); }
    };
    utter.onerror = function (event) {
      if (trigger) { trigger.classList.remove("is-playing"); trigger.setAttribute("aria-pressed", "false"); }
      if (event && (event.error === "not-allowed" || event.error === "synthesis-failed")) {
        showSpeechNotice("Playback was blocked by the browser. Press the speaker again, or check that your device has a Korean voice installed (System settings → Accessibility → Spoken content).");
      }
    };

    try {
      window.speechSynthesis.speak(utter);
    } catch (err) {
      showSpeechNotice("Playback is unavailable right now. If you are on iOS, add a Korean keyboard or voice under Settings → Accessibility → Spoken Content.");
    }

    if (!voice) {
      showSpeechNotice("No Korean voice was found on this device, so the browser will use its default voice. For accurate sounds, install a Korean voice in your system settings (iOS: Settings → Accessibility → Spoken Content → Voices → Korean).");
    }
  }

  function textForTrigger(el) {
    var explicit = el.getAttribute("data-say");
    if (explicit) return explicit;
    var card = el.closest(".phrase");
    if (card) {
      var kr = card.querySelector(".phrase__korean");
      if (kr) return kr.textContent.trim();
    }
    return "";
  }

  function initSpeech() {
    if (!speech.supported) {
      document.documentElement.classList.add("no-tts");
      return;
    }

    if (window.speechSynthesis.getVoices && window.speechSynthesis.getVoices().length) {
      speech.voice = pickKoreanVoice();
    }
    window.speechSynthesis.addEventListener("voiceschanged", function () {
      speech.voice = pickKoreanVoice();
    });

    document.addEventListener("click", function (e) {
      var trigger = e.target.closest("[data-speak], .phrase__speak, .vocab-speak");
      if (!trigger) return;
      e.preventDefault();
      speak(textForTrigger(trigger), trigger);
    });

    $$("[data-speed]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var val = parseFloat(btn.getAttribute("data-speed"));
        speech.rate = isNaN(val) ? 1 : val;
        $$("[data-speed]").forEach(function (b) {
          var active = b === btn;
          b.classList.toggle("is-active", active);
          b.setAttribute("aria-pressed", String(active));
        });
        var label = $("[data-speed-status]");
        if (label) label.textContent = speech.rate === 1 ? "Normal speed (1.0x)" : "Slow speed (0.8x)";
        stopSpeaking();
      });
    });

    $$("[data-speed]").forEach(function (b) {
      var val = parseFloat(b.getAttribute("data-speed"));
      var active = Math.abs((isNaN(val) ? 1 : val) - speech.rate) < 0.001;
      b.classList.toggle("is-active", active);
      b.setAttribute("aria-pressed", String(active));
    });

    window.addEventListener("pagehide", stopSpeaking);
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) stopSpeaking();
    });
  }

  /* --------------------------------------------------------------- 4. Quiz */
  function initQuizzes() {
    $$("[data-quiz]").forEach(function (form) {
      var questions = $$("[data-answer]", form);
      var scoreBox = $("[data-quiz-score]", form);
      var submitBtn = $("[data-quiz-submit]", form);
      var resetBtn = $("[data-quiz-reset]", form);

      function clearMarks() {
        $$(".quiz__option", form).forEach(function (opt) { opt.classList.remove("is-correct", "is-wrong"); });
        $$("[data-quiz-feedback]", form).forEach(function (fb) { fb.hidden = true; fb.textContent = ""; });
      }

      function grade() {
        var correctCount = 0;
        var answered = 0;

        questions.forEach(function (fieldset, index) {
          var answer = fieldset.getAttribute("data-answer");
          var explain = fieldset.getAttribute("data-explain") || "";
          var feedback = $("[data-quiz-feedback]", fieldset);
          var options = $$(".quiz__option", fieldset);
          var picked = $("input:checked", fieldset);

          options.forEach(function (opt) {
            var input = $("input", opt);
            opt.classList.remove("is-correct", "is-wrong");
            if (input.value === answer) opt.classList.add("is-correct");
            else if (picked && picked === input) opt.classList.add("is-wrong");
          });

          if (picked) answered += 1;
          if (picked && picked.value === answer) correctCount += 1;

          if (feedback) {
            var verdict = picked
              ? (picked.value === answer ? "Correct. " : "Not quite. ")
              : "No answer yet. ";
            feedback.innerHTML = "<strong>" + verdict + "</strong>" + explain;
            feedback.hidden = false;
          }
        });

        if (scoreBox) {
          var total = questions.length;
          var message;
          if (answered === 0) {
            message = "Pick an answer for each question, then check again.";
          } else if (correctCount === total) {
            message = "Perfect — " + correctCount + " / " + total + ". Time for a refill ☕";
          } else if (correctCount >= Math.ceil(total * 0.66)) {
            message = "Nice work — " + correctCount + " / " + total + ". Read the notes under each answer and press Check again.";
          } else {
            message = correctCount + " / " + total + ". Go back to the phrase cards above and give it another try.";
          }
          scoreBox.textContent = message;
          scoreBox.hidden = false;
        }
      }

      form.addEventListener("submit", function (e) {
        e.preventDefault();
        grade();
        if (scoreBox) scoreBox.setAttribute("role", "status");
      });

      if (resetBtn) {
        resetBtn.addEventListener("click", function () {
          form.reset();
          clearMarks();
          if (scoreBox) { scoreBox.hidden = true; scoreBox.textContent = ""; }
          if (submitBtn) submitBtn.focus();
        });
      }
    });
  }

  /* --------------------------------------------------- 5. Newsletter (Kit) */
  var MSG_EMAIL =
    "That email address doesn&rsquo;t look right &mdash; check it and press the button again.";
  var MSG_OK =
    "<strong>You&rsquo;re on the list.</strong> Check your inbox and click the confirmation link &mdash; that is what puts the sentence in your mailbox. If nothing arrives in a few minutes, look in spam and mark it &ldquo;not spam&rdquo;." +
    '<span class="form-message__extra">Want the whole morning, every morning? Daily letters with Ku&rsquo;s audio, a word-by-word breakdown and a culture note, plus the live class every two weeks &mdash; <strong>$6.99/mo or $59/yr</strong>, with 7 days free.</span>' +
    '<a class="btn btn--sm" href="' + GUMROAD + '" target="_blank" rel="noopener">Start the 7-day free trial &rarr;</a>';
  var MSG_FAIL =
    "<strong>We couldn&rsquo;t reach the mailing list just now.</strong> That is usually a short network problem, and nothing is lost &mdash; give it another try in a moment." +
    '<span class="form-message__extra">If it keeps failing, <a href="' + LANDING + '" target="_blank" rel="noopener">join on the subscription page</a>, or DM <a href="' + INSTAGRAM + '" target="_blank" rel="noopener">@cupofcoffee_korean</a> and we will add you by hand. If a confirmation email arrives anyway, you are already on the list.</span>';

  function initForms() {
    $$("[data-newsletter]").forEach(function (form) {
      var message = $("[data-form-message]", form);
      var button = $("button[type='submit']", form);
      var emailInput = $("input[type='email']", form);
      var nameInput = $("input[name='first_name']", form);
      var label = (button && (button.getAttribute("data-submit-label") || button.textContent)) || "Join the list";

      if (!message || !button || !emailInput) return;

      function show(kind, html) {
        message.className = "form-message" + (form.classList.contains("newsletter__form") ? "" : " form-message--inline") + " form-message--" + kind;
        message.innerHTML = html;
        message.hidden = false;
      }

      function busy(isBusy) {
        form.classList.toggle("is-sending", isBusy);
        form.setAttribute("aria-busy", isBusy ? "true" : "false");
        button.disabled = isBusy;
        button.textContent = isBusy ? "Sending\u2026" : label;
      }

      function done() {
        busy(false);
        form.classList.add("is-done");
      }

      form.addEventListener("submit", function (e) {
        e.preventDefault();
        if (form.getAttribute("aria-busy") === "true") return;

        var email = (emailInput.value || "").trim();
        if (!email || (emailInput.checkValidity && !emailInput.checkValidity())) {
          show("error", MSG_EMAIL);
          emailInput.focus();
          return;
        }

        var payload = { email_address: email };
        var firstName = (nameInput && nameInput.value ? nameInput.value : "").trim();
        if (firstName) payload.first_name = firstName;

        message.hidden = true;
        busy(true);

        fetch(KIT_ENDPOINT, {
          method: "POST",
          mode: "cors",
          credentials: "omit",
          headers: { "Content-Type": "application/json", "Accept": "application/json" },
          body: JSON.stringify(payload)
        }).then(function (res) {
          if (!res.ok) throw new Error("HTTP " + res.status);
          if (nameInput) nameInput.value = "";
          emailInput.value = "";
          done();
          show("ok", MSG_OK);
        }).catch(function () {
          busy(false);
          show("error", MSG_FAIL);
        });
      });
    });
  }

  /* ------------------------------------------------------- 6. Scroll reveal */
  function initReveal() {
    var items = $$(".reveal");
    if (!items.length) return;

    if (!("IntersectionObserver" in window)) {
      items.forEach(function (el) { el.classList.add("is-in"); });
      return;
    }

    document.documentElement.classList.add("js-ready");
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });

    items.forEach(function (el) { io.observe(el); });
  }

  /* ------------------------------------------------------------- 7. Footer */
  function initFooter() {
    $$("[data-year]").forEach(function (el) {
      el.textContent = String(new Date().getFullYear());
    });
  }

  /* ---------------------------------------------------------------- boot */
  function boot() {
    initHeader();
    initRomanization();
    initSpeech();
    initQuizzes();
    initForms();
    initReveal();
    initFooter();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
