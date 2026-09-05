/**
 * AAV Works - Featured Projects Architectural Dashboard Controller
 * Matches media_1788555040082.png
 * Manages 5 projects with active item selection, center card updates, and right-panel benefits/metadata sync.
 */

const projectsData = [
  {
    idx: "01",
    shortTitle: "Automatic Block Signalling (ABS)",
    shortLoc: "Pan India • 85+ RKM",
    badge: "SIGNALLING",
    image: "/assets/images/proj_signalling_abs.jpg",
    title: "Automatic Block Signalling (ABS)",
    desc: "Design, circuit diagrams, application logic, and technical assurance for 85+ RKM dense mainline block sections.",
    benefit1: { title: "Enhanced Safety", sub: "Reduced human error" },
    benefit2: { title: "Higher Capacity", sub: "Smoother & faster operations" },
    benefit3: { title: "Proven Deployment", sub: "85+ RKM across corridors" },
    location: "Pan India",
    duration: "2022 – 2024"
  },
  {
    idx: "02",
    shortTitle: "Station Redevelopment",
    shortLoc: "South India • 12 Stations",
    badge: "STATION REDEV",
    image: "/assets/images/proj_station_redev.jpg",
    title: "Station Redevelopment & Yard Remodelling",
    desc: "Comprehensive Signal Interlocking Plan (SIP), dog charts, and turnkey drawing validation for high-capacity junction stations.",
    benefit1: { title: "Modernized Interlocking", sub: "Fail-safe route assurance" },
    benefit2: { title: "Expanded Junction Flow", sub: "Optimized platform turnaround" },
    benefit3: { title: "Turnkey Signoff", sub: "Zonal Railway compliance" },
    location: "South India",
    duration: "2021 – 2023"
  },
  {
    idx: "03",
    shortTitle: "Viaduct & Bridges",
    shortLoc: "Western Corridor",
    badge: "VIADUCT & S&T",
    image: "/assets/images/featured_viaduct_clean.jpg",
    title: "High-Speed Viaduct & Civil-S&T Integration",
    desc: "Multi-span elevated rail viaduct design support, cable trough routing schematics, and structural coordination.",
    benefit1: { title: "Structural Integration", sub: "Zero conduit interference" },
    benefit2: { title: "Elevated High-Speed", sub: "160+ kmph corridor readiness" },
    benefit3: { title: "Turnkey Assurance", sub: "Multi-span bridge proofing" },
    location: "Western Corridor",
    duration: "2023 – Present"
  },
  {
    idx: "04",
    shortTitle: "Yard Modelling",
    shortLoc: "Freight Networks",
    badge: "INTERLOCKING",
    image: "/assets/images/about_tracks.jpg",
    title: "Yard Remodelling & Interlocking Logic",
    desc: "Independent verification and validation (IV&V) of bit chart logic, station data tables, square sheets, and fail-safe safety protocols.",
    benefit1: { title: "Zero Error Logic", sub: "Automated bit-chart verification" },
    benefit2: { title: "Yard Throughput", sub: "Faster marshalling operations" },
    benefit3: { title: "Multi-OEM Ready", sub: "Universal interlocking formats" },
    location: "Central & Western Corridors",
    duration: "2021 – 2024"
  },
  {
    idx: "05",
    shortTitle: "Civil-S&T Integration",
    shortLoc: "High-Speed Projects",
    badge: "CIVIL-S&T",
    image: "/assets/images/project_bridge_viaduct.jpg",
    title: "Civil-S&T Integration & Cable Routing",
    desc: "Cable trough cross-sections, track circuit bonding schemes, and foundation clearance validation.",
    benefit1: { title: "EMC Protection", sub: "Shielded cabling pathways" },
    benefit2: { title: "Asset Longevity", sub: "Heavy-duty trough enclosures" },
    benefit3: { title: "Speedy Execution", sub: "Validated clash-free routing" },
    location: "National High-Speed Projects",
    duration: "2022 – 2024"
  }
];

