# Project Issue Fixes TODO

## Current Progress
- [x] Analyzed files and identified issues (DB migration, console.logs, typos, hardcoded URLs, auth logic)

## Pending Steps

### 1. Database Verification & Fixes
- [x] Run `node test-db.js` → Old ID null, DB healthy (ravi/sergio authors present).
- [ ] Update fix-db.js and test-db.js to use process.env.DB_URL instead of hardcoded.
- [ ] Re-run fix if needed.

### 2. Backend Cleanups (complete)

Note: Update imports from '../MiddeWares/' → '../Middlewares/' in API files.
- [x] server.js: Remove console.logs, fix duplicate error middleware.
- [x] APIs/authorAPI.js: Remove console.logs, fix req.user.userId consistency (already clean).
- [x] APIs/userAPI.js: Fix "Articlenotfound" → "Article not found".
- [x] MiddeWares/verifyToken.js: Fix "Forbiddden ypu dont have permission" → "Forbidden, you don't have permission".
- [x] Rename MiddeWares → Middlewares (ren executed).

### 3. Frontend Cleanups
- [ ] Frontend/stores/useAuth.js: Fix readArticles logic (don't set currentUser), use env baseURL.
- [ ] Frontend/src/components/AuthorArticles.jsx: Remove console.log, use env URL.

### 4. General
- [ ] Remove all remaining console.logs project-wide.
- [ ] Add .env.example with DB_URL, PORT.
- [ ] Test: Run backend/frontend, check author articles load.

### 5. Verification
- [ ] Test endpoints with res.http.
- [ ] Ensure no errors in console.
