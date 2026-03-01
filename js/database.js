/**
 * Database Module - Exports database functions from main.js
 * This module provides a clean API for working with sites and finds
 */

export { 
    getSites, 
    getActiveSite, 
    setActiveSite, 
    addFind, 
    getFinds,
    updateFind,
    deleteFind,
    addSite, 
    clearFindsForActiveSite, 
    getZones 
} from './main.js';
