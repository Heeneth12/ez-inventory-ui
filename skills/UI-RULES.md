# UI Rules — Kubee Inventory

**Design system:** Tesla-inspired minimal. One accent color. No shadows. No gradients. Precision over decoration.

---

## 1. Core Philosophy

| Principle | Rule |
|---|---|
| **One chromatic color** | Electric Blue `#3E6AE1` for primary CTAs only. Never for decoration. |
| **No shadows** | Elevation is communicated through whitespace and z-index, never `box-shadow`. |
| **No gradients** | Surfaces are flat white, flat ash, or flat carbon. No gradient backgrounds on UI elements. |
| **No rounded-pill shapes** | Buttons get 4px. Inputs/cards get 0px. Only dots/avatars get `50%`. |
| **Two font weights** | `400` for body/regular text. `500` for headings/UI labels. Never `700` (bold). |
| **Normal letter-spacing everywhere** | Never use `tracking-tight` or negative letter-spacing. Only uppercase micro-labels use `tracking-[0.1em]`. |
| **0.33s universal transition** | All interactive state changes use `duration-ez` (0.33s). No faster, no slower. |
| **Border-only focus signal** | Focus states change border color to Electric Blue. No `focus:ring`, no glow. |

---

## 2. CSS Variables — Complete Reference

All tokens live in `src/styles.css` under `:root`. Never hardcode hex values in templates — always reference a variable or a semantic utility class.

### 2.1 Font

```css
--ez-font           /* 'DM Sans', 'Universal Sans Text', -apple-system, Arial, sans-serif */
--ez-font-display   /* 'DM Sans', 'Universal Sans Display', -apple-system, Arial, sans-serif */
```

**Usage:** Applied globally via `*, *::before, *::after { font-family: var(--ez-font) }`. You do not need to add font-family to individual elements. Use `--ez-font-display` only for large hero headings (>28px).

### 2.2 Font Sizes

| Variable | Value | Role |
|---|---|---|
| `--ez-text-2xs` | 10px | Uppercase micro-labels: step counters, status badges |
| `--ez-text-xs` | 11px | Error messages, fine print, trust captions |
| `--ez-text-sm` | 12px | Form labels, secondary captions |
| `--ez-text-base` | 13px | Body text, inputs, button labels |
| `--ez-text-md` | 14px | Subtitles, descriptions, nav items |
| `--ez-text-lg` | 15px | Section sub-headings, card titles |
| `--ez-text-xl` | 17px | Product names, card headers |
| `--ez-text-2xl` | 22px | Prices, promo callouts |
| `--ez-text-hero` | 28px | Page headings (auth, onboarding steps) |

> Large display text above 28px (e.g., 40–42px hero headlines) is used only for marketing/landing panels — not in app UI.

### 2.3 Font Weights

```css
--ez-weight-regular: 400;   /* body copy, descriptions, sub-links */
--ez-weight-medium:  500;   /* headings, labels, button text, nav items */
```

> There is no `font-bold` (700) in this system. If you find yourself reaching for bold, use medium instead.

### 2.4 Colors

#### Primary

| Variable | Value | Name | Use |
|---|---|---|---|
| `--ez-color-primary` | `#3E6AE1` | Electric Blue | Primary CTA backgrounds, active step dots, active border focus |
| `--ez-color-primary-hover` | `#2d5ac8` | Electric Blue Dark | Hover state of Electric Blue elements |
| `--ez-color-primary-tint` | `rgba(62,106,225,0.10)` | Electric Blue Tint | Badge/chip backgrounds (e.g., STANDARD plan tag) |

#### Surfaces

| Variable | Value | Name | Use |
|---|---|---|---|
| `--ez-color-white` | `#FFFFFF` | Pure White | Page bg, panels, input backgrounds, nav backgrounds |
| `--ez-color-ash` | `#F4F4F4` | Light Ash | Alternate surfaces, info banners, trust cards, billing toggles |
| `--ez-color-carbon` | `#171A20` | Carbon Dark | Dark sidebar/panel backgrounds |

