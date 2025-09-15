// Simple data validation test for Discover NorthEast
const fs = require('fs');
const path = require('path');

console.log('🧪 Running data validation tests...\n');

let testsPassed = 0;
let testsFailed = 0;

// Test helper
function test(name, fn) {
    try {
        fn();
        console.log(`✅ ${name}`);
        testsPassed++;
    } catch (error) {
        console.log(`❌ ${name}`);
        console.log(`   Error: ${error.message}`);
        testsFailed++;
    }
}

// Assert helper
function assert(condition, message) {
    if (!condition) {
        throw new Error(message || 'Assertion failed');
    }
}

// Load JSON files
function loadJson(filename) {
    const filePath = path.join(__dirname, '../server/data', filename);
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
}

// Test States Data
test('States file exists and is valid JSON', () => {
    const states = loadJson('states.json');
    assert(states, 'States data should exist');
    assert(Array.isArray(states), 'States should be an array');
});

test('Should have exactly 8 states', () => {
    const states = loadJson('states.json');
    assert(states.length === 8, `Expected 8 states, got ${states.length}`);
});

test('Each state should have required fields', () => {
    const states = loadJson('states.json');
    const requiredFields = ['id', 'slug', 'name', 'description', 'coords', 'cities'];
    
    states.forEach(state => {
        requiredFields.forEach(field => {
            assert(state[field] !== undefined, `State ${state.name} missing field: ${field}`);
        });
        
        // Check coords structure
        assert(typeof state.coords.lat === 'number', `State ${state.name} has invalid latitude`);
        assert(typeof state.coords.lng === 'number', `State ${state.name} has invalid longitude`);
        
        // Check cities is array
        assert(Array.isArray(state.cities), `State ${state.name} cities should be an array`);
        assert(state.cities.length >= 2, `State ${state.name} should have at least 2 cities`);
    });
});

test('State slugs should be unique', () => {
    const states = loadJson('states.json');
    const slugs = states.map(s => s.slug);
    const uniqueSlugs = [...new Set(slugs)];
    assert(slugs.length === uniqueSlugs.length, 'Duplicate state slugs found');
});

// Test Cities Data
test('Cities file exists and is valid JSON', () => {
    const cities = loadJson('cities.json');
    assert(cities, 'Cities data should exist');
    assert(Array.isArray(cities), 'Cities should be an array');
});

test('Should have exactly 16 cities', () => {
    const cities = loadJson('cities.json');
    assert(cities.length === 16, `Expected 16 cities, got ${cities.length}`);
});

test('Each city should have required fields', () => {
    const cities = loadJson('cities.json');
    const requiredFields = ['id', 'slug', 'name', 'stateSlug', 'summary', 'coords'];
    
    cities.forEach(city => {
        requiredFields.forEach(field => {
            assert(city[field] !== undefined, `City ${city.name} missing field: ${field}`);
        });
        
        // Check coords structure
        assert(typeof city.coords.lat === 'number', `City ${city.name} has invalid latitude`);
        assert(typeof city.coords.lng === 'number', `City ${city.name} has invalid longitude`);
    });
});

test('City slugs should be unique', () => {
    const cities = loadJson('cities.json');
    const slugs = cities.map(c => c.slug);
    const uniqueSlugs = [...new Set(slugs)];
    assert(slugs.length === uniqueSlugs.length, 'Duplicate city slugs found');
});

test('Each state should have 2 cities', () => {
    const states = loadJson('states.json');
    const cities = loadJson('cities.json');
    
    states.forEach(state => {
        const stateCities = cities.filter(c => c.stateSlug === state.slug);
        assert(stateCities.length === 2, `State ${state.name} has ${stateCities.length} cities, expected 2`);
    });
});

test('All city stateSlug references should be valid', () => {
    const states = loadJson('states.json');
    const cities = loadJson('cities.json');
    const validStateSlugs = states.map(s => s.slug);
    
    cities.forEach(city => {
        assert(
            validStateSlugs.includes(city.stateSlug),
            `City ${city.name} has invalid stateSlug: ${city.stateSlug}`
        );
    });
});

test('All state city references should be valid', () => {
    const states = loadJson('states.json');
    const cities = loadJson('cities.json');
    const validCitySlugs = cities.map(c => c.slug);
    
    states.forEach(state => {
        state.cities.forEach(citySlug => {
            assert(
                validCitySlugs.includes(citySlug),
                `State ${state.name} references invalid city: ${citySlug}`
            );
        });
    });
});

// Test Feedback File
test('Feedback file exists and is valid JSON', () => {
    try {
        const feedback = loadJson('feedback.json');
        assert(Array.isArray(feedback), 'Feedback should be an array');
    } catch (error) {
        // It's OK if feedback.json doesn't exist initially
        if (!error.message.includes('ENOENT')) {
            throw error;
        }
    }
});

// Test Coordinates
test('All coordinates should be within India bounds', () => {
    const states = loadJson('states.json');
    const cities = loadJson('cities.json');
    
    // Rough bounds for India
    const indiaBounds = {
        lat: { min: 8, max: 37 },
        lng: { min: 68, max: 97 }
    };
    
    [...states, ...cities].forEach(location => {
        assert(
            location.coords.lat >= indiaBounds.lat.min && location.coords.lat <= indiaBounds.lat.max,
            `${location.name} latitude ${location.coords.lat} is outside India bounds`
        );
        assert(
            location.coords.lng >= indiaBounds.lng.min && location.coords.lng <= indiaBounds.lng.max,
            `${location.name} longitude ${location.coords.lng} is outside India bounds`
        );
    });
});

// Test NorthEast States
test('All states should be actual NE states of India', () => {
    const states = loadJson('states.json');
    const validNEStates = [
        'Assam',
        'Arunachal Pradesh',
        'Meghalaya',
        'Manipur',
        'Mizoram',
        'Nagaland',
        'Sikkim',
        'Tripura'
    ];
    
    states.forEach(state => {
        assert(
            validNEStates.includes(state.name),
            `${state.name} is not a valid NorthEast state`
        );
    });
    
    // Check all NE states are present
    validNEStates.forEach(stateName => {
        const found = states.find(s => s.name === stateName);
        assert(found, `Missing NE state: ${stateName}`);
    });
});

// Summary
console.log('\n' + '='.repeat(50));
console.log(`Test Results: ${testsPassed} passed, ${testsFailed} failed`);
console.log('='.repeat(50));

if (testsFailed > 0) {
    console.log('\n⚠️  Some tests failed. Please fix the issues above.');
    process.exit(1);
} else {
    console.log('\n🎉 All tests passed! Your data is valid.');
    process.exit(0);
}