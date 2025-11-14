# Quick Test Guide: Item Name Autocomplete

## Setup

1. Ensure the frontend is running:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

2. Navigate to the application in your browser

## Test Cases

### Test 1: Basic Autocomplete
**Objective:** Verify suggestions appear when typing

**Steps:**
1. Click "Report Lost Item" or "Report Found Item"
2. Click "Lost General Item" or equivalent
3. Focus on the "Item Name" field
4. Type: `"a"`
5. **Expected:** See "Airpods" in the dropdown

**Pass Criteria:** 
- ✅ Suggestion appears
- ✅ Dropdown is visible
- ✅ Can see "Airpods" option

---

### Test 2: Partial Matching
**Objective:** Verify case-insensitive partial matching

**Steps:**
1. In Item Name field, clear and type: `"back"`
2. **Expected:** See "Backpack" suggestion
3. Type: `"BAG"` (uppercase)
4. **Expected:** See "Backpack", "Handbag", "Laptop Bag", "Sling bag" (case-insensitive)

**Pass Criteria:**
- ✅ Suggestions work in any case
- ✅ Partial matches work
- ✅ Multiple items match

---

### Test 3: Selection by Click
**Objective:** Verify user can click to select a suggestion

**Steps:**
1. Clear Item Name field
2. Type: `"smart"`
3. See dropdown showing suggestions
4. **Expected:** See "Smart Watch" and "Smartphone"
5. Click on "Smartphone"
6. **Expected:** Field fills with "Smartphone"

**Pass Criteria:**
- ✅ Dropdown shows matching items
- ✅ Click works
- ✅ Field populated with selection
- ✅ No errors in console

---

### Test 4: Custom Entry
**Objective:** Verify users can enter items not in the list

**Steps:**
1. Clear Item Name field
2. Type: `"Custom Item"`
3. **Expected:** No suggestions show
4. Continue to next field (no selection needed)
5. **Expected:** Form accepts "Custom Item"

**Pass Criteria:**
- ✅ No suggestions for unknown item
- ✅ Field still allows text entry
- ✅ Form validates and accepts

---

### Test 5: All 23 Items Available
**Objective:** Verify all items from YOLO mapping are available

**Steps:**
1. Click in Item Name field without typing
2. **Expected:** See all 23 options in dropdown (or type to see available)

**Items to verify present:**
```
✓ Airpods
✓ Backpack
✓ Calculator
✓ Cap
✓ Eyeglasses
✓ Flash-drive
✓ Handbag
✓ Headphone
✓ Helmet
✓ Key
✓ Laptop
✓ Laptop Bag
✓ Phone Charger
✓ Powerbank
✓ Sling bag
✓ Smart Watch
✓ Wallet
✓ Smartphone
✓ Tablet
✓ Totebag
✓ Tumbler
✓ Umbrella
✓ Watch
```

**Pass Criteria:**
- ✅ Can verify all 23 items by filtering
- ✅ No items missing
- ✅ No extra items

---

### Test 6: Filter Specific Items
**Objective:** Test filtering for various item searches

| Search Term | Expected Result | Check |
|------------|-----------------|-------|
| "air" | Airpods | ✓ |
| "back" | Backpack | ✓ |
| "phone" | Phone Charger, Smartphone | ✓ |
| "watch" | Smart Watch, Watch | ✓ |
| "bag" | Backpack, Handbag, Laptop Bag, Sling bag | ✓ |
| "power" | Powerbank | ✓ |
| "key" | Key | ✓ |
| "helmet" | Helmet | ✓ |
| "flash" | Flash-drive | ✓ |
| "tablet" | Tablet | ✓ |

**Pass Criteria:**
- ✅ All searches return correct items
- ✅ Case-insensitive
- ✅ Partial matching works

---

### Test 7: Form Submission
**Objective:** Verify form still submits correctly

**Steps:**
1. Fill form with any item (from suggestions or custom)
2. Fill other required fields
3. Click "Submit Report"
4. **Expected:** Form submits successfully
5. **Expected:** No errors in backend

**Pass Criteria:**
- ✅ Form validates
- ✅ Submission succeeds
- ✅ Backend receives item name correctly
- ✅ Item is stored in database
- ✅ No console errors

---

### Test 8: Mobile Responsiveness
**Objective:** Verify autocomplete works on mobile devices

**Steps:**
1. Open on mobile browser (or use DevTools mobile view)
2. Navigate to Report Page
3. Tap Item Name field
4. Type character: `"s"`
5. **Expected:** Dropdown appears (may be styled for mobile)
6. Tap a suggestion: `"Smart Watch"`
7. **Expected:** Field fills with selection

**Pass Criteria:**
- ✅ Mobile dropdown appears
- ✅ Suggestions are selectable on mobile
- ✅ Touch interactions work
- ✅ Layout is responsive

---

### Test 9: Keyboard Navigation
**Objective:** Test keyboard-only interaction

**Steps:**
1. Focus on Item Name field
2. Press `↓` (down arrow) or type `"a"`
3. **Expected:** Dropdown shows
4. Press `↓` to highlight next item
5. Press `↑` to highlight previous
6. Press `Enter` to select
7. **Expected:** Field populates with selection

