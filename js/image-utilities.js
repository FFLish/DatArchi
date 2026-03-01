/**
 * Image Utilities - Random Image Selection
 * Provides random image selection for excavation sites and finds
 */

/**
 * Available images for excavation sites
 */
const EXCAVATION_SITE_IMAGES = [
    'ausgrabungsstätte1.jpg',
    'ausgrabungsstätte2.png',
    'ausgrabungsstätte3.png',
    'ausgrabungsstätte4.png',
    'ausgrabungsstätte5.png',
    'ausgrabungsstätte6.png'
];

/**
 * Available images for finds
 */
const FIND_IMAGES = [
    'Münze.png',
    'Skelett.png',
    'VasenStück.png'
];

/**
 * Calculate correct relative path from current document to images folder
 * Works from any HTML file location
 */
function getRelativePath() {
    // Get current document path (e.g., /pages/projects/index.html or /index.html)
    const pathname = window.location.pathname;
    
    // Split path and filter out empty segments
    const segments = pathname.split('/').filter(s => s);
    
    // Remove the filename if present (last segment contains a dot)
    const pathSegments = segments.filter((seg, idx) => {
        // Keep all segments except the last one if it's a file
        if (idx === segments.length - 1 && seg.includes('.')) {
            return false;
        }
        return true;
    });
    
    // Calculate depth: number of directory levels from root
    // Examples:
    // [] (root index.html) = 0 directories → "./partials/images/"
    // ['pages'] = 1 directory → "../partials/images/"
    // ['pages', 'projects'] = 2 directories → "../../partials/images/"
    const depth = pathSegments.length;
    
    if (depth === 0) {
        return './partials/images/';
    }
    
    return '../'.repeat(depth) + 'partials/images/';
}

/**
 * Base paths for images - calculated dynamically from current location
 */
let IMAGE_PATHS = {
    excavationSite: getRelativePath() + 'ausgrabungsstätte/',
    find: getRelativePath() + 'funde/'
};

// Log paths on load for debugging
console.log('🖼️ Image Utilities Loaded');
console.log('Current path:', window.location.pathname);
console.log('Calculated image paths:', IMAGE_PATHS);

/**
 * Get a random excavation site image
 * @returns {string} Image URL
 */
export function getRandomExcavationSiteImage() {
    const randomIndex = Math.floor(Math.random() * EXCAVATION_SITE_IMAGES.length);
    const url = IMAGE_PATHS.excavationSite + EXCAVATION_SITE_IMAGES[randomIndex];
    console.log('🖼️ Excavation image:', url);
    return url;
}

/**
 * Get a random find image
 * @returns {string} Image URL
 */
export function getRandomFindImage() {
    const randomIndex = Math.floor(Math.random() * FIND_IMAGES.length);
    const url = IMAGE_PATHS.find + FIND_IMAGES[randomIndex];
    console.log('🖼️ Find image:', url);
    return url;
}

/**
 * Get random excavation site image with fallback
 * @returns {string} Image URL
 */
export function getRandomExcavationSiteImageUrl() {
    return getRandomExcavationSiteImage();
}

/**
 * Get random find image with fallback
 * @returns {string} Image URL
 */
export function getRandomFindImageUrl() {
    return getRandomFindImage();
}

/**
 * Preload random image for caching
 * @param {string} type - "excavation" or "find"
 */
export function preloadRandomImage(type) {
    const imageUrl = type === 'excavation' 
        ? getRandomExcavationSiteImage() 
        : getRandomFindImage();
    
    const img = new Image();
    img.src = imageUrl;
    return imageUrl;
}

export default {
    getRandomExcavationSiteImage,
    getRandomFindImage,
    getRandomExcavationSiteImageUrl,
    getRandomFindImageUrl,
    preloadRandomImage,
    EXCAVATION_SITE_IMAGES,
    FIND_IMAGES,
    IMAGE_PATHS
};
