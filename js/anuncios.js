/* ══════════════════════════════════════════
   PROYECTO MURO — anuncios.js
   Sistema de anuncios web híbrido

   ┌─────────────────────────────────────────┐
   │  SLOT 1  │  SLOT 2  │  ← PREMIUM FIJO  │
   │  SLOT 3  │  SLOT 4  │  ← ROTACIÓN      │
   └─────────────────────────────────────────┘

   CÓMO AGREGAR UN CLIENTE:
   ─────────────────────────────────────────
   1. Sube su imagen a images/ads/
      (formato .webp, 500×500px)
   2. Copia el bloque correspondiente abajo
   3. Rellena los campos y pon active: true
   4. Commit + push a GitHub → listo en 5 min

   PRECIOS:
   ─────────────────────────────────────────
   "premium"  → $15–20/mes  — slot fijo, siempre visible
   "estandar" → $8/mes      — entra al sorteo de rotación
   "relleno"  → tuyo        — rellena cuando no hay clientes

   CAMBIO DE IMAGEN: +$5 c/u (fuera del incluido en el mes)
══════════════════════════════════════════ */

const ADS_DB = [

  /* ══ ZONA PREMIUM — slots 1 y 2, FIJOS ══════════════════════
     Máximo 2 activos. Si hay menos de 2, los slots
     restantes se llenan con rotación automáticamente.
  ══════════════════════════════════════════════════════════════ */

  // {
  //   id:        "premium_001",
  //   img:       "./images/ads/cliente_premium_001.webp",
  //   link:      "https://instagram.com/tuclientepremium",
  //   alt:       "Nombre del cliente premium",
  //   user:      "@tuclientepremium",
  //   prioridad: "premium",
  //   vence:     "2025-08-01",   // para tu control — no afecta el código
  //   active:    false,
  // },
  // {
  //   id:        "premium_002",
  //   img:       "./images/ads/cliente_premium_002.webp",
  //   link:      "https://instagram.com/tuclientepremium2",
  //   alt:       "Nombre del cliente premium 2",
  //   user:      "@tuclientepremium2",
  //   prioridad: "premium",
  //   vence:     "2025-08-01",
  //   active:    false,
  // },

  /* ══ ZONA ROTACIÓN — slots 3 y 4, ALEATORIOS ════════════════
     Puedes tener muchos clientes aquí.
     Cada visita sortea 2 ganadores.
  ══════════════════════════════════════════════════════════════ */

  // {
  //   id:        "estandar_001",
  //   img:       "./images/ads/cliente_estandar_001.webp",
  //   link:      "https://instagram.com/tucliente",
  //   alt:       "Nombre del cliente",
  //   user:      "@tucliente",
  //   prioridad: "estandar",
  //   vence:     "2025-08-01",
  //   active:    false,
  // },

  /* ══ RELLENO PROPIO — siempre activo ════════════════════════
     Nunca pongas active: false aquí.
     Son el respaldo cuando no hay clientes.
  ══════════════════════════════════════════════════════════════ */
  {
    id:        "propio_01",
    img:       "./images/poster1.webp",
    link:      "https://buymeacoffee.com/proyecto_muro?amount=5",
    alt:       "Compra un espacio en el muro — $5",
    user:      "Espacio libre — $5",
    prioridad: "relleno",
    active:    true,
  },
  {
    id:        "propio_02",
    img:       "./images/poster2.webp",
    link:      "https://www.instagram.com/proyecto_muro/",
    alt:       "Sígueme en Instagram @proyecto_muro",
    user:      "@proyecto_muro",
    prioridad: "relleno",
    active:    true,
  },
  {
    id:        "propio_03",
    img:       "./images/poster3.webp",
    link:      "https://buymeacoffee.com/proyecto_muro?amount=5",
    alt:       "Tu marca aquí — anuncio web",
    user:      "Tu marca aquí",
    prioridad: "relleno",
    active:    true,
  },
  {
    id:        "propio_04",
    img:       "./images/poster4.webp",
    link:      "https://buymeacoffee.com/proyecto_muro?amount=5",
    alt:       "Ocupa este espacio",
    user:      "Espacio disponible",
    prioridad: "relleno",
    active:    true,
  },
];

