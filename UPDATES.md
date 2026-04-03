# Physio Egypt CMS — Updates Log

## Fix 1: Silent token refresh only once per page load
- Updated `src/public/js/api.js`
  - Added an eager, module-load `silentRefresh()` (top-level `await`) so the access token is set before the first `apiFetch()`.
  - Removed the `if (!accessToken) { await silentRefresh() }` block from inside `apiFetch()`.
  - Kept the existing `401` retry behavior (refresh inside the `401` path only).
  - Exported `getAccessToken()` for other modules/pages that need the current token.

## Fix 2: Full profile photo upload (Multer + Sharp, multipart)
- Added `src/utils/upload.js`
  - `uploadMemory`: multer in-memory upload (`single('photo')`), 5MB limit, image-only filter.
  - `processAvatar(buffer, userId)`: sharp resize to `200x200` and output a `.webp` avatar under `/uploads/avatars/`.
- Updated `src/modules/auth/authController.js`
  - Reworked `updateMe` to manually run the multer middleware, then:
    - process and store avatar when `req.file` exists
    - (back-compat) still allow `req.body.photo` string updates
    - best-effort delete of the old avatar file
- Updated `src/public/js/pages/profile.js`
  - Replaced base64+JSON photo upload with `FormData` multipart upload via `fetch('/api/v1/auth/me', { method: 'PATCH', body: formData })`.
  - Uses optimistic preview via `URL.createObjectURL(file)`.
  - On success updates avatar UI for:
    - the profile avatar block (`[data-profile-avatar]`)
    - layout avatars (`[data-user-avatar]` and `[data-user-avatar2]`)

## Fix 3: Patient human-readable sequential ID (PT-*)
### Model + generation
- Updated `src/modules/patient/patientModel.js`
  - Added `patientId` field (`unique`, indexed).
  - Added `pre('save')` hook to generate next sequential id in the format `PT-00001` … (padded to 5 digits).
    - Determines next number by reading the highest existing `patientId` suffix.

### Search
- Updated `src/modules/patient/patient.services.js`
  - Added `patientId` to the `search` `$or` regex filter.

### Booking populates
- Updated `src/modules/booking/booking.services.js`
  - Added `patientId` to populated patient `select` fields for booking responses (create/get/update paths).

### UI display (list/detail/booking/print)
- Updated patient list cards:
  - `src/public/js/pages/patients.js` now renders `p.patientId` as an extra badge.
- Updated patient detail:
  - `src/views/pages/patients/detail.pug` includes `data-patient-id` badge (hidden initially).
  - `src/public/js/pages/patients-detail.js` sets and shows that badge.
- Updated booking detail:
  - `src/views/pages/bookings/detail.pug` includes `data-patient-id` badge.
  - `src/public/js/pages/bookings-detail.js` sets the badge content.
- Updated booking new + auto-fill:
  - `src/views/pages/bookings/new.pug` adds a disabled `data-patient-id` field.
  - `src/public/js/pages/bookings-new.js` fills/clears it when a patient is found/changed.
- Updated printed patient card HTML/PDF source:
  - `src/utils/patientCard.js` adds a “رقم المريض” row using `patient.patientId`.

### Migration for existing patients
- Added `scripts/migratePatientIds.mjs`
  - Finds patients missing `patientId` and calls `save()` so the model `pre('save')` hook assigns ids.

## Localize Lucide + Chart.js (no external CDN scripts)
- Added `scripts/copy-vendor-umd.mjs`
  - Copies:
    - `node_modules/lucide/dist/umd/lucide.min.js` → `src/public/js/vendor/lucide.min.js`
    - `node_modules/chart.js/dist/chart.umd.min.js` → `src/public/js/vendor/chart.umd.min.js`
- Updated Pug templates to load locally:
  - `src/views/layouts/main.pug` (lucide)
  - `src/views/pages/login.pug` (lucide)
  - `src/views/pages/reset-password.pug` (lucide)
  - `src/views/pages/errors/404.pug` (lucide)
  - `src/views/pages/errors/error.pug` (lucide)
  - `src/views/pages/errors/500.pug` (lucide)
  - `src/views/pages/admin/dashboard.pug` (chart.js)
- Updated CSP in `src/app.js`
  - Removed `unpkg.com` / `cdn.jsdelivr.net` from the `helmet` `scriptSrc` allowlist (since scripts are now local).

## Reset Password & Email Verification pages (standalone RTL)
- Updated backend redirect behavior:
  - `src/modules/auth/authController.js`
    - `verifyEmail` now redirects to:
      - `/verify-email/success` on success
      - `/verify-email/error?reason=expired|invalid` on failure
- Updated app routes:
  - `src/app.js`
    - Added `/verify-email/success` and `/verify-email/error`
- Added new standalone verify pages:
  - `src/views/pages/verify-email-success.pug`
  - `src/views/pages/verify-email-error.pug`
    - Includes a resend UI that calls `POST /api/v1/auth/resend-verification` inline
- Refactored/reset-password UI:
  - `src/views/pages/reset-password.pug`
    - Converted into a 3-state standalone RTL state machine (form / success / error)
    - Loads JS module: `/js/pages/reset-password.js`
  - Added `src/public/js/pages/reset-password.js`
    - Extracts reset token from the DOM / URL
    - Validates password match client-side
    - Sends `PATCH /api/v1/auth/resetPassword/:token` with `{ newPassword, passwordConfirm }`
    - Switches UI states based on success vs error.

## Build/validation executed
- Installed dependencies needed by the above features:
  - `multer`, `sharp`, `lucide`, `chart.js`
- Ran:
  - `node scripts/copy-vendor-umd.mjs`
  - `node build.mjs`
  - Compiled all Pug templates to ensure no template syntax errors.

