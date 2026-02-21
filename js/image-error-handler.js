/**
 * Image Error Handler & Fallback System
 * Manages broken image links and provides fallbacks
 */

/**
 * List of valid excavation images with multiple fallback paths
 */
const EXCAVATION_IMAGES_MAP = {
    'ausgrabungsstätte1.jpg': [
        './partials/images/ausgrabungsstätte/ausgrabungsstätte1.jpg',
        '../partials/images/ausgrabungsstätte/ausgrabungsstätte1.jpg',
        '../../partials/images/ausgrabungsstätte/ausgrabungsstätte1.jpg'
    ],
    'ausgrabungsstätte2.png': [
        './partials/images/ausgrabungsstätte/ausgrabungsstätte2.png',
        '../partials/images/ausgrabungsstätte/ausgrabungsstätte2.png',
        '../../partials/images/ausgrabungsstätte/ausgrabungsstätte2.png'
    ],
    'ausgrabungsstätte3.png': [
        './partials/images/ausgrabungsstätte/ausgrabungsstätte3.png',
        '../partials/images/ausgrabungsstätte/ausgrabungsstätte3.png',
        '../../partials/images/ausgrabungsstätte/ausgrabungsstätte3.png'
    ],
    'ausgrabungsstätte4.png': [
        './partials/images/ausgrabungsstätte/ausgrabungsstätte4.png',
        '../partials/images/ausgrabungsstätte/ausgrabungsstätte4.png',
        '../../partials/images/ausgrabungsstätte/ausgrabungsstätte4.png'
    ],
    'ausgrabungsstätte5.png': [
        './partials/images/ausgrabungsstätte/ausgrabungsstätte5.png',
        '../partials/images/ausgrabungsstätte/ausgrabungsstätte5.png',
        '../../partials/images/ausgrabungsstätte/ausgrabungsstätte5.png'
    ],
    'ausgrabungsstätte6.png': [
        './partials/images/ausgrabungsstätte/ausgrabungsstätte6.png',
        '../partials/images/ausgrabungsstätte/ausgrabungsstätte6.png',
        '../../partials/images/ausgrabungsstätte/ausgrabungsstätte6.png'
    ]
};

/**
 * List of valid find images with multiple fallback paths
 */
const FIND_IMAGES_MAP = {
    'Münze.png': [
        './partials/images/funde/Münze.png',
        '../partials/images/funde/Münze.png',
        '../../partials/images/funde/Münze.png'
    ],
    'Skelett.png': [
        './partials/images/funde/Skelett.png',
        '../partials/images/funde/Skelett.png',
        '../../partials/images/funde/Skelett.png'
    ],
    'VasenStück.png': [
        './partials/images/funde/VasenStück.png',
        '../partials/images/funde/VasenStück.png',
        '../../partials/images/funde/VasenStück.png'
    ]
};

/**
 * Placeholder SVG for missing images
 */
const PLACEHOLDER_SVG = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23e0e0e0" width="400" height="300"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23999" font-size="24" font-family="Arial"%3EImage not found%3C/text%3E%3C/svg%3E';

/**
 * Find the first working path for an image
 */
export async function findWorkingImagePath(fallbackPaths) {
    for (const path of fallbackPaths) {
        try {
            const response = await fetch(path, { method: 'HEAD' });
            if (response.ok) {
                console.log('✅ Found working image path:', path);
                return path;
            }
        } catch (error) {
            // Continue to next path
            console.log('⚠️ Path failed:', path);
        }
    }
    
    console.error('❌ All paths failed, using placeholder');
    return PLACEHOLDER_SVG;
}

/**
 * Set up automatic error handling for images
 * Call this on page load to automatically handle broken images
 */
export function setupImageErrorHandling() {
    document.addEventListener('error', async (e) => {
        if (e.target.tagName === 'IMG') {
            const img = e.target;
            const src = img.src;
            
            console.warn('🖼️ Image failed to load:', src);
            
            // Try to find working alternative
            let newSrc = PLACEHOLDER_SVG;
            
            // Check if it's an excavation image
            for (const [name, paths] of Object.entries(EXCAVATION_IMAGES_MAP)) {
                if (src.includes(name)) {
                    newSrc = await findWorkingImagePath(paths);
                    break;
                }
            }
            
            // Check if it's a find image
            for (const [name, paths] of Object.entries(FIND_IMAGES_MAP)) {
                if (src.includes(name)) {
                    newSrc = await findWorkingImagePath(paths);
                    break;
                }
            }
            
            img.src = newSrc;
            img.classList.add('image-fallback');
        }
    }, true);
}

/**
 * Validate image paths in current document
 */
export async function validateAllImages() {
    const images = document.querySelectorAll('img');
    let validCount = 0;
    let brokenCount = 0;
    
    console.log('🔍 Validating', images.length, 'images...');
    
    for (const img of images) {
        try {
            const response = await fetch(img.src, { method: 'HEAD' });
            if (response.ok) {
                validCount++;
                console.log('✅', img.src);
            } else {
                brokenCount++;
                console.warn('❌', img.src, '(status:', response.status + ')');
            }
        } catch (error) {
            brokenCount++;
            console.warn('❌', img.src, '(error:', error.message + ')');
        }
    }
    
    console.log(`📊 Image validation complete: ${validCount} valid, ${brokenCount} broken`);
    return { valid: validCount, broken: brokenCount };
}

/**
 * Get correct path based on current location depth
 */
export function getCorrectImagePath(imageName, type = 'excavation') {
    const pathname = window.location.pathname;
    const segments = pathname.split('/').filter(s => s);
    const depth = segments.length;
    
    let relPath = './partials/images/';
    if (depth > 1) {
        relPath = '../'.repeat(depth - 1) + 'partials/images/';
    }
    
    const folder = type === 'excavation' ? 'ausgrabungsstätte' : 'funde';
    return relPath + folder + '/' + imageName;
}

export default {
    findWorkingImagePath,
    setupImageErrorHandling,
    validateAllImages,
    getCorrectImagePath,
    EXCAVATION_IMAGES_MAP,
    FIND_IMAGES_MAP,
    PLACEHOLDER_SVG
};
