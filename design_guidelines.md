# Educational Institute Management System - Design Guidelines

## Design Approach Documentation
**Selected Approach**: Design System Approach (Material Design influenced)
**Justification**: This is a utility-focused, information-dense enterprise application requiring consistency, efficiency, and learnability across multiple user roles and complex data management workflows.

## Core Design Elements

### Color Palette
**Primary Colors:**
- Light Mode: Primary 213 94% 68% (modern blue), Background 210 40% 98%
- Dark Mode: Primary 213 84% 76%, Background 222 84% 5%

**Semantic Colors:**
- Success: 142 76% 36%, Warning: 38 92% 50%, Error: 0 84% 60%
- Neutral grays: 220 14% 96% to 220 13% 18% (light to dark spectrum)

### Typography
- **Primary Font**: Inter via Google Fonts CDN
- **Hierarchy**: text-xs (12px), text-sm (14px), text-base (16px), text-lg (18px), text-xl (20px)
- **Weights**: font-normal (400), font-medium (500), font-semibold (600)

### Layout System
**Spacing Primitives**: Tailwind units of 1, 2, 4, 6, 8, 12, 16
- Consistent use of p-4, m-2, gap-6, space-y-8 throughout
- Card padding: p-6, Section spacing: space-y-12

### Component Library

**Navigation:**
- Collapsible sidebar (280px expanded, 64px collapsed)
- Role-based menu visibility with subtle role indicators
- Breadcrumb navigation for deep hierarchies

**Data Tables:**
- Sticky headers with sorting indicators
- Pagination controls (10, 25, 50 items per page)
- Search/filter bars above tables
- Truncated text with hover tooltips for long content
- Zebra striping for row differentiation

**Forms:**
- Grouped form sections with clear labels
- Inline validation messages
- Multi-step wizards for complex data entry
- Consistent input heights (h-10) and spacing

**Dashboard Cards:**
- KPI cards with subtle shadows and rounded corners (rounded-lg)
- Chart containers with proper legends and axes
- Status indicators using semantic colors

**Modals & Overlays:**
- Backdrop blur for modal backgrounds
- Consistent modal widths (max-w-2xl for forms, max-w-4xl for data views)
- Toast notifications positioned top-right

### Visual Enhancements
**Animations**: Minimal, 200-300ms transitions for:
- Sidebar expand/collapse
- Modal fade-in/out
- Table row hover states
- Button interactions (handled by component defaults)

**Shadows**: Subtle elevation using shadow-sm for cards, shadow-lg for modals

**Icons**: Heroicons via CDN for consistent iconography throughout the interface

## Key Design Principles
1. **Information Density**: Maximize data visibility while maintaining readability
2. **Role Clarity**: Visual indicators for user permissions and available actions
3. **Workflow Efficiency**: Minimize clicks for common tasks
4. **Accessibility First**: High contrast ratios, keyboard navigation, screen reader support
5. **Responsive Design**: Mobile-first approach with collapsible navigation

## Images
No hero images required. This is a data-focused enterprise application that prioritizes functionality over marketing visuals. Use placeholder avatars for user profiles and simple icons for empty states.