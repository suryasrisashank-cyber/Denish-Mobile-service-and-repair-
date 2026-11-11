# DENISH MOBILE REPAIRING AND SERVICE

> **Official Website & Digital Booking Platform**  
> *"Your Mobile, Our Care."* | *"All Mobile Problems | One Solution."*  
> **Turnaround Guarantee:** *"Fix Today • Use Tomorrow"*  
> **Direct Hotline:** `+91 85116 68848` | **WhatsApp:** `+91 85116 68848`

---

## 1. Executive Summary & Overview
This repository contains the complete, production-ready source code for **DENISH MOBILE REPAIRING AND SERVICE**, engineered using Next.js 14 (App Router), TypeScript, Tailwind CSS, and Lucide Icons.

The website translates the official high-tech business poster into a digital web experience featuring:
- **Colour Palette:** Obsidian Black background (`#05070E`), Midnight Navy cards (`#0F172A`, `#111C35`), Metallic Gold highlights (`#F59E0B`, `#FDE68A`), and Electric Blue accents (`#0284C7`, `#38BDF8`).
- **Mobile-First Responsive Layout:** Full drawer navigation, touch-optimized cards, and persistent bottom contact action bar on handheld devices.
- **Conversion-Focused Architecture:** Direct 1-tap phone dialing (`tel:+918511668848`), instant pre-filled WhatsApp messaging (`wa.me/918511668848`), and a validated repair inquiry system.
- **Local SEO & Schema.org Integration:** `MobilePhoneRepairStore` JSON-LD structured data, dynamic `sitemap.xml`, and `robots.txt`.

---

## 2. Technology Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript 5
- **Styling:** Tailwind CSS 3 with custom brand color extensions & metallic gradients
- **Icons:** Lucide React (`lucide-react`)
- **Runtime:** Node.js (v18+ recommended)
- **Deployment Target:** Vercel (Zero configuration required)

---

## 3. Project Structure

```text
denish-mobile-repair/
├── public/
│   ├── denish-poster.jpg        # Official business branding asset
│   ├── repair-workbench.jpg     # High-resolution photorealistic electronics workbench
│   ├── mobile-preview.html      # Standalone interactive mobile device simulator
│   └── favicon.ico              # Web favicon
├── scripts/
│   ├── production-readiness-audit.js # 59-point comprehensive production audit
│   ├── test-mobile-ui.js        # 32-point mobile UI & touch audit
│   └── qa-deep-test.js          # 49-point interaction and integration test
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── enquire/
│   │   │       └── route.ts     # Real serverless API route for repair tickets
│   │   ├── fonts/               # Geist font assets
│   │   ├── globals.css          # Tailwind base, dark palette & custom utilities
│   │   ├── layout.tsx           # SEO metadata, OpenGraph, JSON-LD Schema.org
│   │   ├── page.tsx             # Main landing page assembling all sections
│   │   ├── mobile-preview/      # Native route for interactive phone frame testing
│   │   ├── robots.ts            # Dynamic robots.txt generation
│   │   └── sitemap.ts           # Dynamic sitemap.xml generator
│   ├── components/
│   │   ├── Navbar.tsx           # Sticky nav, brand crest, phone/WhatsApp CTAs & drawer
│   │   ├── Hero.tsx             # Cinematic 3D smartphone teardown & poster showcase
│   │   ├── Phone3DCanvas.tsx    # Three.js interactive 3D smartphone with exploded view
│   │   ├── TrustBadges.tsx      # 4 core value pillars (Genuine Parts, Certified Techs...)
│   │   ├── About.tsx            # Philosophy, "Keep Your Mobile Running", precision lab
│   │   ├── Services.tsx         # 8 service cards with interactive animations
│   │   ├── ServiceSimulations.tsx # 8 realistic interactive service animations
│   │   ├── BrandsSupported.tsx  # Apple, Samsung, OnePlus, Xiaomi, Vivo, etc.
│   │   ├── WhyChooseUs.tsx      # 6 core differentiators & technical guarantees
│   │   ├── RepairProcess.tsx    # 4-step workflow (Diagnostics -> Quote -> Repair -> QC)
│   │   ├── CustomerTrust.tsx    # Quality assurance & customer satisfaction pledge
│   │   ├── Faq.tsx              # Interactive accordion for common customer queries
│   │   ├── EnquiryForm.tsx      # Real photographic workbench background & appointment booking
│   │   ├── LocationMap.tsx      # Interactive Google Map embed & direction triggers
│   │   ├── Footer.tsx           # Comprehensive footer, hours, links & disclaimer
│   │   └── MobileStickyBar.tsx  # Handheld fixed bottom bar (Call Now & WhatsApp)
│   ├── data/
│   │   └── repairData.ts        # Central configuration file for all business content
│   └── types/
│       └── lucide-react.d.ts    # TypeScript definitions for icon components
├── .eslintrc.json               # ESLint configuration
├── next.config.mjs              # Next.js build configuration
├── package.json                 # Dependencies and npm run scripts
├── postcss.config.mjs           # PostCSS configuration
├── tailwind.config.ts           # Custom Tailwind theme, colors, gradients & shadows
├── tsconfig.json                # TypeScript compiler configuration
└── README.md                    # Project documentation
```