#### Text Hierarchy

| Variable | Value | Name | Use |
|---|---|---|---|
| `--ez-color-text-heading` | `#171A20` | Carbon Dark | H1, H2, model names, card headings, input text |
| `--ez-color-text-body` | `#393C41` | Graphite | Paragraphs, descriptions, body content |
| `--ez-color-text-secondary` | `#5C5E62` | Pewter | Form labels, subtitles, secondary links |
| `--ez-color-text-muted` | `#8E8E8E` | Silver Fog | Placeholders, disabled states, fine print |

#### Borders

| Variable | Value | Name | Use |
|---|---|---|---|
| `--ez-color-border` | `#EEEEEE` | Cloud Gray | Default input borders, dividers, card outlines |
| `--ez-color-border-subtle` | `#D0D1D2` | Pale Silver | Hover state border escalation (secondary button hover) |

#### Semantic

| Variable | Value | Use |
|---|---|---|
| `--ez-color-error` | `#ef4444` | Input error border on focus |
| `--ez-color-error-light` | `#fca5a5` | Input error border at rest |

> No green/yellow/teal semantic colors exist in this system. Warning banners use amber (Tailwind `amber-*`) only where functional necessity demands it (e.g., server warm-up notice).

### 2.5 Border Radius

| Variable | Value | Use |
|---|---|---|
| `--ez-radius-none` | `0px` | Inputs, selects, cards, containers, plan cards — default for everything |
| `--ez-radius-button` | `4px` | All buttons (primary, secondary, nav, back) |
| `--ez-radius-icon` | `4px` | Icon containers, logo boxes |
| `--ez-radius-pill` | `50%` | Step indicator dots, carousel dots, avatar circles |

### 2.6 Motion

| Variable | Value | Use |
|---|---|---|
| `--ez-duration` | `0.33s` | Universal transition duration |
| `--ez-ease` | `cubic-bezier(0.5, 0, 0, 0.75)` | Universal easing curve |
| `--ez-transition` | `var(--ez-duration) var(--ez-ease)` | Full transition shorthand |

### 2.7 Spacing (8px base unit)

| Variable | Value |
|---|---|
| `--ez-space-1` | 4px |
| `--ez-space-2` | 8px |
| `--ez-space-3` | 12px |
| `--ez-space-4` | 16px |
| `--ez-space-5` | 20px |
| `--ez-space-6` | 24px |
| `--ez-space-8` | 32px |
| `--ez-space-10` | 40px |

---

## 3. Semantic Utility Classes

These classes are declared in `@layer utilities` in `styles.css`. Tailwind JIT generates `hover:`, `focus:`, `focus-within:` variants automatically when used in templates.

### 3.1 Text Color Classes

```html
text-ez-heading       <!-- #171A20 Carbon Dark — h1, labels, nav text -->
text-ez-body          <!-- #393C41 Graphite — paragraphs -->
text-ez-secondary     <!-- #5C5E62 Pewter — form labels, subtitles -->
text-ez-muted         <!-- #8E8E8E Silver Fog — placeholders, captions -->
text-ez-primary       <!-- #3E6AE1 Electric Blue — links, active labels -->
text-ez-primary-hover <!-- #2d5ac8 — hover state (use with hover:) -->
text-ez-carbon        <!-- #171A20 — text on dark surfaces (Carbon panel) -->
text-ez-carbon-80     <!-- Carbon at 80% opacity — sub-text on Carbon panels -->
text-ez-carbon-50     <!-- Carbon at 50% opacity — captions on light gradient panels -->
```

**Examples:**

```html
<h1 class="text-ez-hero font-medium text-ez-heading">Set up your workspace</h1>
<p class="text-ez-md text-ez-secondary">Get started in under 2 minutes.</p>
<a class="text-ez-primary hover:text-ez-primary-hover transition-colors duration-ez">Forgot password?</a>
```

### 3.2 Background Color Classes