/* ══════════════════════════════════════════
   CONFIG — ajusta si cambias precios o slots
══════════════════════════════════════════ */
const PREMIUM_SLOTS  = 2;   // slots fijos arriba
const ROTATION_SLOTS = 2;   // slots sorteados abajo
const ROT_WEIGHTS    = { estandar: 4, relleno: 1 }; // probabilidad relativa

/* ── Sorteo ponderado para la zona de rotación ── */
function weightedPick(ads, count) {
  const pool = [];
  ads.forEach(ad => {
    const w = ROT_WEIGHTS[ad.prioridad] ?? 1;
    for (let i = 0; i < w; i++) pool.push(ad);
  });

  const selected = [];
  const usedIds  = new Set();

  while (selected.length < count && pool.length > 0) {
    const idx = Math.floor(Math.random() * pool.length);
    const ad  = pool[idx];
    if (!usedIds.has(ad.id)) {
      selected.push(ad);
      usedIds.add(ad.id);
    }
    pool.splice(0, pool.length, ...pool.filter(a => a.id !== ad.id));
  }
  return selected;
}

/* ── Lógica híbrida principal ── */
function selectAds() {
  const active   = ADS_DB.filter(a => a.active);
  const premiums = active.filter(a => a.prioridad === 'premium');
  const rotation = active.filter(a => a.prioridad !== 'premium');

  // Slots premium: toma los primeros 2 (o menos si no hay)
  const fixedSlots = premiums.slice(0, PREMIUM_SLOTS);

  // Si hay menos de 2 premium, los slots vacíos se cubren con rotación
  const premiumDebt  = PREMIUM_SLOTS - fixedSlots.length;
  const rotationNeed = ROTATION_SLOTS + premiumDebt;

  // Excluir de rotación los que ya están en fixed
  const fixedIds     = new Set(fixedSlots.map(a => a.id));
  const rotationPool = rotation.filter(a => !fixedIds.has(a.id));
  const rotated      = weightedPick(rotationPool, rotationNeed);

  // [premium fijos arriba] + [rotación abajo]
  return [...fixedSlots, ...rotated];
}

/* ── Render en el DOM ── */
function renderAds() {
  const grid = document.getElementById('ad-grid');
  if (!grid) return;

  const ads = selectAds();

  grid.innerHTML = ads.map((ad, i) => {
    const isPremium  = ad.prioridad === 'premium';
    const isEstandar = ad.prioridad === 'estandar';
    const isPaid     = isPremium || isEstandar;
    const isFixed    = i < PREMIUM_SLOTS && isPremium;

    let badgeHTML = '';
    if (isPremium)  badgeHTML = '<span class="ad-badge ad-badge--premium">★ Premium</span>';
    if (isEstandar) badgeHTML = '<span class="ad-badge ad-badge--web">Web</span>';

    return `
    <div class="poster-card poster-tilt ${isPaid ? 'poster-card--paid' : ''} ${isFixed ? 'poster-card--fixed' : ''}">
      <a href="${ad.link}" target="_blank" rel="noopener noreferrer sponsored"
         class="poster-face poster-face--img">
        <img src="${ad.img}" alt="${ad.alt}" loading="lazy">
        <div class="poster-shine"></div>
        ${badgeHTML}
      </a>
      <div class="poster-foot">
        <span class="poster-user">${ad.user}</span>
        <span class="poster-time">${isPremium ? '★ Fijo' : isEstandar ? 'Rotación' : 'Muro'}</span>
      </div>
    </div>`;
  }).join('');

  if (window.__initTilt) window.__initTilt();
}

document.addEventListener('DOMContentLoaded', renderAds);