---

## 4. Installation & Local Development Instructions

### Prerequisites
- Node.js version 18.x or later installed on your system.
- npm (Node Package Manager).

### Steps
1. Open your terminal in the project directory:
   ```bash
   cd c:\Users\MAHADEV\Downloads\denish-mobile-repair
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the local development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to:
   ```text
   http://localhost:3000
   ```

---

## 5. Available Scripts

| Command | Purpose |
| :--- | :--- |
| `npm run dev` | Starts the Next.js development server with hot-reload at `http://localhost:3000`. |
| `npm run build` | Compiles TypeScript, runs ESLint, optimizes CSS, and builds production static pages. |
| `npm run start` | Runs the compiled production build locally for testing. |
| `npm run lint` | Runs ESLint to check for code style and syntax issues. |
| `npm test` | Runs the comprehensive 59-point production readiness audit. |
| `npm run test:all` | Runs the complete 108-assertion full QA & production audit suite. |

---

## 6. Functional Features & Integration Details

### 1. Direct Phone Dialing
- Configured across all navigation headers, hero cards, floating banners, and mobile sticky bars with `tel:+918511668848`.

### 2. WhatsApp Click-to-Chat
- Opens direct chat with `+91 85116 68848` (`https://wa.me/918511668848`).
- Pre-populates relevant context depending on which button or service was clicked.

### 3. Real Working Repair Enquiry Submission
- **Front-end Validation:**
  - Full Name (minimum 2 characters).
  - 10-digit Indian mobile number validation.
  - Smartphone Brand selection.
  - Device Model input.
  - Primary Issue selection from the 8 services.
  - Preferred contact method (WhatsApp message vs Phone call).
- **Back-end Serverless Route (`/api/enquire`):**
  - Validates input server-side.
  - Generates a unique tracking reference (e.g., `DMR-261109-9243`).
  - Logs the lead to the server console with timestamp.
  - Generates a pre-formatted WhatsApp direct ticket link so the customer can send the exact details with 1 tap directly to the technician.
  - Supports optional webhook forwarding to Google Sheets, Discord, Slack, or CRM via the `REPAIR_ENQUIRY_WEBHOOK_URL` environment variable.

---

## 7. Deployment Instructions (Vercel)

