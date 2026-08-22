# GlobeTrotter — DESIGN.md

## 1. Design Direction
The supplied wireframe gives the screen structure, not the final visual system. Keep its information hierarchy but replace sketch-style boxes with a clean travel-product UI.

Design qualities:
- calm;
- spacious;
- image-led;
- professional;
- modern;
- not cartoonish;
- consistent cards and form controls.

## 2. Color Tokens
Use semantic tokens rather than hardcoding colors in components.

Suggested palette:
```text
--background:        #F8FAFC
--surface:           #FFFFFF
--surface-muted:     #F1F5F9
--text-primary:      #0F172A
--text-secondary:    #475569
--border:            #E2E8F0
--primary:           #2563EB
--primary-hover:     #1D4ED8
--accent:            #14B8A6
--success:           #16A34A
--warning:           #D97706
--danger:            #DC2626
```

If brand identity changes later, update tokens, not individual components.

## 3. Typography
Primary: Inter or Geist.

Scale:
- Display: 40/48, semibold
- H1: 32/40, semibold
- H2: 24/32, semibold
- H3: 20/28, semibold
- Body: 16/24
- Small: 14/20
- Caption: 12/16

## 4. Spacing
Use 4px base scale:
`4, 8, 12, 16, 20, 24, 32, 40, 48, 64`

Page max width:
- dashboard/content: 1280–1440px;
- forms: 640–760px;
- public itinerary: 960–1100px.

## 5. Radius & Shadows
- inputs: 10px;
- buttons: 10px;
- cards: 16px;
- dialogs: 18px;
- light shadow only for elevated cards/dialogs.

## 6. Buttons
Primary:
- create/add/save actions.

Secondary:
- neutral navigation or non-destructive action.

Danger:
- delete/revoke.

Icon-only:
- tooltip + aria-label required.

## 7. Forms
- labels above inputs;
- optional helper text;
- validation below field;
- disabled submit while pending;
- date fields grouped logically;
- currency selector beside money input;
- destructive actions separated from normal profile form.

## 8. Dashboard UI
Following the wireframe:
1. Header/nav
2. Hero/banner
3. Search + filter controls
4. Top regional/recommended destinations
5. Previous/upcoming trips
6. Plan Trip CTA

Use meaningful content hierarchy:
- image cards with 3:2 aspect ratio;
- trip cards with date and budget badges;
- 3–5 cards per desktop row depending width.

## 9. Create Trip UI
Use a two-column desktop layout:
- left: trip form;
- right: visual summary/cover or recommendations preview.

Mobile becomes one column.

## 10. Itinerary Builder UI
Desktop:
- 260px stop/day rail;
- flexible center canvas;
- 360px discovery/recommendation panel.

Mobile:
- tabs/bottom sheets instead of three fixed columns.

Item card:
- time;
- title;
- category;
- duration;
- cost;
- location;
- warning badge;
- overflow actions.

## 11. Budget UI
- strong total/remaining number;
- progress bar;
- category chart;
- daily chart;
- compact over-budget callout with suggested action.

Never use red for normal “spent” values; reserve danger styling for actual warnings.

## 12. Search UI
- sticky search/filter bar on desktop;
- filter sheet on mobile;
- debounced search;
- skeleton list;
- explicit zero-state;
- result count;
- pagination/infinite scroll.

## 13. Recommendation UI
Recommendation cards must communicate:
- why;
- fit;
- cost;
- time;
- confidence/rank;
- one clear Add action.

Do not show opaque “AI says so” messaging.

## 14. Loading / Empty / Error
Every data screen requires:
- skeleton loading;
- empty state with next action;
- inline retry;
- safe API error display.

## 15. Responsive Breakpoints
Suggested:
- mobile < 640
- tablet 640–1023
- desktop >= 1024
- wide >= 1440

## 16. Consistency Rules
- same Card component language across trips/cities/activities;
- same money formatter;
- same date formatter;
- same status badge tokens;
- same empty-state component;
- same confirm dialog for destructive actions;
- same toast patterns.

## 17. Accessibility
- minimum contrast;
- keyboard focus visible;
- logical tab order;
- forms labelled;
- dialogs trap focus;
- drag operations have button alternatives;
- charts include textual summaries.
