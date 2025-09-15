# Popular Places Feature Documentation

## Overview
The Popular Places section on state pages displays both cities and tourist attractions for each state. This provides users with a comprehensive view of all notable destinations within a state.

## How It Works

### Data Sources
1. **Cities**: Loaded from the `citiesData` array in the state object
2. **Tourist Attractions**: Extracted from the `highlights` array in states.json, excluding any that are already shown as cities

### Display Logic (state.js)

The `populateCities()` function combines data from two sources:

```javascript
// 1. First, it adds all cities from citiesData
if (state.citiesData && state.citiesData.length > 0) {
    placesToShow = [...state.citiesData];
}

// 2. Then, it adds tourist places from highlights that aren't already cities
state.highlights.forEach((highlight) => {
    // Skip if this highlight is already in cities
    if (!cityNames.includes(highlightName.toLowerCase())) {
        placesToShow.push({
            name: highlightName,
            slug: slug,
            summary: summary,
            image: image,
            isHighlight: true,
            type: 'tourist-place'
        });
    }
});
```

### Visual Differentiation

#### Cities
- **Clickable**: Navigate to city detail pages
- **Display**: Standard city card with "Explore City →" link
- **Icon**: 🏙️ for list view
- **Behavior**: Hover effect with translateY animation

#### Tourist Attractions
- **Non-clickable**: Display only (no detail pages yet)
- **Badge**: "Popular Place" badge in top-right corner
- **Background**: Gradient background (light blue)
- **Icon**: 🏔️ with "Tourist Attraction" label
- **Behavior**: Reduced hover effect (no navigation)

### CSS Styling

```css
/* Tourist place specific styles */
.highlight-card {
    position: relative;
    background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
    cursor: default;
}

.card-badge {
    position: absolute;
    top: 15px;
    right: 15px;
    background: var(--primary);
    color: var(--white);
    padding: 6px 12px;
    border-radius: 20px;
    font-size: 0.875rem;
    font-weight: 600;
}
```

## Data Structure

### Current Implementation (states.json)
```json
{
    "highlights": [
        "Kaziranga National Park",
        "Kamakhya Temple",
        "Manas National Park"
    ]
}
```

### Enhanced Implementation (supports custom data)
The system can also support object-based highlights:
```json
{
    "highlights": [
        {
            "name": "Kamakhya Temple",
            "slug": "kamakhya-temple",
            "summary": "Ancient temple and pilgrimage site",
            "image": "/assets/assam/kamakhya.jpg"
        }
    ]
}
```

## Tourist Attractions Data (tourist-attractions.json)

A separate data file has been created to store detailed information about tourist attractions:

```json
{
    "assam": {
        "kamakhya-temple": {
            "name": "Kamakhya Temple",
            "slug": "kamakhya-temple",
            "summary": "One of the 51 Shakti Peethas...",
            "image": "/assets/assam/kamakhya-temple.jpg",
            "type": "temple",
            "location": "Guwahati"
        }
    }
}
```

## Future Enhancements

1. **Detail Pages**: Create individual pages for tourist attractions
2. **API Integration**: Load tourist attraction data from the server
3. **Image Gallery**: Support multiple images per attraction
4. **Categories**: Filter by attraction type (temple, wildlife, cultural, etc.)
5. **Reviews/Ratings**: User-generated content for attractions
6. **Booking Integration**: Links to booking platforms for tickets/tours

## Mobile Responsiveness

On mobile devices:
- Grid layout switches to single column
- List view becomes visible as fallback
- Tourist places show with distinct gradient background
- Non-clickable items don't show hover animation

## SEO Considerations

- Tourist attractions enhance state page content
- Each attraction has semantic HTML markup
- Alt text for images includes location context
- Structured data can be added for tourist attractions