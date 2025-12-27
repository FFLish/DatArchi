# DatArchi

DatArchi is a web-based application designed for archaeologists to document and manage their excavation finds. It provides an interactive map-based interface to define and manage zones within an excavation site and allows for detailed recording of each find.

The project is currently under development.

## Features

*   **Interactive Image Map:** Use an image of an excavation site as an interactive map.
*   **Zone Management:** Create, edit, and delete zones on the map. Zones can be generated as a grid or drawn manually.
*   **Finds Documentation:** A detailed form to enter information about each find, including title, description, material, date, and coordinates.
*   **Photo Upload:** Attach a photo to each find record.
*   **Location Picker:** Use an interactive map (Leaflet) to specify the exact coordinates of a find.
*   **Local Storage:** Zone data is persisted in the browser's local storage.

## How to Run

Since the project uses ES modules (`import`/`export`), it needs to be run from a local web server to avoid CORS issues with `file://` URLs.

1.  Make sure you have Python installed.
2.  Open a terminal in the `DatArchi/DatArchi` directory.
3.  Run the following command to start a simple HTTP server:

    ```bash
    python -m http.server
    ```

4.  Open your web browser and navigate to `http://localhost:8000`.

This will serve the `index.html` file and you can use the application from there.

## Project Structure

*   `index.html`: The main entry point of the application.
*   `css/`: Contains all the stylesheets.
*   `js/`: Contains the JavaScript files for application logic.
    *   `zone.js`: Core logic for the interactive zone map.
    *   `funde/eingeben.js`: Logic for the "enter find" form.
    *   `injectHeaderFooter.js`: Dynamically loads the header and footer into each page.
*   `pages/`: Contains other HTML pages like "About Us" and "Finds".
*   `partials/`: Reusable HTML partials like the header and footer.
*   `partials/images/`: Contains the images used in the application.