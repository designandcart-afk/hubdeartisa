# De'Artisa Hub - Development Guide

## Project Overview
De'Artisa Hub is a curated marketplace connecting interior designers with freelance 3D visualizers. The platform features a minimalist industrial design aesthetic with a focus on simplicity, premium feel, and user-friendly workflows.

## Brand Identity
- **Primary Color:** #092B2F (Deep Green)
- **Accent Color:** #BDAD9D (Industrial Khaki)
- **Background:** #FFFFFF (White)
- **Logo:** "DeArtisa" in Primary Green + "'" + "Hub" in Accent Khaki
- **Heading Font:** Montserrat Alternates Bold 700
- **Body Font:** Inter Light/Regular 300/400

## Design Principles
- Minimalist Industrial aesthetic
- Clean, premium, minimal UI
- Abundant whitespace
- Subtle borders (no heavy shadows)
- No gradients (except in placeholder images)
- No flashy animations
- No emojis

## Tech Stack
- **Framework:** Next.js 14 (React)
- **Language:** TypeScript
- **Styling:** CSS Modules
- **Fonts:** Google Fonts (Montserrat Alternates, Inter)

## Project Structure
```
src/
├── app/                          # Next.js app router pages
│   ├── layout.tsx               # Root layout with fonts
│   ├── page.tsx                 # Home/Landing page
│   ├── visualizers/             # Visualizer listing and profiles
│   │   ├── page.tsx            # All visualizers grid
│   │   └── [id]/page.tsx       # Individual visualizer profile
│   ├── hire/[id]/               # Hire flow pages
│   │   ├── page.tsx            # Submit project brief
│   │   ├── quote/page.tsx      # Review quote
│   │   └── payment/page.tsx    # Secure payment
│   ├── how-it-works/page.tsx   # Process explanation
│   └── about/page.tsx          # About page
├── components/                   # Reusable UI components
│   ├── Header/                  # Site header with logo & nav
│   ├── Footer/                  # Site footer
│   ├── Layout/                  # Page layout wrapper
│   ├── Button/                  # Button component
│   ├── Card/                    # Card component
│   └── Input/                   # Form input component
├── constants/                    # App constants
│   └── brand.ts                 # Brand colors, routes, etc.
├── data/                        # Mock data
│   └── mockData.ts             # Sample visualizers
├── styles/                      # Global styles
│   └── globals.css             # CSS variables & base styles
└── types/                       # TypeScript types
    └── index.ts                # Data type definitions
```

## Key Features

### 1. Home Page
- Hero section with clear value proposition
- Simple process explanation (4 steps)
- Key benefits section
- Call-to-action for getting started

### 2. Visualizer Discovery
- Grid layout showcasing all visualizers
- Key information: name, title, location, rating, rate, experience
- Specialty tags and availability status
- Clean card-based design with hover effects

### 3. Visualizer Profile
- Detailed profile with avatar and stats
- Portfolio showcase with project cards
- Specialties and bio
- Sticky sidebar with rate and "Hire Now" CTA

### 4. Hire Flow
**Step 1: Submit Brief**
- Project details form (title, description, requirements)
- Deadline and optional budget
- File upload area for CAD files and references
- Sidebar showing selected visualizer

**Step 2: Review Quote**
- Total amount prominently displayed
- Detailed cost breakdown
- Terms (delivery time, revisions, formats)
- Options to request changes or approve

**Step 3: Payment**
- Secure payment form
- Order summary sidebar
- Payment protection information
- Encrypted processing notice

### 5. Additional Pages
- **How It Works:** 6-step process explanation
- **About:** Mission, values, and platform overview

## Running the Project

### Install Dependencies
```bash
npm install
```

### Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production
```bash
npm run build
npm start
```

## Customization Guide

### Updating Colors
Edit `src/styles/globals.css`:
```css
:root {
  --color-primary: #092B2F;
  --color-accent: #BDAD9D;
  --color-background: #FFFFFF;
}
```

### Adding New Visualizers
Edit `src/data/mockData.ts` and add to the `mockVisualizers` array:
```typescript
{
  id: '7',
  name: 'Your Name',
  title: 'Your Title',
  // ... other fields
}
```

### Modifying Routes
Edit `src/constants/brand.ts` to update route paths.

### Styling Components
Each component has its own `.module.css` file for scoped styles. Follow the existing pattern of minimal, clean styling with subtle borders and no gradients.

## Best Practices

1. **Typography:** Use heading tags (h1-h3) with the Montserrat Alternates font for titles. Body text uses Inter.

2. **Spacing:** Utilize CSS variables for consistent spacing:
   - `var(--spacing-xs)` to `var(--spacing-2xl)`

3. **Colors:** Always use CSS variables for colors to maintain brand consistency.

4. **Layout:** Use the `container` class for max-width and horizontal padding.

5. **Components:** Keep components minimal and reusable. Avoid over-engineering.

6. **Responsiveness:** All pages are responsive with mobile-first approach. Test at 768px, 1024px, and 1200px+ breakpoints.

## Future Enhancements

- User authentication (designers and visualizers)
- Real-time messaging system
- Project management dashboard
- File upload functionality
- Payment gateway integration (Stripe/PayPal)
- Review and rating system
- Search and filter functionality
- Portfolio image uploads
- Email notifications
- Admin panel for vetting visualizers

## Support

For questions or issues, refer to the Next.js documentation:
- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
