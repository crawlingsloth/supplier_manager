# Shop Order Management System

A simple, efficient web application for managing vendor orders in a small shop. Track items, organize by vendor, and easily export order lists.

## Features

### Orders Tab
- **Quick Entry Panel**: Add items with ease using autocomplete and quick-add buttons
- **Frequent Items**: Automatically tracks and displays your most-ordered items
- **Vendor Organization**: Orders grouped by vendor with item counts
- **Export Options**: Copy to clipboard or export as CSV for each vendor
- **Session Management**: Save and load order sessions
- **Auto-Suggestion**: Items auto-populate supplier based on saved mappings

### Item Mapping Tab
- **Supplier Management**: Add and manage your suppliers list
- **CSV Import**: Upload a CSV file with your item catalog
- **Quick Mapping**: Swipe-style interface to map items to suppliers one by one
- **Mobile-First**: Optimized for fast mobile use with large touch targets
- **Progress Tracking**: Visual progress bar showing mapping completion
- **Export Mappings**: Download your item-supplier mappings as CSV
- **Skip Option**: Skip items you don't need to map

### General
- **Offline Support**: Works offline after initial load using localStorage
- **Mobile Responsive**: Fully optimized for both desktop and mobile devices
- **No Backend Required**: All data stored locally in your browser

## Live Demo

Visit: [https://supplier-manager.crawlingsloth.cloud](https://supplier-manager.crawlingsloth.cloud)

## Usage

### Getting Started with Item Mapping (Recommended First Step)

1. **Go to Item Mapping Tab**: Click "Item Mapping" in the top navigation
2. **Add Suppliers**: Enter your supplier names (e.g., "Supplier A", "Wholesale Co")
3. **Upload Items CSV**: Upload a CSV file with your items (one item per row)
4. **Map Items**: For each item, tap/click the supplier button to assign it
5. **Download**: Save your mappings as CSV when done

### Creating Orders

1. **Add Items**: Enter item name (auto-suggests supplier if mapped), set quantity, and click "Add Item"
2. **Quick Add**: Click frequent item buttons for one-click adding
3. **Manage Orders**: View all items organized by vendor
4. **Export**: Copy lists or text them to suppliers, or export as CSV
5. **Save Sessions**: Save your current orders for later reference

### CSV Format for Item Upload

Your CSV should have items in the first column:
```
Item Name
Rice Bags
Sugar
Cooking Oil
```

Or with a header:
```
Item,Description
Rice Bags,25kg bags
Sugar,White refined
```

## Keyboard Shortcuts

- `Enter`: Add item to list
- `Escape`: Clear form / Close modals
- `Ctrl+S`: Save current session
- `Tab`: Navigate between fields

## Technical Details

- **Pure HTML/CSS/JavaScript**: No frameworks or dependencies
- **LocalStorage**: All data stored in browser
- **GitHub Pages**: Hosted as a static site
- **Responsive Design**: Mobile-first approach

## Deployment

This project is set up for automatic deployment to GitHub Pages:

1. Push changes to the `main` branch
2. GitHub Actions automatically deploys the `public` folder
3. Site is available at your custom domain

### Manual Deployment

```bash
# Initialize git (if not already done)
git init
git add .
git commit -m "Initial commit"
git branch -M main

# Add remote and push
git remote add origin git@github.com:crawlingsloth/supplier_manager.git
git push -u origin main
```

### GitHub Pages Setup

1. Go to repository Settings → Pages
2. Source: GitHub Actions
3. Custom domain: `supplier-manager.crawlingsloth.cloud`
4. The CNAME file in the public directory handles the custom domain

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

MIT License - feel free to use and modify for your needs.
