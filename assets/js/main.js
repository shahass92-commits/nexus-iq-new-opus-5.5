/* ═══════════════════════════════════════════════════════════════
   COMPASS NEXUS IQ — OPUS 5.5 SPECIAL EDITION · COMPASS STUDIO
   Lenis smooth scroll + GSAP ScrollTrigger cinematic choreography
   ThreeUI 3D WebGL spatial engine + 24H Day & Night Corridor Studio
   ═══════════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  /* Full motion on request, even with Reduce Motion on: "?motion=1", or
     "#motion" for hosts that pass only a plain #anchor (Artifact links). */
  var forceMotion = /[?&]motion=1/.test(window.location.search) ||
    window.location.hash === "#motion";
  var reduceMotion = !forceMotion &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (forceMotion) document.documentElement.classList.add("force-motion");

  /* Always open at the front page: never restore an old scroll position.
     A link to a real section (e.g. #fleet) still opens there. */
  if ("scrollRestoration" in window.history) window.history.scrollRestoration = "manual";
  var openTarget = null;
  if (window.location.hash.length > 1 && window.location.hash !== "#motion") {
    try { openTarget = document.querySelector(window.location.hash); } catch (err) { openTarget = null; }
  }
  if (!openTarget) window.scrollTo(0, 0);
  if (!openTarget && hasGsapEarly()) window.ScrollTrigger.clearScrollMemory("manual");
  function hasGsapEarly() { return typeof window.ScrollTrigger !== "undefined" && typeof window.ScrollTrigger.clearScrollMemory === "function"; }
  var hasGsap = typeof window.gsap !== "undefined" && typeof window.ScrollTrigger !== "undefined";

  if (hasGsap) {
    gsap.registerPlugin(ScrollTrigger);
    ["ScrollToPlugin", "SplitText", "ScrambleTextPlugin", "DrawSVGPlugin",
      "MotionPathPlugin", "Draggable", "InertiaPlugin", "CustomEase",
      "TextPlugin", "MorphSVGPlugin", "Flip", "EasePack"].forEach(function (p) {
      if (window[p]) gsap.registerPlugin(window[p]);
    });
  }
  var cnxEase = "power3.out";
  if (hasGsap && window.CustomEase) {
    CustomEase.create("cnxSwift", "M0,0 C0.22,1.36 0.36,1 1,1");
    cnxEase = "cnxSwift";
  }
  /* EasePack (when loaded): the hero frames settle with a slow-motion ease */
  var settleEase = "power1.out";
  if (hasGsap && window.EasePack) {
    try { if (gsap.parseEase("slow(0.5, 0.8)")) settleEase = "slow(0.5, 0.8)"; } catch (e) {}
  }

  /* ── Lenis smooth scroll (natural — no scroll-jacking) ─────── */
  var lenis = null;
  if (typeof window.Lenis !== "undefined" && !reduceMotion) {
    lenis = new Lenis({
      duration: 1.15,
      easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); },
      smoothWheel: true
    });
    if (hasGsap) {
      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
      gsap.ticker.lagSmoothing(0);
    } else {
      var rafLoop = function (time) { lenis.raf(time); requestAnimationFrame(rafLoop); };
      requestAnimationFrame(rafLoop);
    }
  }

  /* ── Anchor navigation ─────────────────────────────────────── */
  document.querySelectorAll("[data-scroll]").forEach(function (a) {
    a.addEventListener("click", function (e) {
      var id = a.getAttribute("href");
      if (!id || id.charAt(0) !== "#") return;
      var target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      if (lenis) {
        lenis.scrollTo(target, { offset: id === "#hero" ? 0 : -20, duration: 1.6 });
      } else if (hasGsap && !reduceMotion && window.ScrollToPlugin) {
        gsap.to(window, { duration: 1.2, ease: "power2.inOut", scrollTo: { y: target, offsetY: id === "#hero" ? 0 : 20 } });
      } else {
        target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
      }
    });
  });

  /* ── Nav entrance ──────────────────────────────────────────── */
  var nav = document.getElementById("nav");
  requestAnimationFrame(function () {
    setTimeout(function () { nav.classList.add("is-in"); }, 250);
  });

  if (!hasGsap) {
    document.querySelectorAll("[data-reveal]").forEach(function (el) { el.classList.add("is-in"); });
    return;
  }

  /* ── Hero frames: blinking lights only ───────────────────────────
     No drawn vehicles, aircraft or ships. Each photo keeps its slow
     camera drift, and only real light sources blink at their own spots:
     red aviation beacons on rooftops, cranes and the control tower, white
     strobes on the water tower and mast, and amber runway approach lights.
     Points are placed on the photos (1672 × 941 space). */
  var HM = [
    [[908,392,"w",1.3],[570,278,"r"],[815,273,"r"],[1050,290,"r"],[1175,370,"r"],[1515,385,"r"],[400,330,"r"],[690,362,"r"],[1405,205,"r"],[1550,215,"r"],[875,190,"r"]],
    [[318,262,"r"],[472,316,"r"],[614,200,"r"],[752,218,"r"],[955,232,"r"],[1272,200,"r"],[1302,212,"r"],[1060,150,"r"],[1240,128,"r"]],
    [[982,322,"r",1.1],[1202,266,"w"],[1430,742,"a"],[1438,700,"a"],[1446,660,"a"],[1452,620,"a"],[157,288,"w",0.8],[1478,326,"r"]],
    [[710,220,"r"],[740,205,"r"],[757,205,"r"],[795,220,"r"],[828,215,"r"],[960,215,"r"],[1005,202,"r"],[1017,202,"r"],[1078,212,"r"],[1152,202,"r"],[1175,200,"r"],[988,470,"w",1.2],[1488,612,"w",0.9],[568,548,"a",0.8],[1265,430,"a",0.8]]
  ];
  var SVGNS = "http://www.w3.org/2000/svg";
  function hmEl(tag, attrs, parent) { var e = document.createElementNS(SVGNS, tag); for (var k in attrs) e.setAttribute(k, attrs[k]); if (parent) parent.appendChild(e); return e; }
  var heroMotion = [];
  gsap.utils.toArray(".hero-layer").forEach(function (layer, i) {
    var pic = layer.querySelector("picture"), pts = HM[i];
    if (!pic) return;
    var cam = document.createElement("div");
    cam.className = "hm-cam";
    pic.parentNode.insertBefore(cam, pic);
    cam.appendChild(pic);
    if (reduceMotion || !pts) return;
    var svg = hmEl("svg", { "class": "hero-motion", viewBox: "0 0 1672 941", preserveAspectRatio: "xMidYMid slice", "aria-hidden": "true" });
    cam.appendChild(svg);
    var amberIdx = 0;
    pts.forEach(function (pt, k) {
      var g = hmEl("g", { "class": "hm-light hm-" + pt[2], transform: "translate(" + pt[0] + " " + pt[1] + ") scale(" + (pt[3] || 1) + ")" }, svg);
      hmEl("circle", { r: 9, "class": "hm-bloom" }, g);
      hmEl("circle", { r: 2.4, "class": "hm-core" }, g);
      gsap.set(g, { opacity: 0.12 });
      if (pt[2] === "w") {          // white strobe: a quick double flash
        heroMotion.push(gsap.timeline({ repeat: -1, repeatDelay: 1.6 + (k % 3) * 0.4, delay: k * 0.3 })
          .to(g, { opacity: 1, duration: 0.06 }).to(g, { opacity: 0.12, duration: 0.18 })
          .to(g, { opacity: 1, duration: 0.06 }, "+=0.12").to(g, { opacity: 0.12, duration: 0.3 }));
      } else if (pt[2] === "a") {   // amber approach lights: a running sequence
        heroMotion.push(gsap.timeline({ repeat: -1, repeatDelay: 1.2, delay: (amberIdx++) * 0.14 })
          .to(g, { opacity: 1, duration: 0.08 }).to(g, { opacity: 0.12, duration: 0.4 }));
      } else {                      // red aviation beacon: slow pulse, each on its own rhythm
        heroMotion.push(gsap.timeline({ repeat: -1, repeatDelay: 0.8 + (k % 4) * 0.3, delay: (k * 0.37) % 1.8 })
          .to(g, { opacity: 1, duration: 0.22, ease: "power1.out" }).to(g, { opacity: 0.12, duration: 0.9, ease: "power2.in" }));
      }
    });
  });

  /* Day & Night section: the same blinking light sources on its photos
     (the drawn cars, aircraft, ship and beams are hidden in CSS). */
  var DN_LIGHTS = { tower: HM[0], twin: HM[1], airport: HM[2], seaport: HM[3] };
  gsap.utils.toArray(".dn-layer").forEach(function (layer) {
    var pts = DN_LIGHTS[layer.getAttribute("data-dn-layer")];
    if (!pts || reduceMotion) return;
    var svg = hmEl("svg", { "class": "hero-motion dn-blink", viewBox: "0 0 1672 941", preserveAspectRatio: "xMidYMid slice", "aria-hidden": "true" });
    layer.appendChild(svg);
    pts.forEach(function (pt, k) {
      var g = hmEl("g", { "class": "hm-light hm-" + pt[2], transform: "translate(" + pt[0] + " " + pt[1] + ") scale(" + (pt[3] || 1) + ")" }, svg);
      hmEl("circle", { r: 9, "class": "hm-bloom" }, g);
      hmEl("circle", { r: 2.4, "class": "hm-core" }, g);
      gsap.set(g, { opacity: 0.12 });
      var tl = pt[2] === "w"
        ? gsap.timeline({ repeat: -1, repeatDelay: 1.6 + (k % 3) * 0.4, delay: k * 0.3 }).to(g, { opacity: 1, duration: 0.06 }).to(g, { opacity: 0.12, duration: 0.18 }).to(g, { opacity: 1, duration: 0.06 }, "+=0.12").to(g, { opacity: 0.12, duration: 0.3 })
        : pt[2] === "a"
          ? gsap.timeline({ repeat: -1, repeatDelay: 1.2, delay: k * 0.14 }).to(g, { opacity: 1, duration: 0.08 }).to(g, { opacity: 0.12, duration: 0.4 })
          : gsap.timeline({ repeat: -1, repeatDelay: 0.8 + (k % 4) * 0.3, delay: (k * 0.37) % 1.8 }).to(g, { opacity: 1, duration: 0.22, ease: "power1.out" }).to(g, { opacity: 0.12, duration: 0.9, ease: "power2.in" });
      tl;
    });
  });

  /* ══════════════════════════════════════════════════════════
     HERO — pinned cinematic descent
     4 layers crossfade + settle-zoom, staged titles, progress
     ══════════════════════════════════════════════════════════ */
  var layers = gsap.utils.toArray(".hero-layer");
  var stageLines = gsap.utils.toArray(".hero-stage-line");
  var dots = gsap.utils.toArray("#heroProgress span");

  if (reduceMotion) {
    stageLines[0].style.visibility = "visible";
  } else {
    gsap.set(stageLines, { autoAlpha: 0 });
    gsap.set(layers, { autoAlpha: 0 });
    gsap.set(layers[0], { autoAlpha: 1 });
    gsap.set(stageLines[0], { autoAlpha: 1 });

    var heroTl = gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: {
        trigger: "#hero",
        start: "top top",
        end: "+=340%",
        pin: true,
        scrub: 0.9,
        anticipatePin: 1,
        onUpdate: function (self) {
          var idx = Math.min(3, Math.floor(self.progress * 4));
          dots.forEach(function (d, i) { d.classList.toggle("is-on", i <= idx); });
        }
      }
    });

    // Intro: first frame settles from a gentle zoom
    heroTl.fromTo(layers[0].querySelectorAll("img, .hero-motion"),
      { scale: 1.18 }, { scale: 1.04, duration: 0.9, ease: settleEase }, 0);

    // Load-time title reveal (independent of scroll)
    gsap.from(stageLines[0].querySelectorAll(".hero-title"),
      { yPercent: 26, autoAlpha: 0, duration: 1.05, ease: "power3.out", stagger: 0.09, delay: 0.25 });

    // Stage transitions
    for (var i = 1; i < 4; i++) {
      var at = 0.25 * i;
      var img = layers[i].querySelectorAll("img, .hero-motion");
      var line = stageLines[i];

      // outgoing title lifts away
      heroTl.to(stageLines[i - 1], { yPercent: -18, autoAlpha: 0, duration: 0.08, ease: "power1.in" }, at - 0.055);
      // image crossfade: next frame rises from a deeper zoom
      heroTl.set(layers[i], { autoAlpha: 1 }, at - 0.02);
      heroTl.fromTo(img, { scale: 1.22 }, { scale: 1.04, duration: 0.3, ease: settleEase }, at - 0.02);
      heroTl.to(layers[i - 1].querySelectorAll("img, .hero-motion"), { scale: 1.0, duration: 0.3 }, at - 0.02);
      heroTl.to(layers[i - 1], { autoAlpha: 0, duration: 0.09 }, at + 0.035);
      // incoming title
      heroTl.fromTo(line, { autoAlpha: 0, yPercent: 16 }, { autoAlpha: 1, yPercent: 0, duration: 0.09, ease: "power2.out" }, at + 0.03);
    }

    // Final: hero copy & foot drift up as the pin releases
    heroTl.to(".hero-foot", { autoAlpha: 0, y: -30, duration: 0.08, ease: "power1.in" }, 0.93);
    heroTl.to(stageLines[3], { yPercent: -10, duration: 0.07 }, 0.93);
  }

  if (!reduceMotion) {
    var heroCam = [
      { x: -2.2, y: -1.2, s: 1.06, r: -0.4, d: 22 },
      { x: 2.4, y: -0.8, s: 1.07, r: 0.5, d: 24 },
      { x: -1.8, y: 1.4, s: 1.05, r: 0.3, d: 20 },
      { x: 2.0, y: 1.0, s: 1.08, r: -0.5, d: 26 }
    ];
    var heroCamTweens = heroMotion.slice();
    gsap.utils.toArray(".hero-layer").forEach(function (layer, i) {
      var c = heroCam[i % 4], cam = layer.querySelector(".hm-cam");
      if (cam) heroCamTweens.push(gsap.fromTo(cam, { xPercent: 0, yPercent: 0, scale: 1, rotation: 0 },
        { xPercent: c.x, yPercent: c.y, scale: c.s, rotation: c.r, duration: c.d, ease: "sine.inOut", repeat: -1, yoyo: true }));
      var ray = layer.querySelector(".hl-ray");
      if (ray) heroCamTweens.push(gsap.fromTo(ray, { xPercent: -30, opacity: 0 },
        { xPercent: 30, opacity: 1, duration: 9 + i, ease: "sine.inOut", repeat: -1, yoyo: true, delay: i * 1.3 }));
      var haze = layer.querySelector(".hl-haze");
      if (haze) heroCamTweens.push(gsap.fromTo(haze, { opacity: 0.45, yPercent: 4 },
        { opacity: 0.85, yPercent: -4, duration: 7 + i, ease: "sine.inOut", repeat: -1, yoyo: true }));
    });
    var heroEl = document.getElementById("hero");
    if (heroEl) {
      var heroSpan = heroEl.parentNode && heroEl.parentNode.classList.contains("pin-spacer") ? heroEl.parentNode : heroEl;
      ScrollTrigger.create({ trigger: heroSpan, start: "top bottom", end: "bottom top",
        onToggle: function (self) { heroCamTweens.forEach(function (t) { self.isActive ? t.resume() : t.pause(); }); } });
    }
  }

  /* ── Split headlines: SplitText words rise out of masks ────── */
  document.querySelectorAll("[data-split]").forEach(function (el) {
    if (window.SplitText) {
      var split = new SplitText(el, { type: "words", mask: "words", wordsClass: "word" });
      if (reduceMotion) return;
      gsap.fromTo(split.words,
        { yPercent: 110 },
        {
          yPercent: 0,
          duration: 1.1,
          ease: "power4.out",
          stagger: 0.055,
          scrollTrigger: { trigger: el, start: "top 82%" }
        });
      return;
    }
    var words = el.textContent.trim().split(/\s+/);
    el.textContent = "";
    words.forEach(function (w, i) {
      var mask = document.createElement("span");
      mask.className = "word";
      var inner = document.createElement("span");
      inner.textContent = w;
      mask.appendChild(inner);
      el.appendChild(mask);
      if (i < words.length - 1) el.appendChild(document.createTextNode(" "));
    });
    if (reduceMotion) return;
    gsap.fromTo(el.querySelectorAll(".word > span"),
      { yPercent: 110 },
      {
        yPercent: 0,
        duration: 1.1,
        ease: "power4.out",
        stagger: 0.055,
        scrollTrigger: { trigger: el, start: "top 82%" }
      });
  });

  /* ── Reveal on scroll ──────────────────────────────────────── */
  if (reduceMotion) {
    gsap.set("[data-reveal]", { opacity: 1, y: 0 });
  } else {
    gsap.utils.toArray("[data-reveal]").forEach(function (el) {
      gsap.fromTo(el,
        { opacity: 0, y: 34 },
        {
          opacity: 1,
          y: 0,
          duration: 1.05,
          ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 88%" }
        });
    });
  }

  /* ── Counters: odometer rolling digits ─────────────────────── */
  document.querySelectorAll("[data-count]").forEach(function (el) {
    var end = parseFloat(el.getAttribute("data-count"));
    if (isNaN(end)) return;
    var dec = parseInt(el.getAttribute("data-dec") || "0", 10);
    var finalText = end.toLocaleString("en-US", {
      minimumFractionDigits: dec,
      maximumFractionDigits: dec
    });
    if (reduceMotion) { el.textContent = finalText; return; }

    el.setAttribute("aria-label", finalText);
    el.textContent = "";
    var cols = [];
    var digitIdx = 0;
    finalText.split("").forEach(function (ch) {
      if (/\d/.test(ch)) {
        var odo = document.createElement("span");
        odo.className = "odo";
        odo.setAttribute("aria-hidden", "true");
        var col = document.createElement("span");
        col.className = "odo-col";
        var seq = "";
        for (var r = 0; r < 4; r++) {
          for (var n = 0; n <= 9; n++) seq += "<span>" + n + "</span>";
        }
        col.innerHTML = seq; // 4 full 0-9 cycles; lands on digit at index 30+d
        odo.appendChild(col);
        el.appendChild(odo);
        cols.push({ col: col, digit: parseInt(ch, 10), i: digitIdx++ });
      } else {
        el.appendChild(document.createTextNode(ch));
      }
    });

    /* hero-scale counters get a longer, more cinematic spin */
    var big = el.closest(".stat, .fleet-metric, .impact-item, .award, .ally-card") !== null;
    ScrollTrigger.create({
      trigger: el,
      start: "top 90%",
      once: true,
      onEnter: function () {
        cols.forEach(function (c) {
          gsap.fromTo(c.col,
            { y: 0 },
            {
              y: -((big ? 30 : 20) + c.digit) + "em",
              duration: big ? 2.4 : 1.7,
              delay: c.i * 0.09,
              ease: "power4.inOut"
            });
        });
      }
    });
  });

  /* ── Parallax frames ───────────────────────────────────────── */
  if (!reduceMotion) {
    gsap.utils.toArray("[data-parallax]").forEach(function (img) {
      var amt = parseFloat(img.getAttribute("data-parallax")) || 8;
      var fig = img.closest("figure");
      var lights = fig && fig.querySelector(".photo-lights");   // light overlays ride with their photo
      gsap.fromTo(lights ? [img, lights] : img,
        { yPercent: -amt / 2, scale: 1 + amt / 100 },
        {
          yPercent: amt / 2,
          scale: 1 + amt / 100,
          ease: "none",
          scrollTrigger: {
            trigger: img.closest("figure") || img,
            start: "top bottom",
            end: "bottom top",
            scrub: true
          }
        });
    });
  }

  /* ── Landmark photo: blinking lights — the tower's crown breathes,
     its beacon strobes, rooftop aviation lights blink out of step and
     the Technopark sign glows. Runs only while the photo is on screen. */
  var photoLights = document.querySelector("#landmark .photo-lights");
  if (photoLights && !reduceMotion) {
    var plTweens = [];
    plTweens.push(gsap.fromTo(photoLights.querySelector(".pl-crown"), { opacity: 0.35 },
      { opacity: 1, duration: 1.6, ease: "sine.inOut", repeat: -1, yoyo: true }));
    plTweens.push(gsap.fromTo(photoLights.querySelector(".pl-base"), { opacity: 0.3 },
      { opacity: 0.9, duration: 2.2, ease: "sine.inOut", repeat: -1, yoyo: true, delay: 0.6 }));
    plTweens.push(gsap.fromTo(photoLights.querySelector(".pl-sign"), { opacity: 0.25 },
      { opacity: 0.8, duration: 2.6, ease: "sine.inOut", repeat: -1, yoyo: true, delay: 1.1 }));
    var strobe = photoLights.querySelector(".pl-strobe");
    gsap.set(strobe, { transformOrigin: "50% 50%", opacity: 0 });
    plTweens.push(gsap.timeline({ repeat: -1, repeatDelay: 1.3 })
      .to(strobe, { opacity: 1, scale: 1.25, duration: 0.07, ease: "power2.out" })
      .to(strobe, { opacity: 0, scale: 0.8, duration: 0.25, ease: "power2.in" })
      .to(strobe, { opacity: 1, scale: 1.1, duration: 0.07, ease: "power2.out" }, "+=0.14")
      .to(strobe, { opacity: 0, scale: 0.8, duration: 0.35, ease: "power2.in" }));
    gsap.utils.toArray(photoLights.querySelectorAll(".pl-red")).forEach(function (c, i) {
      gsap.set(c, { opacity: 0.15 });
      plTweens.push(gsap.timeline({ repeat: -1, repeatDelay: 0.9 + (i % 4) * 0.25, delay: (i * 0.37) % 1.6 })
        .to(c, { opacity: 1, duration: 0.18, ease: "power1.out" })
        .to(c, { opacity: 0.15, duration: 0.7, ease: "power2.in" }));
    });
    ScrollTrigger.create({
      trigger: photoLights.closest("figure"),
      start: "top bottom",
      end: "bottom top",
      onToggle: function (self) { plTweens.forEach(function (t) { self.isActive ? t.resume() : t.pause(); }); }
    });
    plTweens.forEach(function (t) { t.pause(); });
  }

  /* ── Fleet: pinned horizontal card slide (every width) ────────────
     gsap.matchMedia rebuilds the pin when the viewport crosses a
     breakpoint, so resizing never leaves a stale snap setting behind.
     Narrow widths have a short slide: snapping there reads as a jump,
     so per-card snapping only runs at 1100px and up. */
  var fleetTrack = document.getElementById("fleetTrack");
  var fleetPin = document.getElementById("fleetPin");
  if (fleetTrack && fleetPin && !reduceMotion) {
    var fleetCardsAll = gsap.utils.toArray("#fleetTrack .fleet-card");
    var fleetDist = function () {
      return Math.max(0, fleetTrack.scrollWidth - window.innerWidth);
    };
    /* Every width pins the track and slides the four cards across as you
       scroll down. Phones lose the native swipe strip while pinned (the
       is-pinned class); with Reduce Motion there is no pin and the strip
       stays swipeable. Snapping per card only at 1100px and up. */
    gsap.matchMedia().add({
      wide: "(min-width: 1100px)",
      mid: "(min-width: 720px) and (max-width: 1099.98px)",
      phone: "(max-width: 719.98px)"
    }, function (ctx) {
      var c = ctx.conditions;
      var snap = c.wide && fleetCardsAll.length > 1 ? {
        snapTo: 1 / (fleetCardsAll.length - 1),
        duration: { min: 0.18, max: 0.65 },
        delay: 0.08,
        ease: "power3.out"
      } : false;
      fleetPin.classList.add("is-pinned");
      fleetPin.scrollLeft = 0;
      gsap.to(fleetTrack, {
        x: function () { return -fleetDist(); },
        ease: "none",
        scrollTrigger: {
          trigger: fleetPin,
          start: c.phone ? "top 12%" : "top 14%",
          end: function () { return "+=" + fleetDist(); },
          pin: true,
          scrub: c.phone ? 0.6 : 0.85,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          snap: snap
        }
      });
      if (c.phone) {
        /* phones: cards rise and settle in, then each card's contents follow */
        gsap.fromTo(fleetCardsAll,
          { opacity: 0, y: 56, scale: 0.94, rotateY: 8, transformOrigin: "left center" },
          {
            opacity: 1, y: 0, scale: 1, rotateY: 0,
            duration: 1.05, ease: cnxEase, stagger: 0.12,
            scrollTrigger: { trigger: fleetPin, start: "top 82%" }
          });
        fleetCardsAll.forEach(function (card, i) {
          gsap.from(card.querySelectorAll(".kicker-sm, h3, p:not(.kicker-sm), .fleet-metric"), {
            opacity: 0, y: 18, duration: 0.8, ease: "power3.out", stagger: 0.08,
            delay: 0.25 + i * 0.12, clearProps: "transform,opacity",
            scrollTrigger: { trigger: fleetPin, start: "top 82%" }
          });
        });
      } else {
        /* wider screens: cards shear in as the pinned slide engages */
        gsap.fromTo(fleetCardsAll,
          { opacity: 0, x: 110, rotateY: 9, transformOrigin: "right center" },
          {
            opacity: 1, x: 0, rotateY: 0,
            duration: 1.1, ease: cnxEase, stagger: 0.09,
            scrollTrigger: { trigger: fleetPin, start: "top 68%" }
          });
      }
      return function () { fleetPin.classList.remove("is-pinned"); };
    });
  }

  /* ── Charging station: bays light up one by one on scroll ─── */
  var bays = gsap.utils.toArray("#bayGrid .bay");
  var chargePct = document.getElementById("chargePct");
  var chargeFill = document.getElementById("chargeFill");
  var chargeStatus = document.getElementById("chargeStatus");
  var chargeFinal = document.getElementById("chargeFinal");

  function setCharge(lit, pctVal) {
    bays.forEach(function (b, i) { b.classList.toggle("is-on", i < lit); });
    chargePct.textContent = pctVal;
    chargeFill.style.width = pctVal + "%";
    chargeStatus.textContent = lit >= 12
      ? "Fully powered · 12 / 12 bays"
      : (lit > 0 ? "Charging · " + lit + " / 12 bays" : "Standby · 0 / 12 bays");
    chargeFinal.classList.toggle("is-on", lit >= 12);
  }

  if (bays.length && chargePct) {
    if (reduceMotion) {
      setCharge(12, 100);
    } else {
      ScrollTrigger.create({
        trigger: "#chargeStage",
        start: "top 14%",
        end: "+=230%",
        pin: true,
        scrub: 0.6,
        anticipatePin: 1,
        onUpdate: function (self) {
          var lit = Math.min(12, Math.floor(self.progress * 12.7));
          setCharge(lit, Math.round(self.progress * 100));
        }
      });
    }
  }

  /* ── Software cards: 3D stagger reveal ─────────────────────── */
  var swCards = gsap.utils.toArray("#swGrid .sw-card");
  if (swCards.length) {
    if (reduceMotion) {
      gsap.set(swCards, { opacity: 1 });
    } else {
      gsap.fromTo(swCards,
        { opacity: 0, y: 64, rotateY: -14, transformOrigin: "left center" },
        {
          opacity: 1,
          y: 0,
          rotateY: 0,
          duration: 1.15,
          ease: cnxEase,
          stagger: 0.14,
          scrollTrigger: { trigger: ".sw-stage", start: "top 80%" }
        });
    }
  }

  /* ── Software: circuit trace draw + travelling pulse ───────── */
  var swCircuitPath = document.getElementById("swCircuitPath");
  var swPulse = document.getElementById("swPulse");
  if (swCircuitPath && swPulse) {
    if (reduceMotion || !window.DrawSVGPlugin || !window.MotionPathPlugin) {
      gsap.set(swPulse, { opacity: 0 });
    } else {
      var swSats = gsap.utils.toArray("#swCircuitSatellites .sw-sat");
      gsap.set(swCircuitPath, { drawSVG: "0%" });
      gsap.set(swSats, { drawSVG: "0%", opacity: 0 });
      var swPulseTween = gsap.to(swPulse, {
        motionPath: { path: swCircuitPath, align: swCircuitPath, alignOrigin: [0.5, 0.5] },
        duration: 5.5,
        ease: "none",
        repeat: -1,
        paused: true
      });
      /* trace draws itself in as you scroll through the section */
      var swCircuitTl = gsap.timeline({
        scrollTrigger: { trigger: ".sw-stage", start: "top 78%", end: "bottom 30%", scrub: 0.7 }
      });
      swCircuitTl
        .to(swCircuitPath, { drawSVG: "100%", duration: 0.55, ease: "power1.inOut" }, 0)
        .to(swSats, { drawSVG: "100%", opacity: 1, duration: 0.35, ease: "power1.out", stagger: 0.06 }, 0.42);
      gsap.set(swPulse, { opacity: 1 });
      /* pulse travels the trace only while the stage is on screen */
      ScrollTrigger.create({
        trigger: ".sw-stage",
        start: "top 90%",
        end: "bottom top",
        onToggle: function (self) { self.isActive ? swPulseTween.play() : swPulseTween.pause(); }
      });
    }
  }

  /* ── Twin cards: GSAP card-swap deck ───────────────────────────
     The eight cards sit in a stacked 3D deck; the section pins and each
     step of scroll sends the front card down and away while the next
     card steps forward. Reduce Motion keeps the plain grid. */
  var twinGrid = document.getElementById("twinGrid");
  var twinCards = gsap.utils.toArray("#twinGrid .twin-card");
  if (twinCards.length) {
    if (reduceMotion) {
      gsap.set(twinCards, { opacity: 1 });
    } else {
      twinGrid.classList.add("is-deck");
      var twinMM = gsap.matchMedia();
      twinMM.add({ phone: "(max-width: 719.98px)", wide: "(min-width: 720px)" }, function (ctx) {
        var ph = ctx.conditions.phone;
        var n = twinCards.length;
        var slot = function (k) {
          return {
            x: k * (ph ? 10 : 30),
            y: -k * (ph ? 14 : 24),
            scale: 1 - k * 0.05,
            rotation: 0,
            opacity: k <= 3 ? 1 - k * 0.18 : 0,
            zIndex: 50 - k
          };
        };
        twinCards.forEach(function (c, i) { gsap.set(c, Object.assign({ transformOrigin: "50% 100%" }, slot(i))); });
        var deckTl = gsap.timeline({
          scrollTrigger: {
            trigger: twinGrid,           // pin only the card deck — the 3D panel above scrolls freely
            start: "center 52%",
            end: function () { return "+=" + Math.round(window.innerHeight * 0.38 * (n - 1)); },
            pin: true,
            scrub: 0.6,
            anticipatePin: 1,
            invalidateOnRefresh: true
          }
        });
        for (var st = 0; st < n - 1; st++) {
          var front = twinCards[st];
          deckTl.to(front, { y: ph ? 300 : 360, rotation: -7, opacity: 0, duration: 0.55, ease: "power2.in" }, st);
          for (var j = st + 1; j < n; j++) {
            deckTl.to(twinCards[j], Object.assign({ duration: 0.6, ease: "power3.out" }, slot(j - st - 1)), st + 0.18);
          }
          deckTl.set(front, slot(n - 1), st + 0.6);
          var glyph = twinCards[st + 1].querySelector(".ri-glyph");
          if (glyph) deckTl.fromTo(glyph, { scale: 0.6, rotation: -10 }, { scale: 1, rotation: 0, duration: 0.45, ease: "back.out(2.4)" }, st + 0.4);
        }
        // Apple buttons: step the deck one card at a time
        var dPrev = document.getElementById("deckPrev"), dNext = document.getElementById("deckNext"), dCount = document.getElementById("deckCount");
        var deckST = deckTl.scrollTrigger;
        var deckIdx = function () { return Math.round(deckST.progress * (n - 1)); };
        var pad = function (v) { return (v < 10 ? "0" : "") + v; };
        var syncCount = function () { if (dCount) dCount.textContent = pad(deckIdx() + 1) + " / " + pad(n); };
        deckST.vars.onUpdate = syncCount;
        ScrollTrigger.addEventListener("scrollEnd", syncCount);
        var goCard = function (k) {
          k = Math.max(0, Math.min(n - 1, k));
          var y = deckST.start + (deckST.end - deckST.start) * (k / (n - 1)) + 1;
          if (window.ScrollToPlugin) gsap.to(window, { scrollTo: y, duration: 0.8, ease: "power2.inOut" }); else window.scrollTo({ top: y, behavior: "smooth" });
        };
        var onPrev = function () { goCard(deckIdx() - 1); }, onNext = function () { goCard(deckIdx() + 1); };
        if (dPrev) dPrev.addEventListener("click", onPrev);
        if (dNext) dNext.addEventListener("click", onNext);
        return function () {
          gsap.set(twinCards, { clearProps: "all" });
          if (dPrev) dPrev.removeEventListener("click", onPrev);
          if (dNext) dNext.removeEventListener("click", onNext);
        };
      });
    }
  }

  /* ── Allianz site cards: spatial 3D assembly + pointer spotlight ──
     The six cards start scattered in depth (tilted, pushed back, blurred)
     and assemble into the grid as you scroll; a light follows the pointer. */
  var allyCards = gsap.utils.toArray("#allyGrid .ally-card");
  if (allyCards.length) {
    allyCards.forEach(function (c) {
      c.addEventListener("pointermove", function (e) {
        var r = c.getBoundingClientRect();
        c.style.setProperty("--mx", ((e.clientX - r.left) / r.width * 100).toFixed(1) + "%");
        c.style.setProperty("--my", ((e.clientY - r.top) / r.height * 100).toFixed(1) + "%");
      });
    });
    if (!reduceMotion) {
      var spread = [[-1.2, -0.6], [0, -1], [1.2, -0.6], [-1.2, 0.6], [0, 1], [1.2, 0.6]];
      gsap.timeline({
        scrollTrigger: { trigger: "#allyGrid", start: "top 92%", end: "center 55%", scrub: 0.9 }
      }).fromTo(allyCards, {
        x: function (i) { return spread[i % 6][0] * 140; },
        y: function (i) { return spread[i % 6][1] * 90; },
        z: -420,
        rotationX: function (i) { return spread[i % 6][1] * -28; },
        rotationY: function (i) { return spread[i % 6][0] * 26; },
        opacity: 0,
        filter: "blur(10px)"
      }, {
        x: 0, y: 0, z: 0, rotationX: 0, rotationY: 0, opacity: 1, filter: "blur(0px)",
        ease: "power3.out", stagger: { each: 0.06, from: "center" }
      });
      gsap.fromTo("#allyGrid .ally-num", { scale: 0.7 }, {
        scale: 1, duration: 0.9, ease: "back.out(2.2)", stagger: 0.08,
        scrollTrigger: { trigger: "#allyGrid", start: "top 70%" }
      });
    }
  }

  /* ── 10 · ETS operating layer ───────────────────────────────────
     Each of the eight blocks has its own motion, tied to what it shows:
     a roster flowing into dispatch, cars moving on live routes, an event
     stream arriving, an automation chain firing, a ledger reconciling,
     counters, a console powering up and a forecast drawing itself. */
  (function () {
    var ets = document.getElementById("ets");
    if (!ets) return;
    // E2 cars: place along their routes (static for Reduce Motion, moving otherwise)
    var visCars = [["visCar1", "visR1", 0.22, 7], ["visCar2", "visR2", 0.55, 9], ["visCar3", "visR1", 0.7, 7], ["cmdCar", "cmdRoute", 0.1, 6], ["predCar", "predActual", 0, 6]].map(function (c) {
      var car = document.getElementById(c[0]), path = document.getElementById(c[1]);
      if (!car || !path || !path.getTotalLength) return null;
      var len = path.getTotalLength(), o = { t: c[2] };
      var rot = car.querySelector(".vis-car-rot");
      var put = function () {
        var l = len * (o.t % 1), p = path.getPointAtLength(l), q = path.getPointAtLength(Math.min(len, l + 3));
        if (l + 3 > len) q = { x: p.x + (p.x - path.getPointAtLength(l - 3).x), y: p.y + (p.y - path.getPointAtLength(l - 3).y) };
        car.setAttribute("transform", "translate(" + p.x.toFixed(1) + " " + p.y.toFixed(1) + ")");
        if (rot) rot.setAttribute("transform", "rotate(" + (Math.atan2(q.y - p.y, q.x - p.x) * 180 / Math.PI).toFixed(1) + ")" + (car.id === "predCar" ? " scale(1.5)" : ""));
      };
      put();
      return { o: o, put: put, dur: c[3] };
    }).filter(Boolean);
    if (reduceMotion) return;

    // copy columns: index, title, text and points rise in sequence; visuals drift in depth
    gsap.utils.toArray("#ets .ets-block").forEach(function (block) {
      var copy = block.querySelectorAll(".ets-idx, .ets-copy h3, .ets-copy p, .ets-points li, .ets-kv div");
      gsap.fromTo(copy, { y: 34, opacity: 0 }, { y: 0, opacity: 1, duration: 0.95, ease: "power3.out", stagger: 0.07,
        scrollTrigger: { trigger: block, start: "top 78%" } });
      var vis = block.querySelector(".ets-visual, .auto-chain, .scale-band, .cmd-console");
      if (vis) {
        gsap.fromTo(vis, { opacity: 0, y: 60, scale: 0.97 }, { opacity: 1, y: 0, scale: 1, duration: 1.2, ease: "expo.out",
          scrollTrigger: { trigger: block, start: "top 74%" } });
        if (!block.classList.contains("ets-wide")) {
          gsap.fromTo(vis, { yPercent: 6 }, { yPercent: -6, ease: "none",
            scrollTrigger: { trigger: block, start: "top bottom", end: "bottom top", scrub: true } });
        }
      }
    });

    // E1 · roster → core → dispatch
    var orch = document.getElementById("etsOrch");
    if (orch) {
      var otl = gsap.timeline({ scrollTrigger: { trigger: orch, start: "top 68%" } });
      otl.from(orch.querySelectorAll(".orch-col:first-child .orch-chip"), { x: -40, opacity: 0, duration: 0.6, stagger: 0.1, ease: "power3.out" })
        .from(orch.querySelectorAll(".orch-wires:first-of-type path"), { strokeDashoffset: 60, opacity: 0, duration: 0.6, stagger: 0.08 }, "-=0.2")
        .from(orch.querySelector(".orch-core"), { scale: 0.6, opacity: 0, duration: 0.8, ease: "back.out(2)" }, "-=0.3")
        .from(orch.querySelectorAll(".orch-wires:last-of-type path"), { opacity: 0, duration: 0.5, stagger: 0.08 }, "-=0.2")
        .from(orch.querySelectorAll(".orch-col:last-child .orch-chip"), { x: 40, opacity: 0, duration: 0.6, stagger: 0.1, ease: "power3.out" }, "-=0.3");
      gsap.to(orch.querySelectorAll(".orch-wires path"), { strokeDashoffset: -80, duration: 4, ease: "none", repeat: -1 });
      gsap.to(orch.querySelector(".orch-core-ring"), { rotation: 360, duration: 24, ease: "none", repeat: -1 });
    }

    // E2 · cars keep moving while the block is on screen
    var visTweens = visCars.map(function (c) {
      return gsap.to(c.o, { t: "+=1", duration: c.dur, ease: "none", repeat: -1, onUpdate: c.put, paused: true });
    });
    var visBlock = document.getElementById("etsVis");
    ScrollTrigger.create({ trigger: "#ets", start: "top bottom", end: "bottom top",
      onToggle: function (self) { visTweens.forEach(function (t) { self.isActive ? t.play() : t.pause(); }); } });
    if (visBlock) {
      gsap.from(visBlock.querySelector(".vis-alert"), { y: 24, opacity: 0, duration: 0.8, ease: "power3.out", delay: 0.6,
        scrollTrigger: { trigger: visBlock, start: "top 60%" } });
      if (window.DrawSVGPlugin) {
        gsap.from(visBlock.querySelectorAll(".vis-route"), { drawSVG: 0, duration: 1.8, ease: "power2.inOut", stagger: 0.3,
          scrollTrigger: { trigger: visBlock, start: "top 70%" } });
      }
    }

    // E3 · events arrive one by one
    var intel = document.getElementById("etsIntel");
    if (intel) {
      gsap.from(intel.querySelectorAll(".intel-list li"), { x: 30, opacity: 0, duration: 0.6, ease: "power3.out", stagger: 0.28,
        scrollTrigger: { trigger: intel, start: "top 66%" } });
    }

    // E4 · the automation chain fires as you scroll through it
    var auto = document.getElementById("etsAuto");
    if (auto) {
      var nodes = auto.querySelectorAll(".auto-node"), links = auto.querySelectorAll(".auto-link i");
      var atl = gsap.timeline({ scrollTrigger: { trigger: auto, start: "top 70%", end: "bottom 55%", scrub: 0.8 } });
      nodes.forEach(function (nd, i) {
        atl.fromTo(nd, { opacity: 0.25, y: 18 }, { opacity: 1, y: 0, duration: 0.5 });
        if (links[i]) atl.to(links[i], { scaleX: 1, scaleY: 1, duration: 0.5, ease: "none" });
      });
    }

    // E5 · ledger reconciles row by row; the held row pulses amber
    var audit = document.getElementById("etsAudit");
    if (audit) {
      var ltl = gsap.timeline({ scrollTrigger: { trigger: audit, start: "top 66%" } });
      ltl.from(audit.querySelectorAll(".ledger-row"), { opacity: 0, x: -20, duration: 0.5, stagger: 0.14, ease: "power2.out" })
        .from(audit.querySelectorAll(".ledger-row span:last-child"), { opacity: 0, scale: 0.8, duration: 0.35, stagger: 0.1 }, "-=0.4")
        .fromTo(audit.querySelector(".ledger-row .flag"), { textShadow: "0 0 0 rgba(233,162,75,0)" },
          { textShadow: "0 0 14px rgba(233,162,75,0.9)", duration: 0.5, yoyo: true, repeat: 3 })
        .from(audit.querySelector(".ledger-foot"), { opacity: 0, y: 10, duration: 0.5 }, "-=1");
    }

    // E7 · console powers up: tilts flat, panels light, bars grow, bays fill
    var cmd = document.getElementById("etsCmd");
    if (cmd) {
      var con = cmd.querySelector(".cmd-console");
      gsap.fromTo(con, { rotationX: 16, transformPerspective: 1400, transformOrigin: "50% 100%" }, { rotationX: 0, ease: "none",
        scrollTrigger: { trigger: cmd, start: "top bottom", end: "center 60%", scrub: true } });
      var ctl = gsap.timeline({ scrollTrigger: { trigger: cmd, start: "top 60%" } });
      ctl.from(con.querySelectorAll(".cmd-panel"), { opacity: 0, y: 16, duration: 0.5, stagger: 0.08 })
        .from(con.querySelectorAll(".cmd-bars i"), { scaleY: 0, duration: 0.6, stagger: 0.06, ease: "power3.out" }, "-=0.2")
        .from(con.querySelectorAll(".cmd-bays i.on"), { opacity: 0, duration: 0.2, stagger: 0.07 }, "-=0.6");
      if (window.DrawSVGPlugin) ctl.from(con.querySelector(".cmd-route"), { drawSVG: 0, duration: 1.2, ease: "power2.inOut" }, 0.2);
      gsap.to(con.querySelectorAll(".cmd-dot"), { opacity: 0.35, duration: 0.9, yoyo: true, repeat: -1, stagger: 0.3, ease: "sine.inOut" });
    }

    // E8 · actuals draw, then the forecast extends past "now"
    var pred = document.getElementById("etsPred");
    if (pred && window.DrawSVGPlugin) {
      var ptl = gsap.timeline({ scrollTrigger: { trigger: pred, start: "top 66%" } });
      ptl.from(pred.querySelector(".pred-actual"), { drawSVG: 0, duration: 1.4, ease: "power2.inOut" })
        .from(pred.querySelector(".pred-now"), { opacity: 0, duration: 0.3 })
        .from(pred.querySelector(".pred-band"), { opacity: 0, duration: 0.6 }, "<")
        .fromTo(pred.querySelector(".pred-fore"), { opacity: 0, strokeDashoffset: 60 }, { opacity: 1, strokeDashoffset: 0, duration: 1.2, ease: "power2.out" }, "<")
        .from(pred.querySelector(".pred-pin"), { scale: 0, transformOrigin: "50% 50%", duration: 0.5, ease: "back.out(3)" })
        .from(pred.querySelector(".pred-callout"), { x: 24, opacity: 0, duration: 0.6, ease: "power3.out" }, "-=0.2");
    }
  })();

  /* ── Process steps: staggered rise ─────────────────────────── */
  var processSteps = gsap.utils.toArray("#processTrack .process-step");
  if (processSteps.length) {
    if (reduceMotion) {
      gsap.set(processSteps, { opacity: 1 });
    } else {
      gsap.fromTo(processSteps,
        { opacity: 0, y: 66, scale: 0.96 },
        {
          opacity: 1, y: 0, scale: 1,
          duration: 1.05, ease: "power3.out", stagger: 0.16,
          scrollTrigger: { trigger: "#processTrack", start: "top 82%" }
        });
    }
  }

  /* ── Impact band: cinematic item cascade ───────────────────── */
  var impactBand = document.querySelector(".impact-band");
  var impactItems = gsap.utils.toArray(".impact-item");
  if (impactBand) {
    if (reduceMotion) {
      gsap.set([impactBand].concat(impactItems), { opacity: 1 });
    } else {
      var impactTl = gsap.timeline({
        scrollTrigger: { trigger: impactBand, start: "top 82%" }
      });
      impactTl.fromTo(impactBand,
          { opacity: 0, y: 64, scale: 0.965 },
          { opacity: 1, y: 0, scale: 1, duration: 1.15, ease: "power3.out" })
        .fromTo(impactItems,
          { opacity: 0, y: 38, scale: 0.9 },
          { opacity: 1, y: 0, scale: 1, duration: 0.9, ease: "back.out(1.7)", stagger: 0.16 }, "-=0.6");
    }
  }

  /* ── Awards: hero-scale card cascade ───────────────────────── */
  var awardCards = gsap.utils.toArray("#company .award");
  if (awardCards.length) {
    if (reduceMotion) {
      gsap.set(awardCards, { opacity: 1 });
    } else {
      /* Cinematic reveal: each card rises out of depth through a mask,
         de-blurs into focus, then a light sweep crosses its glass and its
         figure, title and line settle in. While the section scrolls, the
         cards drift at different depths (yPercent, so it never fights the
         entrance's y). */
      var awardsGrid = document.querySelector("#company .awards-grid");
      awardCards.forEach(function (card) {
        var glare = document.createElement("span");
        glare.className = "award-glare";
        glare.setAttribute("aria-hidden", "true");
        card.appendChild(glare);
      });
      var awardTl = gsap.timeline({
        scrollTrigger: { trigger: awardsGrid, start: "top 82%" }
      });
      awardTl.fromTo(awardCards,
        {
          opacity: 0, y: 90, z: -260, rotateX: 18, scale: 0.9,
          filter: "blur(14px)",
          clipPath: "inset(100% 0% 0% 0% round 20px)",
          transformPerspective: 1200, transformOrigin: "center bottom"
        },
        {
          opacity: 1, y: 0, z: 0, rotateX: 0, scale: 1,
          filter: "blur(0px)",
          clipPath: "inset(0% 0% 0% 0% round 20px)",
          duration: 1.25, ease: "expo.out", stagger: 0.14,
          clearProps: "filter,clipPath,z"
        })
        .fromTo(awardCards.map(function (c) { return c.querySelector(".award-glare"); }),
          { xPercent: -140, opacity: 1 },
          { xPercent: 260, opacity: 0, duration: 1.1, ease: "power2.inOut", stagger: 0.14 },
          0.45)
        .from(awardCards.map(function (c) { return c.querySelectorAll(".stat-num, b, span:not(.award-glare):not(.stat-num):not(.stat-num *)"); }).reduce(function (all, list) { return all.concat([].slice.call(list)); }, []),
          { opacity: 0, y: 16, duration: 0.7, ease: "power3.out", stagger: 0.05, clearProps: "opacity,transform" },
          0.35);
      /* number flare as each figure lands */
      awardTl.fromTo(awardCards.map(function (c) { return c.querySelector(".stat-num"); }),
        { color: "#4fd8ff", textShadow: "0 0 22px rgba(79,216,255,0.8)" },
        { color: "#f5f7fa", textShadow: "0 0 0px rgba(79,216,255,0)", duration: 1.2, ease: "power2.out", stagger: 0.14 },
        0.9);
      /* camera move: the grid starts laid back in 3D and lowers flat as it arrives */
      gsap.fromTo(awardsGrid,
        { rotateX: 24, y: 90, scale: 0.9, transformPerspective: 1400, transformOrigin: "50% 100%" },
        {
          rotateX: 0, y: 0, scale: 1, ease: "none",
          scrollTrigger: { trigger: awardsGrid, start: "top bottom", end: "top 40%", scrub: 1 }
        });
      /* backdrop: the giant "12" drifts and swells, the light sweeps across */
      var awardsBig = document.querySelector("#company .awards-big");
      var awardsLight = document.querySelector("#company .awards-light");
      if (awardsBig) {
        gsap.fromTo(awardsBig,
          { yPercent: 18, scale: 0.86, opacity: 0 },
          {
            yPercent: -12, scale: 1.06, opacity: 1, ease: "none",
            scrollTrigger: { trigger: "#company", start: "top bottom", end: "bottom top", scrub: 1.2 }
          });
      }
      if (awardsLight) {
        gsap.fromTo(awardsLight,
          { xPercent: -60 },
          {
            xPercent: 170, ease: "none",
            scrollTrigger: { trigger: "#company", start: "top 80%", end: "bottom 20%", scrub: 0.8 }
          });
      }
      awardCards.forEach(function (card, i) {
        gsap.to(card, {
          yPercent: i % 2 ? -8 : 6,
          ease: "none",
          scrollTrigger: { trigger: awardsGrid, start: "top bottom", end: "bottom top", scrub: 0.8 }
        });
      });
    }
  }

  /* ── Corridor highway fill ─────────────────────────────────── */
  var fill = document.getElementById("highwayFill");
  if (fill) {
    gsap.fromTo(fill, { width: "0%" }, {
      width: "100%",
      ease: "none",
      scrollTrigger: {
        trigger: "#highway",
        start: "top 85%",
        end: "top 35%",
        scrub: 0.6
      }
    });
  }

  /* ── Subtle hero HUD breathing ─────────────────────────────── */
  /* ══════════════════════════════════════════════════════════
     ENHANCEMENT LAYER — new bands + site-wide GSAP choreography
     GSAP 3.15 premium plugins (vendored, used site-wide):
       SplitText       → [data-split] headline word masks
       ScrambleText    → section kickers decode-in
       DrawSVG         → software icons + circuit trace
       MotionPath      → circuit pulse travel
       ScrollToPlugin  → anchor glide when Lenis is absent
       CustomEase      → "cnxSwift" signature ease
     Hand-rolled fallbacks remain for every plugin path.
     ══════════════════════════════════════════════════════════ */
  var GLYPHS = "ABCDEFGHJKLMNPQRSTUVWXYZ0123456789·/°%+—";
  var finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  /* ── ScrambleText: GSAP ScrambleTextPlugin with robust fallback ─ */
  function scramble(el, dur) {
    if (!el || el.__scrambled) return;
    var finalText = el.textContent;
    if (!finalText || !finalText.trim()) return;
    el.__scrambled = true;

    if (window.ScrambleTextPlugin && hasGsap && !reduceMotion) {
      gsap.to(el, {
        duration: dur || 0.85,
        scrambleText: {
          text: finalText,
          chars: GLYPHS,
          speed: 0.55,
          revealDelay: 0.05
        },
        ease: "power2.out"
      });
      return;
    }

    var proxy = { p: 0 };
    gsap.to(proxy, {
      p: 1,
      duration: dur || 0.8,
      ease: "none",
      onUpdate: function () {
        var keep = Math.floor(proxy.p * finalText.length);
        var out = finalText.slice(0, keep);
        for (var i = keep; i < finalText.length; i++) {
          var raw = finalText.charAt(i);
          out += raw === " " ? " " : GLYPHS.charAt(Math.floor(Math.random() * GLYPHS.length));
        }
        el.textContent = out;
      },
      onComplete: function () { el.textContent = finalText; }
    });
  }

  // Interactive viewport decode for section kickers
  if (hasGsap && window.ScrollTrigger && !reduceMotion) {
    document.querySelectorAll(".kicker, .twin-cat, .fleet-card .kicker-sm, .process-meta").forEach(function (k) {
      ScrollTrigger.create({
        trigger: k,
        start: "top 90%",
        once: true,
        onEnter: function () { scramble(k, 0.85); }
      });
    });
  }

  /* ── 02 · Live telemetry ticker — seamless marquee ─────────── */
  var tickerTrack = document.getElementById("tickerTrack");
  var tickerBand = document.getElementById("ticker");
  if (tickerTrack && tickerBand && !reduceMotion) {
    tickerTrack.innerHTML += tickerTrack.innerHTML; // duplicate once → -50% loop is seamless
    var tickerTween = gsap.to(tickerTrack, {
      xPercent: -50,
      duration: 46,
      ease: "none",
      repeat: -1
    });
    ScrollTrigger.create({
      trigger: tickerBand,
      start: "top bottom",
      end: "bottom top",
      onToggle: function (self) { self.isActive ? tickerTween.play() : tickerTween.pause(); }
    });
    tickerBand.addEventListener("mouseenter", function () { tickerTween.timeScale(0.22); });
    tickerBand.addEventListener("mouseleave", function () { tickerTween.timeScale(1); });
  }

  /* ── 03 · Corridor — cinematic dark map, turn-by-turn follow cam ──
     Scroll drives one value, t (0 → 1 along the route). From it: the
     iQ arrow puck travels and turns with the road, the camera eases from
     the overview into a pitched 3D follow view and back out at the
     deepwater, the travelled path lights up in the logo's light, and the
     navigation banner / ETA bar count down live. Everything is vector,
     so it stays sharp at any resolution. */
  var cmStage = document.getElementById("corridorStage");
  var cmScene = document.getElementById("cmapScene");
  var cmSvg = document.getElementById("corridorMap");
  var cmCam = document.getElementById("cmapCam");
  var cmFog = document.getElementById("cmapFog");
  var corridorRoute = document.getElementById("corridorRoute");
  var corridorTrail = document.getElementById("corridorTrail");
  var corridorTrailGlow = document.getElementById("corridorTrailGlow");
  var corridorMarker = document.getElementById("corridorMarker");
  var corridorPuck = document.getElementById("corridorPuck");
  var corridorRing = document.getElementById("corridorRing");
  var cmapNodes = gsap.utils.toArray("#corridor .map-node");
  var cmapLegend = gsap.utils.toArray("#cmapLegend li");
  var corridorLen = corridorRoute && corridorRoute.getTotalLength ? corridorRoute.getTotalLength() : 0;

  function litCorridor(idx) {
    cmapNodes.forEach(function (n, i) {
      var was = n.classList.contains("is-on");
      n.classList.toggle("is-on", i <= idx);
      if (!was && i <= idx && i === idx && !reduceMotion) {   // arriving at a stop: the pin pops
        gsap.fromTo(n.querySelector(".pin-badge"), { scale: 1.7, transformOrigin: "50% 50%" }, { scale: 1, duration: 0.7, ease: "back.out(3)" });
        gsap.fromTo(n.querySelector(".pin-halo"), { attr: { r: 9 } }, { attr: { r: 15 }, duration: 0.8, ease: "power3.out" });
      }
    });
    cmapLegend.forEach(function (n, i) { n.classList.toggle("is-on", i <= idx); });
  }

  if (corridorLen && cmStage && cmSvg && cmCam && corridorMarker) {
    var CM = { W: 0, H: 0, z0: 1, P: 1200, phone: false, t: 0, seg: -1, idx: -1 };
    var BOX = { x: 110, y: 20, w: 1310, h: 860 };      // overview framing: route + labels
    var KM = [0, 1.4, 9.2, 24.8], MINS = 38, PUCK_TURN = 0;   // the vector arrow points east at 0°
    var bbs = gsap.utils.toArray("#corridorMap .bb").map(function (g) {
      return { el: g, x: +g.getAttribute("data-x"), y: +g.getAttribute("data-y"),
        min: +g.getAttribute("data-min"), pmin: +g.getAttribute("data-pmin"), o: -1 };
    });
    var strokes = gsap.utils.toArray("#corridorMap [data-px]").map(function (g) {
      var v = g.getAttribute("data-px").split(",");
      return { el: g, a: +v[0], b: +v[1] };
    });
    // where each stop sits along the route (fraction of its length)
    var samples = [];
    for (var si = 0; si <= 600; si++) {
      var sp = corridorRoute.getPointAtLength(corridorLen * si / 600);
      samples.push([sp.x, sp.y]);
    }
    var fr = cmapNodes.map(function (n) {
      var nx = +n.getAttribute("data-x"), ny = +n.getAttribute("data-y"), best = 0, bd = Infinity;
      samples.forEach(function (q, i) {
        var d = (q[0] - nx) * (q[0] - nx) + (q[1] - ny) * (q[1] - ny);
        if (d < bd) { bd = d; best = i; }
      });
      return best / 600;
    });
    fr[0] = 0; fr[fr.length - 1] = 1;
    // Compass Mobility Hub (the Compass garage, Eanchakkal): lights up as the arrow drives past
    var cmGarage = document.getElementById("cmapGarage");
    var frGarage = 2;
    if (cmGarage) {
      var gx = +cmGarage.getAttribute("data-x"), gy = +cmGarage.getAttribute("data-y"), gb = Infinity;
      samples.forEach(function (q, i) {
        var d = (q[0] - gx) * (q[0] - gx) + (q[1] - gy) * (q[1] - gy);
        if (d < gb) { gb = d; frGarage = i / 600; }
      });
    }
    function kmAt(t) {
      for (var i = 0; i < fr.length - 1; i++) {
        if (t <= fr[i + 1]) return KM[i] + (KM[i + 1] - KM[i]) * (t - fr[i]) / Math.max(1e-6, fr[i + 1] - fr[i]);
      }
      return KM[KM.length - 1];
    }
    [corridorTrail, corridorTrailGlow].forEach(function (p) {
      if (p) { p.style.strokeDasharray = corridorLen + " " + corridorLen; p.style.strokeDashoffset = corridorLen; }
    });

    // live navigation HUD
    var navDist = document.getElementById("navDist");
    var navRoad = document.getElementById("navRoad");
    var navTo = document.getElementById("navTo");
    var navTurn = document.getElementById("navTurn");
    var navTxt = document.getElementById("navTxt");
    var navKm = document.getElementById("navKm");
    var navMin = document.getElementById("navMin");
    var navEta = document.getElementById("navEta");
    var navCoords = document.getElementById("navCoords");
    var TURN = {
      right: "M7 20V12a3 3 0 0 1 3-3h8M14 5l4 4-4 4",
      slight: "M9 20v-6.5a3 3 0 0 1 .9-2.1L16 5.5M11 5h5.5v5.5",
      straight: "M12 20V5M7 10l5-5 5 5",
      arrive: "M12 21s-6-5.4-6-10.2a6 6 0 1 1 12 0C18 15.6 12 21 12 21zM12 8.6a2.2 2.2 0 1 0 0 4.4 2.2 2.2 0 0 0 0-4.4z"
    };
    /* four scroll sections: IT Park → TRV Airport → Compass Mobility Hub
       (the garage) → Vizhinjam Port. Each leg gets the same scroll distance. */
    var STOPS = [
      { f: fr[2], km: KM[2] },
      { f: frGarage <= 1 ? frGarage : fr[2], km: kmAt(frGarage <= 1 ? frGarage : fr[2]) },
      { f: 1, km: KM[KM.length - 1] }
    ];
    var SEG = {
      park: { turn: "right", road: "Technopark Phase III", to: "toward TRV Airport · via Ganga Tower P3" },
      airport: { turn: "slight", road: "NH 66 · Kovalam Bypass", to: "toward TRV Airport" },
      hub: { turn: "straight", road: "NH 66 · Kovalam Bypass", to: "toward Compass Mobility Hub" },
      port: { turn: "straight", road: "NH 66 · Vizhinjam Port Road", to: "toward Vizhinjam Seaport" },
      arrive: { turn: "arrive", road: "Vizhinjam Seaport", to: "L4 · Deepwater · on time" }
    };
    if (navEta) {
      var eta = new Date(Date.now() + MINS * 60000);
      navEta.textContent = ("0" + eta.getHours()).slice(-2) + ":" + ("0" + eta.getMinutes()).slice(-2);
    }
    function setText(el, s) { if (el && el.textContent !== s) el.textContent = s; }
    function fmtDist(d) {
      return d < 1 ? Math.max(50, Math.round(d * 20) * 50) + " m" : d.toFixed(1) + " km";
    }
    function hud(t, km, idx, animate) {
      var arrived = t > 0.992;
      var n = 0;
      while (n < STOPS.length - 1 && t >= STOPS[n].f - 0.003) n++;
      var key = arrived ? "arrive" : n === 0 ? (t < fr[1] ? "park" : "airport") : n === 1 ? "hub" : "port";
      if (key !== CM.seg) {
        CM.seg = key;
        var s = SEG[key];
        if (navTurn) navTurn.setAttribute("d", TURN[s.turn]);
        setText(navRoad, s.road);
        setText(navTo, s.to);
        if (animate && navTxt) {
          gsap.fromTo([navTurn.parentNode, navTxt], { y: 16, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.5, stagger: 0.06, ease: "power3.out", overwrite: true });
        }
      }
      setText(navDist, arrived ? "Arrived" : fmtDist(Math.max(0, STOPS[n].km - km)));
      var left = Math.max(0, KM[KM.length - 1] - km);
      setText(navKm, left.toFixed(1));
      setText(navMin, String(Math.round(left / KM[KM.length - 1] * MINS)));
    }

    function smooth(a, b, x) { x = Math.min(1, Math.max(0, (x - a) / (b - a))); return x * x * (3 - 2 * x); }
    function cmLayout() {
      CM.W = cmStage.clientWidth || 1;
      CM.H = cmStage.clientHeight || 1;
      CM.phone = CM.W < 600;
      CM.z0 = Math.min(CM.W * 0.96 / BOX.w, CM.H * (CM.phone ? 0.6 : 0.74) / BOX.h);
      CM.P = Math.max(CM.W, CM.H) * (CM.phone ? 1.25 : 1.05);
      cmSvg.setAttribute("viewBox", "0 0 " + (CM.W * 1.6).toFixed(1) + " " + (CM.H * 1.6).toFixed(1));
      // phones: the anchor's name sits above its pin, clear of the stage edge
      var l1 = cmapNodes[0] && cmapNodes[0].querySelector(".pin-name");
      if (l1) {
        l1.setAttribute("text-anchor", CM.phone ? "start" : "end");
        l1.setAttribute("x", CM.phone ? -10 : -24);
        l1.setAttribute("y", CM.phone ? -20 : -1);
        var l1s = cmapNodes[0].querySelector(".pin-sub");
        if (l1s) l1s.setAttribute("x", -24);
      }
      var l4 = cmapNodes[3] && cmapNodes[3].querySelector(".pin-name");
      if (l4) {
        l4.setAttribute("text-anchor", CM.phone ? "end" : "middle");
        l4.setAttribute("x", CM.phone ? -10 : 0);
        l4.setAttribute("y", CM.phone ? 26 : 30);
      }
    }
    function cmRender(t, animate) {
      CM.t = t;
      var L = t * corridorLen;
      var p = corridorRoute.getPointAtLength(L);
      var a = corridorRoute.getPointAtLength(Math.max(0, L - 8));
      var b = corridorRoute.getPointAtLength(Math.min(corridorLen, L + 8));
      var hd = Math.atan2(b.y - a.y, b.x - a.x);
      // camera: overview → pitched follow → overview
      // (with Reduce Motion the camera holds the overview: only the arrow moves, under your scroll)
      var k = reduceMotion ? 0 : smooth(0.015, 0.14, t) * (1 - smooth(0.86, 0.985, t));
      // full-view 3D: the whole corridor stays in frame; the camera tilts
      // into 3D with only a gentle push and a light drift toward the arrow
      var zr = Math.exp(k * Math.log(CM.phone ? 1.35 : 1.22));
      var z = CM.z0 * zr, inv = 1 / z;
      var look = 0;
      var cx = BOX.x + BOX.w / 2, cy = BOX.y + BOX.h / 2;
      cx += (p.x - cx) * k * 0.22;
      cy += (p.y - cy) * k * 0.22;
      var ay = 0.5 + 0.06 * k;                        // anchor, as a fraction of the stage height
      cmCam.setAttribute("transform", "translate(" + (0.8 * CM.W).toFixed(2) + " " + ((ay + 0.3) * CM.H).toFixed(2) +
        ") scale(" + z.toFixed(5) + ") translate(" + (-cx).toFixed(2) + " " + (-cy).toFixed(2) + ")");
      var pitch = 42 * k;
      gsap.set(cmSvg, { rotationX: pitch, transformPerspective: CM.P, transformOrigin: "50% " + ((ay + 0.3) / 1.6 * 100).toFixed(2) + "%" });
      if (cmFog) cmFog.style.opacity = k.toFixed(3);
      // constant on-screen widths and labels (counter the zoom and the pitch)
      var ky = Math.min(1.45, 1 / Math.cos(pitch * Math.PI / 180));
      strokes.forEach(function (s) { s.el.setAttribute("stroke-width", ((s.a + s.b * k) * inv).toFixed(3)); });
      bbs.forEach(function (d) {
        d.el.setAttribute("transform", "translate(" + d.x + " " + d.y + ") scale(" + inv.toFixed(5) + " " + (inv * ky).toFixed(5) + ")");
        var m = CM.phone ? d.pmin : d.min;
        var o = m <= 0 ? 1 : Math.round(Math.min(1, Math.max(0, (zr - m) / 0.35)) * 100) / 100;
        if (o !== d.o) { d.o = o; d.el.style.opacity = o; d.el.style.visibility = o ? "" : "hidden"; }
      });
      // travelled path + puck
      var off = (corridorLen * (1 - t)).toFixed(2);
      corridorTrail.style.strokeDashoffset = off;
      if (corridorTrailGlow) corridorTrailGlow.style.strokeDashoffset = off;
      var ps = (CM.phone ? 0.9 : 1) * inv;
      corridorMarker.setAttribute("transform", "translate(" + p.x.toFixed(2) + " " + p.y.toFixed(2) + ") scale(" + ps.toFixed(5) + " " + (ps * ky).toFixed(5) + ")");
      if (corridorPuck) corridorPuck.setAttribute("transform", "rotate(" + (hd * 180 / Math.PI + PUCK_TURN).toFixed(2) + ")");
      // stops, legend, banner, ETA bar, live coordinates
      var idx = 0;
      for (var i = 0; i < fr.length; i++) if (t >= fr[i] - 0.004) idx = i;
      if (idx !== CM.idx) { CM.idx = idx; litCorridor(idx); }
      if (cmGarage) {
        var gOn = t >= frGarage - 0.004;
        if (gOn !== cmGarage.classList.contains("is-on")) {
          cmGarage.classList.toggle("is-on", gOn);
          if (gOn && animate) {
            gsap.fromTo(cmGarage.querySelector(".pin-badge"), { scale: 1.7, transformOrigin: "50% 50%" }, { scale: 1, duration: 0.7, ease: "back.out(3)" });
          }
        }
      }
      hud(t, kmAt(t), idx, animate);
      if (navCoords) {
        var lat = 8.5570 - (p.x - 160) / (111 * 56), lon = 76.8811 + (770 - p.y) / (110 * 56);
        setText(navCoords, lat.toFixed(4) + "° N · " + lon.toFixed(4) + "° E");
      }
    }

    cmLayout();
    /* The drive is scroll-driven for everyone — it moves only as you scroll.
       With Reduce Motion the camera stays still (no zoom, tilt or entrance). */
    {
      cmRender(0, false);
      var cmProxy = { t: 0 };
      var cmTl = gsap.timeline({
        scrollTrigger: {
          trigger: cmStage,
          start: "center 54%",   // clear of the fixed site header
          end: function () { return "+=" + Math.round(window.innerHeight * (CM.phone ? 2.6 : 2.4)); },
          pin: true,
          scrub: 0.9,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          snap: { snapTo: "labels", inertia: false, duration: { min: 0.35, max: 1 }, delay: 0.18, ease: "power2.inOut" }
        }
      });
      /* four sections, one per stop — IT Park → Airport → Mobility Hub
         (garage) → Port. Each leg eases in and out, holds at its stop, and
         the scroll snaps to the nearest stop when you pause. */
      var cmUpd = function () { cmRender(cmProxy.t, !reduceMotion); };
      cmTl.addLabel("itpark", 0);
      ["airport", "hub", "port"].forEach(function (name, i) {
        cmTl.to(cmProxy, { t: STOPS[i].f, duration: 1, ease: "power1.inOut", onUpdate: cmUpd });
        if (i < 2) {
          cmTl.to({}, { duration: 0.12 });
          cmTl.addLabel(name);               // the snap point sits mid-hold at each stop
          cmTl.to({}, { duration: 0.12 });
        } else {
          cmTl.addLabel(name);
        }
      });
      ScrollTrigger.addEventListener("refreshInit", cmLayout);
      ScrollTrigger.addEventListener("refresh", function () { cmRender(cmProxy.t, false); });

      // entrance: the map settles out of a soft zoom, the HUD drops in
      if (!reduceMotion) gsap.timeline({ scrollTrigger: { trigger: cmStage, start: "top 86%" } })
        .fromTo(cmScene, { opacity: 0, scale: 1.12 }, { opacity: 1, scale: 1, duration: 1.6, ease: "expo.out" })
        .fromTo("#navBanner", { y: -26, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" }, 0.25)
        .fromTo("#corridorStage .nav-btn", { scale: 0.6, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.6, stagger: 0.08, ease: "back.out(2)" }, 0.4)
        .fromTo("#corridorStage .nav-bar", { y: 26, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" }, 0.35);
      if (corridorRing && !reduceMotion) {
        gsap.fromTo(corridorRing,
          { attr: { r: 9 }, opacity: 0.7 },
          { attr: { r: 24 }, opacity: 0, duration: 1.8, ease: "power2.out", repeat: -1 });
      }
    }
  }

  /* ── 10 · Timeline — scrubbed rail + phase activation ──────── */
  var tlTrack = document.getElementById("tlTrack");
  var tlFill = document.getElementById("tlFill");
  var tlItems = gsap.utils.toArray("#tlTrack .tl-item");
  if (tlTrack && tlFill && tlItems.length) {
    if (reduceMotion) {
      gsap.set(tlFill, { height: "100%" });
      tlItems.forEach(function (it) { it.classList.add("is-on"); });
    } else {
      gsap.fromTo(tlFill, { height: "0%" }, {
        height: "100%",
        ease: "none",
        scrollTrigger: { trigger: tlTrack, start: "top 74%", end: "bottom 74%", scrub: 0.5 }
      });
      tlItems.forEach(function (item) {
        gsap.fromTo(item.querySelector(".tl-card"),
          { opacity: 0, y: 44 },
          {
            opacity: 1,
            y: 0,
            duration: 0.95,
            ease: "power3.out",
            scrollTrigger: { trigger: item, start: "top 86%" }
          });
        ScrollTrigger.create({
          trigger: item,
          start: "top 74%",
          end: "bottom 34%",
          onToggle: function (self) { item.classList.toggle("is-on", self.isActive); }
        });
      });
    }
  }

  /* ── Process: scrubbed active step ─────────────────────────── */
  var procSteps = gsap.utils.toArray("#processTrack .process-step");
  if (procSteps.length) {
    if (reduceMotion) {
      procSteps.forEach(function (s) { s.classList.add("is-active"); });
    } else {
      procSteps.forEach(function (step) {
        ScrollTrigger.create({
          trigger: step,
          start: "top 70%",
          end: "bottom 42%",
          onToggle: function (self) { step.classList.toggle("is-active", self.isActive); }
        });
      });
    }
  }

  /* ── Highway: travelling vehicle + sequential stop activation ─ */
  var hwStops = gsap.utils.toArray(".highway-stops li");
  var hwVehicle = document.getElementById("highwayVehicle");
  if (hwStops.length && !reduceMotion) {
    var hwTl = gsap.timeline({
      scrollTrigger: {
        trigger: "#highway",
        start: "top 85%",
        end: "top 35%",
        scrub: 0.6,
        onUpdate: function (self) {
          var lit = Math.min(hwStops.length, Math.floor(self.progress * hwStops.length + 0.999));
          hwStops.forEach(function (s, i) { s.classList.toggle("is-on", i < lit); });
        }
      }
    });
    if (hwVehicle) {
      hwTl.fromTo(hwVehicle, { left: "0%" }, { left: "100%", ease: "none", duration: 1 }, 0);
      gsap.to(hwVehicle, {
        boxShadow: "0 0 0 6px rgba(79, 216, 255, 0.30), 0 0 22px rgba(79, 216, 255, 0.9)",
        duration: 1.1, ease: "sine.inOut", yoyo: true, repeat: -1
      });
    }
  } else if (hwStops.length) {
    hwStops.forEach(function (s) { s.classList.add("is-on"); });
  }

  /* ── Charging: per-bay surge flash when a bay energizes ────── */
  var bayGrid = document.getElementById("bayGrid");
  if (bayGrid && bays.length && !reduceMotion && window.MutationObserver) {
    var lastLit = 0;
    new MutationObserver(function () {
      var lit = bayGrid.querySelectorAll(".bay.is-on").length;
      if (lit > lastLit && bays[lit - 1]) {
        var surgedBay = bays[lit - 1];
        surgedBay.classList.add("is-surge");
        gsap.fromTo(surgedBay, { scale: 1.028 }, { scale: 1, duration: 0.7, ease: "power3.out" });
        gsap.delayedCall(0.85, function () { surgedBay.classList.remove("is-surge"); });
      }
      lastLit = lit;
    }).observe(bayGrid, { subtree: true, attributes: true, attributeFilter: ["class"] });
  }

  /* ── Fleet: emphasise the card nearest the viewport centre ─── */
  if (fleetPin && !reduceMotion && window.innerWidth >= 720) {
    var fleetCards = gsap.utils.toArray("#fleetTrack .fleet-card");
    if (fleetCards.length) {
      var focusedCard = null;
      ScrollTrigger.create({
        trigger: fleetPin,
        start: "top bottom",
        end: "bottom top",
        onUpdate: function () {
          var mid = window.innerWidth / 2;
          var best = null;
          var bestDist = Infinity;
          fleetCards.forEach(function (c) {
            var r = c.getBoundingClientRect();
            var d = Math.abs((r.left + r.right) / 2 - mid);
            if (d < bestDist) { bestDist = d; best = c; }
          });
          if (best && best !== focusedCard) {
            if (focusedCard) focusedCard.classList.remove("is-focus");
            best.classList.add("is-focus");
            focusedCard = best;
          }
        }
      });
    }
  }

  /* ── Subtle hero HUD breathing ─────────────────────────────── */
  if (!reduceMotion) {
    gsap.to(".hud-corner", {
      opacity: 0.35,
      duration: 2.4,
      ease: "sine.inOut",
      yoyo: true,
      repeat: -1,
      stagger: 0.6
    });
  }

  /* ── Clients: implemented-first cascade ────────────────────── */
  var clientCards = gsap.utils.toArray("#clientGrid .client-card");
  if (clientCards.length) {
    if (reduceMotion) {
      gsap.set(clientCards, { opacity: 1 });
    } else {
      gsap.fromTo(clientCards,
        { opacity: 0, y: 48, scale: 0.96 },
        {
          opacity: 1, y: 0, scale: 1,
          duration: 0.9, ease: cnxEase, stagger: 0.09,
          scrollTrigger: { trigger: "#clientGrid", start: "top 84%" }
        });
      /* EV run: on every card a small electric car drives across the
         bottom edge, leaving a light trail, and the tag charges up */
      clientCards.forEach(function (card, i) {
        var run = document.createElement("span");
        run.className = "ev-run";
        run.setAttribute("aria-hidden", "true");
        run.innerHTML = '<i class="ev-trail"></i><svg class="ev-car" viewBox="0 0 40 18"><path d="M4 13V9.6c0-1 .6-1.8 1.6-2.1L11 6l4.6-3.4c.7-.5 1.5-.8 2.4-.8h8.4c1.2 0 2.3.6 3 1.6L32 6.6l3.6 1c1.3.4 2.2 1.6 2.2 3V13z"/><circle cx="11" cy="13.5" r="3"/><circle cx="30" cy="13.5" r="3"/><path class="ev-bolt" d="M20.6 4.4l-2.6 3.6h2l-.8 3 2.8-3.8h-2z"/></svg>';
        card.appendChild(run);
        var car = run.querySelector(".ev-car"), trail = run.querySelector(".ev-trail");
        var tl = gsap.timeline({ scrollTrigger: { trigger: card, start: "top 86%" }, delay: 0.5 + i * 0.12 });
        tl.fromTo(car, { left: "-12%" }, { left: "100%", duration: 2.2, ease: "power2.inOut" })
          .fromTo(trail, { scaleX: 0, opacity: 1 }, { scaleX: 1, duration: 2.2, ease: "power2.inOut" }, 0)
          .to(trail, { opacity: 0.25, duration: 0.8 }, ">-0.2")
          .fromTo(card.querySelector(".client-tag"), { boxShadow: "0 0 0 0 rgba(79,227,160,0)" },
            { boxShadow: "0 0 22px 2px rgba(79,227,160,0.45)", duration: 0.35, yoyo: true, repeat: 3 }, 1.6);
        card.addEventListener("pointerenter", function () { if (!tl.isActive()) tl.restart(); });
      });
      // each company's colour mark pops in after its card lands
      gsap.fromTo("#clientGrid .client-mark",
        { scale: 0.3, rotation: -14, opacity: 0 },
        {
          scale: 1, rotation: 0, opacity: 1,
          duration: 0.8, ease: "back.out(2.2)", stagger: 0.09, delay: 0.3,
          scrollTrigger: { trigger: "#clientGrid", start: "top 84%" }
        });
    }
  }

  /* ── CTA: halo pulse behind the action cluster ─────────────── */
  var ctaHalo = document.querySelector(".cta-halo");
  if (ctaHalo && !reduceMotion) {
    var haloTween = gsap.fromTo(ctaHalo,
      { opacity: 0, scale: 0.88 },
      {
        opacity: 0.9,
        scale: 1.05,
        duration: 2.6,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
        paused: true
      });
    ScrollTrigger.create({
      trigger: "#cta",
      start: "top 92%",
      end: "bottom top",
      onToggle: function (self) { self.isActive ? haloTween.play() : haloTween.pause(); }
    });
  }

  /* ── Port cards: numbers flip in character by character ──────
     Wraps each card number's own characters ("24/7", the "+") in spans
     and flips them up one after another; the counting digits keep their
     odometer roll. A short cyan flare then settles back to white. */
  if (!reduceMotion) {
    gsap.utils.toArray("#port .port-cards .mini b").forEach(function (b, i) {
      [].slice.call(b.childNodes).forEach(function (node) {
        if (node.nodeType !== 3 || !node.textContent.trim()) return;
        var frag = document.createDocumentFragment();
        node.textContent.split("").forEach(function (ch) {
          var sp = document.createElement("span");
          sp.className = "pc-char";
          sp.textContent = ch;
          frag.appendChild(sp);
        });
        b.replaceChild(frag, node);
      });
      var parts = b.querySelectorAll(".pc-char, .odo");
      gsap.timeline({ scrollTrigger: { trigger: b.closest(".mini"), start: "top 88%" } })
        .from(parts, {
          yPercent: 110, rotateX: -90, opacity: 0,
          duration: 0.75, ease: "back.out(1.8)", stagger: 0.07, delay: i * 0.06
        })
        .fromTo(b, { color: "#4fd8ff", textShadow: "0 0 18px rgba(79,216,255,0.75)" },
          { color: "#f5f7fa", textShadow: "0 0 0 rgba(79,216,255,0)", duration: 1.1, ease: "power2.out" }, "-=0.35");
    });
  }

  /* ── Software cards: realistic icons pop in, then float ────── */
  if (!reduceMotion) {
    gsap.utils.toArray("#swGrid .sw-icon-real").forEach(function (icon, i) {
      var card = icon.closest(".sw-card") || icon;
      var glyph = icon.querySelector(".ri-glyph");
      gsap.timeline({ scrollTrigger: { trigger: card, start: "top 88%" } })
        .fromTo(icon,
          { opacity: 0, scale: 0.55, rotateY: -35, rotateX: 18, transformPerspective: 600 },
          { opacity: 1, scale: 1, rotateY: 0, rotateX: 0, duration: 1.0, ease: "back.out(1.6)", delay: i * 0.08 })
        .fromTo(glyph,
          { y: 10, scale: 0.8, opacity: 0 },
          { y: 0, scale: 1, opacity: 1, duration: 0.7, ease: "power3.out" }, "-=0.55");
      gsap.to(glyph, { y: -2.5, duration: 2.2 + i * 0.2, ease: "sine.inOut", yoyo: true, repeat: -1, delay: 1.2 });
    });
  }


  /* ── Kickers: scramble-in telemetry text ───────────────────── */
  if (!reduceMotion) {
    gsap.utils.toArray("section .kicker").forEach(function (k) {
      if (k.closest("#hero")) return;
      ScrollTrigger.create({
        trigger: k,
        start: "top 94%",
        once: true,
        onEnter: function () {
          if (window.ScrambleTextPlugin) {
            gsap.to(k, {
              duration: 0.9,
              ease: "none",
              scrambleText: { text: k.textContent, chars: "upperCase", speed: 0.35 }
            });
          } else {
            scramble(k, 0.8);
          }
        }
      });
    });
  }

  /* ── Universal 3D pointer tilt (desktop fine pointers only) ── */
  if (finePointer && !reduceMotion && window.innerWidth >= 900) {
    [
      { sel: ".stats-grid .stat", max: 5 },
      { sel: "#swGrid .sw-card", max: 6 },
      { sel: "#company .award", max: 6 },
      { sel: ".port-cards .mini", max: 6 },
      { sel: "#tlTrack .tl-card", max: 5 },
          ].forEach(function (cfg) {
      gsap.utils.toArray(cfg.sel).forEach(function (el) {
        el.classList.add("tilt");
        gsap.set(el, { transformPerspective: 1000 });
        var toRX = gsap.quickTo(el, "rotationX", { duration: 0.6, ease: "power3.out" });
        var toRY = gsap.quickTo(el, "rotationY", { duration: 0.6, ease: "power3.out" });
        el.addEventListener("pointermove", function (e) {
          var r = el.getBoundingClientRect();
          toRY(((e.clientX - r.left) / r.width - 0.5) * cfg.max * 2);
          toRX(-((e.clientY - r.top) / r.height - 0.5) * cfg.max * 2);
        });
        el.addEventListener("pointerleave", function () { toRX(0); toRY(0); });
      });
    });
  }

  /* ── Nav: scroll-hide + scrollspy from one trigger ─────────── */
  var navLinksAll = gsap.utils.toArray(".nav-links a");
  var footerLinksAll = gsap.utils.toArray(".footer-links a");
  var mobileLinksAll = gsap.utils.toArray(".mobile-menu-links a");
  var lastScrollY = window.scrollY;
  var spyCurrent = null;

  function refreshSpy() {
    var line = window.innerHeight * 0.45;
    var winner = null;
    navLinksAll.forEach(function (a) {
      var href = a.getAttribute("href") || "";
      if (href.charAt(0) !== "#") return;
      var sec = document.getElementById(href.slice(1));
      if (!sec) return;
      var r = sec.getBoundingClientRect();
      if (r.top <= line && r.bottom >= line) winner = a;
    });
    if (winner === spyCurrent) return;
    spyCurrent = winner;
    navLinksAll.forEach(function (x) { x.classList.remove("is-current"); });
    footerLinksAll.forEach(function (x) { x.classList.remove("is-current"); });
    mobileLinksAll.forEach(function (x) { x.classList.remove("is-current"); });
    if (!winner) return;
    winner.classList.add("is-current");
    var targetHref = winner.getAttribute("href");
    var footLink = document.querySelector('.footer-links a[href="' + targetHref + '"]');
    if (footLink) footLink.classList.add("is-current");
    var mobLink = document.querySelector('.mobile-menu-links a[href="' + targetHref + '"]');
    if (mobLink) mobLink.classList.add("is-current");
  }

  var navProgress = document.getElementById("navProgress");
  var backToTop = document.getElementById("backToTop");

  ScrollTrigger.create({
    start: 0,
    end: "max",
    onUpdate: function (self) {
      var y = self.scroll();
      var delta = y - lastScrollY;
      if (!reduceMotion && Math.abs(delta) > 4) {
        if (y > window.innerHeight * 0.85 && delta > 0) nav.classList.add("is-hidden");
        else nav.classList.remove("is-hidden");
      }
      if (navProgress) navProgress.style.transform = "scaleX(" + self.progress.toFixed(4) + ")";
      if (backToTop) {
        if (y > 380) backToTop.classList.add("is-visible");
        else backToTop.classList.remove("is-visible");
      }
      lastScrollY = y;
      refreshSpy();
    }
  });

  if (backToTop) {
    backToTop.addEventListener("click", function (e) {
      e.preventDefault();
      if (lenis) {
        lenis.scrollTo(0, { duration: 1.4 });
      } else {
        window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
      }
    });
  }

  /* ── Mobile menu drawer interaction ───────────────────────── */
  var navToggle = document.getElementById("navToggle");
  var mobileMenu = document.getElementById("mobileMenu");
  var mobileMenuClose = document.getElementById("mobileMenuClose");
  var mobileMenuBackdrop = document.getElementById("mobileMenuBackdrop");

  function openMobileMenu() {
    if (!mobileMenu) return;
    mobileMenu.classList.add("is-open");
    mobileMenu.setAttribute("aria-hidden", "false");
    if (navToggle) {
      navToggle.classList.add("is-active");
      navToggle.setAttribute("aria-expanded", "true");
    }
    document.body.style.overflow = "hidden";
  }

  function closeMobileMenu() {
    if (!mobileMenu) return;
    mobileMenu.classList.remove("is-open");
    mobileMenu.setAttribute("aria-hidden", "true");
    if (navToggle) {
      navToggle.classList.remove("is-active");
      navToggle.setAttribute("aria-expanded", "false");
    }
    document.body.style.overflow = "";
  }

  if (navToggle) {
    navToggle.addEventListener("click", function () {
      if (mobileMenu && mobileMenu.classList.contains("is-open")) {
        closeMobileMenu();
      } else {
        openMobileMenu();
      }
    });
  }
  if (mobileMenuClose) {
    mobileMenuClose.addEventListener("click", closeMobileMenu);
  }
  if (mobileMenuBackdrop) {
    mobileMenuBackdrop.addEventListener("click", closeMobileMenu);
  }

  document.querySelectorAll(".mobile-menu-links a, .mobile-menu-footer a").forEach(function (link) {
    link.addEventListener("click", function (e) {
      var href = link.getAttribute("href");
      closeMobileMenu();
      if (href && href.charAt(0) === "#") {
        var target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          if (lenis) {
            lenis.scrollTo(target, { offset: href === "#hero" ? 0 : -20, duration: 1.4 });
          } else {
            target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
          }
        }
      }
    });
  });

  window.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && mobileMenu && mobileMenu.classList.contains("is-open")) {
      closeMobileMenu();
    }
  });

  /* ── Magnetic glass buttons (desktop fine pointers only) ─────
     One document listener: each button starts drifting toward the
     cursor inside a 60px halo, with the pull fading out at the edge. */
  if (finePointer && !reduceMotion) {
    var magnets = gsap.utils.toArray(".btn-glass").map(function (btn) {
      btn.classList.add("is-magnetic");
      return {
        el: btn,
        xTo: gsap.quickTo(btn, "x", { duration: 0.55, ease: "power3.out" }),
        yTo: gsap.quickTo(btn, "y", { duration: 0.55, ease: "power3.out" }),
        on: false
      };
    });
    var MAG_HALO = 60;
    /* three buttons: measuring on every move is cheap, so no frame throttle */
    var magX = -9999, magY = -9999;
    var magUpdate = function () {
      magnets.forEach(function (m) {
        var r = m.el.getBoundingClientRect();
        /* undo the current pull so the halo is measured from the resting box */
        var cx = r.left + r.width / 2 - gsap.getProperty(m.el, "x");
        var cy = r.top + r.height / 2 - gsap.getProperty(m.el, "y");
        var dx = magX - cx, dy = magY - cy;
        var outX = Math.max(0, Math.abs(dx) - r.width / 2);
        var outY = Math.max(0, Math.abs(dy) - r.height / 2);
        var gap = Math.sqrt(outX * outX + outY * outY);
        if (gap < MAG_HALO) {
          var k = 1 - gap / MAG_HALO;
          m.xTo(dx * 0.16 * k);
          m.yTo(dy * 0.3 * k);
          m.on = true;
        } else if (m.on) {
          m.xTo(0); m.yTo(0);
          m.on = false;
        }
      });
    };
    document.addEventListener("pointermove", function (e) {
      if (e.pointerType && e.pointerType !== "mouse") return;
      magX = e.clientX; magY = e.clientY;
      magUpdate();
    }, { passive: true });
    /* page scrolls under a still cursor: re-measure so pulls don't stick */
    window.addEventListener("scroll", magUpdate, { passive: true });
    /* cursor leaves the window: release everything */
    document.addEventListener("mouseout", function (e) {
      if (e.relatedTarget) return;
      magX = magY = -9999;
      magnets.forEach(function (m) { m.xTo(0); m.yTo(0); m.on = false; });
    });
  }

  /* ── Footer: staggered settle ──────────────────────────────── */
  var footerInner = document.querySelector(".footer-inner");
  if (footerInner && !reduceMotion && footerInner.children.length) {
    gsap.fromTo(footerInner.children,
      { opacity: 0, y: 26 },
      {
        opacity: 1,
        y: 0,
        duration: 0.9,
        ease: "power3.out",
        stagger: 0.08,
        scrollTrigger: { trigger: ".footer", start: "top 94%" }
      });
  }

  /* ── Button pointer glow: CSS radial follows the cursor ────── */
  if (finePointer && !reduceMotion) {
    document.addEventListener("pointermove", function (e) {
      var b = e.target && e.target.closest ? e.target.closest(".btn-glass, .btn-apple") : null;
      if (!b) return;
      var r = b.getBoundingClientRect();
      b.style.setProperty("--mx", ((e.clientX - r.left) / r.width * 100).toFixed(2) + "%");
    }, { passive: true });
  }

  /* ── Specular glow: one delegated listener drives every card ── */
  if (finePointer && !reduceMotion) {
    var specSel = ".glass-card, .cta-panel, .apple-showcase, .glass-frame-liquid, .dn-hud-panel, .threeui-canvas-stage";
    document.addEventListener("pointermove", function (e) {
      var el = e.target && e.target.closest ? e.target.closest(specSel) : null;
      if (!el || !el.classList.contains("specular")) return;
      var r = el.getBoundingClientRect();
      el.style.setProperty("--mx", ((e.clientX - r.left) / r.width * 100).toFixed(2) + "%");
      el.style.setProperty("--my", ((e.clientY - r.top) / r.height * 100).toFixed(2) + "%");
    }, { passive: true });
    document.addEventListener("pointerover", function (e) {
      var el = e.target && e.target.closest ? e.target.closest(specSel) : null;
      if (el && el.classList.contains("specular") && !el.__glow) {
        el.__glow = true;
        el.classList.add("is-glow");
      }
    }, { passive: true });
    document.addEventListener("pointerout", function (e) {
      var el = e.target && e.target.closest ? e.target.closest(specSel) : null;
      if (el && el.__glow && !(e.relatedTarget && el.contains(e.relatedTarget))) {
        el.__glow = false;
        el.classList.remove("is-glow");
      }
    }, { passive: true });
    document.querySelectorAll(".glass-card, .cta-panel, .apple-showcase, .glass-frame-liquid, .dn-hud-panel, .threeui-canvas-stage")
      .forEach(function (el) { el.classList.add("specular"); });
  }

  /* ── Entrances for groups that otherwise only switch states ───
     The corridor legend, highway stops, charging bays and timeline nodes
     light up through CSS classes as you scroll. Each group also rises in
     with GSAP the first time it arrives; clearProps then hands opacity and
     transform back to those CSS states. */
  function enter(targets, trigger, from, stagger) {
    var els = gsap.utils.toArray(targets);
    var trig = typeof trigger === "string" ? document.querySelector(trigger) : trigger;
    if (!els.length || !trig) return;
    gsap.from(els, Object.assign({
      opacity: 0,
      duration: 0.9,
      ease: "power3.out",
      stagger: stagger,
      clearProps: "opacity,transform",
      scrollTrigger: { trigger: trig, start: "top 86%", once: true }
    }, from));
  }
  if (hasGsap && !reduceMotion) {
    enter(".cmap-legend li", ".cmap-legend", { x: -22 }, 0.09);
    enter(".highway-stops li", "#highway", { y: 22 }, 0.1);
    enter("#bayGrid .bay", "#bayGrid", { y: 26, scale: 0.9 }, 0.045);
    enter(".charge-final", ".charge-final", { y: 18 }, 0);
    gsap.utils.toArray("#tlTrack .tl-item").forEach(function (item) {
      enter(item.querySelector(".tl-node"), item, { scale: 0.3 }, 0);
    });
  }

  /* ══════════════════════════════════════════════════════════
     DEEPSEEK V4.1 · THE BACKGROUND SWITCH — dark ⇄ white
     Persisted in localStorage ("cnx-theme") and applied head-side
     before first paint. The knob's glyph morphs sun ⇄ moon
     (MorphSVGPlugin when present), a veil expands from the switch,
     and the meta theme-color follows the change.
     ══════════════════════════════════════════════════════════ */
  var themeSwitch = document.getElementById("themeSwitch");
  var tsGlyph = document.getElementById("tsGlyph");
  var tsRays = document.getElementById("tsRays");
  var tsSunPath = document.getElementById("tsSunPath");
  var tsMoonPath = document.getElementById("tsMoonPath");
  var THEME_BG = { dark: "#030506", light: "#f2f4f8" };
  function currentTheme() {
    return document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark";
  }
  function setSwitchChrome(theme) {
    var light = theme === "light";
    if (themeSwitch) {
      themeSwitch.setAttribute("aria-checked", light ? "true" : "false");
      themeSwitch.setAttribute("aria-label", light ? "Switch to the dark background" : "Switch to the white background");
    }
    var mobSwitch = document.getElementById("mobileThemeSwitch");
    if (mobSwitch) {
      mobSwitch.setAttribute("aria-checked", light ? "true" : "false");
      mobSwitch.setAttribute("aria-label", light ? "Switch to the dark background" : "Switch to the white background");
    }
    var m = document.querySelector('meta[name="theme-color"]');
    if (m) m.setAttribute("content", THEME_BG[theme]);
  }
  function setGlyph(theme, animate) {
    if (!tsGlyph || !tsSunPath || !tsMoonPath) return;
    var light = theme === "light";
    if (animate && hasGsap && window.MorphSVGPlugin && !reduceMotion) {
      gsap.to(tsGlyph, { morphSVG: light ? "#tsSunPath" : "#tsMoonPath", duration: 0.6, ease: "power2.inOut", overwrite: "auto" });
      if (tsRays) gsap.to(tsRays, { opacity: light ? 1 : 0, duration: 0.45, ease: "power2.out", overwrite: "auto" });
      var knobGlyph = document.querySelector(".theme-switch .ts-glyph");
      if (knobGlyph) gsap.fromTo(knobGlyph, { rotate: light ? -55 : 55, scale: 0.78 }, { rotate: 0, scale: 1, duration: 0.62, ease: "back.out(2)", overwrite: "auto" });
    } else {
      tsGlyph.setAttribute("d", (light ? tsSunPath : tsMoonPath).getAttribute("d"));
      if (tsRays) tsRays.setAttribute("opacity", light ? "1" : "0");
    }
  }
  var themeVeil = null;
  function flashThemeVeil(fromEl, theme) {
    if (!hasGsap || reduceMotion || !fromEl) return;
    if (!themeVeil) {
      themeVeil = document.createElement("span");
      themeVeil.className = "theme-veil";
      themeVeil.setAttribute("aria-hidden", "true");
      document.body.appendChild(themeVeil);
    }
    var r = fromEl.getBoundingClientRect();
    var x = Math.round(r.left + r.width / 2), y = Math.round(r.top + r.height / 2);
    var reach = Math.ceil(Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y)) + 8);
    themeVeil.style.background = THEME_BG[theme];
    gsap.killTweensOf(themeVeil);
    gsap.set(themeVeil, { opacity: 1, clipPath: "circle(0px at " + x + "px " + y + "px)" });
    gsap.to(themeVeil, {
      clipPath: "circle(" + reach + "px at " + x + "px " + y + "px)",
      duration: 0.72,
      ease: "power2.inOut",
      onComplete: function () {
        gsap.to(themeVeil, { opacity: 0, duration: 0.5, ease: "power1.out" });
      }
    });
  }
  function applyTheme(theme, animate) {
    document.documentElement.setAttribute("data-theme", theme);
    document.documentElement.style.colorScheme = theme;
    try { localStorage.setItem("cnx-theme", theme); } catch (e) {}
    setSwitchChrome(theme);
    setGlyph(theme, !!animate);
  }
  /* Sync the switch with the theme the head script already applied */
  setSwitchChrome(currentTheme());
  (function () {
    var light = currentTheme() === "light";
    if (tsGlyph && tsSunPath && tsMoonPath) tsGlyph.setAttribute("d", (light ? tsSunPath : tsMoonPath).getAttribute("d"));
    if (tsRays) tsRays.setAttribute("opacity", light ? "1" : "0");
  })();
  if (themeSwitch) {
    themeSwitch.addEventListener("click", function () {
      var next = currentTheme() === "light" ? "dark" : "light";
      applyTheme(next, true);
      flashThemeVeil(themeSwitch, next);
    });
  }
  var mobSwitch = document.getElementById("mobileThemeSwitch");
  if (mobSwitch) {
    mobSwitch.addEventListener("click", function () {
      var next = currentTheme() === "light" ? "dark" : "light";
      applyTheme(next, true);
      flashThemeVeil(mobSwitch, next);
    });
  }

  /* ══════════════════════════════════════════════════════════
     10 · EVERY SCREEN — desktop / tablet / phone choreography
     Entrance cascade, idle float, depth parallax, pointer tilt,
     screen micro-animations (route draw + iQ puck rides) and,
     further down, the dock magnification, the typed status line
     (TextPlugin) and the "Shuffle views" flip (Flip).
     ══════════════════════════════════════════════════════════ */
  var deviceRig = document.getElementById("deviceRig");
  var deviceStage = document.getElementById("deviceStage");
  var deviceEls = gsap.utils.toArray("#devices .device");
  var deviceFloat = [];
  var deviceStatus = document.getElementById("deviceStatus");
  var DOCK_LINE = "trip settled · ₹1,842 · 0 calls · flight TRV 06:40 landed on time";

  if (deviceRig && deviceStage && deviceEls.length && hasGsap && !reduceMotion) {
    /* entrance: each frame settles in from its own depth */
    gsap.fromTo(".device-desktop",
      { autoAlpha: 0, scale: 0.9, rotateY: -12, transformPerspective: 1500, transformOrigin: "50% 90%" },
      { autoAlpha: 1, scale: 1, rotateY: 0, duration: 1.25, ease: cnxEase,
        scrollTrigger: { trigger: deviceStage, start: "top 82%" } });
    gsap.fromTo(".device-tablet",
      { autoAlpha: 0, scale: 0.84, rotateY: 16, transformPerspective: 1500, transformOrigin: "100% 60%" },
      { autoAlpha: 1, scale: 1, rotateY: 0, duration: 1.15, ease: cnxEase,
        scrollTrigger: { trigger: deviceStage, start: "top 82%" } });
    gsap.fromTo(".device-phone",
      { autoAlpha: 0, scale: 0.8, rotateY: -18, transformPerspective: 1500, transformOrigin: "0% 60%" },
      { autoAlpha: 1, scale: 1, rotateY: 0, duration: 1.15, ease: cnxEase,
        scrollTrigger: { trigger: deviceStage, start: "top 82%" } });

    /* idle float: each device breathes at its own rate */
    deviceEls.forEach(function (d, i) {
      deviceFloat.push(gsap.to(d, {
        y: 9 + i * 2, duration: 5.4 + i * 0.9, ease: "sine.inOut",
        yoyo: true, repeat: -1, delay: 0.8 + i * 0.45
      }));
    });
    ScrollTrigger.create({
      trigger: "#devices", start: "top bottom", end: "bottom top",
      onToggle: function (self) { deviceFloat.forEach(function (t) { self.isActive ? t.resume() : t.pause(); }); }
    });

    /* depth parallax while the section passes */
    deviceEls.forEach(function (d) {
      var depth = parseFloat(d.getAttribute("data-depth")) || 1;
      gsap.fromTo(d, { yPercent: 2.6 * depth }, {
        yPercent: -2.6 * depth, ease: "none",
        scrollTrigger: { trigger: "#devices", start: "top bottom", end: "bottom top", scrub: true }
      });
    });

    /* pointer tilt (fine pointers): the rig feels physical */
    if (finePointer) {
      deviceEls.forEach(function (d) {
        var rx = gsap.quickTo(d, "rotationX", { duration: 0.6, ease: "power3.out" });
        var ry = gsap.quickTo(d, "rotationY", { duration: 0.6, ease: "power3.out" });
        d.addEventListener("pointermove", function (e) {
          var r = d.getBoundingClientRect();
          if (!r.width || !r.height) return;
          ry(((e.clientX - r.left) / r.width - 0.5) * 9);
          rx(((e.clientY - r.top) / r.height - 0.5) * -7);
        }, { passive: true });
        d.addEventListener("pointerleave", function () { rx(0); ry(0); });
      });
    }

    /* screen micro-animations: routes draw, bars grow, numbers count */
    var dvTL = gsap.timeline({
      scrollTrigger: { trigger: deviceStage, start: "top 74%", once: true },
      defaults: { ease: "power3.out" }
    });
    dvTL.fromTo(".dv-map, .dv-phone-route", { opacity: 0 }, { opacity: 1, duration: 0.7, stagger: 0.15 }, 0);
    if (window.DrawSVGPlugin) {
      dvTL.fromTo("#dvRoute", { drawSVG: "0%" }, { drawSVG: "100%", duration: 1.5, ease: "power2.inOut" }, 0.1);
      dvTL.fromTo("#dvPhoneRoute", { drawSVG: "0%" }, { drawSVG: "100%", duration: 1.1, ease: "power2.inOut" }, 0.45);
    }
    dvTL.fromTo(".dv-bars i", { scaleY: 0 }, { scaleY: 1, duration: 0.8, stagger: 0.055 }, 0.2)
      .fromTo(".dv-kpi", { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.55, stagger: 0.1 }, 0.25)
      .fromTo(".dv-rows li", { opacity: 0, x: 14 }, { opacity: 1, x: 0, duration: 0.5, stagger: 0.09 }, 0.3)
      .fromTo("#dvRing", { strokeDashoffset: 175.93 }, { strokeDashoffset: 24.63, duration: 1.5, ease: "power2.inOut" }, 0.45)
      .fromTo(".dv-charge, .dv-driver, .dv-navpill", { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.6, stagger: 0.12 }, 0.5);
    var dvTrips = document.getElementById("dvTrips");
    var dvRingPct = document.getElementById("dvRingPct");
    if (dvTrips) {
      var tripO = { v: 0 };
      dvTL.to(tripO, { v: 42, duration: 1.3, ease: "power2.out",
        onUpdate: function () { dvTrips.textContent = String(Math.round(tripO.v)); } }, 0.25);
    }
    if (dvRingPct) {
      var ringO = { v: 0 };
      dvTL.to(ringO, { v: 86, duration: 1.5, ease: "power2.inOut",
        onUpdate: function () { dvRingPct.textContent = Math.round(ringO.v) + "%"; } }, 0.45);
    }
  }

  /* ── the iQ puck rides both routes — paused whenever off-screen ── */
  if (hasGsap && !reduceMotion && window.MotionPathPlugin && deviceRig) {
    var puckTweens = [];
    var dvRoutePath = document.getElementById("dvRoute");
    var dvPuck = document.getElementById("dvPuck");
    var dvPhonePath = document.getElementById("dvPhoneRoute");
    var dvPhonePuck = document.getElementById("dvPhonePuck");
    if (dvRoutePath && dvPuck) {
      puckTweens.push(gsap.to(dvPuck, {
        motionPath: { path: dvRoutePath, align: dvRoutePath, alignOrigin: [0.5, 0.5], autoRotate: true },
        duration: 7, ease: "none", repeat: -1, paused: true
      }));
    }
    if (dvPhonePath && dvPhonePuck) {
      puckTweens.push(gsap.to(dvPhonePuck, {
        motionPath: { path: dvPhonePath, align: dvPhonePath, alignOrigin: [0.5, 0.5], autoRotate: true },
        duration: 5.2, ease: "none", repeat: -1, yoyo: true, paused: true
      }));
    }
    puckTweens.forEach(function (t) { t.progress(0); });
    if (puckTweens.length) {
      ScrollTrigger.create({
        trigger: "#devices", start: "top bottom", end: "bottom top",
        onToggle: function (self) { puckTweens.forEach(function (t) { self.isActive ? t.play() : t.pause(); }); }
      });
    }
  }

  /* ── typed status line (TextPlugin) ────────────────────────── */
  if (deviceStatus && window.TextPlugin && hasGsap && !reduceMotion) {
    gsap.set(deviceStatus, { text: "" });
    var typeTw = gsap.to(deviceStatus, { text: { value: DOCK_LINE }, duration: 3, ease: "none", paused: true });
    ScrollTrigger.create({
      trigger: "#devices", start: "top 62%", once: true,
      onEnter: function () { typeTw.play(); }
    });
  }

  /* ── the dock magnifies toward the cursor (macOS style) ────── */
  var appleDock = document.getElementById("appleDock");
  if (appleDock && hasGsap && finePointer && !reduceMotion) {
    var dockItems = gsap.utils.toArray(".dock-item", appleDock);
    var dockSetters = dockItems.map(function (el) {
      gsap.set(el, { transformOrigin: "50% 100%" });
      return {
        sc: gsap.quickTo(el, "scale", { duration: 0.4, ease: "power3.out" }),
        yi: gsap.quickTo(el, "y", { duration: 0.4, ease: "power3.out" })
      };
    });
    appleDock.addEventListener("pointermove", function (e) {
      dockItems.forEach(function (el, i) {
        var r = el.getBoundingClientRect();
        if (!r.width) return;
        var k = Math.max(0, 1 - Math.abs(e.clientX - (r.left + r.width / 2)) / 170);
        k = k * k;
        dockSetters[i].sc(1 + 0.42 * k);
        dockSetters[i].yi(-11 * k);
      });
    }, { passive: true });
    appleDock.addEventListener("pointerleave", function () {
      dockSetters.forEach(function (s) { s.sc(1); s.yi(0); });
    });
    dockItems.forEach(function (b) {
      b.addEventListener("click", function () {
        var line = (b.getAttribute("data-tip") || "Nexus iQ") + " · vector locked · 0 calls";
        if (deviceStatus && window.TextPlugin) {
          gsap.to(deviceStatus, { text: { value: line }, duration: 0.9, ease: "none", overwrite: true });
        } else if (deviceStatus) {
          deviceStatus.textContent = line;
        }
        var icon = b.querySelector("svg");
        if (icon) gsap.fromTo(icon, { scale: 0.7 }, { scale: 1, duration: 0.55, ease: "back.out(2.6)", overwrite: "auto" });
      });
    });
  }

  /* ── "Shuffle views": Flip rearranges the rig ──────────────── */
  (function () {
    var layoutBtn = document.getElementById("deviceLayoutBtn");
    if (!layoutBtn || !deviceRig) return;
    layoutBtn.addEventListener("click", function () {
      if (window.innerWidth < 880) return;
      var willStack = !deviceRig.classList.contains("is-stacked");
      if (hasGsap && window.Flip && !reduceMotion) {
        var state = Flip.getState(gsap.utils.toArray("#devices .device"));
        deviceRig.classList.toggle("is-stacked", willStack);
        layoutBtn.setAttribute("aria-pressed", String(willStack));
        deviceFloat.forEach(function (t) { t.pause(); });
        Flip.from(state, {
          duration: 0.9, ease: "power3.inOut", absolute: true, stagger: 0.045,
          onComplete: function () {
            deviceFloat.forEach(function (t) { t.play(); });
            ScrollTrigger.refresh();
          }
        });
      } else {
        deviceRig.classList.toggle("is-stacked", willStack);
        layoutBtn.setAttribute("aria-pressed", String(willStack));
      }
    });
  })();

  /* ═══════════════════════════════════════════════════════════════
     05 · DAY & NIGHT 24-HOUR CORRIDOR STUDIO — COMPASS STUDIO
     Real-time solar timeline scrubber, live sky & atmospheric transitions,
     and 4K cinematic vehicle motion simulation (EVs, Flight AI-657, Seaport vessel)
     ═══════════════════════════════════════════════════════════════ */
  (function initDayNightStudio() {
    var dnSection = document.getElementById("daynight");
    if (!dnSection) return;

    var dnViewport = document.getElementById("dnViewport");
    var dnSky = document.getElementById("dnSky");
    var dnFilter = document.getElementById("dnFilter");
    var dnSunOrb = document.getElementById("dnSunOrb");
    var dnMoonOrb = document.getElementById("dnMoonOrb");
    var dnStars = document.getElementById("dnStars");

    var dnHudTime = document.getElementById("dnHudTime");
    var dnHudState = document.getElementById("dnHudState");
    var dnHudSolar = document.getElementById("dnHudSolar");
    var dnHudLux = document.getElementById("dnHudLux");
    var dnHudFleet = document.getElementById("dnHudFleet");

    var presets = Array.from(document.querySelectorAll(".btn-dn-preset"));
    var scrubberTrack = document.getElementById("dnScrubberTrack");
    var scrubberFill = document.getElementById("dnScrubberFill");
    var scrubberThumb = document.getElementById("dnScrubberThumb");
    var thumbLabel = document.getElementById("dnThumbLabel");
    var playCycleBtn = document.getElementById("dnPlayCycleBtn");
    var playText = document.getElementById("dnPlayText");

    var carBeams = Array.from(document.querySelectorAll(".car-beam-cone"));

    var dnStage = document.getElementById("dnStage");
    var sceneBtns = Array.from(document.querySelectorAll(".btn-dn-scene"));
    var dnLayers = Array.from(document.querySelectorAll(".dn-layer"));
    var currentScene = "tower";

    var currentTime = 720; // Default to 12:00 PM (High Noon)
    var isCyclePlaying = false;
    var cycleRaf = null;
    var timeTween = null;

    // ── 4-Scene Perspective / Picture Switcher & 4K Camera Drift ──
    var sceneDriftTween = null;
    function startCinematicDrift(img) {
      if (!img || reduceMotion) return;
      if (sceneDriftTween) sceneDriftTween.kill();
      sceneDriftTween = gsap.fromTo(img,
        { scale: 1.04, x: -10, y: -5 },
        { scale: 1.10, x: 10, y: 5, duration: 16, ease: "sine.inOut", yoyo: true, repeat: -1 }
      );
    }

    function switchScene(sceneName) {
      currentScene = sceneName;
      sceneBtns.forEach(function (btn) {
        var match = btn.getAttribute("data-scene") === sceneName;
        btn.classList.toggle("is-active", match);
        btn.setAttribute("aria-selected", String(match));
      });

      dnLayers.forEach(function (layer) {
        var isTarget = layer.getAttribute("data-dn-layer") === sceneName;
        if (isTarget) {
          layer.classList.add("is-active");
          var img = layer.querySelector("img");
          if (img) startCinematicDrift(img);
        } else {
          layer.classList.remove("is-active");
        }
      });

      if (dnHudState) {
        if (sceneName === "airport") {
          dnHudState.textContent = "TRV Runway Approach Vector";
        } else if (sceneName === "seaport") {
          dnHudState.textContent = "Vizhinjam Deepwater Channel";
        } else if (sceneName === "twin") {
          dnHudState.textContent = "Phase 3 Campus Overview";
        } else {
          dnHudState.textContent = "NH-66 Arterial EV Fleet";
        }
      }
    }

    sceneBtns.forEach(function (btn) {
      btn.addEventListener("click", function () {
        var s = btn.getAttribute("data-scene");
        if (s) switchScene(s);
      });
    });

    var activeImg = dnSection.querySelector(".dn-layer.is-active img");
    if (activeImg) startCinematicDrift(activeImg);

    // ── 3D Interactive Parallax Tilt on Liquid Stage ──
    if (finePointer && dnViewport && !reduceMotion) {
      dnViewport.addEventListener("pointermove", function (e) {
        var rect = dnViewport.getBoundingClientRect();
        var nx = (e.clientX - rect.left) / rect.width - 0.5;
        var ny = (e.clientY - rect.top) / rect.height - 0.5;
        var rotY = nx * 5.8;
        var rotX = -ny * 4.6;
        if (window.Motion && typeof window.Motion.animate === "function") {
          window.Motion.animate(dnViewport, { rotateX: rotX, rotateY: rotY }, { type: "spring", stiffness: 240, damping: 24 });
        } else if (hasGsap) {
          gsap.to(dnViewport, { rotateX: rotX, rotateY: rotY, duration: 0.5, ease: "power2.out" });
        }
      });
      dnViewport.addEventListener("pointerleave", function () {
        if (window.Motion && typeof window.Motion.animate === "function") {
          window.Motion.animate(dnViewport, { rotateX: 0, rotateY: 0 }, { type: "spring", stiffness: 200, damping: 20 });
        } else if (hasGsap) {
          gsap.to(dnViewport, { rotateX: 0, rotateY: 0, duration: 0.7, ease: "power2.out" });
        }
      });
    }

    // ── 4K Vehicle Motion along SVG Paths ──
    var vehicleTweens = [];
    if (hasGsap && window.MotionPathPlugin && !reduceMotion) {
      try {
        // EV-01 Sedan (Southbound towards Airport on Path 1)
        var car1 = document.getElementById("evCar1");
        if (car1) {
          vehicleTweens.push(gsap.to(car1, {
            motionPath: {
              path: "#dnHighwayPath1",
              align: "#dnHighwayPath1",
              autoRotate: true,
              alignOrigin: [0.5, 0.5]
            },
            duration: 17,
            repeat: -1,
            ease: "none"
          }));
        }

        // EV-04 Executive Shuttle (Northbound from Vizhinjam on Path 2)
        var car2 = document.getElementById("evCar2");
        if (car2) {
          vehicleTweens.push(gsap.to(car2, {
            motionPath: {
              path: "#dnHighwayPath2",
              align: "#dnHighwayPath2",
              autoRotate: 180,
              alignOrigin: [0.5, 0.5]
            },
            duration: 21,
            repeat: -1,
            ease: "none"
          }));
        }

        // EV-09 Premium SUV (Connecting to Campus P3 on Path 1, staggered)
        var car3 = document.getElementById("evCar3");
        if (car3) {
          vehicleTweens.push(gsap.to(car3, {
            motionPath: {
              path: "#dnHighwayPath1",
              align: "#dnHighwayPath1",
              autoRotate: true,
              alignOrigin: [0.5, 0.5],
              start: 0.52,
              end: 1.52
            },
            duration: 15,
            repeat: -1,
            ease: "none"
          }));
        }

        // Flight AI-657: TRV Runway 32 Glidepath Descent
        var plane = document.getElementById("dnAirplane");
        if (plane) {
          var planeTl = gsap.timeline({ repeat: -1 });
          planeTl.fromTo(plane,
            { scale: 0.72, opacity: 0 },
            { opacity: 1, duration: 2, ease: "power1.in" },
            0
          );
          planeTl.to(plane, {
            motionPath: {
              path: "#dnFlightPath",
              align: "#dnFlightPath",
              autoRotate: true,
              alignOrigin: [0.5, 0.5]
            },
            scale: 1.15,
            duration: 24,
            ease: "power1.inOut"
          }, 0);
          planeTl.to(plane, { opacity: 0, duration: 1.5, ease: "power2.in" }, 22.5);
          vehicleTweens.push(planeTl);
        }

        // Seaport Container Vessel & Pilot Escort: Vizhinjam Approaches
        var ship = document.getElementById("dnShip");
        if (ship) {
          vehicleTweens.push(gsap.to(ship, {
            motionPath: {
              path: "#dnShipPath",
              align: "#dnShipPath",
              autoRotate: true,
              alignOrigin: [0.5, 0.5]
            },
            duration: 42,
            repeat: -1,
            ease: "none"
          }));
          // Nautical gentle pitch and roll
          vehicleTweens.push(gsap.to(ship, {
            rotation: "+=2.2",
            y: "+=3.5",
            duration: 3.6,
            ease: "sine.inOut",
            yoyo: true,
            repeat: -1
          }));
        }

        // Rotating Lighthouse Beam at Vizhinjam Headland
        var lhBeam = document.getElementById("dnLighthouseBeam");
        if (lhBeam) {
          vehicleTweens.push(gsap.to(lhBeam, {
            rotation: 360,
            transformOrigin: "0px 0px",
            duration: 12,
            ease: "none",
            repeat: -1
          }));
        }

        // Tactile micro-motion on moving vehicles using Framer Motion
        if (window.Motion && typeof window.Motion.animate === "function" && !reduceMotion) {
          [car1, car2, car3].forEach(function (c, idx) {
            if (c) {
              window.Motion.animate(c, { y: [0, -1.2, 0] }, { duration: 1.2 + idx * 0.2, repeat: Infinity, ease: "easeInOut" });
            }
          });
        }

        // Pause vehicle animations when corridor section is off-screen
        ScrollTrigger.create({
          trigger: dnSection,
          start: "top bottom",
          end: "bottom top",
          onToggle: function (self) {
            vehicleTweens.forEach(function (t) {
              if (self.isActive) t.play(); else t.pause();
            });
          }
        });
      } catch (err) {
        console.warn("DayNight vehicle motion init error:", err);
      }
    }

    // ── Solar Engine & Lighting Interpolator ──
    function renderTime(minutes) {
      minutes = ((minutes % 1440) + 1440) % 1440;
      currentTime = minutes;

      var hours = Math.floor(minutes / 60);
      var mins = Math.floor(minutes % 60);
      var ampm = hours >= 12 ? "PM" : "AM";
      var h12 = hours % 12 || 12;
      var timeStr12 = (h12 < 10 ? "0" : "") + h12 + ":" + (mins < 10 ? "0" : "") + mins + " " + ampm;
      var timeStr24 = (hours < 10 ? "0" : "") + hours + ":" + (mins < 10 ? "0" : "") + mins;

      // Scrubber visual sync
      var pct = (minutes / 1440) * 100;
      if (scrubberFill) scrubberFill.style.width = pct + "%";
      if (scrubberThumb) {
        scrubberThumb.style.left = pct + "%";
        scrubberThumb.setAttribute("aria-valuenow", String(Math.round(minutes)));
      }
      if (thumbLabel) thumbLabel.textContent = timeStr24;
      if (dnHudTime) dnHudTime.textContent = timeStr12;

      // Solar Elevation Calculation (Trivandrum Latitude ~8.5° N)
      var isDay = minutes >= 360 && minutes <= 1080; // 06:00 to 18:00
      var solarElevation = 0;
      var lux = 0;
      var dayPhase = 0;

      if (isDay) {
        dayPhase = (minutes - 360) / 720; // 0 at dawn, 0.5 at noon, 1.0 at dusk
        solarElevation = Math.sin(dayPhase * Math.PI) * 73.4;
        lux = Math.round(1800 + Math.pow(Math.sin(dayPhase * Math.PI), 1.65) * 92400);
      } else {
        var nightMinutes = minutes > 1080 ? (minutes - 1080) : (minutes + 360);
        var nightPhase = nightMinutes / 720;
        solarElevation = -Math.sin(nightPhase * Math.PI) * 58.2;
        lux = (0.04 + Math.sin(nightPhase * Math.PI) * 0.22).toFixed(2);
      }

      if (dnHudSolar) dnHudSolar.textContent = (solarElevation >= 0 ? "+" : "") + solarElevation.toFixed(1) + "°";
      if (dnHudLux) dnHudLux.textContent = typeof lux === "number" ? lux.toLocaleString() + " lx" : lux + " lx";

      // Corridor Operational State Description & Dynamic Fleet
      var stateName = "High Noon Clarity";
      var fleetCount = 38;
      if (minutes >= 300 && minutes < 450) {
        stateName = "Dawn Awakening";
        fleetCount = 26;
      } else if (minutes >= 450 && minutes < 660) {
        stateName = "Morning Rush Surge";
        fleetCount = 46;
      } else if (minutes >= 660 && minutes < 870) {
        stateName = "High Noon Clarity";
        fleetCount = 38;
      } else if (minutes >= 870 && minutes < 1020) {
        stateName = "Midday Dispatch Active";
        fleetCount = 34;
      } else if (minutes >= 1020 && minutes < 1170) {
        stateName = "Golden Hour Dusk";
        fleetCount = 45;
      } else if (minutes >= 1170 && minutes < 1320) {
        stateName = "Evening Shift Transfer";
        fleetCount = 39;
      } else if (minutes >= 1320 || minutes < 120) {
        stateName = "Deep Midnight Radar";
        fleetCount = 22;
      } else {
        stateName = "Quiet Hours · Port Freight";
        fleetCount = 16;
      }

      if (dnHudState && dnHudState.textContent !== stateName) dnHudState.textContent = stateName;
      if (dnHudFleet) dnHudFleet.textContent = fleetCount + " EVs";

      // Sun Orb Position & Visibility
      if (dnSunOrb) {
        if (isDay) {
          var sunX = 8 + dayPhase * 84; // 8% to 92%
          var sunY = 72 - Math.sin(dayPhase * Math.PI) * 58; // 72% down to 14%
          dnSunOrb.style.left = sunX.toFixed(1) + "%";
          dnSunOrb.style.top = sunY.toFixed(1) + "%";
          var sunAlpha = Math.sin(dayPhase * Math.PI) * 1.2;
          dnSunOrb.style.opacity = Math.min(1, Math.max(0, sunAlpha)).toFixed(2);
        } else {
          dnSunOrb.style.opacity = "0";
        }
      }

      // Moon Orb Position & Visibility
      if (dnMoonOrb) {
        if (!isDay) {
          var nMin = minutes > 1080 ? (minutes - 1080) : (minutes + 360);
          var mPhase = nMin / 720;
          var moonX = 8 + mPhase * 84;
          var moonY = 72 - Math.sin(mPhase * Math.PI) * 54;
          dnMoonOrb.style.left = moonX.toFixed(1) + "%";
          dnMoonOrb.style.top = moonY.toFixed(1) + "%";
          var moonAlpha = Math.sin(mPhase * Math.PI) * 1.15;
          dnMoonOrb.style.opacity = Math.min(1, Math.max(0, moonAlpha)).toFixed(2);
        } else {
          dnMoonOrb.style.opacity = "0";
        }
      }

      // Deep Stars Layer Opacity
      if (dnStars) {
        var starAlpha = 0;
        if (minutes > 1170 || minutes < 270) {
          starAlpha = 1;
        } else if (minutes >= 1050 && minutes <= 1170) {
          starAlpha = (minutes - 1050) / 120;
        } else if (minutes >= 270 && minutes <= 390) {
          starAlpha = 1 - (minutes - 270) / 120;
        }
        dnStars.style.opacity = starAlpha.toFixed(2);
      }

      // Environmental Sky Gradient & Atmospheric Filter Color Transitions
      var skyStyle = "";
      var filterBg = "";
      var filterOpacity = 0.35;
      var beamOpacity = 0.85;

      if (minutes >= 300 && minutes < 480) {
        // Dawn Transition (05:00 - 08:00)
        var kDawn = (minutes - 300) / 180;
        skyStyle = "linear-gradient(180deg, rgba(24,36,64," + (0.75 - kDawn * 0.45).toFixed(2) + ") 0%, rgba(255,130,80," + (0.55 * (1 - Math.abs(kDawn - 0.5) * 0.6)).toFixed(2) + ") 55%, rgba(255,215,120," + (0.42 * kDawn).toFixed(2) + ") 100%)";
        filterBg = "rgba(255, 130, 60, " + (0.35 - kDawn * 0.2).toFixed(2) + ")";
        filterOpacity = 0.38 - kDawn * 0.22;
        beamOpacity = 0.9 - kDawn * 0.5;
      } else if (minutes >= 480 && minutes < 990) {
        // Full Daytime & Noon Clarity (08:00 - 16:30)
        var kNoon = Math.sin(((minutes - 480) / 510) * Math.PI);
        skyStyle = "linear-gradient(180deg, rgba(0,110,250," + (0.28 * kNoon).toFixed(2) + ") 0%, rgba(120,210,255," + (0.18 * kNoon).toFixed(2) + ") 50%, rgba(255,255,255," + (0.08 * kNoon).toFixed(2) + ") 100%)";
        filterBg = "rgba(0, 140, 255, 0.08)";
        filterOpacity = 0.12 * kNoon;
        beamOpacity = 0.35 - kNoon * 0.12;
      } else if (minutes >= 990 && minutes < 1170) {
        // Sunset / Golden Hour Dusk (16:30 - 19:30)
        var kDusk = (minutes - 990) / 180;
        skyStyle = "linear-gradient(180deg, rgba(42,16,60," + (0.4 + kDusk * 0.42).toFixed(2) + ") 0%, rgba(240,65,35," + (0.6 * Math.sin(kDusk * Math.PI)).toFixed(2) + ") 48%, rgba(255,170,45," + (0.48 * (1 - kDusk * 0.5)).toFixed(2) + ") 100%)";
        filterBg = "rgba(255, 75, 25, " + (0.2 + kDusk * 0.25).toFixed(2) + ")";
        filterOpacity = 0.2 + kDusk * 0.35;
        beamOpacity = 0.4 + kDusk * 0.52;
      } else {
        // Deep Midnight Radar (19:30 - 05:00)
        var nSpan = minutes >= 1170 ? (minutes - 1170) : (minutes + 270);
        var kNight = Math.sin((nSpan / 570) * Math.PI);
        skyStyle = "linear-gradient(180deg, rgba(2,6,15," + (0.85 + kNight * 0.12).toFixed(2) + ") 0%, rgba(5,14,32," + (0.8 + kNight * 0.12).toFixed(2) + ") 55%, rgba(9,22,46," + (0.75 + kNight * 0.15).toFixed(2) + ") 100%)";
        filterBg = "rgba(2, 9, 24, " + (0.65 + kNight * 0.15).toFixed(2) + ")";
        filterOpacity = 0.65 + kNight * 0.15;
        beamOpacity = 0.95;
      }

      if (dnSky) dnSky.style.background = skyStyle;
      if (dnFilter) {
        dnFilter.style.backgroundColor = filterBg;
        dnFilter.style.opacity = filterOpacity.toFixed(2);
      }

      // Dynamic ambient lighting refraction for Apple iOS 27.1 Liquid Glass Frame
      if (dnStage) {
        var borderCol, specCol, glowCol, glowSize;
        if (minutes >= 300 && minutes < 480) { // Dawn
          var kD = (minutes - 300) / 180;
          borderCol = "rgba(255, 175, 110, " + (0.42 + kD * 0.1).toFixed(2) + ")";
          specCol = "rgba(255, 220, 180, 0.65)";
          glowCol = "rgba(255, 130, 60, " + (0.35 * (1 - Math.abs(kD - 0.5))).toFixed(2) + ")";
          glowSize = "34px";
        } else if (minutes >= 480 && minutes < 990) { // Noon
          borderCol = "rgba(255, 255, 255, 0.45)";
          specCol = "rgba(255, 255, 255, 0.85)";
          glowCol = "rgba(79, 216, 255, 0.28)";
          glowSize = "40px";
        } else if (minutes >= 990 && minutes < 1170) { // Sunset / Dusk
          var kS = (minutes - 990) / 180;
          borderCol = "rgba(255, 120, 70, " + (0.45 + kS * 0.1).toFixed(2) + ")";
          specCol = "rgba(255, 190, 130, 0.7)";
          glowCol = "rgba(240, 75, 35, 0.38)";
          glowSize = "42px";
        } else { // Midnight Radar
          borderCol = "rgba(79, 216, 255, 0.38)";
          specCol = "rgba(180, 235, 255, 0.55)";
          glowCol = "rgba(0, 121, 254, 0.35)";
          glowSize = "46px";
        }
        dnStage.style.setProperty("--dn-glass-border", borderCol);
        dnStage.style.setProperty("--dn-glass-specular", specCol);
        dnStage.style.setProperty("--dn-glass-glow", glowCol);
        dnStage.style.setProperty("--dn-glass-glow-size", glowSize);
      }

      // Sync vehicle headlight & strobe beam cones
      carBeams.forEach(function (b) {
        b.style.opacity = beamOpacity.toFixed(2);
      });

      // Update preset buttons active indicator
      presets.forEach(function (btn) {
        var pTime = btn.getAttribute("data-time");
        if (!pTime) return;
        var pParts = pTime.split(":");
        var pMin = parseInt(pParts[0], 10) * 60 + parseInt(pParts[1], 10);
        var diff = Math.abs(minutes - pMin);
        if (diff > 720) diff = 1440 - diff;
        var isActive = diff <= 45;
        btn.classList.toggle("is-active", isActive);
        btn.setAttribute("aria-pressed", String(isActive));
      });
    }

    // ── Smooth Animation to Target Preset ──
    function animateToTime(targetMin) {
      if (timeTween) timeTween.kill();
      targetMin = ((targetMin % 1440) + 1440) % 1440;
      var cur = currentTime;
      var diff = targetMin - cur;
      if (diff > 720) diff -= 1440;
      if (diff < -720) diff += 1440;
      var dest = cur + diff;

      if (hasGsap && !reduceMotion) {
        var proxy = { t: cur };
        timeTween = gsap.to(proxy, {
          t: dest,
          duration: 1.15,
          ease: "power2.out",
          onUpdate: function () {
            renderTime(proxy.t);
          },
          onComplete: function () {
            currentTime = ((targetMin % 1440) + 1440) % 1440;
          }
        });
      } else {
        renderTime(targetMin);
      }
    }

    // ── 24-Hour Cycle Loop Engine ──
    function startCycle() {
      if (isCyclePlaying) return;
      isCyclePlaying = true;
      if (playCycleBtn) playCycleBtn.setAttribute("aria-pressed", "true");
      if (playText) playText.textContent = "Pause Cycle";
      if (playCycleBtn) playCycleBtn.classList.add("is-active");

      var lastTs = performance.now();
      function loop(ts) {
        if (!isCyclePlaying) return;
        var dt = Math.min(64, ts - lastTs);
        lastTs = ts;
        // Complete 1440 minutes in 28 seconds (51.4 minutes per second)
        var deltaMin = (dt / 1000) * 51.4;
        currentTime = (currentTime + deltaMin) % 1440;
        renderTime(currentTime);
        cycleRaf = requestAnimationFrame(loop);
      }
      cycleRaf = requestAnimationFrame(loop);
    }

    function pauseCycle() {
      if (!isCyclePlaying) return;
      isCyclePlaying = false;
      if (cycleRaf) cancelAnimationFrame(cycleRaf);
      if (playCycleBtn) playCycleBtn.setAttribute("aria-pressed", "false");
      if (playText) playText.textContent = "24H Solar Cycle";
      if (playCycleBtn) playCycleBtn.classList.remove("is-active");
    }

    if (playCycleBtn) {
      playCycleBtn.addEventListener("click", function () {
        if (isCyclePlaying) pauseCycle(); else startCycle();
      });
    }

    // ── Interactive Scrubber Events (Mouse & Touch) ──
    if (scrubberTrack) {
      var isScrubbing = false;
      function scrubFromEvent(e) {
        var rect = scrubberTrack.getBoundingClientRect();
        var clientX = e.clientX;
        var ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
        pauseCycle();
        if (timeTween) timeTween.kill();
        renderTime(ratio * 1440);
      }

      scrubberTrack.addEventListener("pointerdown", function (e) {
        isScrubbing = true;
        try { scrubberTrack.setPointerCapture(e.pointerId); } catch (err) {}
        scrubFromEvent(e);
      });

      scrubberTrack.addEventListener("pointermove", function (e) {
        if (!isScrubbing) return;
        scrubFromEvent(e);
      });

      function endScrub(e) {
        if (isScrubbing) {
          isScrubbing = false;
          try { scrubberTrack.releasePointerCapture(e.pointerId); } catch (err) {}
        }
      }
      scrubberTrack.addEventListener("pointerup", endScrub);
      scrubberTrack.addEventListener("pointercancel", endScrub);

      // Keyboard accessible slider controls
      if (scrubberThumb) {
        scrubberThumb.addEventListener("keydown", function (e) {
          pauseCycle();
          if (e.key === "ArrowRight" || e.key === "ArrowUp") {
            e.preventDefault();
            renderTime(currentTime + 15);
          } else if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
            e.preventDefault();
            renderTime(currentTime - 15);
          } else if (e.key === "Home") {
            e.preventDefault();
            renderTime(0);
          } else if (e.key === "End") {
            e.preventDefault();
            renderTime(1439);
          }
        });
      }
    }

    // ── Preset Button Click Handlers ──
    presets.forEach(function (btn) {
      btn.addEventListener("click", function () {
        var pTime = btn.getAttribute("data-time");
        if (!pTime) return;
        pauseCycle();
        var pParts = pTime.split(":");
        var targetMin = parseInt(pParts[0], 10) * 60 + parseInt(pParts[1], 10);
        animateToTime(targetMin);
      });
    });

    // Initial render at 12:00 PM High Noon
    renderTime(720);
  })();

  /* ═══════════════════════════════════════════════════════════════
     06 · THREEUI 3D WEBGL SPATIAL TWIN ENGINE — COMPASS STUDIO
     Three.js structure flow particle constellation (14,000 points)
     and 3D gyro coordinate sphere (8.5570° N · 76.8811° E)
     ═══════════════════════════════════════════════════════════════ */
  (function initThreeUI() {
    var stage = document.getElementById("threeuiStage");
    var canvas = document.getElementById("threeuiCanvas");
    if (!stage || !canvas || typeof window.THREE === "undefined") return;

    var width = stage.clientWidth || 800;
    var height = stage.clientHeight || 380;

    var renderer = null;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        alpha: true,
        antialias: true,
        powerPreference: "high-performance"
      });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(width, height);
    } catch (err) {
      console.warn("ThreeUI WebGL initialization skipped:", err);
      return;
    }

    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(46, width / height, 1, 1000);
    camera.position.set(0, 0, 175);

    // Dynamic Glow Dot Texture via Canvas
    function createGlowDot() {
      var c = document.createElement("canvas");
      c.width = 64;
      c.height = 64;
      var ctx = c.getContext("2d");
      var g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
      g.addColorStop(0, "rgba(255,255,255,1)");
      g.addColorStop(0.2, "rgba(79,216,255,0.85)");
      g.addColorStop(0.5, "rgba(0,121,254,0.35)");
      g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, 64, 64);
      return new THREE.CanvasTexture(c);
    }
    // every particle is a micro Compass Nexus iQ arrow (the logo mark)
    function createMicroArrow() {
      var c = document.createElement("canvas");
      c.width = c.height = 64;
      var x = c.getContext("2d");
      var g = x.createRadialGradient(32, 32, 0, 32, 32, 30);
      g.addColorStop(0, "rgba(79,216,255,0.35)"); g.addColorStop(1, "rgba(0,121,254,0)");
      x.fillStyle = g; x.fillRect(0, 0, 64, 64);
      x.translate(32, 32); x.rotate(-Math.PI / 5); x.scale(1.9, 1.9);
      x.beginPath(); x.moveTo(11, 0); x.lineTo(-8, -9.5); x.lineTo(-3, 0); x.lineTo(-8, 9.5); x.closePath();
      x.lineJoin = "round";
      x.fillStyle = "rgba(255,255,255,0.55)"; x.fill();
      x.lineWidth = 1.6; x.strokeStyle = "#ffffff"; x.stroke();
      return new THREE.CanvasTexture(c);
    }
    var glowTexture = createMicroArrow();

    // ── 14,000 Structure Flow Particles Constellation ──
    var PARTICLE_COUNT = 14000;
    var geometry = new THREE.BufferGeometry();
    var positions = new Float32Array(PARTICLE_COUNT * 3);
    var colors = new Float32Array(PARTICLE_COUNT * 3);
    var pData = [];

    for (var i = 0; i < PARTICLE_COUNT; i++) {
      var streamType = 0;
      var r = 0.31, g = 0.85, b = 1.0;
      var speed = 0.0016 + Math.random() * 0.0028;
      var u = Math.random();
      var spreadX = (Math.random() - 0.5) * 8;
      var spreadY = (Math.random() - 0.5) * 8;
      var spreadZ = (Math.random() - 0.5) * 12;

      if (i < 5500) {
        // Highway Corridor (Cyan -> Azure)
        streamType = 0;
        var tCol = Math.random();
        r = 0.31 * (1 - tCol) + 0.0 * tCol;
        g = 0.85 * (1 - tCol) + 0.47 * tCol;
        b = 1.0;
        speed = 0.0022 + Math.random() * 0.0032;
      } else if (i < 9500) {
        // TRV Flight Corridor (Gold -> White)
        streamType = 1;
        var tCol2 = Math.random();
        r = 0.77 * (1 - tCol2) + 1.0 * tCol2;   // logo core light #c4f6ff → white
        g = 0.96 * (1 - tCol2) + 1.0 * tCol2;
        b = 1.0;
        speed = 0.0018 + Math.random() * 0.0024;
      } else if (i < 12500) {
        // Vizhinjam Seaport Stream (Emerald -> Teal)
        streamType = 2;
        var tCol3 = Math.random();
        r = 0.0;                                 // logo glow blue #0079fe → cyan #4fd8ff
        g = 0.47 * (1 - tCol3) + 0.85 * tCol3;
        b = 1.0;
        speed = 0.0014 + Math.random() * 0.002;
      } else {
        // Ambient Twin Lattice Field
        streamType = 3;
        r = 0.65; g = 0.82; b = 1.0;
        speed = 0.0004 + Math.random() * 0.0008;
      }

      pData.push({
        stream: streamType,
        u: u,
        speed: speed,
        spreadX: spreadX,
        spreadY: spreadY,
        spreadZ: spreadZ,
        freq: 1.5 + Math.random() * 2
      });

      colors[i * 3] = r;
      colors[i * 3 + 1] = g;
      colors[i * 3 + 2] = b;
    }

    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    var pointsMat = new THREE.PointsMaterial({
      size: 3.4,
      map: glowTexture,
      vertexColors: true,
      transparent: true,
      opacity: 0.88,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    var pointCloud = new THREE.Points(geometry, pointsMat);
    scene.add(pointCloud);

    // ── 3D Gyro Coordinate Sphere (8.5570° N · 76.8811° E) ──
    var gyroGroup = new THREE.Group();

    // Central Wireframe Beacon Core
    var coreGeo = new THREE.SphereGeometry(3.6, 16, 16);
    var coreMat = new THREE.MeshBasicMaterial({ color: 0x4fd8ff, wireframe: true });
    var coreMesh = new THREE.Mesh(coreGeo, coreMat);
    gyroGroup.add(coreMesh);

    // Latitude Ring (tilted at 8.5570° N)
    var latGeo = new THREE.TorusGeometry(20, 0.45, 8, 64);
    var latMat = new THREE.MeshBasicMaterial({ color: 0x4fd8ff });
    var latRing = new THREE.Mesh(latGeo, latMat);
    latRing.rotation.x = THREE.MathUtils.degToRad(8.557);
    gyroGroup.add(latRing);

    // Longitude Ring (oriented at 76.8811° E)
    var lonGeo = new THREE.TorusGeometry(26, 0.45, 8, 64);
    var lonMat = new THREE.MeshBasicMaterial({ color: 0x0079fe });
    var lonRing = new THREE.Mesh(lonGeo, lonMat);
    lonRing.rotation.y = THREE.MathUtils.degToRad(76.8811);
    gyroGroup.add(lonRing);

    // Horizon Precession Ring
    var horGeo = new THREE.TorusGeometry(32, 0.4, 8, 64);
    var horMat = new THREE.MeshBasicMaterial({ color: 0xc4f6ff, opacity: 0.85, transparent: true });
    var horRing = new THREE.Mesh(horGeo, horMat);
    gyroGroup.add(horRing);

    // Coordinate crosshair guides
    var axisMat = new THREE.LineBasicMaterial({ color: 0x4fd8ff, opacity: 0.35, transparent: true });
    var axisPts = [
      new THREE.Vector3(-36, 0, 0), new THREE.Vector3(36, 0, 0),
      new THREE.Vector3(0, -36, 0), new THREE.Vector3(0, 36, 0),
      new THREE.Vector3(0, 0, -36), new THREE.Vector3(0, 0, 36)
    ];
    var axisGeo = new THREE.BufferGeometry().setFromPoints(axisPts);
    var axisLines = new THREE.LineSegments(axisGeo, axisMat);
    gyroGroup.add(axisLines);

    gyroGroup.position.set(0, 0, 0);
    scene.add(gyroGroup);

    // ── Compass Nexus iQ navigation arrows riding the three streams ──
    function streamPos(stream, u, t) {
      if (stream === 0) return new THREE.Vector3(-115 + u * 230, Math.sin(u * Math.PI * 2.2 + 2.5) * 22 - 14, Math.cos(u * Math.PI * 1.8) * 28);
      if (stream === 1) return new THREE.Vector3(120 - u * 220, 50 - u * 90 + Math.sin(u * Math.PI * 3) * 8, -40 + u * 80 + Math.cos(u * Math.PI * 2) * 16);
      return new THREE.Vector3(-90 + u * 190, -45 + Math.sin(u * Math.PI * 1.6 + t * 0.8) * 12, Math.sin(u * Math.PI * 2.5) * 35);
    }
    function arrowTexture() {
      var c = document.createElement("canvas"); c.width = c.height = 128;
      var x = c.getContext("2d");
      x.translate(64, 64); x.scale(4.2, 4.2);
      x.beginPath(); x.moveTo(11, 0); x.lineTo(-8, -9.5); x.lineTo(-3, 0); x.lineTo(-8, 9.5); x.closePath();
      x.lineJoin = "round";
      x.shadowColor = "rgba(0,121,254,0.95)"; x.shadowBlur = 6;
      x.fillStyle = "rgba(196,246,255,0.32)"; x.fill();
      x.lineWidth = 1.6; x.strokeStyle = "#c4f6ff"; x.stroke();
      return new THREE.CanvasTexture(c);
    }
    var arrowTex = arrowTexture();
    var navArrows = [0, 1, 2].map(function (st, k) {
      var mat = new THREE.SpriteMaterial({ map: arrowTex, transparent: true, depthWrite: false, depthTest: false });
      var sp = new THREE.Sprite(mat);
      sp.scale.set(8, 8, 1);
      scene.add(sp);
      return { sprite: sp, stream: st, u: k * 0.33, speed: 0.0016 + k * 0.0003 };
    });
    var _pa = new THREE.Vector3(), _pb = new THREE.Vector3();
    function updateNavArrows(t) {
      scene.updateMatrixWorld();
      navArrows.forEach(function (a) {
        a.u = (a.u + a.speed) % 1;
        var p = streamPos(a.stream, a.u, t), q = streamPos(a.stream, Math.min(1, a.u + 0.01), t);
        a.sprite.position.copy(p);
        _pa.copy(p).applyMatrix4(scene.matrixWorld).project(camera);
        _pb.copy(q).applyMatrix4(scene.matrixWorld).project(camera);
        a.sprite.material.rotation = Math.atan2((_pb.y - _pa.y) * height, (_pb.x - _pa.x) * width);
        var dim = activeStreamFilter === "all" || ["highway", "flight", "seaport"][a.stream] === activeStreamFilter ? 1 : 0.2;
        a.sprite.material.opacity = dim * (a.u < 0.05 ? a.u * 20 : a.u > 0.95 ? (1 - a.u) * 20 : 1);
      });
    }

    // ── Stream Mode Selector & Camera Glide ──
    var activeStreamFilter = "all";
    var streamBtns = Array.from(document.querySelectorAll(".threeui-stream-btn"));
    streamBtns.forEach(function (btn) {
      btn.addEventListener("click", function () {
        streamBtns.forEach(function (b) { b.classList.remove("is-active"); });
        btn.classList.add("is-active");
        activeStreamFilter = btn.getAttribute("data-stream") || "all";

        if (hasGsap && !reduceMotion) {
          var targetCamZ = 175;
          var targetCamY = 0;
          if (activeStreamFilter === "highway") {
            targetCamZ = 142; targetCamY = -12;
          } else if (activeStreamFilter === "flight") {
            targetCamZ = 148; targetCamY = 24;
          } else if (activeStreamFilter === "seaport") {
            targetCamZ = 155; targetCamY = -28;
          }
          gsap.to(camera.position, { z: targetCamZ, y: targetCamY, duration: 1.1, ease: "power2.out" });
        }
      });
    });

    // ── Visibility & Pointer Tracking ──
    var isVisible = false;
    if (hasGsap && window.ScrollTrigger) {
      ScrollTrigger.create({
        trigger: stage,
        start: "top bottom",
        end: "bottom top",
        onToggle: function (self) { isVisible = self.isActive; }
      });
    } else {
      isVisible = true;
    }

    var rotTargetX = 0, rotTargetY = 0;
    if (finePointer) {
      stage.addEventListener("pointermove", function (e) {
        var rect = stage.getBoundingClientRect();
        var nx = (e.clientX - rect.left) / rect.width - 0.5;
        var ny = (e.clientY - rect.top) / rect.height - 0.5;
        rotTargetY = nx * 0.48;
        rotTargetX = -ny * 0.38;
      });
      stage.addEventListener("pointerleave", function () {
        rotTargetX = 0;
        rotTargetY = 0;
      });
    }

    var clock = new THREE.Clock();
    function animateThree() {
      requestAnimationFrame(animateThree);
      if (!isVisible && !reduceMotion) return;

      var elapsed = clock.getElapsedTime();
      var posAttr = geometry.attributes.position;
      var pArr = posAttr.array;

      // Gyro differential rotations
      latRing.rotation.z += 0.0055;
      lonRing.rotation.x += 0.0038;
      horRing.rotation.y += 0.0028;
      coreMesh.rotation.y += 0.009;

      // Smooth pointer parallax damping
      scene.rotation.y += (rotTargetY - scene.rotation.y) * 0.06;
      scene.rotation.x += (rotTargetX - scene.rotation.x) * 0.06;

      // Dynamic stream flow computation
      for (var i = 0; i < PARTICLE_COUNT; i++) {
        var p = pData[i];
        p.u = (p.u + p.speed) % 1.0;
        var u = p.u;
        var idx = i * 3;

        var filterDim = 1.0;
        if (activeStreamFilter === "highway" && p.stream !== 0) filterDim = 0.22;
        else if (activeStreamFilter === "flight" && p.stream !== 1) filterDim = 0.22;
        else if (activeStreamFilter === "seaport" && p.stream !== 2) filterDim = 0.22;

        if (p.stream === 0) {
          // Highway Corridor S-curve: Technopark arterial vector
          pArr[idx] = (-115 + u * 230 + p.spreadX) * filterDim;
          pArr[idx + 1] = (Math.sin(u * Math.PI * 2.2 + p.freq) * 22 - 14 + p.spreadY) * filterDim;
          pArr[idx + 2] = (Math.cos(u * Math.PI * 1.8) * 28 + p.spreadZ) * filterDim;
        } else if (p.stream === 1) {
          // TRV Flight Corridor: Runway 32 glide descent stream
          pArr[idx] = (120 - u * 220 + p.spreadX) * filterDim;
          pArr[idx + 1] = (50 - u * 90 + Math.sin(u * Math.PI * 3) * 8 + p.spreadY) * filterDim;
          pArr[idx + 2] = (-40 + u * 80 + Math.cos(u * Math.PI * 2) * 16 + p.spreadZ) * filterDim;
        } else if (p.stream === 2) {
          // Vizhinjam Seaport Maritime Stream: coastal channel swell
          pArr[idx] = (-90 + u * 190 + p.spreadX) * filterDim;
          pArr[idx + 1] = (-45 + Math.sin(u * Math.PI * 1.6 + elapsed * 0.8) * 12 + p.spreadY) * filterDim;
          pArr[idx + 2] = (Math.sin(u * Math.PI * 2.5) * 35 + p.spreadZ) * filterDim;
        } else {
          // Ambient Spatial Twin Field
          var theta = u * Math.PI * 2;
          var phi = (i % 100) / 100 * Math.PI;
          var rad = (42 + Math.sin(elapsed + i) * 3) * filterDim;
          pArr[idx] = rad * Math.sin(phi) * Math.cos(theta);
          pArr[idx + 1] = rad * Math.sin(phi) * Math.sin(theta);
          pArr[idx + 2] = rad * Math.cos(phi);
        }
      }
      posAttr.needsUpdate = true;
      updateNavArrows(elapsed);

      renderer.render(scene, camera);
    }
    animateThree();

    // Responsive Canvas Resize
    window.addEventListener("resize", function () {
      var w = stage.clientWidth;
      var h = stage.clientHeight;
      if (!w || !h) return;
      width = w; height = h;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    }, { passive: true });
  })();

  /* ═══════════════════════════════════════════════════════════════
     MOTION LIBRARY (FRAMER MOTION / MOTION DOM) & APPLE BUTTONS
     Tactile micro-spring physics on Apple buttons and liquid frames
     ═══════════════════════════════════════════════════════════════ */
  (function initMotionButtons() {
    var appleButtons = Array.from(document.querySelectorAll(".btn-apple, .btn-primary, .btn-ghost"));
    if (!appleButtons.length) return;

    appleButtons.forEach(function (btn) {
      // Dynamic specular cursor tracking
      if (finePointer) {
        btn.addEventListener("pointermove", function (e) {
          var rect = btn.getBoundingClientRect();
          var x = ((e.clientX - rect.left) / rect.width) * 100;
          var y = ((e.clientY - rect.top) / rect.height) * 100;
          btn.style.setProperty("--mx", x.toFixed(1) + "%");
          btn.style.setProperty("--my", y.toFixed(1) + "%");
        });
      }

      btn.addEventListener("pointerenter", function () {
        if (window.Motion && typeof window.Motion.animate === "function" && !reduceMotion) {
          window.Motion.animate(btn, { scale: 1.025 }, { type: "spring", stiffness: 450, damping: 20 });
        }
      });

      btn.addEventListener("pointerdown", function () {
        if (window.Motion && typeof window.Motion.animate === "function" && !reduceMotion) {
          window.Motion.animate(btn, { scale: 0.94, y: 1 }, { type: "spring", stiffness: 600, damping: 24 });
        } else if (hasGsap && !reduceMotion) {
          gsap.to(btn, { scale: 0.94, y: 1, duration: 0.12, ease: "power2.out" });
        }
      });

      var release = function () {
        if (window.Motion && typeof window.Motion.animate === "function" && !reduceMotion) {
          window.Motion.animate(btn, { scale: 1, y: 0 }, { type: "spring", stiffness: 480, damping: 17 });
        } else if (hasGsap && !reduceMotion) {
          gsap.to(btn, { scale: 1, y: 0, duration: 0.35, ease: "back.out(2)" });
        }
      };

      btn.addEventListener("pointerup", release);
      btn.addEventListener("pointerleave", release);
      btn.addEventListener("pointercancel", release);
    });
  })();

  /* ── Reduce Motion: park the section at its end state ──────── */
  if (reduceMotion) {
    var dvTripsRM = document.getElementById("dvTrips");
    if (dvTripsRM) dvTripsRM.textContent = "42";
    if (deviceStatus) deviceStatus.textContent = DOCK_LINE;
    var dnHudStateRM = document.getElementById("dnHudState");
    if (dnHudStateRM) dnHudStateRM.textContent = "High Noon Clarity";
  }

  /* ── Re-measure once fonts, images and the iframe settle ───── */
  window.addEventListener("load", function () {
    /* ScrollTrigger keeps its own scroll memory and would put the page
       back where it was; clear it so a fresh visit opens at the top. */
    if (!openTarget) ScrollTrigger.clearScrollMemory("manual");
    ScrollTrigger.sort();
    ScrollTrigger.refresh();
    if (!openTarget) {
      window.scrollTo(0, 0);
      if (lenis) lenis.scrollTo(0, { immediate: true, force: true });
    }
  });
})();
