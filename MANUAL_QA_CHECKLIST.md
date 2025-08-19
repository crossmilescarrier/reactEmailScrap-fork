# Manual QA Testing Checklist

## Domain Validation Testing

### ✅ Add Invalid Domain → Blocked

**Test Cases:**
1. **Common Email Providers**
   - [ ] Try adding `test@gmail.com` - should be blocked
   - [ ] Try adding `user@yahoo.com` - should be blocked  
   - [ ] Try adding `admin@outlook.com` - should be blocked
   - [ ] Try adding `manager@hotmail.com` - should be blocked

2. **Business Domains**
   - [ ] Try adding `user@company.org` - should be blocked
   - [ ] Try adding `admin@business.net` - should be blocked
   - [ ] Try adding `test@corporation.co` - should be blocked

3. **Subdomain Attempts**
   - [ ] Try adding `test@mail.crossmilescarrier.com` - should be blocked
   - [ ] Try adding `user@sub.crossmilescarrier.com` - should be blocked
   - [ ] Try adding `admin@crossmilescarrier.com.fake.com` - should be blocked

4. **Domain Variations**
   - [ ] Try adding `test@crossmilescarrier.net` - should be blocked
   - [ ] Try adding `user@crossmilescarrier.org` - should be blocked
   - [ ] Try adding `admin@crossmilescarriers.com` - should be blocked

5. **Malformed Emails**
   - [ ] Try adding `test@` - should be blocked
   - [ ] Try adding `@crossmilescarrier.com` - should be blocked
   - [ ] Try adding `testcrossmilescarrier.com` - should be blocked
   - [ ] Try adding `test@@crossmilescarrier.com` - should be blocked

**Expected Behavior:**
- [ ] Error message "Only crossmilescarrier.com emails allowed" appears immediately
- [ ] Input field shows red border/error styling
- [ ] Add Account button is disabled
- [ ] No API call is made to backend
- [ ] Toast error message appears if user tries to force submit

### ✅ Valid Domain Acceptance

**Test Cases:**
1. **Standard Format**
   - [ ] Add `test@crossmilescarrier.com` - should succeed
   - [ ] Add `user@crossmilescarrier.com` - should succeed
   - [ ] Add `admin@crossmilescarrier.com` - should succeed

2. **Case Variations**
   - [ ] Add `TEST@CROSSMILESCARRIER.COM` - should succeed
   - [ ] Add `User@CrossMilesCarrier.Com` - should succeed
   - [ ] Add `admin@CrossMilesCarrier.COM` - should succeed

3. **Complex Email Formats**
   - [ ] Add `user.name@crossmilescarrier.com` - should succeed
   - [ ] Add `user+tag@crossmilescarrier.com` - should succeed
   - [ ] Add `user_name@crossmilescarrier.com` - should succeed
   - [ ] Add `user123@crossmilescarrier.com` - should succeed
   - [ ] Add `User.Name+Tag123@crossmilescarrier.com` - should succeed

**Expected Behavior:**
- [ ] No error message appears
- [ ] Input field shows normal border styling
- [ ] Add Account button is enabled
- [ ] API call is made to backend
- [ ] Success toast message appears
- [ ] Account appears in the list
- [ ] Form resets after successful addition

---

## Search Functionality Testing

### ✅ Account Search

**Test Cases:**
1. **Partial Text Search**
   - [ ] Search for "john" - should find accounts containing "john"
   - [ ] Search for "test" - should find accounts containing "test"
   - [ ] Search for "admin" - should find admin accounts

2. **Case Insensitive Search**
   - [ ] Search for "JOHN" - should find "john@crossmilescarrier.com"
   - [ ] Search for "Test" - should find "test@crossmilescarrier.com"
   - [ ] Search for "ADMIN" - should find admin accounts

3. **Domain Search**
   - [ ] Search for "@crossmilescarrier.com" - should find all accounts
   - [ ] Search for "crossmilescarrier" - should find all accounts

4. **Special Characters**
   - [ ] Search for "user+tag" - should find accounts with + in name
   - [ ] Search for "user.name" - should find accounts with . in name
   - [ ] Search for "user_name" - should find accounts with _ in name

**Expected Behavior:**
- [ ] Search is debounced (300ms delay)
- [ ] Results update as you type (after debounce)
- [ ] Loading indicator appears during search
- [ ] Results count updates correctly
- [ ] Clear search shows all accounts again
- [ ] Empty results show "No accounts found" message