**Pass Criteria:**
- ✅ Keyboard navigation works
- ✅ Enter key selects highlighted item
- ✅ Arrow keys navigate list
- ✅ Accessible for keyboard-only users

---

### Test 10: Empty & Clear
**Objective:** Test clearing and re-filtering

**Steps:**
1. Type: `"phone"`
2. See suggestions: "Phone Charger", "Smartphone"
3. Clear field (Ctrl+A, Delete)
4. **Expected:** Suggestions disappear
5. Type: `"p"`
6. **Expected:** More suggestions show (Phone Charger, Powerbank)

**Pass Criteria:**
- ✅ Suggestions disappear when cleared
- ✅ Re-filtering works after clear
- ✅ No stuck suggestions

---

### Test 11: Browser Compatibility
**Test in each browser:**

| Browser | Version | Tested | Status |
|---------|---------|--------|--------|
| Chrome | Latest | [ ] | ✓/✗ |
| Firefox | Latest | [ ] | ✓/✗ |
| Safari | Latest | [ ] | ✓/✗ |
| Edge | Latest | [ ] | ✓/✗ |
| Mobile Safari | Latest | [ ] | ✓/✗ |
| Chrome Mobile | Latest | [ ] | ✓/✗ |

**Steps for each:**
1. Navigate to Report Page
2. Test autocomplete with "phone"
3. Verify suggestions appear
4. Verify selection works

**Pass Criteria:**
- ✅ Works in all browsers
- ✅ Dropdown appears
- ✅ Selection works

---

### Test 12: Integration with YOLO
**Objective:** Verify suggestions match YOLO detection output

**Steps:**
1. Upload an image in the Report Form
2. YOLO detection runs
3. Detected objects shown (e.g., "Airpods 95%")
4. Copy detected item name (e.g., "Airpods")
5. Paste into Item Name field
6. **Expected:** Suggestion appears immediately

**Pass Criteria:**
- ✅ Item names match YOLO output
- ✅ No translation/naming discrepancies
- ✅ Users can use detected items easily

---

## Quick Checklist

Copy and use this checklist:

```
TEST CHECKLIST - Item Name Autocomplete
========================================

Basic Functionality:
☐ Suggestions appear when typing
☐ Partial matching works
☐ Case-insensitive search
☐ Click selection works
☐ Custom entries allowed

All Items Present:
☐ All 23 items available
☐ Can find each item by name

Form Integration:
☐ Form submits with selected item
☐ Form submits with custom item
☐ Item saved in database
☐ No console errors

User Experience:
☐ Mobile works
☐ Keyboard navigation works
☐ Dropdown styling looks good
☐ Clear/filter works

Browser Support:
☐ Chrome works
☐ Firefox works
☐ Safari works
☐ Edge works
☐ Mobile browsers work

Data Consistency:
☐ Matches YOLO output
☐ All 23 items from class mapping
☐ No extra/missing items

Final:
☐ No breaking changes
☐ All existing features still work
☐ Ready for production
```

---

## Common Issues & Solutions

### Issue: Suggestions don't appear
**Solution:**
- Check browser console for JS errors (F12)
- Verify `filterSuggestions` function is defined
- Clear browser cache
- Restart dev server

### Issue: Typing doesn't filter
**Solution:**
- Check that `@input="filterSuggestions"` is on input
- Verify `filteredSuggestions` ref is updated
- Check browser console for errors

### Issue: Can't select from dropdown
**Solution:**
- Try clicking directly on option
- Try keyboard navigation (arrow keys + Enter)
- Check datalist ID matches input's list attribute
- Verify no CSS hiding the dropdown

### Issue: Custom items rejected
**Solution:**
- Check form validation rules
- Verify no `pattern` attribute restricting input
- Check backend validation isn't too strict
- Custom items should be allowed

### Issue: Works in Chrome but not in other browsers
**Solution:**
- Verify HTML5 datalist support
- Check for browser-specific bugs
- Try clearing cache in that browser
- Check browser dev console for specific errors

---

## Test Results Documentation

When testing is complete, document:

```markdown
# Test Results

**Date:** [Date]
**Tester:** [Name]
**Environment:** [Dev/Staging/Production]

## Results Summary

| Test Case | Status | Notes |
|-----------|--------|-------|
| Test 1: Basic Autocomplete | ✓ PASS | |
| Test 2: Partial Matching | ✓ PASS | |
| Test 3: Selection by Click | ✓ PASS | |
| Test 4: Custom Entry | ✓ PASS | |
| Test 5: All 23 Items | ✓ PASS | |
| Test 6: Filter Specific | ✓ PASS | |
| Test 7: Form Submission | ✓ PASS | |
| Test 8: Mobile | ✓ PASS | |
| Test 9: Keyboard | ✓ PASS | |
| Test 10: Empty & Clear | ✓ PASS | |
| Test 11: Browsers | ✓ PASS | All major browsers ✓ |
| Test 12: YOLO Integration | ✓ PASS | |

## Overall Result
**✅ READY FOR PRODUCTION**

## Notes
- No issues found
- All features working
- No breaking changes
```

---

**Status:** ✅ Ready to Test

Use this guide to thoroughly verify the item name autocomplete feature!
