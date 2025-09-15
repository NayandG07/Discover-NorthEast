# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

Discover NorthEast is a hackathon MVP tourism platform showcasing India's 8 Northeast states through an interactive web application. It features maps, galleries, user engagement, and an admin panel, built with vanilla JavaScript and Express.js for optimal performance and accessibility in remote regions.

## Development Commands

### Essential Commands
```bash
# Start development server (primary command)
npm run dev

# Alternative start command (production)
npm start

# Run data validation tests
npm test

# Seed database with initial data (if available)
npm run seed
```

### Server Management
```bash
# Production deployment with PM2
npm install -g pm2
pm2 start server/index.js --name discover-ne
pm2 save
pm2 startup

# Environment setup
cp .env.example .env
# Edit .env with secure ADMIN_PASS and PORT
```

### Testing and Debugging
```bash
# Test single functionality
node tests/data-test.js

# Check server logs
pm2 logs discover-ne

# Monitor server status
pm2 status
```

## Architecture and Code Structure

### High-Level Architecture
- **Frontend**: Vanilla JS with ES6 modules, no framework dependencies
- **Backend**: Express.js server with file-based JSON storage
- **Maps**: Leaflet.js with OpenStreetMap integration
- **File Structure**: Monolithic with clear separation of concerns

### Key Architectural Decisions
1. **No Framework**: Chose vanilla JS for instant loading and zero dependencies
2. **File-based Storage**: Uses JSON files in `server/data/` for rapid development
3. **Module System**: ES6 modules with clear separation (data.js, map.js, etc.)
4. **Responsive First**: CSS Grid/Flexbox with mobile-first approach

### Core Data Flow
```
User Request → Express Router → JSON Data Files → API Response → Frontend JS → DOM Rendering
```

### Frontend Module Architecture
- **`data.js`**: API interactions with caching (5-minute cache)
- **`map.js`**: Leaflet wrapper with custom markers and fallbacks
- **`home.js`**: Homepage logic with hero slider and feedback
- **`state.js`**: State page with image galleries and city navigation
- **`city.js`**: City page with POI maps and photo uploads
- **`admin.js`**: Admin panel for content management and moderation

### Backend API Structure
- **Public APIs**: `/api/states`, `/api/cities`, `/api/feedback`, `/api/upload`
- **Admin APIs**: `/api/admin/*` (password-protected)
- **File Uploads**: Multer with validation (5MB limit, images only)
- **Data Storage**: `server/data/` contains states.json, cities.json, feedback.json

### Data Relationships
- 8 NorthEast states (Assam, Arunachal Pradesh, Meghalaya, etc.)
- 16 cities (2 per state)
- Each state has: coordinates, description, history, festivals
- Each city has: POIs, gallery, local specialties, coordinates
- User uploads are stored per city with moderation flags

## Environment Configuration

### Required Environment Variables
```bash
PORT=3000                    # Server port
ADMIN_PASS=changeme         # Admin panel password (CHANGE THIS!)
MAPBOX_TOKEN=               # Optional: leave empty for OpenStreetMap
```

### Optional Production Variables
```bash
SUPABASE_URL=               # For cloud storage migration
AWS_S3_BUCKET=              # For image CDN
```

## Development Guidelines

### Frontend Development
- Use ES6 modules exclusively - no CommonJS in frontend
- Implement proper error handling with user-friendly fallbacks
- Cache API responses using the built-in cache in `data.js`
- Always escape user input using `escapeHtml()` function
- Test map functionality with and without internet connectivity

### Backend Development  
- All user inputs must be validated and sanitized
- File uploads go through Multer with strict validation
- Admin endpoints require password authentication middleware
- JSON files are the source of truth - backup regularly
- API responses should be cached (5-minute default)

### Data Management
- States and cities have strict validation in `tests/data-test.js`
- Each state must have exactly 2 cities
- All coordinates must be within India bounds
- State and city slugs must be unique
- User uploads require admin approval before display

### Security Considerations
- Admin password is environment-based, never hardcoded
- All file uploads are validated for type and size
- XSS protection through HTML escaping
- Image moderation system prevents inappropriate content
- No sensitive data in client-side code

### Testing Strategy
- Run `npm test` before any data changes
- Test validates: 8 states, 16 cities, coordinate validity
- Manual testing checklist in README.md covers full user flow
- Test both online and offline map functionality
- Verify admin panel authentication and content updates

### Performance Guidelines
- Keep total bundle under 500KB for remote area accessibility
- Implement lazy loading for images
- Use CSS Grid/Flexbox instead of heavy layout frameworks
- Cache API responses aggressively (5-minute default)
- Optimize images to under 500KB each

## Common Development Tasks

### Adding New States/Cities
1. Update `server/data/states.json` and `server/data/cities.json`
2. Ensure coordinates are accurate for map display
3. Add corresponding image assets to `apps/web/assets/`
4. Run `npm test` to validate data integrity
5. Test map markers and navigation flow

### Modifying Admin Features
- Admin authentication is in `server/index.js` line 257-266
- All admin routes require `authenticateAdmin` middleware
- Frontend admin logic is in `apps/web/js/admin.js`
- Admin panel HTML structure is in `apps/web/admin.html`

### Updating Map Functionality
- Map logic centralized in `apps/web/js/map.js`
- Uses Leaflet with OpenStreetMap tiles
- Custom markers for different POI types (temples, waterfalls, etc.)
- Fallback gracefully handles offline scenarios

### Image Upload System
- Files stored in `apps/web/uploads/` directory
- Multer handles validation and storage
- Gallery items have moderation status in city data
- Admin can approve/reject through `/api/admin/moderate`

### API Response Caching
- Client-side cache in `data.js` with 5-minute TTL
- Clear cache with `cache.clear()` after admin updates
- Server doesn't implement caching - relies on client cache
- Consider adding server-side Redis for production

## File System Layout

```
apps/web/           # Static frontend assets
├── js/            # ES6 modules (data, map, admin, etc.)
├── css/           # Responsive stylesheets  
├── assets/        # Images and media
└── uploads/       # User-uploaded photos

server/            # Express.js backend
├── index.js       # Main server with all routes
└── data/          # JSON data storage
    ├── states.json    # 8 NE states
    ├── cities.json    # 16 cities
    └── feedback.json  # User feedback

tests/             # Data validation tests
└── data-test.js   # Comprehensive JSON validation
```

The project prioritizes simplicity and performance over architectural complexity, making it ideal for rapid development and deployment in bandwidth-constrained environments.