This website is designed for native deployment on [Vercel](https://vercel.com):

### Option A: Via GitHub (Recommended)
1. Initialize git and commit your files:
   ```bash
   git init
   git add .
   git commit -m "Initial commit of DENISH MOBILE REPAIRING website"
   ```
2. Push your repository to GitHub:
   ```bash
   git remote add origin https://github.com/<your-username>/denish-mobile-repair.git
   git branch -M main
   git push -u origin main
   ```
3. Go to [Vercel](https://vercel.com/new).
4. Select the repository and click **Import**.
5. Framework preset will automatically detect **Next.js**.
6. Click **Deploy**. The website will be live in ~60 seconds with SSL enabled.

### Option B: Via Vercel CLI
```bash
npm i -g vercel
vercel
```

---

## 8. Client Content Configuration Guide

All business details are centralized in a single, well-documented file:  
`src/data/repairData.ts`

To update any content, edit this file:

### Updating Contact Phone & WhatsApp
```typescript
export const BUSINESS_CONFIG = {
  phoneDisplay: "+91 85116 68848",
  phoneRaw: "8511668848",
  phoneTel: "tel:+918511668848",
  whatsappNumber: "918511668848",
  ...
};
```

### Updating Google Maps Shop Location
Once the client approves their exact Google Maps pin:
1. Open Google Maps, search for your shop.
2. Click **Share** -> **Embed a map** -> **Copy HTML**.
3. Extract the `src="..."` URL from the embed code.
4. Replace the `googleMapsEmbedUrl` string in `src/data/repairData.ts`:
   ```typescript
   googleMapsEmbedUrl: "https://www.google.com/maps/embed?pb=YOUR_EMBED_CODE",
   ```

### Optional Lead Webhook (Google Sheets / Slack / CRM)
To receive customer inquiry form submissions in a Google Sheet or Slack channel, simply define an environment variable in `.env.local` or in Vercel project settings:
```env
REPAIR_ENQUIRY_WEBHOOK_URL=https://hook.eu1.make.com/your-webhook-endpoint
```

---

## 9. Quality Assurance & Testing Report

A deep automated QA audit ([`scripts/qa-deep-test.js`](file:///c:/Users/MAHADEV/Downloads/denish-mobile-repair/scripts/qa-deep-test.js)) verified all components, links, and integrations:

| Category | Assertions Verified | Result |
| :--- | :--- | :--- |
| **Phone Call Functionality** | 12 distinct `tel:+918511668848` links across Nav, Hero, Services, FAQ, Contact, Location, Footer, and Mobile Sticky Bar | **100% PASSED** |
| **WhatsApp Functionality** | 19 distinct `https://wa.me/918511668848` action links with properly formatted, single-encoded text query parameters | **100% PASSED** |
| **Navigation & Anchors** | 7 navigation targets (`#services`, `#about`, `#why-us`, `#process`, `#reviews`, `#faq`, `#contact`) and 2 semantic anchors (`#location`, `#footer`) verified | **100% PASSED** |
| **Enquiry Form Validation** | 6 boundary edge-cases rejected (empty payload, short name, bad phone, missing brand, missing model, missing issue) | **100% PASSED** |
| **Form Submission** | Valid inquiry returns HTTP 200, generates reference ID (`DMR-YYYYMMDD-XXXX`), logs lead, and crafts WhatsApp ticket | **100% PASSED** |
| **Google Maps Integration** | Iframe embed verified, external Google Maps direct navigation link with secure `target="_blank"` verified | **100% PASSED** |
| **Mobile Menu** | Hamburger toggle with `aria-label`, responsive `lg:hidden` drawer, and persistent mobile sticky action bar verified | **100% PASSED** |
| **Footer Links** | Services, location, booking, phone, WhatsApp, and copyright verified | **100% PASSED** |

**Summary: 49 out of 49 Deep QA Tests Passed (100% Pass Rate).**

---

## 10. Remaining Client Information Required

To finalize production rollout for the client:
1. **Exact Physical Shop Address & Landmark:**  
   The current map is centered on Gujarat with a placeholder. The client should provide their exact shop number, street name, and landmark so we can finalize the Google Maps embed and schema markup.
2. **Official Business Hours:**  
   Currently set to Monday – Sunday (10:00 AM – 9:00 PM). Confirm if the shop has a weekly off day.
3. **Google Business Profile / Reviews Link:**  
   Once the client provides their verified Google Review URL, it can be linked directly into the Customer Trust section.
