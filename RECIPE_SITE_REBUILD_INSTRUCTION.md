# WORLD KITCHEN ATLAS — Full Site Rebuild Instruction

**Purpose:** Ei document ta ekta complete build-spec — Claude Code ke direct feed kora jabe. Existing site (recipevault91.pages.dev) full delete kore, ei spec onujayi fresh rebuild korte hobe.

---

## 0. GETTING STARTED (age eita korben)

**Framework decision: Next.js** (na Vite+React). Reason: recipe site-er traffic mostly Google search theke ashe — SSG/SSR diye prottek page fully SEO-crawlable hobe, built-in Image optimization thakbe, ar recipe rich-snippet (Google search results-e photo+time+rating shoho card dekhano) er jonno schema.org structured data add kora onek shohoj. Cloudflare Pages e official adapter (`@cloudflare/next-on-pages`) diye deploy hobe — stack-er baki shob (GitHub JSON, Worker logic, no Firebase) same thake.

**Step 1 — Same Cloudflare Pages project e kaj korben** (notun project na, karon domain/GitHub connection already ache) — `main` branch-e sorasori fresh build shuru korben.

**Step 2 — Claude Code ke first message (Phase 1 shuru):**
```
Ei RECIPE_SITE_REBUILD_INSTRUCTION.md file-ta follow koro.
Stack: Next.js (App Router, SSG), Cloudflare Pages via @cloudflare/next-on-pages,
GitHub JSON storage, Cloudflare Worker/Pages Functions for dynamic bits, no Firebase.
Ekhon shudhu Phase 1 (Section 9) koro: folder scaffold, empty routes,
design tokens (Section 2) wire up. Baki phase gulo porer message e dibo.
```

**Tarpor prottek phase-er por result dekhe next phase-r command diben** — ekbare pura site build korte bolben na, Section 9-r order onujayi step-by-step jaben.

---

## 1. PROJECT OVERVIEW

- **Naam (final):** **World Kitchen Atlas** — clean, describes the continent→country structure directly, and pairs well with a cartography/map-legend design language (see "Atlas Pin" signature, Section 2).
- **Concept:** Ekta global culinary encyclopedia — Continent → Country → Dish structure e organize kora, prottek dish er shathe history, occasion, o traditional drink pairing
- **Content model:** 2-tier
  - **Discovery entries:** Shudhu naam + origin + historic note + when-eaten + paired drink (2800+ dish, jegula user pore add korbe)
  - **Full recipes:** Ingredients + numbered steps + nutrition estimate + time + difficulty (existing 32-r moto quality, user nijer moto add korbe)
- **Current status:** Site EMPTY thakbe rebuild-er por — shudhu structure/scaffold + 3-5 ta sample/placeholder recipe (testing-er jonno), real content user nije add korbe

---

## 2. DESIGN DIRECTION (Professional, Distinctive UI)

**Grounding:** Ei site "cuisine as geography + history" — na generic food-blog, na stock-photo recipe card wall. Design ta emon hote hobe jate mone hoy ekta **field-researcher's culinary atlas** — jekhane prottek dish ekta "entry" jar geographic o historic provenance ache.

### Design Token System

**Color palette (spice-market inspired, generic terracotta/cream avoid kora):**
| Token | Hex | Use |
|---|---|---|
| `--ink` | #241B14 | Primary text, deep roasted-cacao brown-black |
| `--parchment` | #FAF3E7 | Base background |
| `--turmeric` | #D89B2A | Primary accent (CTA, links, highlights) |
| `--paprika` | #B5482E | Secondary accent (occasion tags, alerts) |
| `--cardamom` | #4A6357 | Tertiary accent (dietary tags, success states) |
| `--clay-line` | #C9B89A | Borders, dividers, hairlines |

