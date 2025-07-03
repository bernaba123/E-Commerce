# User Edit/Cancel Feature Implementation

## Overview
This document describes the implementation of a feature that allows non-admin users to edit and cancel both "requested products" and "placed orders" within the first 10 minutes after creation. This functionality is accessible through the user dashboard.

## Feature Requirements
- **Scope**: Requested Products and Placed Orders
- **User Type**: Non-admin users only
- **Time Limit**: 10 minutes after creation
- **Actions**: Edit and Cancel
- **Access Location**: User Dashboard

## Implementation Details

### Backend Changes

#### 1. Order Controller Updates (`backend/controllers/orderController.js`)

**New Functions Added:**
- `canEditOrCancel(createdAt)` - Helper function to validate 10-minute window
- `editUserOrder()` - Allows editing of order shipping/billing addresses and notes
- `cancelUserOrder()` - Allows cancellation with reason and stock restoration

**Key Features:**
- Time validation (10-minute window)
- Status validation (only pending orders can be edited/cancelled)
- User ownership validation
- Automatic stock restoration on cancellation
- Tracking updates for audit trail
- Real-time socket notifications

#### 2. Request Controller Updates (`backend/controllers/requestController.js`)

**New Functions Added:**
- `canEditOrCancel(createdAt)` - Helper function to validate 10-minute window
- `editUserRequest()` - Allows editing of product details, pricing, shipping address
- `cancelUserRequest()` - Allows cancellation with reason

**Key Features:**
- Time validation (10-minute window)
- Status validation (only pending requests can be edited/cancelled)
- User ownership validation
- Automatic price recalculation based on urgency changes
- Tracking updates for audit trail

#### 3. Route Updates

**Orders Routes (`backend/routes/orders.js`):**
```javascript
router.put('/:id/edit', editUserOrder);
router.put('/:id/cancel', cancelUserOrder);
```

**Requests Routes (`backend/routes/requests.js`):**
```javascript
router.put('/:id/edit', editUserRequest);
router.put('/:id/cancel', cancelUserRequest);
```

### Frontend Changes

#### 1. API Service Updates (`frontend/src/services/api.js`)

**New Methods Added:**
- `editUserOrder(id, orderData)` - Edit order endpoint
- `cancelUserOrder(id, reason)` - Cancel order endpoint
- `editUserRequest(id, requestData)` - Edit request endpoint
- `cancelUserRequest(id, reason)` - Cancel request endpoint

#### 2. New Modal Components

**OrderEditModal (`frontend/src/components/common/OrderEditModal.jsx`):**
- Real-time countdown timer showing remaining edit time
- Form validation and error handling
- Shipping and billing address editing
- Order notes editing
- Time expiration warning

**RequestEditModal (`frontend/src/components/common/RequestEditModal.jsx`):**
- Real-time countdown timer showing remaining edit time
- Complete product information editing
- Category and urgency selection with automatic price recalculation
- Shipping address editing
- Additional notes editing
- Time expiration warning

#### 3. UserDashboard Updates (`frontend/src/pages/dashboard/UserDashboard.jsx`)

**New Features:**
- `canEditOrCancel()` helper function
- Edit and Cancel buttons for eligible items
- Modal integration and state management
- API integration with proper error handling
- Automatic data refresh after successful operations

**UI Elements:**
- Edit button (warning color) - appears only within 10-minute window
- Cancel button (error color) - appears only within 10-minute window
- Buttons only show for pending status items
- Responsive button layout with flex-wrap

## Technical Implementation

### Time Validation Logic
```javascript
const canEditOrCancel = (createdAt) => {
  const now = new Date();
  const createdTime = new Date(createdAt);
  const timeDiff = now - createdTime;
  const tenMinutesInMs = 10 * 60 * 1000; // 10 minutes in milliseconds
  return timeDiff <= tenMinutesInMs;
};
```

