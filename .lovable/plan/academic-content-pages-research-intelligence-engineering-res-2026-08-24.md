# Academic Content Pages: Research, Intelligence, Engineering, Resources

## Overview

Build the four remaining academic pages that were planned in the original handover but never built. Each is a real, sourced content page with links to credible aerospace organizations. No fabricated facts, no em dashes, no internal jargon. They follow the existing design system (glass cards, page-hero, container narrow) and each gets its own route file with SEO head() metadata.

## Verified sources (researched this turn)

Every external link below was confirmed to exist via web search:

- NASA Technical Reports Server (NTRS): ntrs.nasa.gov
- NASA PubSpace: ntrs.nasa.gov/collections/pubspace
- ESA COSMOS / ESAC Science Data Centre: cosmos.esa.int
- SAO/NASA Astrophysics Data System (ADS)
- NASA Missions directory: nasa.gov/missions (filterable by status and type)
- NASA Science Missions: science.nasa.gov/science-missions
- NASA A to Z mission list: nasa.gov/a-to-z-of-nasa-missions
- HEASARC active missions: heasarc.gsfc.nasa.gov/docs/heasarc/missions/active.html
- NASA Basics of Spaceflight: science.nasa.gov/learn/basics-of-space-flight
- NASA Small Spacecraft Technology State-of-the-Art 2026 report: nasa.gov/smallsat-institute/sst-soa
- NASA STEM Opportunities: nasa.gov/learning-resources/nasa-stem-opportunities-activities
- NASA Citizen Science: science.nasa.gov/citizen-science (46 open projects)
- NASA Human Exploration Rover Challenge 2026
- Join the Artemis Mission: nasa.gov/learning-resources/join-artemis

## Pages to build

### 1. Research Library (`/research`)

**Purpose:** A curated index of public aerospace research databases and publication archives, so students and researchers can find primary sources.

**Content sections:**
- Hero: "Research Library" with tagline about tracing every figure back to a named source.
- Primary databases card: NTRS, NASA PubSpace, ESA COSMOS, SAO/NASA ADS, arXiv astro-ph. Each with a one-line description and external link.
- Research areas card: grouped links into NASA's science disciplines (heliophysics, astrophysics, planetary science, Earth science) linking to the relevant NASA science portal pages.
- Provenance note: how ORBITEX itself uses these sources, cross-linking to the About page.

**Route file:** `src/routes/research.tsx`

### 2. Mission Intelligence (`/intelligence`)

**Purpose:** A structured overview of active and historic space missions, bridging the academic side to the live data already on ORBITEX.

**Content sections:**
- Hero: "Mission Intelligence" with tagline about mission status and analysis.
- Active missions card: links to NASA's missions directory (filterable by status) and NASA Science Missions page. Mentions IMAP (launched Sep 2025) and TRACERS (launched Jul 2025) as recent additions, sourced from science.nasa.gov.
- Deep-space probes card: cross-links to ORBITEX's own Deep Space page for Voyager 1/2, New Horizons, Parker Solar Probe, JWST, and Juno, with a note that live distances are tracked there.
- Catalog card: link to NASA A to Z mission list and HEASARC active high-energy missions.
- Note: this page does not duplicate live data already rendered elsewhere. It provides context and links.

**Route file:** `src/routes/intelligence.tsx`

### 3. Engineering Notes (`/engineering`)

**Purpose:** Technical explainers of the orbital mechanics and spacecraft engineering concepts that ORBITEX visualizes.

**Content sections:**
- Hero: "Engineering Notes" with tagline about the physics behind the dashboard.
- Orbital mechanics card: links to NASA Basics of Spaceflight (science.nasa.gov/learn/basics-of-space-flight), specifically the Gravity and Mechanics chapter. Mentions Newton's principles, Keplerian elements, eccentricity.
- Orbital regimes card: brief factual descriptions of LEO, MEO, GEO, and Sun-synchronous orbits (the regimes the tracker visualizes), each with altitude range and typical use. Links to the tracker.
- Small spacecraft card: link to the NASA Small Spacecraft Technology State-of-the-Art 2026 report (nasa.gov/smallsat-institute/sst-soa), noting it covers propulsion, power, GN&C, and communications for smallsats as of April 2026.
- Reference card: link to the NTRS orbital mechanics primer "Space Flight: The Application of Orbital Mechanics."

**Route file:** `src/routes/engineering.tsx`

### 4. Learning Resources (`/resources`)

**Purpose:** A curated guide to educational programs, citizen science, and student competitions for space enthusiasts.

**Content sections:**
- Hero: "Learning Resources" with tagline about getting involved in space exploration.
- STEM programs card: links to NASA STEM Opportunities, NASA Community College Aerospace Scholars, and Join the Artemis Mission.
- Citizen science card: link to NASA Citizen Science page (46 open projects, no citizenship required), with a few named examples from the page.
- Competitions card: pulls the verified competitions already seeded in the database (NASA Space Apps Challenge, Conrad Challenge, AIAA Design/Build/Fly, CanSat, ISSDC) and links to the live competitions section on the landing page. Adds the NASA Human Exploration Rover Challenge 2026.
- Tools card: cross-links to ORBITEX's own tools (Orbit Tracker, Sky Tonight, Asteroid Watch) as hands-on learning instruments.

**Route file:** `src/routes/resources.tsx`

### 5. Navigation update

Add the four new pages to `src/components/site/site-header.tsx` under a new "Learn" section in the mobile drawer (after "More"). Desktop nav gets the four links appended. Each link uses TanStack `<Link to>` with the correct route path.

## Design and content rules

- Every page uses the existing `page-main > section > container narrow > page-hero` structure with `glass glass-card` sections, matching About and Privacy.
- No em dashes anywhere in the copy.
- No internal jargon (no "proxy", "cache", "API key", "server function", "DEMO_KEY").
- Every external link opens in a new tab with `rel="noopener noreferrer"`.
- Every external link is to a real, verified URL from the sources list above.
- Each route defines its own `head()` with unique title, description, og:title, og:description, and `og:type: website`.
- Cross-links to internal ORBITEX pages use `<Link to>` from TanStack Router.

## Verification

- Build passes with no type errors.
- All four routes render in the dev preview at `/research`, `/intelligence`, `/engineering`, `/resources`.
- Every external link on each page points to a real URL (verified during research, spot-checked after build).
- Navigation includes all four new links on desktop and mobile.
- No em dashes in any shipped copy.
- Playwright screenshot of each page to confirm layout matches the design system.
