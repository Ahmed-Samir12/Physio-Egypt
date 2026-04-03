# Physio Egypt (Clinic System)

A Node.js + Express + MongoDB clinic management system for handling:
- Employees/administrators
- Patients
- Bookings (appointments)
- Auth with JWT refresh tokens
- Profile settings (including avatar upload)
- Printable patient cards (HTML and optional PDF)

This project uses Pug for server-rendered pages and esbuild to bundle frontend JavaScript/CSS.

## Tech Stack
- Node.js (ESM) · Express 5
- MongoDB · Mongoose
- JSON Web Tokens (JWT) with refresh-token rotation
- Pug templates (RTL UI)
- Frontend: Vanilla ES2022
- Bundling: esbuild

## Key Features
### Auth & Account
- Signup, login, refresh, logout (cookie-based refresh token)
- Email verification flow with dedicated success/error pages
- Password reset flow with a standalone, JS-driven state UI
- “Forgot password” and “Reset password” endpoints

### Patients & Bookings
- Patient list + patient detail pages
- Booking create/detail pages
- Human-readable sequential patient identifier `PT-00001`, `PT-00002`, ...
- Searching patients by name/phone/nationality and `patientId`
- Booking views display `patientId`
- Patient card printing (HTML and optional PDF)

### Profile
- Avatar upload using multipart upload:
  - multer (memory storage)
  - sharp resize + webp conversion
- Avatar is shown in:
  - profile page
  - sidebar
  - topbar dropdown

### Frontend Assets
- esbuild bundles all page entrypoints from `src/public/js/pages/`
- Lucide icons + Chart.js are loaded from local vendor UMD files (no external script CDNs)

## Project Scripts
- `npm run start`
  - runs server in development mode with nodemon
- `npm run start:prod`
  - runs server in production mode
- `npm run build`
  - bundles frontend assets (production mode)
- `npm run build:dev`
  - bundles frontend assets with dev-friendly settings

## Environment Variables
Create an `.env` file in the project root with at least the required variables:

### Required (validated at startup)
- `NODE_ENV`
- `DATABASE_URL`
- `DATABASE_PASSWORD`
- `PORT`
- `JWT_ACCESS_TOKEN_SECRET`
- `JWT_ACCESS_TOKEN_EXPIRES_IN`

### Important (used at runtime)
- `FRONTEND_URL` (used for CORS + constructing verification/reset URLs)
- Email SMTP variables (see `src/utils/emails.js`):
  - `EMAIL_FROM` (optional; defaults to a placeholder)
  - `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_SECURE`, `EMAIL_USERNAME`, `EMAIL_PASSWORD` (production SMTP)
  - `EMAIL_DEV_HOST`, `EMAIL_DEV_PORT`, `EMAIL_DEV_USERNAME`, `EMAIL_DEV_PASSWORD` (development SMTP, typically Mailtrap)
- Optional clinic branding for printed cards (`src/utils/patientCard.js`):
  - `CLINIC_NAME`
  - `CLINIC_PHONE`
  - `CLINIC_ADDRESS`

## Setup (Local Development)
1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy local vendor bundles (lucide + chart.js):
   ```bash
   node scripts/copy-vendor-umd.mjs
   ```
3. Build frontend assets:
   ```bash
   node build.mjs
   ```
4. Start the server:
   ```bash
   npm run start
   ```

## Build Output
Frontend bundles are written to:
- `src/public/dist/`

In production mode, the main layout references bundled CSS under `/dist/...`.

## Email Verification
Backend behavior:
- `GET/POST /api/v1/auth/verify-email/:token`
  - redirects to:
    - `/verify-email/success` on success
    - `/verify-email/error?reason=expired` on failure

Frontend pages:
- `src/views/pages/verify-email-success.pug`
- `src/views/pages/verify-email-error.pug`

The error page includes an inline “request new link” flow via:
- `POST /api/v1/auth/resend-verification`

## Password Reset
Backend endpoint:
- `PATCH /api/v1/auth/resetPassword/:resetToken`

Frontend:
- `src/views/pages/reset-password.pug`
- ES module entrypoint:
  - `src/public/js/pages/reset-password.js`

This UI has 3 states (form/success/error) managed client-side.

## Patient IDs (`PT-*`)
Model:
- `src/modules/patient/patientModel.js`

Generation:
- Automatically assigns the next sequential ID on first save when `patientId` is missing.

Migration for existing patients (optional):
- `scripts/migratePatientIds.mjs`
  ```bash
  node scripts/migratePatientIds.mjs
  ```

## Avatar Uploads
Upload implementation:
- `src/utils/upload.js`
- `src/modules/auth/authController.js` (`updateMe`)

Files are written to:
- `src/public/uploads/avatars/`

The server already serves `/src/public` statically, so URLs returned by the API (like `/uploads/avatars/...`) work directly.

## Local Lucide + Chart.js (No External CDN Scripts)
To avoid runtime external script/CDN loading:
- Lucide UMD + Chart.js UMD are copied locally into:
  - `src/public/js/vendor/`
- Updated Pug templates load:
  - `/js/vendor/lucide.min.js`
  - `/js/vendor/chart.umd.min.js`

## Manual Verification Checklist
1. Email verification link:
   - Should land on the green success page.
2. Expired verification link:
   - Should land on the error page and allow resending.
3. Password reset link:
   - Should show the reset form and switch to success after submitting.
4. Expired reset token:
   - Should show the error state and the “request new link” action.
5. Avatar upload:
   - Upload an image <= 5MB.
   - Verify the saved file and that avatars update in the UI.
6. Patient IDs:
   - Create patients and confirm `PT-00001`, `PT-00002`, ...
   - Verify search supports `patientId`.

## Security Notes
- Refresh tokens are stored in `httpOnly` cookies.
- API requests include credentials and authorization as needed.
- CSP is configured in `src/app.js` and restricts scripts to local assets.