### Status Validation
- **Orders**: Only `pending` status orders can be edited/cancelled
- **Requests**: Only `pending` status requests can be edited/cancelled

### Security Measures
- User ownership validation on backend
- JWT authentication required
- Input validation and sanitization
- Status checks before allowing operations

## User Experience Features

### Real-time Countdown Timer
Both edit modals display a live countdown showing remaining time:
```javascript
const formatTimeRemaining = (ms) => {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};
```

### Time Expiration Handling
When the 10-minute window expires:
- Edit buttons disappear from dashboard
- Edit modals show expiration message
- Forms are disabled
- Users are guided to contact support

### User Feedback
- Success messages for completed operations
- Error handling with descriptive messages
- Confirmation dialogs for destructive actions
- Loading states during API calls

## Error Handling

### Backend Error Responses
- `400 Bad Request` - Time window expired or invalid status
- `404 Not Found` - Order/request not found or not owned by user
- `500 Internal Server Error` - Server-side errors

### Frontend Error Handling
- Try-catch blocks around all API calls
- User-friendly error messages
- Graceful fallbacks for failed operations
- Console logging for debugging

## Data Flow

### Edit Operation Flow
1. User clicks Edit button (only visible within 10 minutes)
2. Modal opens with pre-populated data and countdown timer
3. User modifies fields and submits
4. Frontend validates and sends request to backend
5. Backend validates time window, ownership, and status
6. Backend updates data and returns response
7. Frontend updates UI and refetches data

### Cancel Operation Flow
1. User clicks Cancel button (only visible within 10 minutes)
2. Confirmation dialog appears
3. Optional reason prompt
4. Frontend sends cancel request to backend
5. Backend validates and updates status
6. Stock restoration (for orders) if applicable
7. Frontend updates UI and refetches data

## Files Modified/Created

### Backend Files
- `backend/controllers/orderController.js` - Added edit/cancel functions
- `backend/controllers/requestController.js` - Added edit/cancel functions  
- `backend/routes/orders.js` - Added new routes
- `backend/routes/requests.js` - Added new routes

### Frontend Files
- `frontend/src/services/api.js` - Added new API methods
- `frontend/src/components/common/OrderEditModal.jsx` - New component
- `frontend/src/components/common/RequestEditModal.jsx` - New component
- `frontend/src/pages/dashboard/UserDashboard.jsx` - Updated with new functionality

## Testing Considerations

### Manual Testing Scenarios
1. **Within 10-minute window:**
   - Edit buttons should appear for pending items
   - Edit operations should succeed
   - Cancel operations should succeed
   - Timer should count down accurately

2. **After 10-minute window:**
   - Edit buttons should not appear
   - Direct API calls should fail with appropriate error
   - Edit modals should show expiration message

3. **Status restrictions:**
   - Only pending orders/requests should be editable
   - Processed, shipped, or completed items should not show edit buttons

4. **User ownership:**
   - Users should only see edit options for their own items
   - API should reject attempts to edit others' items

### Edge Cases
- Network interruptions during edit operations
- Multiple browser tabs editing same item
- Status changes while edit modal is open
- Timer accuracy across different timezones

## Future Enhancements

### Potential Improvements
1. **Grace Period Notifications:**
   - Email/SMS reminders before edit window expires
   - Browser notifications for time warnings

2. **Extended Edit Capabilities:**
   - Allow editing of order items (with inventory checks)
   - Partial cancellations for multi-item orders

3. **Audit Trail:**
   - Enhanced logging of all edit/cancel operations
   - Admin dashboard for monitoring user changes

4. **Batch Operations:**
   - Allow cancelling multiple items at once
   - Bulk edit operations for similar items

## Conclusion

This implementation successfully provides non-admin users with the ability to edit and cancel their orders and requests within a 10-minute window, enhancing user experience while maintaining system integrity and security. The real-time countdown timer and intuitive UI ensure users are aware of the time constraints, while comprehensive error handling provides a smooth user experience.