```html
bg-ez-primary         <!-- #3E6AE1 — primary CTA button background -->
bg-ez-primary-hover   <!-- #2d5ac8 — hover state (use with hover:) -->
bg-ez-primary-tint    <!-- rgba(62,106,225,0.10) — badge/chip tint -->
bg-ez-ash             <!-- #F4F4F4 — surface cards, banners, toggles -->
bg-ez-white           <!-- #FFFFFF — panels, inputs -->
bg-ez-carbon          <!-- #171A20 — sidebar, dark panels -->
```

**Examples:**

```html
<button class="bg-ez-primary hover:bg-ez-primary-hover text-white rounded">Continue</button>
<div class="bg-ez-ash px-4 py-3">Info banner</div>
<aside class="bg-ez-carbon text-white">Sidebar</aside>
```

### 3.3 Border Color Classes

```html
border-ez-border      <!-- #EEEEEE Cloud Gray — default borders -->
border-ez-subtle      <!-- #D0D1D2 Pale Silver — hover border escalation -->
border-ez-primary     <!-- #3E6AE1 Electric Blue — active/selected borders -->
```

**Examples:**

```html
<!-- Input with focus -->
<input class="border border-ez-border focus:border-ez-primary outline-none transition-[border-color] duration-ez">

<!-- Phone wrapper with group focus -->
<div class="flex border border-ez-border focus-within:border-ez-primary transition-[border-color] duration-ez">

<!-- Plan card selected state -->
<div class="border-2 border-ez-primary bg-ez-ash">Selected plan</div>

<!-- Plan card default -->
<div class="border-2 border-ez-border hover:border-ez-subtle">Default plan</div>
```

### 3.4 Font Size Classes

```html
text-ez-2xs   <!-- 10px -->
text-ez-xs    <!-- 11px -->
text-ez-sm    <!-- 12px -->
text-ez-base  <!-- 13px -->
text-ez-md    <!-- 14px -->
text-ez-lg    <!-- 15px -->
text-ez-xl    <!-- 17px -->
text-ez-2xl   <!-- 22px -->
text-ez-hero  <!-- 28px -->
```

### 3.5 Transition Duration

```html
duration-ez   <!-- 0.33s — use instead of duration-[330ms] everywhere -->
```

---

## 4. Component Classes

Pre-built component CSS classes in `styles.css`. Use these before reaching for Tailwind utility chains.

### 4.1 `.ez-input`

Base class for all text inputs and textareas.

```html
<!-- Always pair with a state modifier -->
<input class="ez-input ez-input--default w-full" placeholder="..." />
<input class="ez-input ez-input--error w-full" />
<textarea class="ez-input ez-input--default w-full resize-none"></textarea>
```

What it does:

- `padding: 8px 12px`
- `font-size: 13px`, `font-weight: 400`
- `color: #171A20` (Carbon Dark)
- `background: #FFFFFF`
- `border: 1px solid` (color set by modifier)
- `border-radius: 0px` — sharp edges
- `outline: none`
- `transition: border-color 0.33s`
- `::placeholder { color: #8E8E8E }`

State modifiers:

- `.ez-input--default` — `border-color: #EEEEEE`, focus → `border-color: #3E6AE1`
- `.ez-input--error` — `border-color: #fca5a5`, focus → `border-color: #ef4444`

> Do **not** mix `.ez-input` with Tailwind `focus:border-*` or `border-*` classes — the modifiers handle that.

### 4.2 `.ez-select`

For all `<select>` dropdowns. Same visual spec as `.ez-input`.

```html
<select class="ez-select w-full" formControlName="businessType">
  <option *ngFor="let bt of businessTypes" [value]="bt.value">{{ bt.label }}</option>
</select>
```

What it does:

- Same sizing, color, and border as `.ez-input--default`
- `appearance: none` — removes OS chrome
- `cursor: pointer`

> For conditional error borders on selects (e.g., when touched and invalid), override manually:

```html
<select class="ez-select w-full"
  [ngClass]="form.get('state')?.touched && form.get('state')?.invalid ? 'border-red-300 focus:border-red-400' : ''">
```

### 4.3 `.ez-label`

For all form field labels.

