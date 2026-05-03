gsap.registerPlugin(ScrollTrigger);
ScrollTrigger.config({ ignoreMobileResize: true });

if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
}

window.scrollTo(0, 0);

document.addEventListener('DOMContentLoaded', () => {
    window.scrollTo(0, 0);

    // 1. LENIS (Smooth scroll)
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isTouchDevice = window.matchMedia('(pointer: coarse)').matches;
    const useSmoothScroll = !isTouchDevice && !prefersReducedMotion;
    const allowScrollEffects = useSmoothScroll;
    let lenis = null;
    const topNav = document.querySelector('.top-nav');

    function updateNavState() {
        if (!topNav) return;
        topNav.classList.toggle('is-scrolled', window.scrollY > 8);
    }

    window.addEventListener('scroll', updateNavState, { passive: true });
    updateNavState();

    function setupLenis() {
        if (lenis || !window.Lenis) return lenis;

        lenis = new window.Lenis({
            duration: 0.85,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            smoothWheel: true,
            smoothTouch: false,
        });

        lenis.on('scroll', () => {
            ScrollTrigger.update();
            updateNavState();
        });
        gsap.ticker.add((time) => lenis.raf(time * 1000));
        gsap.ticker.lagSmoothing(0);
        lenis.stop();

        return lenis;
    }

    function loadLenis() {
        if (!useSmoothScroll) return Promise.resolve(null);
        if (window.Lenis) return Promise.resolve(setupLenis());

        return new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = 'https://unpkg.com/@studio-freight/lenis@1.0.33/dist/lenis.min.js';
            script.async = true;
            script.onload = () => resolve(setupLenis());
            script.onerror = () => resolve(null);
            document.head.appendChild(script);
        });
    }

    const lenisReady = loadLenis();

    const images = document.querySelectorAll('.image-container');
    const headings = document.querySelectorAll('.split-text');
    const scrollProgress = document.querySelector('.scroll-progress span');
    const heroCharGroups = [];

    headings.forEach((h1) => {
        const text = h1.innerText;
        h1.innerHTML = '';

        text.split('').forEach(char => {
            const span = document.createElement('span');
            span.className = 'char';
            span.innerText = char === ' ' ? '\u00A0' : char;
            h1.appendChild(span);
        });

        const chars = h1.querySelectorAll('.char');
        heroCharGroups.push(chars);
        gsap.set(chars, { y: 90, opacity: 0 });
    });

    // 2. INTRO ANIMATION
    const introLayer = document.getElementById('intro-layer');
    const blob = document.getElementById('intro-blob');
    const mainWrapper = document.getElementById('smooth-wrapper');
    const blobPath = blob.querySelector('path');

    const blobPaths = {
        base: 'M 88,18 C 108,7 132,14 143,33 C 153,50 154,65 169,79 C 187,97 195,121 190,146 C 184,178 163,202 135,205 C 112,208 101,193 96,174 C 90,153 73,145 61,131 C 44,111 43,81 51,58 C 58,37 72,25 88,18 Z',
        softA: 'M 84,15 C 105,3 132,12 146,33 C 158,52 156,67 173,82 C 192,100 199,124 191,151 C 183,181 162,204 134,207 C 109,210 98,191 94,171 C 89,150 70,145 58,130 C 41,109 42,80 51,56 C 60,33 70,24 84,15 Z',
        softB: 'M 92,20 C 111,10 133,15 141,35 C 150,54 155,66 166,77 C 183,94 193,120 189,144 C 184,177 165,200 138,203 C 113,207 104,195 98,177 C 91,157 75,150 62,134 C 45,113 41,84 48,61 C 55,40 75,27 92,20 Z',
        press: 'M 89,23 C 108,13 130,19 140,37 C 149,53 151,66 165,80 C 182,97 189,120 184,144 C 178,173 160,196 135,199 C 114,202 104,189 99,172 C 93,153 77,146 65,132 C 49,114 48,84 55,62 C 62,43 74,30 89,23 Z'
    };

    gsap.set(blobPath, { attr: { d: blobPaths.base } });
    gsap.set(blob, { transformOrigin: "50% 50%" });

    const introMotion = gsap.timeline({
        repeat: -1,
        defaults: { ease: "sine.inOut" }
    });

    introMotion
        .to(blob, { scaleX: 1.08, scaleY: 0.96, rotation: -2.4, duration: 1.35 }, 0)
        .to(blobPath, { attr: { d: blobPaths.softA }, duration: 1.35 }, 0)
        .to(blob, { scaleX: 0.96, scaleY: 1.08, rotation: 2, duration: 1.55 }, 1.35)
        .to(blobPath, { attr: { d: blobPaths.softB }, duration: 1.55 }, 1.35)
        .to(blob, { scaleX: 1, scaleY: 1, rotation: 0, duration: 1.35 }, 2.9)
        .to(blobPath, { attr: { d: blobPaths.base }, duration: 1.35 }, 2.9);

    let introOpened = false;

    function openIntro() {
        if (introOpened) return;
        introOpened = true;

        window.scrollTo(0, 0);
        if (lenis) lenis.scrollTo(0, { immediate: true });

        introMotion.kill();
        blob.style.pointerEvents = 'none';
        gsap.set(mainWrapper, { autoAlpha: 1 });
        initEditorialAnimations();

        const tl = gsap.timeline({
            defaults: { ease: "expo.inOut" }
        });

        tl.to(blobPath, {
            attr: { d: blobPaths.press },
            duration: 0.24,
            ease: "sine.out"
        })
            .to(blob, {
                scale: 0.96,
                duration: 0.24,
                ease: "sine.out"
            }, 0)
            .to(blobPath, {
                attr: { d: blobPaths.base },
                duration: 0.48,
                ease: "elastic.out(1, 0.75)"
            })
            .to(blob, {
                scale: 1,
                duration: 0.24,
                ease: "power3.out"
            }, 0.24)
            .to(blob, {
                scale: 44,
                rotation: 8,
                duration: 0.78,
                ease: "expo.inOut"
            }, 0.42)
            .to(introLayer, {
                autoAlpha: 0,
                duration: 0.32,
                ease: "power2.out",
                onComplete: () => {
                    introLayer.remove();
                    window.scrollTo(0, 0);
                    if (lenis) lenis.scrollTo(0, { immediate: true });
                    if (lenis) lenis.start();
                    document.body.style.overflow = "auto";
                    ScrollTrigger.refresh();
                    lenisReady.then((activeLenis) => {
                        if (!activeLenis) return;
                        if (window.scrollY < 4) {
                            activeLenis.scrollTo(0, { immediate: true });
                        }
                        activeLenis.start();
                        ScrollTrigger.refresh();
                    });
                }
            }, 1);
    }

    blob.addEventListener('click', openIntro);
    blob.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            openIntro();
        }
    });

    // 3. EDITORIAL ANIMATIONS
    let editorialAnimationsStarted = false;

    function initEditorialAnimations() {
        if (editorialAnimationsStarted) return;
        editorialAnimationsStarted = true;

        gsap.to('.reveal-el', { opacity: 1, duration: 0.75, ease: "power2.out", delay: 0.05 });

        heroCharGroups.forEach((chars, index) => {
            gsap.to(chars, {
                y: 0,
                opacity: 1,
                duration: 0.9,
                stagger: 0.03,
                ease: "power4.out",
                delay: index * 0.08
            });
        });

        gsap.to(scrollProgress, {
            scaleY: 1,
            ease: "none",
            scrollTrigger: {
                trigger: document.body,
                start: "top top",
                end: "bottom bottom",
                scrub: 0.25
            }
        });

        gsap.utils.toArray('.section-reveal').forEach((section) => {
            gsap.to(section, {
                y: 0,
                opacity: 1,
                duration: 0.8,
                ease: "power3.out",
                scrollTrigger: {
                    trigger: section,
                    start: "top 78%",
                    once: true
                }
            });
        });

        if (allowScrollEffects) {
            gsap.delayedCall(1, () => {
                headings.forEach((heading, index) => {
                    gsap.to(heading, {
                        y: index % 2 === 0 ? -26 : -14,
                        ease: "none",
                        scrollTrigger: {
                            trigger: ".hero-section",
                            start: "top top",
                            end: "bottom top",
                            scrub: true
                        }
                    });
                });

                ScrollTrigger.refresh();
            });
        }

        if (allowScrollEffects) {
            gsap.to(".hero-media", {
                yPercent: 8,
                scale: 0.96,
                ease: "none",
                scrollTrigger: {
                    trigger: ".hero-section",
                    start: "top top",
                    end: "bottom top",
                    scrub: true
                }
            });

            gsap.fromTo(".flow-divider svg",
                { xPercent: -3, scaleY: 0.86, transformOrigin: "center bottom" },
                {
                    xPercent: 3,
                    scaleY: 1.18,
                    ease: "none",
                    scrollTrigger: {
                        trigger: ".flow-divider",
                        start: "top bottom",
                        end: "bottom top",
                        scrub: true
                    }
                }
            );
        }

        images.forEach((container) => {
            const img = container.querySelector('img');
            const caption = container.closest('.gallery-row').querySelector('.image-caption span');
            const captionCopy = container.closest('.gallery-row').querySelector('.image-caption p');

            gsap.set(caption, { yPercent: 110, opacity: 0 });
            gsap.set(captionCopy, { y: 14, opacity: 0 });

            if (allowScrollEffects) {
                gsap.fromTo(img,
                    { y: '-5%' },
                    {
                        y: '5%',
                        ease: "none",
                        scrollTrigger: {
                            trigger: container,
                            start: "top bottom",
                            end: "bottom top",
                            scrub: true
                        }
                    }
                );
            }

            gsap.fromTo(container,
                {
                    y: 70,
                    opacity: 0,
                    scale: 0.94
                },
                {
                    y: 0,
                    opacity: 1,
                    scale: 1,
                    duration: 0.9,
                    ease: "power3.out",
                    scrollTrigger: {
                        trigger: container,
                        start: "top 80%",
                        once: true
                    }
                }
            );

            gsap.to(caption, {
                yPercent: 0,
                opacity: 1,
                duration: 0.75,
                ease: "power3.out",
                scrollTrigger: {
                    trigger: container,
                    start: "top 72%",
                    once: true
                }
            });

            gsap.to(captionCopy, {
                y: 0,
                opacity: 1,
                duration: 0.65,
                ease: "power2.out",
                scrollTrigger: {
                    trigger: container,
                    start: "top 68%",
                    once: true
                }
            });
        });

        document.querySelectorAll('.book-btn').forEach((target) => {
            const releaseTap = () => {
                gsap.to(target, { scale: 1, duration: 0.28, ease: "elastic.out(1, 0.65)" });
            };

            target.addEventListener('pointerdown', () => {
                gsap.to(target, { scale: 0.965, duration: 0.12, ease: "power2.out" });
            }, { passive: true });
            target.addEventListener('pointerup', releaseTap, { passive: true });
            target.addEventListener('pointerleave', releaseTap, { passive: true });
            target.addEventListener('pointercancel', releaseTap, { passive: true });
        });
    }
});
