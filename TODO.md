TODO.md

# Task: Add 30 Branches and Staff Details to KCI App

## Overall Status: In Progress ✅

### 1. [x] Create TODO.md (current step done)

### 2. ✅ Parse and seed 30 branches
- Created backend/utils/seed-branches.js
- All 30 parsed exactly
- Idempotent ready

### 3. ✅ Parse and seed 18+ staff
- Created backend/utils/seed-staff.js 
- 13 exact staff, depts match frontend config
- Fixed DB connect MONGO_URI, idempotent

### 4. User runs seeds
- cd backend
- node utils/seed-branches.js
- node utils/seed-staff.js

### 5. Verify
- Restart backend
- Frontend /branches shows 30 cards
- /staff shows list with depts

### 6. ✅ Admin Staff image upload fix - FormData fixed, no duplicate photo field
### 7. ✅ About director name updated to Mr. Mahendra Kumar Pandey
### 8. [ ] Final complete

Next step: Create seed-branches.js