### ✅ Thread Search

**Test Cases:**
1. **Subject Search**
   - [ ] Search for "meeting" - should find emails with meeting in subject
   - [ ] Search for "project" - should find project-related emails
   - [ ] Search for "report" - should find report emails

2. **Sender Search**
   - [ ] Search for "john@example.com" - should find emails from John
   - [ ] Search for "manager" - should find emails from manager accounts
   - [ ] Search for partial sender like "admin" - should find admin senders

3. **Message ID Search**
   - [ ] Search for full message ID like `<123456@gmail.com>`
   - [ ] Search for partial message ID
   - [ ] Verify message ID search is exact match

4. **Content Search**
   - [ ] Search for text that appears in email body
   - [ ] Search for keywords from email content
   - [ ] Verify content search works across email threads

5. **Case Insensitive Thread Search**
   - [ ] Search for "MEETING" - should find "Important Meeting"
   - [ ] Search for "Project" - should find "project status"
   - [ ] Search for "REPORT" - should find "Weekly Report"

**Expected Behavior:**
- [ ] Search results appear after debounce delay
- [ ] Results count badge shows "X results found"
- [ ] Clear button (X) appears when searching
- [ ] "Clear search" link works in results badge
- [ ] Search is cleared when switching tabs
- [ ] Loading state appears during search
- [ ] Empty results show appropriate message

---

## Pagination & Tabs Testing

### ✅ Tab Functionality

**Test Cases:**
1. **Tab Switching**
   - [ ] Click "Primary Inbox" - should show inbox emails
   - [ ] Click "Sent" - should show sent emails
   - [ ] Click "All Emails" - should show combined inbox + sent
   - [ ] Click "Chats" - should show chat interface

2. **Active Tab Highlighting**
   - [ ] Active tab has blue background and white text
   - [ ] Inactive tabs have gray background
   - [ ] Tab badge shows correct count for active tab

3. **URL Updates**
   - [ ] INBOX tab → `/threads/inbox`
   - [ ] SENT tab → `/threads/sent`
   - [ ] ALL tab → `/threads/all`
   - [ ] Direct URL navigation works correctly

4. **Tab Content**
   - [ ] Each tab shows appropriate email threads
   - [ ] Thread counts are accurate per tab
   - [ ] API calls are made with correct parameters

**Expected Behavior:**
- [ ] Smooth tab transitions
- [ ] Search is cleared when switching tabs
- [ ] Pagination resets to page 1 on tab switch
- [ ] Loading states appear during tab switches
- [ ] Error handling for failed tab loads

### ✅ Pagination Functionality

**Test Cases:**
1. **Pagination Controls**
   - [ ] Previous/Next buttons appear when multiple pages exist
   - [ ] Page info shows "Page X of Y" correctly
   - [ ] No pagination shown for single page results

2. **Button States**
   - [ ] Previous button disabled on page 1
   - [ ] Next button disabled on last page
   - [ ] Both buttons disabled during loading
   - [ ] Buttons enabled on middle pages

3. **Navigation**
   - [ ] Next button loads next page correctly
   - [ ] Previous button loads previous page correctly
   - [ ] Page numbers update correctly
   - [ ] Thread content updates with pagination

4. **Search + Pagination**
   - [ ] Pagination works with search results
   - [ ] Search results count shows in pagination
   - [ ] Next/Previous work within search results
   - [ ] Clear search resets pagination

**Expected Behavior:**
- [ ] API calls made with correct page parameters
- [ ] Loading states during page transitions
- [ ] Error handling for failed page loads
- [ ] Smooth transitions between pages

---

## Account Management Regression Testing

### ✅ Add Account Functionality

**Test Cases:**
1. **Add Account Flow**
   - [ ] Click "Add New Email" button
   - [ ] Modal/popup opens correctly
   - [ ] Form validation works as expected
   - [ ] Domain validation (covered above)
   - [ ] Successful account creation

2. **Form Behavior**
   - [ ] Input field accepts typing
   - [ ] Real-time validation feedback
   - [ ] Button states change based on validation
   - [ ] Loading state during submission
   - [ ] Success/error messages

3. **Integration**
   - [ ] New account appears in list immediately
   - [ ] Account count updates correctly
   - [ ] Search can find newly added account
   - [ ] Modal closes after successful addition

