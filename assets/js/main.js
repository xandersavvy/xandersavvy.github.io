/* ============================================================
   PORTFOLIO  |  main.js
   Theme · Nav · SPA sections · Intersection observer
   Terminal mini-game · Dad jokes · Scroll
   ============================================================ */
(function () {
  'use strict';

  /* ── 1. SVG ICONS (must be first — used by applyTheme) ── */
  const SVG = {
    moon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>',
    sun:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>',
    up:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"/></svg>',
  };

  /* ── 2. THEME ─────────────────────────────────────────── */
  const ROOT  = document.documentElement;
  const THEME_KEY = 'sg-theme';

  function getStoredTheme () {
    return localStorage.getItem(THEME_KEY) ||
      (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  }

  function applyTheme (t) {
    ROOT.setAttribute('data-theme', t);
    localStorage.setItem(THEME_KEY, t);
    const icon = document.getElementById('theme-icon');
    if (icon) icon.innerHTML = t === 'dark' ? SVG.sun : SVG.moon;
    document.dispatchEvent(new Event('themechange'));
  }

  function toggleTheme () {
    applyTheme(ROOT.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
  }

  applyTheme(getStoredTheme());

  /* ── 3. DOM-READY ─────────────────────────────────────── */
  document.addEventListener('DOMContentLoaded', function () {

    /* Theme button */
    const btnTheme = document.getElementById('btn-theme');
    if (btnTheme) btnTheme.addEventListener('click', toggleTheme);
    // Set initial icon
    const themeIcon = document.getElementById('theme-icon');
    if (themeIcon) themeIcon.innerHTML = getStoredTheme() === 'dark' ? SVG.sun : SVG.moon;

    /* Hamburger nav */
    const hamburger = document.getElementById('nav-hamburger');
    const drawer    = document.getElementById('nav-drawer');
    if (hamburger && drawer) {
      hamburger.addEventListener('click', function () {
        drawer.classList.toggle('open');
      });
      drawer.querySelectorAll('a').forEach(function (a) {
        a.addEventListener('click', function () { drawer.classList.remove('open'); });
      });
    }

    /* Smooth scroll for nav links */
    document.querySelectorAll('[data-scroll]').forEach(function (el) {
      el.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.getElementById(el.dataset.scroll);
        if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });

    /* ── 4. READING PROGRESS BAR ─────────────────────────── */
    const readingBar = document.getElementById('reading-bar');
    window.addEventListener('scroll', function () {
      if (!readingBar) return;
      const scrolled  = window.scrollY;
      const total     = document.body.scrollHeight - window.innerHeight;
      readingBar.style.width = (total > 0 ? (scrolled / total) * 100 : 0) + '%';
    }, { passive: true });

    /* ── 5. SCROLL-TO-TOP ─────────────────────────────────── */
    const scrollTopBtn = document.getElementById('scroll-top');
    window.addEventListener('scroll', function () {
      if (!scrollTopBtn) return;
      scrollTopBtn.classList.toggle('visible', window.scrollY > 500);
    }, { passive: true });
    if (scrollTopBtn) {
      scrollTopBtn.addEventListener('click', function () {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }

    /* ── 6. SECTION REVEAL ───────────────────────────────── */
    const sections = document.querySelectorAll('.section');
    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0, rootMargin: '0px 0px -60px 0px' });
    sections.forEach(function (s) { observer.observe(s); });

    /* ── 7. ACTIVE NAV LINK ──────────────────────────────── */
    const navLinks = document.querySelectorAll('.nav-links a, .nav-drawer a');
    const sectionIds = ['hero','about','skills','experience','projects','certs','cv','contact','tools','fun'];

    const sectionObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          navLinks.forEach(function (l) {
            l.classList.toggle('active', l.dataset.scroll === entry.target.id);
          });
        }
      });
    }, { rootMargin: '-40% 0px -55% 0px' });

    sectionIds.forEach(function (id) {
      const el = document.getElementById(id);
      if (el) sectionObserver.observe(el);
    });

    /* ── 8. DAD JOKES ────────────────────────────────────── */
    const jokeText = document.getElementById('joke-text');
    const jokeBtn  = document.getElementById('joke-btn');

    async function fetchJoke () {
      if (jokeText) jokeText.textContent = 'Fetching a fresh one…';
      try {
        const r    = await fetch('https://official-joke-api.appspot.com/random_joke');
        const data = await r.json();
        if (jokeText) jokeText.textContent = data.setup + ' — ' + data.punchline;
      } catch (_) {
        if (jokeText) jokeText.textContent = 'Why do programmers prefer dark mode? Because light attracts bugs. 🐛';
      }
    }

    fetchJoke();
    if (jokeBtn) jokeBtn.addEventListener('click', fetchJoke);

    /* ── 9. TERMINAL GAME ────────────────────────────────── */
    initTerminal();

    /* ── 10. SECRET RICK-ROLL ────────────────────────────── */
    document.addEventListener('keydown', function (e) {
      if (e.ctrlKey && e.key === 'c' && window.getSelection().toString() === '') {
        window.open('https://youtu.be/zL19uMsnpSU', '_blank', 'noopener');
      }
    });

    /* ── Photo click-swap ────────────────────────────────── */
    var photoBox = document.querySelector('.about-photo');
    if (photoBox) {
      photoBox.addEventListener('click', function () {
        photoBox.classList.toggle('swapped');
      });
    }

    /* ── Project card click-to-flip ──────────────────────── */
    document.querySelectorAll('.project-card').forEach(function (card) {
      function flipCard(e) {
        /* Don't flip when clicking a link on the back face */
        if (e.target.closest('a')) return;
        card.classList.toggle('flipped');
      }
      card.addEventListener('click', flipCard);
      card.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); flipCard(e); }
      });
    });

    /* ── 11. SCROLL-TRIGGERED HERO PARALLAX ──────────────── */
    /* subtle translateY only — no opacity fade so content stays visible */
    const heroLayout = document.querySelector('.hero-layout');
    window.addEventListener('scroll', function () {
      if (!heroLayout) return;
      const y = window.scrollY;
      heroLayout.style.transform = 'translateY(' + (y * 0.06) + 'px)';
    }, { passive: true });

  }); // end DOMContentLoaded

  /* ── TERMINAL ──────────────────────────────────────────── */
  function initTerminal () {
    const body  = document.getElementById('terminal-output');
    const input = document.getElementById('terminal-input');
    if (!body || !input) return;

    /* Print a line with a given CSS class */
    function print (text, cls) {
      const p = document.createElement('p');
      p.className = cls || 'output';
      p.textContent = text;
      body.appendChild(p);
      body.scrollTop = body.scrollHeight;
    }

    /* Print array of [text, cls] pairs */
    function printLines (lines) {
      lines.forEach(function (l) { print(l[0], l[1]); });
      body.scrollTop = body.scrollHeight;
    }

    /* Echo the typed command in green */
    function echo (cmd) {
      print('➜  ' + cmd, 'prompt');
    }

    /* Clear */
    function clearBody () {
      body.innerHTML = '';
    }

    /* ── Commands ─────────────────────────────────────────── */
    var COMMANDS = {
      help: function () {
        printLines([
          ['─────────────────────────────────', 'divider'],
          ['  whoami     who is Souvik?',        'info'],
          ['  skills     tech stack',            'info'],
          ['  exp        work experience',       'info'],
          ['  projects   notable projects',      'info'],
          ['  contact    how to reach me',       'info'],
          ['  joke       :)',                    'info'],
          ['  hire       most important cmd',    'warn'],
          ['  clear      clear terminal',        'info'],
          ['─────────────────────────────────', 'divider'],
        ]);
      },
      whoami: function () {
        printLines([
          ['Souvik Ghosh',                                       'success'],
          ['SDET · Full-Stack Automation Engineer',              'output'],
          ['IBM Consulting — Bangalore, India',                  'output'],
          ['3+ years building enterprise test frameworks',       'output'],
          ['250+ E2E tests  |  60% faster regression cycles',   'output'],
        ]);
      },
      skills: function () {
        printLines([
          ['── Languages ──────────────────', 'divider'],
          ['Java · JavaScript · TypeScript · Python · SQL', 'output'],
          ['── Automation ─────────────────', 'divider'],
          ['Playwright · Selenium · REST Assured · TestNG · Cucumber', 'output'],
          ['── CI/CD & Cloud ───────────────', 'divider'],
          ['Jenkins · GitHub Actions · Docker · Kubernetes · Salesforce', 'output'],
          ['── Databases ──────────────────', 'divider'],
          ['MySQL · MongoDB', 'output'],
        ]);
      },
      exp: function () {
        var yrs = new Date().getFullYear() - 2023;
        printLines([
          ['IBM Consulting — ' + (yrs + 2) + '+ yrs total', 'success'],
          ['  ↳ J&J  Salesforce Health Cloud (Playwright, Java, LWC)', 'output'],
          ['  ↳ AT&T Spring Boot Microservices (REST/SOAP/GraphQL)',    'output'],
          ['IBM Growth Award  |  Successful Deal Signing Award',        'warn'],
        ]);
      },
      projects: function () {
        printLines([
          ['AI Playwright Automation (IBM BOB + MCP)', 'success'],
          ['  → Self-healing tests, AI-driven test gen', 'output'],
          ['TestResultMaker', 'success'],
          ['  → Desktop app for QA report generation', 'output'],
          ['  → github.com/xandersavvy/TestResultMaker', 'info'],
        ]);
      },
      contact: function () {
        printLines([
          ['📧  xandersavy@gmail.com',                          'info'],
          ['💼  linkedin.com/in/souvik-g-4ba0a7190',            'info'],
          ['🐙  github.com/xandersavvy',                        'info'],
          ['🌐  xandersavvy.github.io',                         'info'],
        ]);
      },
      joke: function () {
        var jokes = [
          'Why do Java devs wear glasses? Because they don\'t C#. 😄',
          'A QA engineer walks into a bar. Orders 0 beers. Orders -1 beers. Orders null. Bar crashes. 🤣',
          '10 types of people: those who understand binary, and those who don\'t.',
          'It\'s not a bug — it\'s an undocumented feature. ✨',
          '"Works on my machine" — shipping the machine. 🚢',
        ];
        print(jokes[Math.floor(Math.random() * jokes.length)], 'warn');
      },
      hire: function () {
        printLines([
          ['🚀 Great choice! Let\'s talk:',       'success'],
          ['📧  xandersavy@gmail.com',            'info'],
          ['💼  linkedin.com/in/souvik-g-4ba0a7190', 'info'],
          ['💡  Available for exciting opportunities', 'warn'],
        ]);
      },
      clear: function () {
        clearBody();
      },
    };

    /* ── Typewriter intro ─────────────────────────────────── */
    var introLines = [
      ['Welcome! I\'m Souvik Ghosh 👋', 'success'],
      ['SDET @ IBM Consulting',          'output'],
      ['Type "help" for commands',       'info'],
    ];
    var delay = 120;
    introLines.forEach(function (l, i) {
      setTimeout(function () {
        print(l[0], l[1]);
        if (i === introLines.length - 1) {
          // auto-focus after intro
          setTimeout(function () { input.focus(); }, 200);
        }
      }, delay * (i + 1));
    });

    /* ── Input handler ────────────────────────────────────── */
    var history = [];
    var histIdx  = -1;

    input.addEventListener('keydown', function (e) {
      // Command history navigation
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (histIdx < history.length - 1) histIdx++;
        input.value = history[histIdx] || '';
        return;
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (histIdx > 0) histIdx--;
        else { histIdx = -1; input.value = ''; return; }
        input.value = history[histIdx] || '';
        return;
      }
      if (e.key !== 'Enter') return;

      var val = input.value.trim().toLowerCase();
      input.value = '';
      histIdx = -1;
      if (!val) return;

      history.unshift(val);
      echo(val);

      if (COMMANDS[val]) {
        COMMANDS[val]();
      } else {
        print('command not found: ' + val + '  (try "help")', 'error');
      }
    });

    /* Click anywhere on terminal body to focus input */
    body.addEventListener('click', function () { input.focus(); });
  }

}());
