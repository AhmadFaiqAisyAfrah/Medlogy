# Medlogy Project Plan

## Master Roadmap
1. **Phase 1: Foundation & Visuals** (Current)
   - Establish high-fidelity design system (Tailwind, Lucide, Framer Motion).
   - Implement core dashboard with Bento Grid layout.
   - Design authentication and onboarding flows.
2. **Phase 2: Functional Core**
   - Connect frontend to real backend data.
   - Implement data visualization modules.
   - User profile and settings.
3. **Phase 3: Scale & Optimize**
   - Mobile optimization.
   - Performance tuning.
   - Advanced analytics features.

## Current Trajectory
**Focus**: Application Functionality & Logic.
**Goal**: Build the core engine (API, State, Infra).
**Key Trends**: Clean Architecture, Serverless, scalable data patterns.


## Research & Architecture Strategy
**Current Focus**: Data Intelligence & Reliability.

### Data Sources (Epidemiological)
*   **Primary**: **CDC Socrata SODA API** (US Data) & **WHO GHO OData API** (Global).
*   **Secondary**: **disease.sh** (Aggregator for quick metrics).
*   **Ingestion**: Server-side proxy via Next.js Route Handlers to hide API keys (if any) and normalize data shapes.

### Technology Stack Recommendations
*   **Fetching**: **TanStack Query** (Client-side polling/caching) + **Next.js Native Fetch** (Server-side deduplication).
*   **Visualization**: **Recharts** (Complex implementations) & **Tremor** (Rapid Dashboarding).
*   **Utilities**: `date-fns` for time series manipulation.

## Bugs & Issues (Logged by The Nerd)
| ID | Description | Severity | Assigned To | Status |
| :--- | :--- | :--- | :--- | :--- |
| BUG-001 | **Navbar Color Mismatch** (see analysis below) | Medium | **Antigravity (Design)** | **Fixed** |

### BUG-001: Root Cause Analysis
**Symptom:** A visible color seam/band appears at the top of the page where the navbar meets the hero section.

**Root Cause:**
1.  **Header** (`src/components/layout/Header.tsx`, line 19): Uses solid background `bg-[#0B0C10]`.
2.  **Hero Section** (`src/app/page.tsx`, lines 35-40): Uses radial gradient overlays (`bg-primary/5`, `bg-purple-500/5`) with blur effects that do not extend under the header.
3.  The `#0B0C10` header does not match the computed color of the hero's gradients, causing a visible transition.

**Recommendation (for Design Lead):**
-   Option A: Make the header transparent or semi-transparent (`bg-transparent` or `bg-[#0B0C10]/50 backdrop-blur-md`) so it blends with the hero gradient.
-   Option B: Extend the hero's top vignette gradient (line 39) to be more prominent or remove the header's `border-b`.
-   Option C: Use a consistent gradient across both header and hero.

---

## Squad Status
| Agent | Task | Status |
| :--- | :--- | :--- |
| **The Builder** | Core API & Logic Implementation | **Completed** |
| **The Nerd** | Quality Control & Testing | **Active** |
