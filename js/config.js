// js/config.js

// This file contains shared configuration variables for the DatArchi application.

// The main image of the excavation site used for map overlays.
// Change this value to update the map image across the entire application.
// Using a root-relative path is more robust for different page depths.
export const getMapImageUrl = () => {
  // Use import.meta.url to get the current script's URL.
  // Then, navigate up two levels (from js/config.js to the project root)
  // and then down into partials/images/
  const configJsPath = import.meta.url;
  // Construct a URL object from the config.js path to easily resolve relative paths.
  // '../../' moves two directories up from js/funde/config.js (or js/config.js) to the DatArchi project root.
  const siteRootUrl = new URL('../../', configJsPath); 
  // Resolve the image path relative to the calculated siteRootUrl
  return new URL('partials/images/ausgrabungsstätte.jpg', siteRootUrl).href;
};