const express = require('express');
const path = require('path');
const fs = require('fs').promises;
const multer = require('multer');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_PASS = process.env.ADMIN_PASS || 'changeme';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from apps/web
app.use(express.static(path.join(__dirname, '../apps/web')));

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: async (req, file, cb) => {
        const uploadDir = path.join(__dirname, '../apps/web/uploads');
        try {
            await fs.mkdir(uploadDir, { recursive: true });
            cb(null, uploadDir);
        } catch (error) {
            cb(error);
        }
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|webp/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'));
        }
    }
});

// Helper functions
async function readJsonFile(filename) {
    try {
        const filePath = path.join(__dirname, 'data', filename);
        const data = await fs.readFile(filePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error(`Error reading ${filename}:`, error);
        return null;
    }
}

async function writeJsonFile(filename, data) {
    try {
        const filePath = path.join(__dirname, 'data', filename);
        await fs.mkdir(path.dirname(filePath), { recursive: true });
        await fs.writeFile(filePath, JSON.stringify(data, null, 2));
        return true;
    } catch (error) {
        console.error(`Error writing ${filename}:`, error);
        return false;
    }
}

// Initialize data files if they don't exist
async function initializeDataFiles() {
    const dataDir = path.join(__dirname, 'data');
    
    try {
        await fs.mkdir(dataDir, { recursive: true });
        
        // Check if files exist, if not create them with empty arrays/objects
        const files = ['states.json', 'cities.json', 'feedback.json'];
        
        for (const file of files) {
            const filePath = path.join(dataDir, file);
            try {
                await fs.access(filePath);
            } catch {
                // File doesn't exist, create it
                const initialData = file === 'feedback.json' ? [] : [];
                await writeJsonFile(file, initialData);
                console.log(`Created ${file}`);
            }
        }
    } catch (error) {
        console.error('Error initializing data files:', error);
    }
}

// ===== API Routes =====

// Get all states
app.get('/api/states', async (req, res) => {
    const states = await readJsonFile('states.json');
    if (states) {
        res.json(states);
    } else {
        res.status(500).json({ error: 'Failed to load states data' });
    }
});

// Get single state with its cities
app.get('/api/states/:slug', async (req, res) => {
    const { slug } = req.params;
    const states = await readJsonFile('states.json');
    const cities = await readJsonFile('cities.json');
    
    if (!states || !cities) {
        return res.status(500).json({ error: 'Failed to load data' });
    }
    
    const state = states.find(s => s.slug === slug);
    if (!state) {
        return res.status(404).json({ error: 'State not found' });
    }
    
    // Get cities for this state
    const stateCities = cities.filter(c => c.stateSlug === slug);
    
    res.json({
        ...state,
        citiesData: stateCities
    });
});

// Get all cities
app.get('/api/cities', async (req, res) => {
    const cities = await readJsonFile('cities.json');
    if (cities) {
        res.json(cities);
    } else {
        res.status(500).json({ error: 'Failed to load cities data' });
    }
});

// Get single city
app.get('/api/cities/:slug', async (req, res) => {
    const { slug } = req.params;
    const cities = await readJsonFile('cities.json');
    
    if (!cities) {
        return res.status(500).json({ error: 'Failed to load cities data' });
    }
    
    const city = cities.find(c => c.slug === slug);
    if (!city) {
        return res.status(404).json({ error: 'City not found' });
    }
    
    res.json(city);
});

// Submit feedback
app.post('/api/feedback', async (req, res) => {
    const { name, email, message } = req.body;
    
    // Validate input
    if (!name || !email || !message) {
        return res.status(400).json({ error: 'All fields are required' });
    }
    
    if (!email.includes('@')) {
        return res.status(400).json({ error: 'Invalid email address' });
    }
    
    const feedback = await readJsonFile('feedback.json') || [];
    
    const newFeedback = {
        id: Date.now().toString(),
        name: name.substring(0, 100),
        email: email.substring(0, 100),
        message: message.substring(0, 1000),
        timestamp: new Date().toISOString()
    };
    
    feedback.push(newFeedback);
    
    const success = await writeJsonFile('feedback.json', feedback);
    
    if (success) {
        res.json({ success: true, message: 'Feedback submitted successfully' });
    } else {
        res.status(500).json({ error: 'Failed to save feedback' });
    }
});

// Upload image
app.post('/api/upload', upload.single('photo'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }
        
        const { citySlug } = req.body;
        const caption = req.body.caption || '';
        
        if (!citySlug) {
            return res.status(400).json({ error: 'City slug is required' });
        }
        
        const cities = await readJsonFile('cities.json');
        if (!cities) {
            return res.status(500).json({ error: 'Failed to load cities data' });
        }
        
        const cityIndex = cities.findIndex(c => c.slug === citySlug);
        if (cityIndex === -1) {
            return res.status(404).json({ error: 'City not found' });
        }
        
        // Add image to city's gallery
        const imageUrl = `/uploads/${req.file.filename}`;
        const galleryItem = {
            id: Date.now().toString(),
            url: imageUrl,
            caption: caption.substring(0, 100),
            moderated: false,
            uploadedAt: new Date().toISOString()
        };
        
        if (!cities[cityIndex].gallery) {
            cities[cityIndex].gallery = [];
        }
        
        cities[cityIndex].gallery.push(galleryItem);
        
        const success = await writeJsonFile('cities.json', cities);
        
        if (success) {
            res.json({ 
                success: true, 
                message: 'Image uploaded successfully',
                image: galleryItem
            });
        } else {
            res.status(500).json({ error: 'Failed to save image data' });
        }
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: error.message || 'Upload failed' });
    }
});

