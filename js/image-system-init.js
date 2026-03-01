/**
 * Image System Initializer
 * Sets up image path handling and error recovery on page load
 * 
 * Usage: Call setupImageSystem() after DOM is ready
 */

import { setupImageErrorHandling, validateAllImages } from './image-error-handler.js';

let imageSystemInitialized = false;
let imageValidationScheduled = false;

/**
 * Initialize the image system
 * - Set up error handlers
 * - Validate paths
 * - Log status
 */
export function setupImageSystem() {
    if (imageSystemInitialized) {
        return;
    }

    imageSystemInitialized = true;
    console.log('🎨 Initializing Image System...');
    
    // Setup automatic error handling
    setupImageErrorHandling();
    
    // Log page info
    console.log('📍 Page location:', window.location.pathname);
    console.log('🌍 Origin:', window.location.origin);
    
    // Defer validation to avoid blocking
    if (!imageValidationScheduled) {
        imageValidationScheduled = true;
        setTimeout(() => {
            validateAllImages()
                .then(result => {
                    if (result.broken > 0) {
                        console.warn(`⚠️ ${result.broken} broken images detected`);
                    } else {
                        console.log('✅ All images loaded successfully');
                    }
                })
                .catch(error => {
                    console.error('❌ Image validation failed:', error);
                });
        }, 2000);
    }
}

/**
 * Quick image path check
 * Shows what paths would be generated for current location
 */
export function debugImagePaths() {
    const pathname = window.location.pathname;
    const segments = pathname.split('/').filter(s => s);
    const depth = segments.length;
    
    let relPath = './partials/images/';
    if (depth > 1) {
        relPath = '../'.repeat(depth - 1) + 'partials/images/';
    }
    
    const info = {
        pathname,
        depth,
        basePath: relPath,
        excavationPath: relPath + 'ausgrabungsstätte/',
        findPath: relPath + 'funde/',
        exampleExcavation: relPath + 'ausgrabungsstätte/ausgrabungsstätte1.jpg',
        exampleFind: relPath + 'funde/Münze.png'
    };
    
    console.table(info);
    return info;
}

/**
 * List all images available in the system
 */
export function listAvailableImages() {
    const excavations = [
        'ausgrabungsstätte1.jpg',
        'ausgrabungsstätte2.png',
        'ausgrabungsstätte3.png',
        'ausgrabungsstätte4.png',
        'ausgrabungsstätte5.png',
        'ausgrabungsstätte6.png'
    ];
    
    const finds = [
        'Münze.png',
        'Skelett.png',
        'VasenStück.png'
    ];
    
    console.log('🏛️ Available Excavation Images:', excavations);
    console.log('🎁 Available Find Images:', finds);
    
    return { excavations, finds };
}

export default {
    setupImageSystem,
    debugImagePaths,
    listAvailableImages
};
