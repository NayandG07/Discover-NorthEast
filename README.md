# Discover NorthEast India 🏔️

A hackathon MVP showcasing the tourism potential of Northeast India's 8 states through an interactive web application with maps, galleries, and user engagement features.

## 🚀 Quick Start

```bash
# Clone the repository
git clone <repository-url>
cd discover-northeast

# Install dependencies
npm install

# Copy environment configuration
cp .env.example .env

# Start the development server
npm run dev

# Open in browser
# http://localhost:3000
```

## 🎯 Features

### For Visitors
- **Interactive Maps**: Explore 8 NE states and 16 cities with clickable markers
- **Image Galleries**: Browse beautiful destinations with lightbox view
- **City Exploration**: Detailed information about attractions, culture, and local specialties
- **Photo Upload**: Share your travel photos (with moderation)
- **Feedback System**: Submit feedback directly from the homepage

### For Administrators
- **Content Management**: Edit state and city descriptions
- **Image Moderation**: Approve/reject user-uploaded photos
- **Feedback Review**: View all user feedback
- **Secure Access**: Password-protected admin panel

## 📁 Project Structure

```
discover-northeast/
├── apps/
│   └── web/                 # Static frontend
│       ├── index.html        # Home page
│       ├── state.html        # State details
│       ├── city.html         # City details
│       ├── admin.html        # Admin panel
│       ├── css/              # Stylesheets
│       ├── js/               # JavaScript modules
│       ├── assets/           # Images and media
│       └── uploads/          # User uploads
├── server/
│   ├── index.js             # Express server
│   ├── routes/              # API routes
│   └── data/                # JSON data storage
│       ├── states.json      # 8 NE states
│       ├── cities.json      # 16 cities (2 per state)
│       └── feedback.json    # User feedback
├── scripts/                 # Utility scripts
├── tests/                   # Test files
├── package.json            # Dependencies
├── .env.example            # Environment template
└── README.md               # This file
```

## 🗺️ Covered Regions

### 8 Northeast States
1. **Assam** - Gateway to Northeast India
2. **Arunachal Pradesh** - Land of Dawn-Lit Mountains
3. **Meghalaya** - Abode of Clouds
4. **Manipur** - Jewel of India
5. **Mizoram** - Land of Hill People
6. **Nagaland** - Land of Festivals
7. **Sikkim** - Himalayan Wonderland
8. **Tripura** - Land of Two Goddesses

### 16 Featured Cities (2 per state)
- Guwahati, Jorhat (Assam)
- Itanagar, Tawang (Arunachal Pradesh)
- Shillong, Cherrapunji (Meghalaya)
- Imphal, Moirang (Manipur)
- Aizawl, Lunglei (Mizoram)
- Kohima, Dimapur (Nagaland)
- Gangtok, Pelling (Sikkim)
- Agartala, Udaipur (Tripura)

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# Server Configuration
PORT=3000

# Admin Authentication
ADMIN_PASS=changeme    # ⚠️ Change this in production!

# Map Provider (optional)
MAPBOX_TOKEN=           # Leave empty for OpenStreetMap

# Cloud Storage (optional - for production)
# SUPABASE_URL=
# SUPABASE_KEY=
# AWS_S3_BUCKET=
```

### Changing Admin Password

1. Edit `.env` file
2. Set `ADMIN_PASS=your-secure-password`
3. Restart the server

## 🛠️ Technical Stack

### Frontend
- **HTML5** - Semantic markup
- **CSS3** - Responsive design with CSS Grid/Flexbox
- **Vanilla JavaScript** - ES6 modules, no framework dependencies
- **Leaflet** - Interactive maps with OpenStreetMap

### Backend
- **Node.js** - JavaScript runtime
- **Express** - Web server framework
- **Multer** - File upload handling
- **File-based storage** - JSON data persistence

### Features
- Mobile-responsive design
- Touch/swipe support
- Keyboard navigation
- Accessibility features (ARIA labels)
- XSS protection
- Input validation

## 📱 Navigation Flow

```
Home Page
├── Interactive Map → State Page
├── Highlights Grid → State Page
└── Feedback Form

