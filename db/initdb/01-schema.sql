
CREATE TABLE IF NOT EXISTS vehicle_types (
    vehicle_type_id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255),
    form_factor VARCHAR(50) NOT NULL,
    propulsion_type VARCHAR(50) NOT NULL,
    max_range_meters INT,
    rider_capacity INT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS stations (
    station_id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address VARCHAR(255),
    latitude DECIMAL(9, 6) NOT NULL,
    longitude DECIMAL(9, 6) NOT NULL,
    capacity INT,
    is_virtual_station BOOLEAN NOT NULL DEFAULT FALSE,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS station_status (
    station_id VARCHAR(50) NOT NULL REFERENCES stations(station_id),
    feed_updated_at TIMESTAMPTZ NOT NULL,
    last_reported TIMESTAMPTZ,
    num_bikes_available INT NOT NULL,
    num_docks_available INT,
    vehicle_types_available JSONB,
    is_installed BOOLEAN NOT NULL,
    is_renting BOOLEAN NOT NULL,
    is_returning BOOLEAN NOT NULL,
    PRIMARY KEY (station_id, feed_updated_at)
);

CREATE INDEX IF NOT EXISTS station_status_feed_updated_at_idx ON station_status (feed_updated_at);

-- bike_id is rotated by the provider for privacy, so it is not stored.
CREATE TABLE IF NOT EXISTS bike_status (
    id BIGSERIAL PRIMARY KEY,
    feed_updated_at TIMESTAMPTZ NOT NULL,
    vehicle_type_id VARCHAR(50) REFERENCES vehicle_types(vehicle_type_id),
    latitude DECIMAL(9, 6) NOT NULL,
    longitude DECIMAL(9, 6) NOT NULL,
    is_reserved BOOLEAN NOT NULL,
    is_disabled BOOLEAN NOT NULL,
    current_range_meters INT,
    last_reported TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS bike_status_feed_updated_at_idx ON bike_status (feed_updated_at);