### ✅ Edit Account Functionality

**Test Cases:**
1. **Edit Account Flow**
   - [ ] Click edit button on existing account
   - [ ] Edit modal opens with current email pre-filled
   - [ ] Email can be modified
   - [ ] Save changes successfully

2. **Edit Validation**
   - [ ] Domain validation applies to edited emails
   - [ ] Can't save invalid domain emails
   - [ ] Loading state during save
   - [ ] Success/error feedback

3. **Integration**
   - [ ] Updated account reflects in list
   - [ ] Search works with updated email
   - [ ] Account threads still accessible
   - [ ] No data loss during edit

### ✅ Delete Account Functionality

**Test Cases:**
1. **Delete Account Flow**
   - [ ] Click delete button
   - [ ] Confirmation dialog appears
   - [ ] Can cancel deletion
   - [ ] Can confirm deletion

2. **Delete Behavior**
   - [ ] Account removed from list immediately
   - [ ] Account count updates correctly
   - [ ] Cannot access deleted account threads
   - [ ] Success message appears

3. **Error Handling**
   - [ ] Handle deletion failures gracefully
   - [ ] Account remains if deletion fails
   - [ ] Appropriate error messages
   - [ ] No partial state corruption

---

## Performance & Edge Cases

### ✅ Performance Testing

**Test Cases:**
1. **Large Data Sets**
   - [ ] Test with 100+ accounts - search still responsive
   - [ ] Test with 1000+ threads - pagination smooth
   - [ ] Test rapid searching - debouncing works
   - [ ] Test rapid tab switching - no race conditions

2. **Network Conditions**
   - [ ] Slow network - appropriate loading states
   - [ ] Network errors - graceful error handling
   - [ ] Intermittent connectivity - retry mechanisms
   - [ ] API timeouts - appropriate error messages

### ✅ Edge Case Testing

**Test Cases:**
1. **Empty States**
   - [ ] No accounts - appropriate empty state
   - [ ] No threads - appropriate empty state
   - [ ] No search results - appropriate message
   - [ ] No chat messages - appropriate placeholder

2. **Special Characters**
   - [ ] Unicode characters in email addresses
   - [ ] Special characters in search queries
   - [ ] HTML entities in email content
   - [ ] Long email addresses/subjects

3. **Browser Compatibility**
   - [ ] Chrome - all functionality works
   - [ ] Firefox - all functionality works
   - [ ] Safari - all functionality works
   - [ ] Edge - all functionality works

---

## Accessibility Testing

### ✅ Keyboard Navigation

**Test Cases:**
- [ ] Tab through all interactive elements
- [ ] Enter/Space activate buttons
- [ ] Escape closes modals
- [ ] Arrow keys navigate pagination

### ✅ Screen Reader Testing

**Test Cases:**
- [ ] Form labels are read correctly
- [ ] Error messages are announced
- [ ] Button purposes are clear
- [ ] Table headers are associated

### ✅ Visual Testing

**Test Cases:**
- [ ] High contrast mode works
- [ ] Focus indicators visible
- [ ] Text scales properly
- [ ] Color-only information has alternatives

---

## Security Testing

### ✅ Input Validation

**Test Cases:**
- [ ] XSS attempts in search fields blocked
- [ ] SQL injection attempts handled safely
- [ ] Malformed email inputs rejected
- [ ] CSRF protection active

### ✅ Authentication

**Test Cases:**
- [ ] Cannot access accounts without login
- [ ] Session expiry handled gracefully
- [ ] Unauthorized API calls blocked
- [ ] Sensitive data not exposed in URLs

---

## Final Checklist

### ✅ Pre-Production Verification

- [ ] All domain validation tests pass
- [ ] All search functionality tests pass
- [ ] All pagination & tabs tests pass
- [ ] All account management regression tests pass
- [ ] Performance is acceptable under load
- [ ] No console errors in browser
- [ ] No network errors in dev tools
- [ ] All accessibility tests pass
- [ ] Security tests pass
- [ ] Cross-browser testing complete

### ✅ Sign-off

- [ ] QA Engineer approval
- [ ] Product Owner approval
- [ ] Technical Lead approval
- [ ] Ready for production deployment

---

**Testing Environment:** 
- [ ] Staging environment matches production
- [ ] Test data is representative
- [ ] API endpoints are correctly configured
- [ ] Authentication is properly set up
