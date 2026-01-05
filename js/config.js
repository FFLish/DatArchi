// js/config.js

// This file contains shared configuration variables for the DatArchi application.

// Determine the site root dynamically, similar to injectHeaderFooter.js
const getSiteRoot = () => {
  const pathname = window.location.pathname;
  // If hosted on GitHub Pages, the repo name is part of the path
  if (pathname.includes('/DatArchi/')) {
    return window.location.origin + '/DatArchi/';
  }
  // For local development or other hosting, assume root is '/'
  return window.location.origin + '/';
};

const SITE_ROOT = getSiteRoot();

// The main image of the excavation site used for map overlays.
// Change this value to update the map image across the entire application.
// Using a root-relative path is more robust for different page depths.
export const getMapImageUrl = () => {
  return SITE_ROOT + 'partials/images/ausgrabungsstätte.jpg';
};