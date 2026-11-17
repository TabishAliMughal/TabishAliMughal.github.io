// Portfolio home page behaviour: mobile menu, active nav link, skill bars, footer year,
// and the contact form (opens the visitor's email app via mailto - no server involved).
(function () {
    'use strict';

    var hamburger = document.getElementById('hamburger');
    var navMenu = document.getElementById('nav-menu');

    function setMenu(open) {
        if (!hamburger || !navMenu) return;
        hamburger.classList.toggle('active', open);
        navMenu.classList.toggle('active', open);
        hamburger.setAttribute('aria-expanded', open ? 'true' : 'false');
        hamburger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    }

    if (hamburger) {
        hamburger.addEventListener('click', function () {
            setMenu(!navMenu.classList.contains('active'));
        });
    }
    document.querySelectorAll('.nav-link').forEach(function (link) {
        link.addEventListener('click', function () { setMenu(false); });
    });
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && navMenu && navMenu.classList.contains('active')) {
            setMenu(false);
            hamburger.focus();
        }
    });

    // Navbar gets a solid edge once the page scrolls
    var navbar = document.querySelector('.navbar');
    function onScroll() {
        if (navbar) navbar.classList.toggle('scrolled', window.scrollY > 24);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    // Highlight the nav link of the section in view
    var navLinks = document.querySelectorAll('.nav-link[href^="#"]');
    if ('IntersectionObserver' in window) {
        var sectionObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;
                var id = entry.target.id;
                navLinks.forEach(function (link) {
                    var on = link.getAttribute('href') === '#' + id;
                    link.classList.toggle('active', on);
                    if (on) link.setAttribute('aria-current', 'true');
                    else link.removeAttribute('aria-current');
                });
            });
        }, { rootMargin: '-45% 0px -50% 0px' });
        document.querySelectorAll('main section[id]').forEach(function (s) { sectionObserver.observe(s); });
    }

    // Skill bars: width comes from data-level (0-100)
    document.querySelectorAll('.skill-level').forEach(function (bar) {
        bar.style.setProperty('--skill-width', (bar.getAttribute('data-level') || 0) + '%');
    });

    // Footer year
    var yearElement = document.getElementById('current-year');
    if (yearElement) yearElement.textContent = new Date().getFullYear();

    // Contact form -> mailto
    var contactForm = document.getElementById('contact-form');
    var statusEl = document.getElementById('form-status');

    function setStatus(text, kind) {
        if (!statusEl) return;
        statusEl.textContent = text;
        statusEl.className = 'form-status' + (kind ? ' is-' + kind : '');
    }

    function validateForm(form) {
        var firstBad = null;
        form.querySelectorAll('input, textarea').forEach(function (input) {
            var value = input.value.trim();
            var bad = !value || (input.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value));
            input.setAttribute('aria-invalid', bad ? 'true' : 'false');
            if (bad && !firstBad) firstBad = input;
        });
        if (firstBad) firstBad.focus();
        return !firstBad;
    }

    if (contactForm) {
        contactForm.addEventListener('submit', function (e) {
            e.preventDefault();
            if (!validateForm(this)) {
                setStatus('Fill in every field, with a valid email address, then send again.', 'error');
                return;
            }
            var data = new FormData(this);
            var body = 'Name: ' + data.get('name') + '\nEmail: ' + data.get('email') + '\n\nMessage:\n' + data.get('message');
            var mailtoLink = 'mailto:tabishalimughal@gmail.com?subject=' + encodeURIComponent(data.get('subject')) +
                '&body=' + encodeURIComponent(body);
            window.location.href = mailtoLink;
            setStatus('Your email app is opening with the message filled in. Press send there to deliver it.', 'ok');
            this.reset();
        });
    }
})();
