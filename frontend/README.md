# GlobeTrotter Trips

Design GlobeTrotter as a modern trip-planning application visually inspired by the simplicity and structure of Tripadvisor Trips, but do NOT directly copy Tripadvisor branding, colors, icons, or exact layouts.

Focus only on UI/UX.

Overall Style

clean white background

large whitespace

minimal borders/shadows

strong travel photography

simple top navigation

rounded but not overly rounded cards

bold readable headings

professional travel-product feel

avoid admin-dashboard appearance

avoid sidebars on normal traveler pages unless required for itinerary building

Global Header

Create a Tripadvisor-style top navigation:

GlobeTrotter logo

Center/left navigation:

Discover

Trips

Activities

Right:

Search

Currency

Notifications

Profile / Sign In

Keep header clean and horizontal.

1. My Trips Page

This should be similar in simplicity to Tripadvisor's Trips experience.

Header:

My Trips

Subtext:
“Plan, organize and keep all your adventures in one place.”

Primary button:
+ Create a Trip

Below show tabs:

Upcoming

Ongoing

Past

Trip cards should contain:

large destination image

trip name

date range

cities

number of saved activities

small budget status

collaborators/avatar group

Continue Planning button

Example:

Italy Escape
Rome • Florence • Venice
12–20 October
8 days • 12 activities

[Continue planning]

2. Empty Trips State

For a new account use a centered layout similar to Tripadvisor:

Plan your next adventure

Save places you love, organize activities, manage your budget and build your itinerary.

[Create your first trip]

Use one high-quality travel illustration/photo and lots of whitespace.

3. Dashboard / Discover

Do not create an analytics dashboard.

Instead create a travel discovery homepage.

Top hero:

Where do you want to go?

Large search:

[ Search destinations, hotels, attractions or experiences ]

Below:

Recommended for you

Destination image cards.

Then:

Popular destinations

Then:

Continue planning

Show user's current trip.

4. Create Trip

Simple centered form/modal similar to a modern travel planner.

Fields:

Trip name

Destination

Start date

End date

Budget

Currency

Button:

Create Trip

Keep this screen minimal instead of creating a complex dashboard form.

5. Trip Detail Page

This is the main trip workspace.

Header:

Italy Escape

Rome • Florence • Venice
12–20 October

Buttons:

Share

Edit

More

Tabs:

Overview | Itinerary | Saved | Budget

Large destination cover image below header.

6. Overview Tab

Show:

Your trip

City route:

Rome → Florence → Venice

Then cards:

8 days

3 cities

12 activities

€1,050 remaining

Below:

Saved places

Horizontal activity cards.

Then:

Recommended for your trip

Travel recommendation cards.

7. Saved Places

Make this similar to Tripadvisor's save-first experience.

Show saved:

attractions

restaurants

experiences

places

Card:

[Image]

Vatican Museums

★ 4.8
Culture • Rome

Saved

[Add to itinerary]

Provide filters:

All | Attractions | Food | Experiences

8. Itinerary Builder

This screen can be slightly more application-like.

Desktop:

Left
Days / cities

Center
Day itinerary

Right
Saved places + recommendations

Example:

Day 2 — Rome

09:00
Colosseum Guided Tour
2 hrs • €50

12:00
Lunch in Trastevere
1.5 hrs • €30

[+ Add activity]

Keep it visually light like a travel planner, not a project-management board.

9. Activity Discovery

Large search-first layout.

Header:

Things to do in Rome

Filters:

Attractions

Food

Culture

Adventure

Price

Rating

Use large Tripadvisor-style travel cards:

[Image]

Vatican Museums

★ 4.8 (32,410)

Culture
Approx. €32

[Save] [Add to Trip]

10. Recommendations

Use normal travel cards rather than AI-looking cards.

Title:

Recommended for your trip

Example:

Italian Cooking Class

★ 4.9

Food • Rome
€70 • 2.5 hrs

“Fits your food interests and today's budget.”

[Save] [Add to itinerary]

Do not use robots or excessive AI gradients.

11. Budget

Keep budget visually simple.

Top:

Trip budget

€1,350 planned of €2,400

Progress bar.

Below:

Accommodation

Transport

Food

Activities

Use one clean donut chart and one daily spending chart.

12. Timeline

Display:

Monday, 12 October

Rome

09:00 — Colosseum
12:00 — Lunch
15:30 — Roman Forum

Then next day.

Keep it clean and scrollable.

13. Shared Trip

Use the same clean public travel style.

No application sidebar.

Show:

cover image

trip title

cities

dates

itinerary

saved experiences

Buttons:

Save this trip

Copy itinerary

Mobile

Follow modern travel-app behavior:

Bottom navigation:

Discover | Trips | Saved | Profile

Do not shrink desktop sidebars onto mobile.

The final product should feel like a combination of:

Tripadvisor-style discovery + saved places + structured itinerary planning + GlobeTrotter budget/recommendation features.

Keep the design simple, visual and travel-first instead of making GlobeTrotter look like an admin SaaS dashboard.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/53521c91-e195-4d84-9ffb-8445fe2b5d7d).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