**Typography (2 deliberate faces, not default pairing):**
- **Display:** A confident slab-serif or humanist serif with real character — e.g. "Fraunces" (variable, warm, has personality) for dish names, country names, headlines
- **Body/UI:** A clean grotesque — e.g. "Inter" or "General Sans" for ingredients, steps, nav, filters
- **Utility/Meta:** A monospace — e.g. "IBM Plex Mono" for time, difficulty, nutrition numbers (gives a "field notebook / measured data" feel, distinct from decorative type)

**Layout concept:**
- Country pages structured like an **atlas plate**: country name as a large running header (like an atlas book's map-title), a thin horizontal rule with small tick marks (like a map scale bar, not a stock map graphic), dish cards in a dense grid below
- Recipe cards: no drop-shadows/rounded-bubble defaults — flat cards with a `1px solid var(--clay-line)` border, small pin-shaped badge in the corner showing continent + confidence level (like a map legend marker — this ties directly to the "where this dish is from" concept)
- Recipe detail page: two-column on desktop (ingredients sidebar sticky-left, steps flowing right) — a real cooking-reference layout, not a magazine-style hero-photo-then-scroll

**Signature element:** The **"Atlas Pin"** — a small pin/waypoint-shaped badge on every card and detail page (like a location marker on a map legend) showing: continent accent-color sliver, occasion icon, and confidence-level tick (per your accuracy-first approach). This is the one memorable, repeated visual motif tying geography + honesty-about-sourcing together — nothing else on the page competes with it for attention.

### Continental Accent System

**Rationale:** Prottek continent-er ekta distinct visual identity thakbe, kintu **stereotype/clip-art symbol** (jemon "Africa=tribal mask", "Asia=dragon", "Middle East=arabesque only") theke na — instead **real historic material culture** (dye, pigment, spice, stone) theke color ground kora, jate respectful o researched lage, cartoon-ish na.

**Mechanism:** Base design (ink, parchment, typography, layout grid, Atlas Pin shape/mechanic) **sob continent e identical thake** — shudhu 3 ta accent variable override hoy per continent, `data-region` attribute diye scoped:

```css
[data-region="asia"]     { --accent-1: #2C4870; --accent-2: #A83232; --accent-3: #4A6B4E; }
[data-region="europe"]   { --accent-1: #6B2737; --accent-2: #6E7548; --accent-3: #A8863E; }
[data-region="africa"]   { --accent-1: #B5651D; --accent-2: #8B4A2B; --accent-3: #2C4870; }
[data-region="americas"] { --accent-1: #A8283F; --accent-2: #D4941E; --accent-3: #3A8E8C; }
[data-region="oceania"]  { --accent-1: #A85A2E; --accent-2: #1E5A6E; --accent-3: #E8E0D0; }
```

| Continent | Accent-1 | Accent-2 | Accent-3 | Historic grounding |
|---|---|---|---|---|
| Asia | Indigo | Vermilion (cinnabar) | Jade | Indigo dye trade routes, cinnabar in East Asian lacquer/seals, jade as ceremonial stone |
| Europe | Bordeaux wine-red | Olive | Aged gold | Wine culture, olive oil trade, illuminated-manuscript gilding |
| Africa | Ochre | Terracotta | Deep indigo | Earth-pigment traditions, Nok terracotta pottery, West African adire dyeing |
| Americas | Cochineal red | Marigold | Turquoise | Cochineal dye (historic major trade good), marigold/cempasúchil significance, Indigenous turquoise stonework |
| Oceania | Ochre-red | Deep ocean blue | Bone white | Aboriginal ochre pigment art, Pacific voyaging/ocean culture, shell/bone material culture |

**What changes vs. what stays fixed:**
- **Changes per continent:** link/CTA color, Atlas Pin accent ring, filter-tag colors, hover underlines
- **Stays identical everywhere:** `--ink`/`--parchment` (body text/background — readability consistency), typography faces, card layout, spacing scale, Atlas Pin shape/size

**Country-level:** Country pages inherit their continent's accent automatically (Bangladesh → Asia palette). Ekta optional phase-2 idea: prottek country-r nijer ekta micro-accent (single extra hex, ekta specific historic dye/spice/material theke) — kintu eta launch-er jonno required na, scope-creep avoid korar jonno phase-1 e base rakhben.

**Motion:** Minimal. Only: a subtle fade-up on card entry (scroll-triggered, staggered by ~40ms), and a smooth accordion-expand on filter panels. No decorative hover-tilt or parallax — this is a reference tool, not a marketing page.

**Accessibility floor:** Responsive to 360px mobile, visible keyboard focus rings (`--turmeric` outline), `prefers-reduced-motion` respected (disable fade/stagger), color contrast AA-compliant on all text/background pairs above.

---

## 3. FULL SITEMAP

```
/                                    Home
/asia  /europe  /africa  /americas  /oceania      Continent hub
/asia/bangladesh                     Country page
/asia/bangladesh/kacchi-biryani      Dish/recipe detail
/breakfast /lunch /dinner /snacks /dessert /drinks  Meal-time hub
/street-food /festival-food                         Occasion hub
/search                              Search + combined filters
/about                               Methodology + accuracy disclaimer
/submit-recipe                       (keep from old site)
/admin                                Hidden (no nav link) + protected (PBKDF2 auth pattern) — see Section 11
```

---

## 4. DATA SCHEMA (single source of truth)

```json
{
  "id": "bd-kacchi-biryani",
  "slug": "kacchi-biryani",
  "name": "Kacchi Biryani",

  "country": "Bangladesh",
  "countrySlug": "bangladesh",
  "continent": "Asia",
  "continentSlug": "asia",

  "mealTime": ["Lunch", "Dinner"],
  "occasion": ["Festival", "Wedding", "Eid"],
  "streetFood": false,

  "dietary": {
    "vegetarian": false, "vegan": false, "glutenFree": false,
    "dairyFree": true, "eggFree": true, "nutFree": true,
    "lowCarb": false, "highProtein": true
  },

  "difficulty": "Hard",
  "totalTimeMinutes": 190,
  "historicNote": "Mughal-Persian dom-cooking heritage",
  "whenEaten": "Biye, Eid, boro celebration-er prodhan khabar",
  "pairedDrink": ["Borhani"],
  "confidenceLevel": "high",

  "shortDescription": "Mangsho o alu diye dom-e ranna kora sugandhi bhat",
  "heroImage": "/images/bangladesh/kacchi-biryani.jpg",

  "category": "Mains",

  "fullRecipeAvailable": false,

  "baseServings": 6,
  "headnote": "A short chef's-intro paragraph — why this dish, what makes this version right, one honest tip up front (e.g. 'the marinade time is non-negotiable, everything else is forgiving').",

  "timing": {
    "prepMinutes": 45,
    "marinateMinutes": 480,
    "activeCookMinutes": 40,
    "restMinutes": 45,
    "totalMinutes": 610
  },
  "equipment": ["Heavy-bottomed handi/dutch oven", "Wheat dough rope for dum-sealing", "Tawa/griddle to diffuse bottom heat"],
  "miseEnPlace": [
    "Soak rice 30 min before cooking",
    "Fry onions ahead of time, keep crispy separately",
    "Marinate mutton minimum 6 hr, ideally overnight"
  ],

  "ingredientGroups": [
    {
      "groupName": "For the mutton marinade",
      "items": [
        { "id": "0001", "name": "mutton, bone-in curry-cut", "amount": 1, "unit": "kg", "prepNote": "fat-on pieces, at room temperature", "pantryStaple": false },
        { "id": "0002", "name": "plain yogurt", "amount": 200, "unit": "g", "prepNote": "whisked smooth", "pantryStaple": true },
        { "id": "0003", "name": "ginger-garlic paste", "amount": 3, "unit": "tbsp", "prepNote": null, "pantryStaple": true }
      ]
    },
    {
      "groupName": "For the rice",
      "items": [
        { "id": "0004", "name": "basmati rice", "amount": 600, "unit": "g", "prepNote": "soaked 30 min, drained", "pantryStaple": true },
        { "id": "0005", "name": "whole spices (bay leaf, cinnamon, cardamom)", "amount": 1, "unit": null, "prepNote": "1 set — see method for exact pieces", "pantryStaple": true }
      ]
    },
    {
      "groupName": "For the dum layering",
      "items": [
        { "id": "0006", "name": "fried onion (beresta)", "amount": 100, "unit": "g", "prepNote": "deep-fried until deep golden, cooled crisp", "pantryStaple": false },
        { "id": "0007", "name": "saffron", "amount": 1, "unit": "pinch", "prepNote": "bloomed in 2 tbsp warm milk", "pantryStaple": false }
      ]
    }
  ],

  "steps": [
    {
      "stepNumber": 1,
      "title": "Marinate the mutton",
      "instruction": "Whisk {0002} until smooth, combine with {0003}, coat {0001} fully, cover and refrigerate.",
      "durationMinutes": 480,
      "heat": null,
      "technique": "Acid + yogurt tenderizing marination",
      "visualCue": "Meat edges look slightly pale/opaque, yogurt fully absorbed, no liquid pooling at the bottom",
      "commonMistake": "Marinating under 4 hours leaves meat tough — yogurt's acid needs time to break down connective tissue"
    },
    {
      "stepNumber": 2,
      "title": "Parboil the rice",
      "instruction": "Boil {0004} with {0005} in salted water until 70% done.",
      "durationMinutes": 6,
      "heat": { "level": "high", "flameNote": "rolling boil, full flame", "tempC": null },
      "technique": "70% parboil — rice must retain a hard white core",
      "visualCue": "Grain bends but snaps, hard uncooked center still visible when bitten",
      "commonMistake": "Fully cooking rice here makes it mushy after the dum stage"
    },
    {
      "stepNumber": 3,
      "title": "Dum cook (sealed steam)",
      "instruction": "Layer rice, mutton, {0006}, and {0007} in the handi. Seal the lid with dough.",
      "durationMinutes": 45,
      "heat": {
        "level": "high then lowest",
        "flameNote": "First 10 min on high flame to build internal steam pressure, then drop to the lowest possible flame with a tawa placed under the pot to diffuse heat and prevent scorching",
        "tempC": null
      },
      "technique": "Dum — dough-sealed pot traps steam, cooking rice and meat together without direct water contact",
      "visualCue": "Fragrant steam escapes when the seal is broken; rice is fully fluffy, mutton is fork-tender",
      "commonMistake": "Skipping the tawa-under-pot trick burns the bottom layer of rice"
    }
  ],

  "chefTips": [
    "Fry the onions a day ahead — they crisp better once fully cooled and stay crunchy longer",
    "If the dum smells like it's catching at the bottom before 45 min, it's too hot — lower the flame further rather than opening the seal"
  ],

  "donenessSummary": "Rice grains separate and fluffy, no raw core; mutton pulls apart with light fork pressure; oil visibly separates at the surface",
  "platingNote": "Serve straight from the handi at the table if possible — the aroma release on opening is part of the dish",
  "storageNote": "Refrigerate up to 3 days; reheat covered with a splash of water on low heat to restore moisture",
  "substitutions": [
    { "original": "Mutton", "swap": "Bone-in chicken thigh", "impact": "Cuts total time by ~40%, milder flavor" }
  ],
  "regionalVariations": [
    "Old Dhaka style uses more ghee and a deeper brown fried onion; some households add a few drops of kewra water at the final dum stage"
  ],

  "nutritionEstimate": { "calories": 620, "proteinG": 32, "carbsG": 58, "fatG": 28 }
}
```

**Serving-size scaling (mandatory feature):**
- `baseServings` is the reference point (e.g. 6). Every ingredient's `amount` is a **plain number + separate `unit`** — never a free-text string like "1 kg" — specifically so the frontend can do `displayAmount = amount * (selectedServings / baseServings)`.
- Recipe detail page needs a **servings stepper** (e.g. `4 [–] 6 [+] 10`) at the top of the ingredients panel — changing it live-recalculates every ingredient amount, with sensible rounding (round whole-count items like eggs/onions to the nearest whole number; round weight/volume to a sensible fraction like nearest 5g or nearest ¼ tsp).
- `pantryStaple: true/false` on each ingredient lets the UI visually mute common pantry items (salt, oil, ginger-garlic paste) vs. bold the items the cook actually needs to shop for — a genuine "professional recipe app" touch, not just a flat list.
- Ingredient names never bury the prep instruction inside the name — `"onion"` + `prepNote: "thinly sliced"`, never `"1 thinly sliced onion"` — this keeps the name column scannable and the scaling math clean.

**Storage:** `recipes/{country-slug}.json` — private GitHub repo, ekta file per country (apnar established pattern, easy to manage/edit one country at a time).

---

## 5. COMPONENT / PAGE BREAKDOWN

| Page | Key components |
|---|---|
| Home | Hero (no stock photo — use the Atlas Pin motif large-scale as the hero graphic), Continent grid, Meal-time quick-links, Search bar |
| Continent Hub | Country grid (name + dish count + flag-color sliver) |
| Country Page | Sticky filter bar (dietary + meal-time + occasion) + dish card grid + "Traditional Drinks" strip at bottom |
| Recipe Detail (full) | Chef-style layout, top to bottom: **headnote** (short intro paragraph), **mise-en-place checklist**, **servings stepper** (live-scales every ingredient amount) above **grouped ingredient list** (by prep stage, pantry-staples visually muted vs. shopping-list items bolded), then **numbered steps** — each step card shows instruction (with inline ingredient references), a **heat badge**, a **timer chip**, a **visual-cue callout**, and a **common-mistake callout** — followed by **doneness summary**, **plating/storage notes**, **chef's tips**, **substitutions**, **regional variations**, Atlas Pin badge, paired drink callout, nutrition table (also scales with servings) |
| Recipe Detail (discovery-only) | Single column: origin, historic note, when-eaten, paired drink, "Full recipe coming soon" state |
| Meal-Time / Occasion Hub | Same card grid + filter bar, cross-country |
| Search | Filter sidebar (continent, meal-time, dietary, occasion) + result grid, Fuse.js client-side |
| About | Plain-text methodology + accuracy disclaimer (reuse wording from your dish-list intro notes) |
| Admin | Hidden route (no nav link — see Section 11), login (PBKDF2, forced password-change on default credential), Analytics dashboard, form to add/edit dish JSON, toggle `fullRecipeAvailable`, password-change settings |

---

## 6. FILTER & SEARCH BEHAVIOR

- All filters (continent, country, meal-time, occasion, dietary x8) are **combinable** via query string: `/search?continent=asia&diet=vegetarian&meal=dinner`
- Same filter bar component reused on Country page, Meal-Time hub, Occasion hub, and Search page — **build it once as a shared component**
- Dietary filters are **AND logic** (Vegan + Gluten-Free = must satisfy both); Meal-time/Occasion are **OR within category, AND across categories**

---

## 7. SEO & RECIPE RICH SNIPPETS (world-class essential)

Ekta public recipe site-er beshirbhag traffic Google search theke ashe — tai eta skip kora jabe na:

- **Schema.org `Recipe` JSON-LD** prottek full-recipe page-e inject korte hobe: `name`, `image`, `recipeIngredient`, `recipeInstructions`, `totalTime`, `prepTime`, `cookTime`, `recipeYield` (servings), `nutrition`, `aggregateRating` (jodi review-system pore add hoy). Eta e Google-ke recipe card (photo+time+rating shoho) search result-e directly dekhate dey.
- **Per-page `<title>` + meta-description** dynamically generate hobe dish name + country + short-description theke (Next.js `generateMetadata` diye)
- **Open Graph tags** (og:image, og:title) prottek dish page-e — social share-e proper preview dekhabe
- **Sitemap.xml** auto-generate hobe shob 2800+ discovery-entry + full-recipe page theke (Next.js built-in sitemap generation)
- **Canonical URL** prottek page-e set kora, duplicate-content issue avoid korar jonno

---

## 8. TECH STACK (apnar established pattern — no changes)

- Frontend: **Next.js (App Router, SSG)**, deployed on Cloudflare Pages via `@cloudflare/next-on-pages` (see Section 0)
- Images: Next.js built-in `<Image>` component for automatic optimization/lazy-loading
- Backend: Cloudflare Worker (proxy pattern, same as carview-proxy/auction-proxy)
- Data: GitHub JSON, private repo
- Auth: PBKDF2 + HMAC session (admin only)
- Search: Fuse.js, client-side
- **No Firebase**

---

## 9. BUILD PHASES (direct Claude Code phase-by-phase)

1. **Scaffold:** Folder structure, empty routes, design tokens (CSS variables from Section 2) wired up
2. **Data layer:** Recipe schema + Worker endpoint to fetch/list/filter from GitHub JSON
3. **Home + Continent + Country pages:** Static shell first, then wire to data
4. **Recipe Detail page:** Both variants (full recipe vs. discovery-only)
5. **Meal-Time + Occasion hubs:** Reuse Country page's card-grid + filter component
6. **Search:** Fuse.js integration + combined filter query-string handling
7. **Admin panel:** Auth + CRUD form
8. **Seed data:** 3-5 sample dishes across different continents to verify every page type renders correctly
9. **Polish pass:** Accessibility check (focus rings, reduced-motion, contrast), mobile responsive check, remove old site files

---

## 10. VISITOR ANALYTICS

**Metrics to track (shown as a dashboard tab inside admin panel):**
- Total page views (all-time), unique visitors per day (last 30 days, as a simple line chart)
- Top 10 most-viewed countries
- Top 10 most-viewed dishes/recipes
- Today's live count

**Storage — Cloudflare KV, not GitHub JSON:** Visit counts change on every page load, jeta GitHub JSON e commit hishebe rakhle prottidin hundreds of commits hobe (bad practice). KV exactly ei use-case-er jonno design kora — apnar Cloudflare account e already available (Cloudflare Developer Platform-er `kv_namespace` tools diye setup kora jay).

**Key structure:**
```
visits:total                        → integer counter
visits:daily:2026-07-27              → integer counter (reset-e na, cumulative per day)
visits:country:bangladesh            → integer counter
visits:dish:kacchi-biryani            → integer counter
```

**Tracking mechanism:** Prottek page load e ekta lightweight Worker endpoint hit hobe (e.g. `/api/track?page=dish&id=kacchi-biryani`) — eta KV counter increment kore, kono cookie/personal-data store kore na (privacy-friendly, GDPR concern-o thake na).

**Alternative/complement:** Cloudflare Pages-e built-in **Cloudflare Web Analytics** free-e available, zero-config, kono code lagbe na — bounce rate, visitor geography, ityadi automatically dashboard-e dekhay. Eta enable kore rakhben site-wide overview-r jonno, ar upor-er custom KV counter shudhu admin-panel-embedded specific number-gulor jonno (total visits, top dish) — dutoi ekshathe use kora jete pare.

---

## 11. HIDDEN ADMIN ACCESS + PASSWORD SYSTEM

**Hidden entry point:** `/admin` route kono nav link/footer link e visible thakbe na. Ekta specific element-e (e.g. footer copyright text, ba site logo) ekta JS event listener thakbe:

```js
element.addEventListener('click', (e) => {
  if (e.ctrlKey && e.shiftKey) {
    window.location.href = '/admin';
  }
});
```

**Joruri security note (eta ignore korle real risk):** Ctrl+Shift+Click shudhu **discovery** lukiye rakhe — eta actual security na. Jekeu directly `/admin` URL type korlei route-e pouchate parbe jodi ekhane real authentication na thake. Tai `/admin` route-ta login-check chara kokhono render hobe na — hidden-entry ta ekta "nice to have obscurity layer" matro, main security ta login system-e e thakte hobe.

**Login flow:**
1. First-time setup: default credential `admin` / `123456` (PBKDF2-hashed, apnar established pattern e store kora — Cloudflare KV te ekta single `admin:credentials` key hishebe, GitHub JSON na, karon eta frequently-changing na kintu sensitive, KV-te thakle GitHub commit history-te kono hash-o thakbe na)
2. **Force password change on first login** — default password diye login korar por-e system automatically ekta "Change your password before continuing" screen dekhabe, normal admin panel e jete dите dibe na jotokhon na notun password set hoy. Eta apnar nijer request (#4, password change option) ke ekta safety-net hishebe implement kore — default "123456" ta beshi din live thake na.
3. **Password change form** (admin panel-er ekta settings tab-e permanently available, first-login-er por-o): current password + new password + confirm new password, notun PBKDF2 hash generate kore KV-te overwrite kore

---

## 12. UPDATED ADMIN PANEL COMPONENT

| Admin panel tab | Contents |
|---|---|
| Login | Username + password form, PBKDF2 check, forced password-change screen on default-credential first login |
| Dashboard/Analytics | Total visits, 30-day daily chart, top 10 countries, top 10 dishes |
| Manage Recipes | Add/edit dish JSON form (all fields from Section 4 schema), toggle `fullRecipeAvailable` |
| Settings | Change password form (current + new + confirm) |

---

## 13. CONTENT ADDITION WORKFLOW (day-to-day, post-launch)

Jokhon user bolbe **"Add Morog Polao from my list"** (ba emon), Claude Code ei steps follow korbe:

1. Ei dish-er entry already discovery-list e (country JSON) ache kina check korbe — thakle oita e upgrade korbe, na thakle notun entry banabe
2. Full Section 4 schema onujayi shob field fill korbe: `ingredientGroups` (prep-stage onujayi grouped), `steps` (heat/duration/technique/visualCue/commonMistake shoho), `headnote`, `chefTips`, `miseEnPlace`, `donenessSummary`, `substitutions`, `regionalVariations`
3. **Image:** maximum 3 image per dish, ei priority order e:
   - **Priority 1 — Licensed free-stock API:** Unsplash API, Pexels API, ba Pixabay API theke search kore matching dish photo khoja hobe (egula free commercial-use license dey, attribution shadharonoto lagena) — eta real copyright-scraping theke shurokkhito
   - **Priority 2 — Kono match na pele AI-generated image:** Claude Code ke ekta image-gen API (jemon OpenAI gpt-image, Google Imagen, ba Stability AI — jekono ekta account/API key setup kore) diye ei nirdisto dish-er photorealistic image generate korte bolben
   - Prottibar first-time-e user ke jiggesh korbe na — ei priority-order ta default hishebe follow korbe, image `/assets/images/{country}/{dish-slug}-{n}.jpg` e save hobe (existing site-er naming convention onujayi)
   - *(Ekta chotto legal note: AI-generated image commercial site-e use kora shadharonoto accepted practice, kintu ami lawyer na — jekono image-gen service-er specific Terms of Service ekbar check kore nite paren commercial-use clause-er jonno.)*
4. `fullRecipeAvailable: false` theke `true` e set korbe
5. `recipes/{country-slug}.json` file-e shei entry update kore GitHub-e commit korbe
6. Visitor-analytics/admin panel-e notun kono change lagbe na — automatically shei dish site-e show hobe

**Note:** Prottek notun dish add korar shomoy Claude Code-ke ei section-ta point kore dile ("Section 13 onujayi Morog Polao add koro") — protibar shob rule notun kore bolte hobe na.

---

## 14. CONTENT PROTECTION

**Honest framing (must be understood before implementing):** Right-click-disable and DevTools-block are **cosmetic deterrents only** — they stop casual copy-paste but do not stop screenshots, `view-source:` URL, or DevTools opened via browser menu. They cannot be made airtight because the browser must have the full HTML/CSS/JS client-side to render the page. The **real threat** is automated scraping bots stealing the whole recipe database, not a person right-clicking — that's solved differently (below).

**A. Cosmetic layer (implement as requested):**
```css
body { user-select: none; -webkit-user-select: none; }
img { pointer-events: none; } /* blocks drag-save on images specifically */
```
```js
document.addEventListener('contextmenu', e => e.preventDefault());
document.addEventListener('keydown', e => {
  if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && ['I','J','C'].includes(e.key)) || (e.ctrlKey && e.key === 'u')) {
    e.preventDefault();
  }
});
```

**B. Real protection (actually stops bulk scraping):**
- **Cloudflare Bot Fight Mode** — enable in Cloudflare dashboard (available on free tier), auto-challenges known scraper/bot traffic
- **Cloudflare Rate Limiting rule** — block/challenge any single IP making an abnormal number of requests per minute (catches naive scrapers hitting every dish page fast)
- **robots.txt** disallow rule for known aggressive AI-training crawlers if desired (does not stop everything, but signals intent and legitimate bots respect it)

**C. Legal deterrent:**
- Footer copyright notice: `© [year] World Kitchen Atlas. All content is original; unauthorized reproduction is prohibited.`
- Keep a private record/timestamp of your own added recipes (git commit history already does this) so you have proof of authorship if a takedown/DMCA request is ever needed

**Definition of Done addition:** [ ] Right-click/select disabled on content pages; Cloudflare Bot Fight Mode + a rate-limiting rule are active; footer copyright notice present

---

## 15. DEFINITION OF DONE

- [ ] Old site fully removed, no dead links
- [ ] All 8 dietary filters functional and combinable with meal-time/occasion/continent filters
- [ ] Both recipe-detail variants (full + discovery-only) render correctly
- [ ] Every full recipe step shows heat level, duration, and — where critical — a visual-cue and common-mistake callout (not just plain prose instructions)
- [ ] Servings stepper live-scales every ingredient amount and the nutrition estimate, with sensible rounding (whole-count items round to whole numbers)
- [ ] Ingredients are grouped by prep stage (marinade / rice / dum layering, etc.) with pantry-staple items visually distinct from shopping-list items
- [ ] Design tokens from Section 2 applied consistently (no default Tailwind/Bootstrap look)
- [ ] Mobile responsive down to 360px
- [ ] Keyboard focus visible everywhere
- [ ] About page includes accuracy/methodology disclaimer
- [ ] Admin panel can add a new dish end-to-end (GitHub JSON updates, reflects on site)
- [ ] `/admin` has no visible nav link anywhere; Ctrl+Shift+Click on the designated element navigates there
- [ ] `/admin` route itself still enforces full login regardless of how it's reached (hidden entry ≠ security)
- [ ] Default `admin`/`123456` login forces an immediate password-change screen before any other admin action is allowed
- [ ] Password change form works and updates the stored hash going forward
- [ ] Visitor counters (total, daily, per-country, per-dish) increment correctly and display on the Analytics tab
- [ ] Adding a new dish end-to-end takes max 3 images, follows the Section 13 workflow without needing rules re-explained each time
- [ ] Every full recipe page outputs valid schema.org Recipe JSON-LD (test with Google's Rich Results Test tool)
- [ ] Sitemap.xml auto-generates and includes all country/dish pages
