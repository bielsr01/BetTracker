# Sports Betting Management App - Design Guidelines

## Design Approach: Reference-Based (Productivity Tools)
Drawing inspiration from **Notion** and **Linear** for their clean data management interfaces and **modern fintech apps** for trustworthy financial tracking aesthetics. This utility-focused application prioritizes efficiency and data clarity.

## Core Design Elements

### Color Palette
**Dark Mode Primary:**
- Background: 220 13% 9%
- Surface: 220 13% 15%
- Primary: 217 89% 61% (Professional blue)
- Success: 142 71% 45%
- Error: 0 65% 51%
- Warning: 38 100% 50%

**Light Mode:**
- Background: 0 0% 98%
- Surface: 0 0% 100%
- Text: 220 9% 15%

### Typography
- **Primary Font:** Inter (Google Fonts)
- **Headings:** 600-700 weight
- **Body:** 400-500 weight
- **Data/Numbers:** 500 weight for emphasis

### Layout System
**Spacing Units:** Tailwind units of 2, 4, 6, and 8 (p-2, m-4, gap-6, h-8)
- Tight spacing for form elements
- Generous padding for cards and sections
- Consistent 6-unit spacing between major sections

### Component Library

**Navigation:**
- Clean sidebar with betting dashboard, filters, and settings
- Top bar with upload action and user profile

**Data Input Flow:**
1. **Upload Interface:** Large drag-drop zone with paste support
2. **OCR Verification Screen:** Two-column layout showing extracted image alongside editable form fields
3. **Confirmation Modal:** Summary view with "Save to Dashboard" action

**Betting Dashboard:**
- Card-based layout for each bet pair
- Clear visual status indicators (pending, won, lost, returned)
- Quick action buttons for bet resolution
- Profit/loss color coding (green/red)

**Forms:**
- Clean, minimal input fields
- Clear labels and validation states
- Grouped related fields (betting house info, odds, amounts)

**Data Displays:**
- Tabular views with sorting capabilities
- Summary cards for key metrics
- Clear typography hierarchy for financial data

**Overlays:**
- Modal dialogs for bet resolution
- Toast notifications for actions
- Loading states during OCR processing

### Key Design Principles

1. **Data Clarity:** Financial information uses consistent formatting and clear visual hierarchy
2. **Trust & Security:** Professional color scheme and clean layouts build confidence
3. **Efficiency:** Minimal clicks from upload to dashboard storage
4. **Error Prevention:** Clear verification step prevents OCR mistakes from entering system
5. **Status Transparency:** Always clear what stage each bet is in (pending, resolved, etc.)

### Animations
**Minimal and Purposeful:**
- Smooth transitions between upload and verification screens
- Subtle hover states on interactive elements
- Loading spinners during OCR processing
- No decorative animations that distract from data tasks

This design emphasizes professional data management with betting-specific workflows, ensuring users can quickly process screenshots while maintaining data accuracy through the verification step.