```html
<label class="ez-label">Company name <span class="text-red-500">*</span></label>
```

What it does:

- `font-size: 12px`, `font-weight: 500`
- `color: #5C5E62` (Pewter)
- `margin-bottom: 4px`
- `display: block`

### 4.4 `.ez-btn`, `.ez-btn-primary`, `.ez-btn-secondary`

Base button class + variants.

```html
<!-- Primary CTA -->
<button class="ez-btn ez-btn-primary w-full">Create account →</button>

<!-- Secondary CTA -->
<button class="ez-btn ez-btn-secondary">View Inventory</button>
```

`.ez-btn` sets:

- `display: inline-flex`, `align-items: center`, `justify-content: center`
- `gap: 8px`, `padding: 8px 16px`, `min-height: 40px`
- `font-size: 13px`, `font-weight: 500`
- `border-radius: 4px`
- `border: 3px solid transparent`
- `transition: background-color, border-color, color — all 0.33s`
- `disabled: opacity-60, cursor-not-allowed`

`.ez-btn-primary`: Electric Blue bg, white text. Hover → darker blue.

`.ez-btn-secondary`: White bg, Graphite text, Cloud Gray border. Hover → Pale Silver border, Carbon Dark text.

### 4.5 `.ez-surface`

For Light Ash background containers (banners, info cards, trust sections).

```html
<div class="ez-surface px-4 py-3">Info content</div>
```

### 4.6 `.ez-divider`

Horizontal separator line using Cloud Gray.

```html
<hr class="ez-divider my-4" />
```

### 4.7 `.ez-micro-label`

Uppercase micro-text for step counters, section headers.

```html
<p class="ez-micro-label">Step 1 of 3</p>
<p class="ez-micro-label">Business address</p>
```

### 4.8 `.step-fade`

Step transition animation — fade in + subtle rise.

```html
<div *ngIf="currentStep === 0" class="step-fade">
  <!-- step content -->
</div>
```

---

## 5. Typography Usage Rules

### Step / page headings

```html
<h1 class="text-ez-hero font-medium text-ez-heading leading-tight">Set up your workspace</h1>
```

### Sub-heading / hero subtitle

```html
<p class="text-ez-md text-ez-secondary mt-1.5">Get started in under 2 minutes.</p>
```

### Section micro-label (uppercase)

```html
<p class="ez-micro-label mb-2">Step 1 of 3</p>
<!-- or -->
<p class="text-ez-2xs font-medium text-ez-muted uppercase tracking-[0.1em] mb-2">Business address</p>
```

### Card / section title

```html
<h3 class="text-ez-lg font-medium text-ez-heading">Payment details</h3>
```

### Body / description

```html
<p class="text-ez-base text-ez-body leading-relaxed">Your account is protected with industry-standard encryption.</p>
```

### Fine print / error

```html
<p class="text-ez-xs text-red-500">Required</p>
<p class="text-ez-xs text-ez-muted">256-bit SSL encrypted · Cancel anytime</p>
```

### Price display

```html
<span class="text-ez-2xl font-medium text-ez-heading">₹{{ plan.price }}</span>
<span class="text-ez-xs text-ez-muted">/ month</span>
```

---

## 6. Button Usage Rules

### Primary CTA (one per screen max)

```html
<button class="ez-btn ez-btn-primary" [disabled]="isLoading">
  <svg *ngIf="isLoading" class="w-4 h-4 animate-spin">...</svg>
  Create account →
</button>
```

### Secondary CTA

```html
<button class="ez-btn ez-btn-secondary">View Inventory</button>
```

### Back / nav button (footer of multi-step flows)

```html
<button class="px-4 py-2 text-ez-base font-medium text-ez-secondary border border-ez-border rounded
               hover:border-ez-subtle hover:text-ez-heading transition-[border-color,color] duration-ez">
  ← Back
</button>
```

### Text link button

```html
<button class="text-ez-sm font-medium text-ez-primary hover:text-ez-primary-hover
               transition-colors duration-ez outline-none">
  Forgot password?
</button>
```

