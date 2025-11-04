# Shop Order Management System - Build Instructions

## Project Overview
Build a single-page web application for a small shop to manage vendor orders. The app will track items that need to be ordered, group them by vendor, and allow easy export/copy of order lists to send via messaging apps.

## Hosting Requirements
- Static HTML/CSS/JavaScript only (for GitHub Pages)
- No backend/database required
- All data stored in browser localStorage
- Must work offline after initial load

## Core Features

### 1. Quick Entry Panel (Left Side - 400px wide on desktop)

#### Frequent Items Section (Top)
- Display 6-8 most frequently ordered items as quick-add buttons
- Format: "Item Name (Vendor)" as compact buttons in a 2-column grid
- Single click adds item with default quantity of 1
- Track frequency in localStorage and update button list dynamically
- Items should be sorted by usage count

#### Main Entry Form
- **Item Name**: Text input with autocomplete from previous entries
- **Vendor**: Dropdown select (stores and shows previously used vendors)
- **Quantity**: Number input with +/- buttons (increment by 1)
- **Add Item Button**: Green prominent button (also triggered by Enter key)
- Auto-focus on item name field after adding

### 2. Vendor Order Lists (Right Side)

#### Layout
- Grid of expandable cards, one per vendor
- Cards auto-expand when items are added
- Empty vendor cards stay collapsed

#### Each Vendor Card Shows
- Header: "Vendor Name" with item count badge (e.g., "Vendor A (3 items)")
- Items displayed as simple rows:
  ```
  Rice Bags         50    [x]
  Sugar            100    [x]
  ```
- Delete button [x] for each item (red on hover)

#### Card Actions (Bottom of each card)
- **Copy List**: Copies items as plain text:
  ```
  Rice Bags - 50
  Sugar - 100
  ```
- **Export CSV**: Downloads as `vendorname_YYYY-MM-DD.csv`
- **Clear All**: Removes all items for this vendor (with confirmation)

### 3. Top Bar
- Search input to filter items across all vendors
- "Save Session" button (saves current state)
- "New Session" button (clears everything with confirmation)
- "Load Previous" button (shows modal with saved sessions by date)

## Technical Implementation

### localStorage Structure
```javascript
{
  "currentSession": {
    "vendor_name": [
      {item: "Item Name", qty: 50, addedAt: timestamp}
    ]
  },
  "itemFrequency": {
    "Item Name": {
      count: 45, 
      lastVendor: "Vendor Name",
      lastUsed: timestamp
    }
  },
  "vendors": ["Vendor A", "Vendor B"],
  "savedSessions": [
    {
      date: "2024-01-15",
      data: {...},
      name: "Monday Orders"
    }
  ]
}
```

### Keyboard Shortcuts
- Enter: Add item to list
- Escape: Clear form
- Tab: Navigate between fields
- Ctrl+S: Save session

### Visual Design
- Clean, minimal design with white cards on #f5f5f5 background
- Primary color: #4CAF50 (green) for add actions
- Delete/clear actions: #f44336 (red)
- Font: System font stack (-apple-system, BlinkMacSystemFont, 'Segoe UI', etc.)
- Card shadows: `box-shadow: 0 2px 4px rgba(0,0,0,0.1)`
- Smooth transitions (0.3s) for all interactions
- Flash green animation when items are added

### Responsive Design
- Desktop: 2-column layout (400px entry panel, remainder for vendor cards)
- Mobile (<768px): Single column, entry form on top
- Touch-friendly buttons (min 44px touch targets)
- Number inputs should trigger numeric keyboard on mobile

## Features to Include

### Auto-Learning
- Track every item added with timestamp
- Update frequent items list based on last 30 days of usage
- Remember last used vendor for each item
- Auto-select vendor when typing a known item

### Data Validation
- Prevent empty item names
- Quantity must be > 0
- Trim whitespace from inputs
- Prevent duplicate items for same vendor (update quantity instead)

### User Feedback
- Green flash animation on item add
- Red flash on delete
- Toast notifications for actions (saved, cleared, exported)
- Confirmation dialogs for destructive actions

### Export Formats
1. **Copy to Clipboard**: Plain text, each item on new line
2. **CSV Export**: Standard CSV with headers (Item,Quantity)
3. **Optional**: WhatsApp formatted text with bold vendor names

## File Structure
```
index.html  - Single file containing everything
```

OR (if you prefer separated files):
```
index.html
style.css
app.js
```

## Additional Requirements
- No external dependencies (no jQuery, React, etc.)
- Must work in modern browsers (Chrome, Firefox, Safari, Edge)
- Graceful handling of localStorage limits
- Clear error messages if localStorage is disabled
- Add favicon and proper meta tags for mobile
- Include "Clear All Data" option in settings

## Sample UI Layout
```
+------------------+--------------------------------+
|  FREQUENT ITEMS  |    Vendor A (3)               |
|  [Rice] [Sugar]  |    Rice Bags      50    [x]   |
|  [Oil]  [Flour]  |    Sugar         100    [x]   |
|                  |    Cooking Oil    20    [x]   |
|  ITEM ENTRY      |    [Copy] [CSV] [Clear]       |
|  Item: [____]    |                               |
|  Vendor: [▼]     |    Vendor B (2)               |
|  Qty: [-][10][+] |    Flour          30    [x]   |
|  [ADD ITEM]      |    Salt           10    [x]   |
+------------------+    [Copy] [CSV] [Clear]       |
```

## Testing Checklist
- [ ] Add items with Enter key
- [ ] Quick-add buttons work
- [ ] Duplicate items update quantity
- [ ] Delete individual items
- [ ] Copy to clipboard works
- [ ] CSV export downloads correctly
- [ ] Sessions save and load
- [ ] Search filters items
- [ ] Mobile responsive layout
- [ ] Works offline
- [ ] localStorage persists on refresh

## Performance Goals
- Initial load < 50KB
- Instant response to all actions
- Smooth animations (60fps)
- Works on 3G connections

Build this as a production-ready application that a non-technical shop owner can use daily without training.
