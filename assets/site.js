/* ================================================================
   MOUNTAIN VIEW COMMONS / SITE JS
   Shared behaviors: nav scroll, mobile menu, reveals,
   FAQ accordion, gallery filters, lightbox.
   ================================================================ */
(function () {
    'use strict';

    document.addEventListener('DOMContentLoaded', function () {

        /* ---- Reveal on scroll ---- */
        var reveals = document.querySelectorAll('.reveal');
        if (reveals.length && 'IntersectionObserver' in window) {
            var io = new IntersectionObserver(function (entries) {
                entries.forEach(function (e) {
                    if (e.isIntersecting) {
                        e.target.classList.add('visible');
                        io.unobserve(e.target);
                    }
                });
            }, { threshold: 0.05, rootMargin: '0px 0px -40px 0px' });
            reveals.forEach(function (el) { io.observe(el); });
        } else {
            reveals.forEach(function (el) { el.classList.add('visible'); });
        }

        /* Transparent nav on home — fades to solid past 50px scroll
           by toggling .nav-scrolled. Mirrors the VIDL pattern. Runs
           once synchronously so a refresh mid-page renders correctly. */
        if (document.body.classList.contains('is-home')) {
            var nav = document.querySelector('.navigation');
            if (nav) {
                var onNavScroll = function () {
                    if (window.scrollY > 50) {
                        nav.classList.add('nav-scrolled');
                    } else {
                        nav.classList.remove('nav-scrolled');
                    }
                };
                window.addEventListener('scroll', onNavScroll, { passive: true });
                onNavScroll();
            }
        }

        /* ---- Mobile menu ---- */
        var toggleBtn = document.querySelector('.nav__toggle');
        var menu = document.querySelector('.mobile-menu');
        var closeBtn = menu ? menu.querySelector('.mobile-menu__close') : null;

        if (menu) {
            menu.classList.remove('open');
            menu.setAttribute('aria-hidden', 'true');
        }
        requestAnimationFrame(function () {
            document.body.classList.add('nav-ready');
        });

        var openMenu = function () {
            if (!menu) return;
            menu.classList.add('open');
            menu.setAttribute('aria-hidden', 'false');
            document.body.classList.add('menu-open');
            if (toggleBtn) toggleBtn.setAttribute('aria-expanded', 'true');
        };
        var closeMenu = function () {
            if (!menu) return;
            menu.classList.remove('open');
            menu.setAttribute('aria-hidden', 'true');
            document.body.classList.remove('menu-open');
            if (toggleBtn) toggleBtn.setAttribute('aria-expanded', 'false');
        };

        if (toggleBtn) toggleBtn.addEventListener('click', openMenu);
        if (closeBtn) closeBtn.addEventListener('click', closeMenu);
        if (menu) {
            menu.querySelectorAll('a').forEach(function (a) {
                a.addEventListener('click', function () { closeMenu(); });
            });
        }
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') closeMenu();
        });

        /* ---- FAQ accordion ---- */
        var faqs = document.querySelectorAll('.faq-q');
        faqs.forEach(function (q) {
            q.addEventListener('click', function () {
                var expanded = q.getAttribute('aria-expanded') === 'true';
                var panel = document.getElementById(q.getAttribute('aria-controls'));
                q.setAttribute('aria-expanded', String(!expanded));
                if (panel) {
                    if (!expanded) {
                        panel.style.maxHeight = panel.scrollHeight + 'px';
                    } else {
                        panel.style.maxHeight = '0px';
                    }
                }
            });
        });

        /* ---- Gallery category filter ---- */
        var catBar = document.querySelector('.gallery-cat-bar');
        if (catBar) {
            var cats = catBar.querySelectorAll('.gallery-cat');
            var tiles = document.querySelectorAll('.gallery-tile');
            cats.forEach(function (c) {
                c.addEventListener('click', function () {
                    var target = c.getAttribute('data-cat');
                    cats.forEach(function (other) { other.setAttribute('aria-pressed', other === c ? 'true' : 'false'); });
                    tiles.forEach(function (t) {
                        var match = target === 'all' || t.getAttribute('data-cat') === target;
                        t.style.display = match ? '' : 'none';
                    });
                });
            });
        }

        /* ---- Lightbox ---- */
        var tiles = document.querySelectorAll('.gallery-tile');
        var lightbox = document.querySelector('.lightbox');
        if (tiles.length && lightbox) {
            var lbImg = lightbox.querySelector('.lightbox__img');
            var lbCap = lightbox.querySelector('.lightbox__cap');
            var lbPrev = lightbox.querySelector('.lightbox__nav--prev');
            var lbNext = lightbox.querySelector('.lightbox__nav--next');
            var lbClose = lightbox.querySelector('.lightbox__close');
            var current = 0;
            var visibleTiles = function () {
                return Array.prototype.filter.call(tiles, function (t) {
                    return t.style.display !== 'none';
                });
            };

            var openAt = function (i) {
                var list = visibleTiles();
                if (!list.length) return;
                current = (i + list.length) % list.length;
                var t = list[current];
                var src = t.getAttribute('data-full') || t.querySelector('img').getAttribute('src');
                var cap = t.getAttribute('data-cap') || t.querySelector('img').getAttribute('alt') || '';
                lbImg.setAttribute('src', src);
                lbImg.setAttribute('alt', cap);
                if (lbCap) lbCap.textContent = cap;
                lightbox.classList.add('open');
                document.body.classList.add('menu-open');
            };
            var close = function () {
                lightbox.classList.remove('open');
                document.body.classList.remove('menu-open');
                lbImg.setAttribute('src', '');
            };
            var step = function (dir) {
                openAt(current + dir);
            };

            tiles.forEach(function (t, idx) {
                t.addEventListener('click', function () {
                    var list = visibleTiles();
                    var pos = list.indexOf(t);
                    if (pos >= 0) openAt(pos);
                });
            });
            if (lbPrev) lbPrev.addEventListener('click', function () { step(-1); });
            if (lbNext) lbNext.addEventListener('click', function () { step(1); });
            if (lbClose) lbClose.addEventListener('click', close);
            lightbox.addEventListener('click', function (e) {
                if (e.target === lightbox) close();
            });
            document.addEventListener('keydown', function (e) {
                if (!lightbox.classList.contains('open')) return;
                if (e.key === 'Escape') close();
                if (e.key === 'ArrowLeft') step(-1);
                if (e.key === 'ArrowRight') step(1);
            });
        }

        /* ---- Film / walkthrough video ---- */
        var filmStage = document.getElementById('filmStage');
        var filmVideo = document.getElementById('filmVideo');
        if (filmStage && filmVideo) {
            var startFilm = function () {
                if (filmStage.classList.contains('is-playing')) return;
                filmStage.classList.add('is-playing');
                filmVideo.play().catch(function () {
                    filmStage.classList.remove('is-playing');
                });
            };
            filmStage.addEventListener('click', startFilm);
            filmStage.addEventListener('keydown', function (e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    startFilm();
                }
            });
            filmVideo.addEventListener('pause', function () {
                if (filmVideo.ended) filmStage.classList.remove('is-playing');
            });
            filmVideo.addEventListener('ended', function () {
                filmStage.classList.remove('is-playing');
                filmVideo.currentTime = 0;
            });
        }

        /* ---- Reduced motion ---- */
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            document.querySelectorAll('.reveal').forEach(function (el) { el.classList.add('visible'); });
        }

    });
})();