### Inline text link (within a sentence)

```html
<button class="font-medium text-ez-primary hover:text-ez-primary-hover ml-1 transition-colors duration-ez">
  Register organization
</button>
```

---

## 7. Form Field Patterns

### Standard text field

```html
<div class="space-y-1.5">
  <label class="ez-label">Company name <span class="text-red-500">*</span></label>
  <input type="text" formControlName="companyName"
    class="ez-input w-full"
    [ngClass]="form.get('companyName')?.touched && form.get('companyName')?.invalid
      ? 'ez-input--error' : 'ez-input--default'"
    placeholder="Acme Logistics Pvt. Ltd." />
  <p *ngIf="form.get('companyName')?.touched && form.get('companyName')?.invalid"
    class="text-ez-xs text-red-500">Required</p>
</div>
```

### Select field

```html
<div class="space-y-1.5">
  <label class="ez-label">Business type <span class="text-red-500">*</span></label>
  <select formControlName="businessType" class="ez-select w-full">
    <option *ngFor="let bt of businessTypes" [value]="bt.value">{{ bt.label }}</option>
  </select>
</div>
```

### Phone number field (country code + number)

```html
<div class="space-y-1.5">
  <label class="ez-label">Phone number <span class="text-red-500">*</span></label>
  <div class="flex border border-ez-border overflow-hidden focus-within:border-ez-primary transition-[border-color] duration-ez">
    <select formControlName="countryCode"
      class="appearance-none w-24 pl-3 pr-2 py-2.5 bg-ez-ash border-r border-ez-border
             text-ez-sm text-ez-body outline-none cursor-pointer">
      <option *ngFor="let c of countries" [value]="c.code">{{ c.label }}</option>
    </select>
    <input type="tel" formControlName="adminPhone" placeholder="98765 43210"
      class="flex-1 px-3 py-2.5 bg-white text-ez-base text-ez-heading placeholder:text-ez-muted outline-none" />
  </div>
</div>
```

### Password with strength bar

```html
<div class="space-y-1.5">
  <label class="ez-label">Password <span class="text-red-500">*</span></label>
  <input type="password" formControlName="password" class="ez-input ez-input--default w-full" placeholder="Min. 8 characters" />
  <div *ngIf="form.get('password')?.value" class="h-[2px] bg-ez-border overflow-hidden">
    <div class="h-full transition-all duration-300" [ngClass]="{
      'w-1/3 bg-red-400':   passwordLength < 8,
      'w-2/3 bg-amber-400': passwordLength >= 8 && passwordLength < 12,
      'w-full bg-ez-primary': passwordLength >= 12
    }"></div>
  </div>
</div>
```

### Section divider within a form

```html
<div class="flex items-center gap-3 pt-2">
  <span class="ez-micro-label whitespace-nowrap">Business address</span>
  <div class="flex-1 h-px bg-ez-border"></div>
</div>
```

---

## 8. Layout & Spacing Rules

### Two-panel layout (auth, onboarding)

```html
<div class="flex w-full h-screen overflow-hidden">
  <aside class="hidden lg:flex w-64 flex-shrink-0 flex-col bg-ez-carbon px-5 py-6">
    <!-- Dark sidebar -->
  </aside>
  <main class="flex-1 flex flex-col overflow-hidden bg-white">
    <!-- Sticky header -->
    <div class="shrink-0 border-b border-ez-border bg-white sticky top-0 z-20">
      <div class="px-6 lg:px-10 h-16 flex items-center justify-end gap-3">
        <!-- Header actions -->
      </div>
    </div>
    <!-- Scrollable content -->
    <div class="flex-1 overflow-y-auto px-8 lg:px-10 pt-8 pb-4">
      <!-- Step content -->
    </div>
    <!-- Sticky footer nav -->
    <div class="flex items-center gap-3 px-8 lg:px-10 py-3 border-t border-ez-border bg-white">
      <!-- Back + Next buttons -->
    </div>
  </main>
</div>
```

### Info/context banner