// Admin authentication middleware
function authenticateAdmin(req, res, next) {
    const { password } = req.body;
    
    if (password !== ADMIN_PASS) {
        return res.status(401).json({ error: 'Invalid admin password' });
    }
    
    next();
}

// Admin login
app.post('/api/admin/login', (req, res) => {
    const { password } = req.body;
    
    if (password === ADMIN_PASS) {
        res.json({ success: true, message: 'Login successful' });
    } else {
        res.status(401).json({ error: 'Invalid password' });
    }
});

// Admin update state
app.post('/api/admin/update/state', authenticateAdmin, async (req, res) => {
    const { stateData } = req.body;
    
    if (!stateData || !stateData.slug) {
        return res.status(400).json({ error: 'Invalid state data' });
    }
    
    const states = await readJsonFile('states.json');
    if (!states) {
        return res.status(500).json({ error: 'Failed to load states data' });
    }
    
    const stateIndex = states.findIndex(s => s.slug === stateData.slug);
    if (stateIndex === -1) {
        return res.status(404).json({ error: 'State not found' });
    }
    
    // Update only allowed fields
    const allowedFields = ['name', 'description', 'history', 'highlights', 'festivals'];
    for (const field of allowedFields) {
        if (stateData[field] !== undefined) {
            states[stateIndex][field] = stateData[field];
        }
    }
    
    const success = await writeJsonFile('states.json', states);
    
    if (success) {
        res.json({ success: true, message: 'State updated successfully' });
    } else {
        res.status(500).json({ error: 'Failed to save state data' });
    }
});

// Admin update city
app.post('/api/admin/update/city', authenticateAdmin, async (req, res) => {
    const { cityData } = req.body;
    
    if (!cityData || !cityData.slug) {
        return res.status(400).json({ error: 'Invalid city data' });
    }
    
    const cities = await readJsonFile('cities.json');
    if (!cities) {
        return res.status(500).json({ error: 'Failed to load cities data' });
    }
    
    const cityIndex = cities.findIndex(c => c.slug === cityData.slug);
    if (cityIndex === -1) {
        return res.status(404).json({ error: 'City not found' });
    }
    
    // Update only allowed fields
    const allowedFields = ['name', 'summary', 'history', 'localSpecialties', 'explore'];
    for (const field of allowedFields) {
        if (cityData[field] !== undefined) {
            cities[cityIndex][field] = cityData[field];
        }
    }
    
    const success = await writeJsonFile('cities.json', cities);
    
    if (success) {
        res.json({ success: true, message: 'City updated successfully' });
    } else {
        res.status(500).json({ error: 'Failed to save city data' });
    }
});

// Admin moderate image
app.post('/api/admin/moderate', authenticateAdmin, async (req, res) => {
    const { citySlug, imageId, action } = req.body;
    
    if (!citySlug || !imageId || !action) {
        return res.status(400).json({ error: 'Missing required parameters' });
    }
    
    const cities = await readJsonFile('cities.json');
    if (!cities) {
        return res.status(500).json({ error: 'Failed to load cities data' });
    }
    
    const cityIndex = cities.findIndex(c => c.slug === citySlug);
    if (cityIndex === -1) {
        return res.status(404).json({ error: 'City not found' });
    }
    
    const gallery = cities[cityIndex].gallery || [];
    const imageIndex = gallery.findIndex(img => img.id === imageId);
    
    if (imageIndex === -1) {
        return res.status(404).json({ error: 'Image not found' });
    }
    
    if (action === 'approve') {
        gallery[imageIndex].moderated = true;
    } else if (action === 'reject') {
        // Remove the image
        gallery.splice(imageIndex, 1);
        
        // Optionally delete the file
        try {
            const imagePath = path.join(__dirname, '../apps/web', gallery[imageIndex].url);
            await fs.unlink(imagePath);
        } catch (error) {
            console.error('Failed to delete image file:', error);
        }
    } else {
        return res.status(400).json({ error: 'Invalid action' });
    }
    
    cities[cityIndex].gallery = gallery;
    
    const success = await writeJsonFile('cities.json', cities);
    
    if (success) {
        res.json({ success: true, message: `Image ${action}d successfully` });
    } else {
        res.status(500).json({ error: 'Failed to save changes' });
    }
});

// Admin get feedback
app.post('/api/admin/feedback', authenticateAdmin, async (req, res) => {
    const feedback = await readJsonFile('feedback.json');
    
    if (feedback) {
        res.json(feedback);
    } else {
        res.status(500).json({ error: 'Failed to load feedback' });
    }
});

// Serve HTML pages for client-side routing
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../apps/web/index.html'));
});

app.get('/state', (req, res) => {
    res.sendFile(path.join(__dirname, '../apps/web/state.html'));
});

app.get('/city', (req, res) => {
    res.sendFile(path.join(__dirname, '../apps/web/city.html'));
});

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, '../apps/web/admin.html'));
});

// Error handling middleware
app.use((error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ error: 'File too large. Maximum size is 5MB' });
        }
        return res.status(400).json({ error: error.message });
    }
    
    console.error('Server error:', error);
    res.status(500).json({ error: 'Internal server error' });
});

// Start server
async function startServer() {
    await initializeDataFiles();
    
    app.listen(PORT, () => {
        console.log(`
╔═══════════════════════════════════════════╗
║   Discover NorthEast Server Running! 🚀   ║
╠═══════════════════════════════════════════╣
║   Local: http://localhost:${PORT}            ║
║   Admin Password: ${ADMIN_PASS === 'changeme' ? 'changeme (⚠️ change this!)' : '********'}   ║
╚═══════════════════════════════════════════╝
        `);
    });
}

startServer().catch(console.error);

module.exports = app;