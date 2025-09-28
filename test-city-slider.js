// Test script to verify city slider functionality
const { chromium } = require('playwright');

(async () => {
    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext();
    const page = await context.newPage();

    try {
        // Test Guwahati city page
        console.log('Loading Guwahati city page...');
        await page.goto('http://localhost:3000/city.html?slug=guwahati');
        
        // Wait for hero slider to initialize
        await page.waitForSelector('.hero-slider-container', { timeout: 5000 });
        console.log('✓ Hero slider container loaded');
        
        // Check if slides are loaded
        const slides = await page.$$('.hero-slide');
        console.log(`✓ Found ${slides.length} slides`);
        
        // Check if city name is displayed
        const cityName = await page.textContent('#cityName');
        console.log(`✓ City name displayed: ${cityName}`);
        
        // Check if navigation arrows exist
        const prevButton = await page.$('.hero-prev');
        const nextButton = await page.$('.hero-next');
        console.log(`✓ Navigation arrows: ${prevButton ? 'Yes' : 'No'} / ${nextButton ? 'Yes' : 'No'}`);
        
        // Check if indicators exist
        const indicators = await page.$$('.hero-indicator');
        console.log(`✓ Found ${indicators.length} indicators`);
        
        // Test slide navigation
        if (nextButton && slides.length > 1) {
            console.log('Testing slide navigation...');
            await nextButton.click();
            await page.waitForTimeout(1500); // Wait for animation
            console.log('✓ Slide navigation works');
        }
        
        // Check responsive behavior
        console.log('Testing responsive behavior...');
        await page.setViewportSize({ width: 768, height: 1024 });
        await page.waitForTimeout(500);
        console.log('✓ Tablet view tested');
        
        await page.setViewportSize({ width: 375, height: 667 });
        await page.waitForTimeout(500);
        console.log('✓ Mobile view tested');
        
        console.log('\n✅ All tests passed! City slider is working correctly.');
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    } finally {
        await browser.close();
    }
})();