```html
<div class="flex items-start gap-3 bg-ez-ash px-4 py-3 mb-6">
  <svg class="text-ez-primary flex-shrink-0 mt-0.5" width="14" height="14">...</svg>
  <div>
    <p class="text-ez-base font-medium text-ez-heading">Title text</p>
    <p class="text-ez-sm text-ez-secondary mt-0.5">Supporting detail.</p>
  </div>
</div>
```

### Trust/feature cards grid

```html
<div class="grid grid-cols-3 gap-3 mt-10">
  <div class="bg-ez-ash p-4">
    <div class="w-7 h-7 bg-white flex items-center justify-center mb-3">
      <svg class="text-ez-primary" width="14" height="14">...</svg>
    </div>
    <p class="text-ez-sm font-medium text-ez-heading mb-1">Card title</p>
    <p class="text-ez-xs text-ez-secondary leading-relaxed">Card description.</p>
  </div>
</div>
```

### Plan selection card

```html
<div (click)="selectedPlan = plan"
  class="relative border-2 p-4 cursor-pointer transition-[border-color,background-color] duration-ez"
  [ngClass]="selectedPlan?.id === plan.id
    ? 'border-ez-primary bg-ez-ash'
    : 'border-ez-border hover:border-ez-subtle bg-white'">
  <!-- Selected checkmark -->
  <div *ngIf="selectedPlan?.id === plan.id"
    class="absolute top-3 right-3 w-5 h-5 bg-ez-primary rounded-full flex items-center justify-center">
    <svg width="9" height="9">...</svg>
  </div>
  <!-- Card content -->
</div>
```

---

## 9. Sidebar (Dark Panel) Rules

The Carbon Dark sidebar uses inverted text. All colors are white with opacity.

```html
<aside class="bg-ez-carbon px-5 py-6">

  <!-- Active step -->
  <p class="text-[13px] font-medium text-white">Account setup</p>
  <p class="text-[11px] text-ez-primary/70">Company & admin basics</p>

  <!-- Completed step -->
  <p class="text-[13px] font-medium text-white/35">Verify email</p>

  <!-- Upcoming step -->
  <p class="text-[13px] font-medium text-white/20">Choose plan</p>

  <!-- Section header -->
  <p class="text-[9px] font-medium uppercase tracking-[0.12em] text-white/20 mb-2">Free trial includes</p>

  <!-- Perk item -->
  <div class="flex items-center gap-2 text-[11px] text-white/30">
    <span class="text-ez-primary font-medium text-xs">✓</span> Unlimited products
  </div>

  <!-- Progress bar -->
  <div class="h-[2px] bg-white/[0.07] overflow-hidden">
    <div class="h-full bg-ez-primary transition-all duration-500" [style.width.%]="progressPercent"></div>
  </div>
</aside>
```

---

## 10. Motion Rules

### Standard interactive transition

```html
<!-- Color-only transitions — never scale or translate -->
class="transition-colors duration-ez"
class="transition-[border-color] duration-ez"
class="transition-[background-color] duration-ez"
class="transition-[border-color,background-color] duration-ez"
class="transition-[border-color,color] duration-ez"
```

### Step/page entrance

```html
<div *ngIf="currentStep === 0" class="step-fade">
  <!-- Fades in + rises 6px over 220ms -->
</div>
```

### Loading spinner

```html
<svg class="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
  <circle cx="12" cy="12" r="10" stroke="white" stroke-width="3" opacity="0.3" />
  <path d="M4 12a8 8 0 018-8" stroke="white" stroke-width="3" stroke-linecap="round" />
</svg>
```

### Progress bar (sidebar)

```html
<div class="h-full bg-ez-primary transition-all duration-500" [style.width.%]="progressPercent"></div>
```

---

## 11. Do's and Don'ts

### DO

