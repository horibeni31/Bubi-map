## Frontend

React web application
Leaflet for displaying the interactive map
Displays bike locations as map markers
Fetches current bike data from the backend REST API
Supports map interactions such as zooming, panning, and selecting bikes
Refreshes bike locations periodically to keep the map up to date

## Backend

Python FastAPI REST API
Retrieves bike data stored in the database and serves it to the frontend
Provides endpoints for querying available bikes and their locations
Processes and normalizes data received from the GBFS (General Bikeshare Feed Specification) feed
Periodically fetches and updates bike data from the GBFS feed
Handles communication between the frontend, GBFS feed, and database
Provides API documentation through OpenAPI/Swagger
Database
PostgreSQL database
Stores bike-sharing data received from the GBFS feed

Stores bike information such as:
- Bike ID
- Latitude and longitude
- Availability/status
- Bike type
- Last update timestamp

Stores station information if the GBFS feed provides station-based data