export function initProjectDashboard() {
  const section = document.getElementById('projects');
  if (!section) return;

  const listItems = Array.from(section.querySelectorAll('.proj-list-item'));
  const prevBtn = section.querySelector('#projDashPrev');
  const nextBtn = section.querySelector('#projDashNext');

  // Center display elements
  const centerImage = section.querySelector('#projHeroImage');
  const centerBadge = section.querySelector('#projHeroBadgeText');
  const centerCounter = section.querySelector('#projHeroCounter');
  const centerTitle = section.querySelector('#projHeroTitle');
  const centerDesc = section.querySelector('#projHeroDesc');
  const centerCard = section.querySelector('.proj-hero-card');

  // Right panel elements
  const b1Title = section.querySelector('#projB1Title');
  const b1Sub = section.querySelector('#projB1Sub');
  const b2Title = section.querySelector('#projB2Title');
  const b2Sub = section.querySelector('#projB2Sub');
  const b3Title = section.querySelector('#projB3Title');
  const b3Sub = section.querySelector('#projB3Sub');
  const locValue = section.querySelector('#projLocValue');
  const durValue = section.querySelector('#projDurValue');

  let activeIndex = 0; // Default to 01 (Automatic Block Signalling)

  function renderProject(index, animate = true) {
    activeIndex = (index + projectsData.length) % projectsData.length;
    const p = projectsData[activeIndex];

    // Update list items active state
    listItems.forEach((item, i) => {
      item.classList.toggle('is-active', i === activeIndex);
      const isActive = i === activeIndex;
      item.classList.toggle('is-active', isActive);
      item.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });

    if (animate && centerCard) {
      centerCard.classList.remove('fade-pulse');
      void centerCard.offsetWidth;
      centerCard.classList.add('fade-pulse');
    }

    // Update center display
    if (centerImage) {
      centerImage.src = p.image;
      centerImage.alt = p.title;
    }
    if (centerBadge) centerBadge.textContent = p.badge;
    if (centerCounter) centerCounter.textContent = `${p.idx} / 05`;
    if (centerTitle) centerTitle.textContent = p.title;
    if (centerDesc) centerDesc.textContent = p.desc;

    // Update right panel
    if (b1Title) b1Title.textContent = p.benefit1.title;
    if (b1Sub) b1Sub.textContent = p.benefit1.sub;
    if (b2Title) b2Title.textContent = p.benefit2.title;
    if (b2Sub) b2Sub.textContent = p.benefit2.sub;
    if (b3Title) b3Title.textContent = p.benefit3.title;
    if (b3Sub) b3Sub.textContent = p.benefit3.sub;
    if (locValue) locValue.textContent = p.location;
    if (durValue) durValue.textContent = p.duration;
  }

  // Left list click
  listItems.forEach((item, i) => {
    item.addEventListener('click', () => renderProject(i));
  });

  // Next / Prev button click
  if (prevBtn) {
    prevBtn.addEventListener('click', (e) => {
      e.preventDefault();
      renderProject(activeIndex - 1);
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', (e) => {
      e.preventDefault();
      renderProject(activeIndex + 1);
    });
  }

  // Keyboard navigation when section is in view
  window.addEventListener('keydown', (e) => {
    const rect = section.getBoundingClientRect();
    const inView = rect.top < window.innerHeight && rect.bottom > 0;
    if (!inView) return;

    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
      renderProject(activeIndex + 1);
    } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
      renderProject(activeIndex - 1);
    }
  });

  // Swipe support for mobile
  let touchStartX = 0;
  let touchEndX = 0;
  if (centerCard) {
    centerCard.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    centerCard.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      if (touchEndX < touchStartX - 40) {
        renderProject(activeIndex + 1);
      } else if (touchEndX > touchStartX + 40) {
        renderProject(activeIndex - 1);
      }
    }, { passive: true });
  }

  // Initial render
  renderProject(0, false);
}

export const initProjectSlider = initProjectDashboard;

// Auto-initialize when loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initProjectDashboard);
} else {
  initProjectDashboard();
}