```html
<!-- ✓ Use semantic classes instead of hex values -->
<p class="text-ez-secondary">Supporting text</p>

<!-- ✓ Use ez-input + modifier -->
<input class="ez-input ez-input--default w-full" />

<!-- ✓ Use ez-label -->
<label class="ez-label">Email address</label>

<!-- ✓ Use duration-ez for all transitions -->
class="transition-colors duration-ez"

<!-- ✓ Sharp edges on containers -->
<div class="bg-ez-ash p-4">...</div>          <!-- 0px radius -->

<!-- ✓ 4px radius on buttons only -->
<button class="... rounded">...</button>

<!-- ✓ Border-only focus signal -->
<input class="... focus:border-ez-primary outline-none" />

<!-- ✓ One primary CTA per screen, two max -->
<button class="bg-ez-primary ...">Create account →</button>
<button class="bg-white border border-ez-border ...">Back to login</button>
```

### DON'T

```html
<!-- ✗ Never use raw hex values -->
<p class="text-[#5C5E62]">...</p>                     <!-- use text-ez-secondary -->
<div class="bg-[#F4F4F4]">...</div>                    <!-- use bg-ez-ash -->
<button class="bg-[#3E6AE1]">...</button>              <!-- use bg-ez-primary -->

<!-- ✗ Never use font-bold -->
<h1 class="font-bold">...</h1>                         <!-- use font-medium -->

<!-- ✗ Never add shadows -->
<div class="shadow-md">...</div>
<div class="drop-shadow-lg">...</div>

<!-- ✗ Never add gradients to UI surfaces -->
<div class="bg-gradient-to-r from-blue-500 to-indigo-600">...</div>

<!-- ✗ Never use focus:ring -->
<input class="focus:ring-2 focus:ring-indigo-500" />   <!-- use focus:border-ez-primary outline-none -->

<!-- ✗ Never use rounded-xl or rounded-2xl on buttons/inputs -->
<button class="rounded-xl">...</button>                <!-- use rounded (4px) -->
<input class="rounded-lg">...</input>                  <!-- use no rounding (0px default) -->

<!-- ✗ Never use tracking-tight -->
<h1 class="tracking-tight">...</h1>                   <!-- remove it, normal tracking is default -->

<!-- ✗ Never use duration-200 or duration-300 for UI transitions -->
<button class="transition duration-200">...</button>   <!-- use duration-ez -->

<!-- ✗ Never use hover:scale or hover:-translate-y -->
<button class="hover:scale-105">...</button>           <!-- color transitions only -->
<button class="hover:-translate-y-0.5">...</button>    <!-- color transitions only -->

<!-- ✗ Never use indigo-* colors (old system) -->
<div class="bg-indigo-600 text-indigo-500">...</div>   <!-- use bg-ez-primary, text-ez-primary -->
```

---

## 12. Adding New Components Checklist

When building any new component or screen, verify:

- [ ] No raw hex values in the template — all colors via `text-ez-*`, `bg-ez-*`, `border-ez-*`
- [ ] No `font-bold` — only `font-medium` (500) or default regular (400)
- [ ] No `shadow-*` anywhere
- [ ] No `rounded-xl`, `rounded-2xl` — only `rounded` (4px) on buttons
- [ ] No `tracking-tight` or negative letter-spacing
- [ ] No `focus:ring-*` — use `focus:border-ez-primary outline-none`
- [ ] All transitions use `duration-ez` (not `duration-200`, `duration-300`, `duration-[330ms]`)
- [ ] Inputs use `.ez-input` + `.ez-input--default` or `.ez-input--error`
- [ ] Labels use `.ez-label`
- [ ] Step/page transitions use `.step-fade`
- [ ] Electric Blue used only for CTAs and active/focus states — not decorative
- [ ] Maximum two action buttons visible at once per screen

---

## 13. File Structure Reference

| File | Purpose |
|---|---|
| `src/styles.css` | Single source of truth — all CSS variables, component classes, utility classes, driver.js overrides |
| `skills/DESIGN.md` | Design philosophy, visual language, and brand rationale |
| `skills/UI-RULES.md` | This file — developer implementation guide |
| `*.component.css` | Component-level overrides only (e.g., `:host` display rules). No color or typography here. |
| `*.component.html` | Templates use only semantic classes from `@layer utilities` and component classes from `styles.css` |