State Page
├── Image Slideshow
├── State Information
├── Interactive Map → City Page
└── Cities Grid → City Page

City Page
├── Image Slideshow
├── City Information
├── Points of Interest Map
├── Photo Gallery (with upload)
└── Lightbox View

Admin Panel
├── Login Screen
├── State Management
├── City Management
├── Image Moderation
└── Feedback Review
```

## 🎮 Admin Panel Usage

1. Navigate to `/admin` or click "Admin" in navigation
2. Enter password (default: `changeme`)
3. Access four main sections:
   - **Manage States**: Edit descriptions and highlights
   - **Manage Cities**: Update summaries and specialties
   - **Moderate Gallery**: Approve/reject uploaded photos
   - **View Feedback**: Read user submissions

## 🧪 Testing

```bash
# Run data validation test
npm test

# Manual testing checklist:
# 1. Load homepage - map and content visible
# 2. Click state marker - navigates to state page
# 3. Click city - navigates to city page
# 4. Upload image - shows pending status
# 5. Submit feedback - success message
# 6. Admin login - access granted with correct password
# 7. Edit content - changes persist
```

## 🚢 Deployment

### Local Development
```bash
npm run dev
```

### Production Deployment

1. **Environment Setup**
   - Set secure `ADMIN_PASS`
   - Configure cloud storage (optional)
   - Set appropriate `PORT`

2. **Process Manager (PM2)**
   ```bash
   npm install -g pm2
   pm2 start server/index.js --name discover-ne
   pm2 save
   pm2 startup
   ```

3. **Nginx Configuration** (optional)
   ```nginx
   server {
       listen 80;
       server_name yourdomain.com;
       
       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

## 📸 Image Management

### Placeholder Images
- Default placeholders are provided in `/assets`
- Replace with actual images for production
- Recommended size: 800x600px, < 500KB

### User Uploads
- Max file size: 5MB
- Supported formats: JPEG, PNG, GIF, WebP
- Stored in `/apps/web/uploads/`
- Requires admin approval before public display

## 🔒 Security Considerations

1. **Change default admin password**
2. **Use environment variables for sensitive data**
3. **Implement rate limiting for production**
4. **Add HTTPS in production**
5. **Regular backups of data/*.json files**
6. **Consider database for production scale**

## 🐛 Troubleshooting

### Map not loading
- Check internet connection (requires OpenStreetMap tiles)
- Fallback list view available on mobile

### Images not displaying
- Placeholder images will show if actual images are missing
- Check `/assets` folder for image files
- Verify file paths in JSON data

### Upload failures
- Ensure `/apps/web/uploads` directory exists
- Check file size (< 5MB)
- Verify file type (images only)

### Admin login issues
- Verify password in `.env` file
- Check browser console for errors
- Clear browser cache/session storage

## 📊 Performance Tips

1. **Enable caching** - API responses cached for 5 minutes
2. **Optimize images** - Compress before uploading
3. **Use CDN** - Serve static assets via CDN in production
4. **Enable gzip** - Compress server responses
5. **Lazy load** - Images load on demand

## 🤝 Contributing

This is a hackathon MVP. For production deployment:

1. Replace file-based storage with database
2. Add user authentication system
3. Implement proper image CDN
4. Add more robust error handling
5. Enhance SEO with server-side rendering
6. Add analytics and monitoring

## 📄 License

MIT License - Feel free to use for your hackathon!

## 🙏 Acknowledgments

- OpenStreetMap for map data
- Northeast India tourism boards
- Local communities and photographers
- Hackathon organizers and mentors

## 📞 Support

For hackathon demo support:
- Check console for errors
- Verify all dependencies installed
- Ensure server is running
- Use Chrome/Firefox for best experience

---

**Made with ❤️ for Northeast India Tourism Hackathon**

*Demo Ready | Mobile Responsive | Admin Panel Included*