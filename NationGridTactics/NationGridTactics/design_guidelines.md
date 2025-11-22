# Design Guidelines: Multiplayer Strategy Game

## Design Approach

**Selected Approach**: Design System - Custom Strategy Game Framework
**Justification**: Information-dense strategy game requiring efficient data presentation, multiple simultaneous views, and extended play sessions. Drawing inspiration from modern strategy games (Civilization, Hearts of Iron, Total War) while maintaining clean, scannable interfaces.

## Core Design Elements

### Typography

**Font Families**:
- Primary: 'Inter' or 'Roboto' - excellent readability for UI elements and stats
- Accent/Headers: 'Rajdhani' or 'Orbitron' - military/tech aesthetic for section titles

**Hierarchy**:
- Resource Stats: text-sm font-bold (always visible top bar)
- Section Headers: text-xl font-bold uppercase tracking-wide
- Building Names: text-base font-semibold
- Descriptions: text-sm font-normal
- Tooltips: text-xs
- Research Tree Items: text-sm font-medium
- Player Names/Countries: text-lg font-bold

### Layout System

**Spacing Primitives**: Use Tailwind units of 2, 4, and 8 consistently
- Micro spacing (within components): p-2, gap-2
- Standard spacing (between elements): p-4, gap-4, m-4
- Section spacing: p-8, gap-8
- Component padding: px-4 py-2 for buttons, p-4 for cards

**Grid Structure**:
```
┌─────────────────────────────────────┐
│  Resource Bar (fixed top)           │
├──────────┬──────────────────┬───────┤
│ Left     │  Main Game Grid  │ Right │
│ Panel    │  (60% width)     │ Panel │
│ (20%)    │                  │ (20%) │
│          │                  │       │
│ Placed   │  Interactive     │ Mini  │
│ Units/   │  Country Map     │ Map + │
│ Military │                  │ Info  │
└──────────┴──────────────────┴───────┘
```

**Responsive Breakpoints**:
- Desktop (lg:): Three-column layout as above
- Tablet (md:): Two-column with collapsible panels
- Mobile: Single column with tabbed navigation

### Component Library

**A. Top Resource Bar** (fixed position)
- Horizontal strip showing all resources with icons
- Money | Population | Manpower | Stability | Research Points | Materials | Oil | Minerals | Food | Uranium
- Each resource: icon + value + small trend indicator
- Height: h-16, bg with subtle transparency, border-b

**B. Game Grid** (main play area)
- Square grid cells, each square represents territory
- Grid: `grid grid-cols-10 gap-1` for 10x10 visible area (scrollable/pannable)
- Each cell: `aspect-square border cursor-pointer hover:ring-2`
- Building icons displayed in cells with small badge indicators
- Selected cell: ring-4 treatment
- Enemy territory: distinctive border treatment
- Protected players: corner badge indicator

**C. Sidebar Panels**

Left Panel - Military/Structures:
- Tabbed interface: "Units" | "Buildings" | "Deploy"
- Scrollable list with cards for each item
- Card structure: icon + name + stats + action button
- Unit cards show: type, count, location, movement speed
- h-screen with overflow-y-auto

Right Panel - Information Hub:
- Minimap at top (h-48)
- Tabbed content below: "Research" | "Trade" | "Events" | "Players"
- Research tree: collapsible accordion with progress bars
- Trade interface: offer/request resource form
- Event feed: timestamped list with severity indicators

**D. Modal Overlays**

Structure Placement Modal:
- Center screen, max-w-2xl
- Header: structure name + resource requirements
- Grid preview showing placement area
- Confirm/Cancel actions
- p-8 spacing

Research Panel:
- Full-screen overlay with close button
- Three-column layout for Military/Economic/Political trees
- Tree nodes: circular icons connected by lines
- Locked items: opacity-50
- Active research: animated progress ring

Trade Interface:
- max-w-4xl centered modal
- Two-column: Your Offer | Their Offer
- Resource selection dropdowns
- Player list with search
- Trade history timeline

**E. Interactive Elements**

Buttons:
- Primary actions: px-6 py-3 rounded-lg font-semibold
- Secondary: px-4 py-2 rounded border-2
- Icon buttons: w-10 h-10 rounded-full
- All buttons include disabled states for resource constraints

Grid Cells:
- Base: border rounded-sm transition-all
- Hover: scale-105 transform
- Selected: ring-4
- Invalid placement: opacity-50 cursor-not-allowed

Cards (structures/units):
- Rounded-lg p-4 border
- Icon at top (w-12 h-12)
- Title below
- Stats grid with 2-column layout
- Action button at bottom, full width

**F. Status Indicators**

Protection Badges:
- Floating corner badge on player territories
- Shows days remaining: "🛡️ 7d" format
- Size: px-2 py-1 rounded text-xs font-bold

Progress Bars:
- Research progress: h-2 rounded-full relative overflow-hidden
- Movement progress: h-1 attached to bottom of unit icons
- Resource generation: subtle pulse animation

Resource Requirements:
- Inline list: icon + value format
- Red treatment when insufficient
- Green when available
- Format: "🏗️ 500 | ⚡ 100 | 💎 50"

**G. Authentication Screens**

Login/Signup:
- Centered card, max-w-md
- min-h-screen flex items-center justify-center
- Logo/title at top
- Form fields: w-full p-3 rounded border
- Primary button below
- Toggle link between login/signup

### Animation Guidelines

**Minimal Animations Only**:
- Grid cell selection: 150ms ease transform and ring
- Panel open/close: 200ms slide transition
- Resource updates: subtle 300ms number change
- Attack/movement: linear path animation for units (speed-based duration)
- Research complete: single pulse on completion
- NO scroll animations, parallax, or decorative effects

### Images

**No hero images** - this is a utility application. Icons only:
- Building/structure icons for each placeable type
- Unit type icons (infantry, vehicles, aircraft)
- Resource icons (consistent set across app)
- Research tree node icons
- Flag/emblem upload for player countries (optional feature)

All icons via **Heroicons** (outline for most UI, solid for emphasis)

### Information Architecture

**Always Visible**: Top resource bar, minimap
**Primary View**: Game grid occupies 60% screen width
**Secondary Panels**: Collapsible but persistent on desktop
**Tertiary Info**: Modal overlays for deep dives (research, trade details)
**Notifications**: Toast notifications bottom-right for events (max-w-sm)