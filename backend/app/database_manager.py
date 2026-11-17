import json
import os

import psycopg2
from psycopg2.extras import execute_values

DATABASE_URL = os.environ.get("DATABASE_URL", "postgresql://myuser:password@postgres:5432/bubi_map")


def get_bike(bike_id: int):
    return {"bike_id": bike_id, "lat": 0.0, "lon": 0.0, "is_reserved": False, "is_disabled": False}

def get_bikes():
    return {"bikes": []}

_STATION_QUERY = """
    SELECT s.station_id, s.name, s.address, s.latitude, s.longitude, s.capacity, s.is_virtual_station,
           st.num_bikes_available, st.num_docks_available, st.is_installed, st.is_renting,
           st.is_returning, st.last_reported, st.feed_updated_at
    FROM stations s
    LEFT JOIN LATERAL (
        SELECT * FROM station_status
        WHERE station_status.station_id = s.station_id
        ORDER BY feed_updated_at DESC
        LIMIT 1
    ) st ON TRUE
"""


def _station_row_to_dict(row):
    (station_id, name, address, lat, lon, capacity, is_virtual, bikes, docks,
     is_installed, is_renting, is_returning, last_reported, feed_updated_at) = row
    return {
        "station_id": station_id,
        "name": name,
        "address": address,
        "lat": float(lat),
        "lon": float(lon),
        "capacity": capacity,
        "is_virtual_station": is_virtual,
        "num_bikes_available": bikes,
        "num_docks_available": docks,
        "is_installed": is_installed,
        "is_renting": is_renting,
        "is_returning": is_returning,
        "last_reported": last_reported.isoformat() if last_reported else None,
        "feed_updated_at": feed_updated_at.isoformat() if feed_updated_at else None,
    }


def get_stations():
    """All stations with their most recent status."""
    conn = connect_to_db()
    try:
        with conn.cursor() as cur:
            cur.execute(_STATION_QUERY + " ORDER BY s.name")
            return {"stations": [_station_row_to_dict(r) for r in cur.fetchall()]}
    finally:
        conn.close()


def get_station(station_id: str):
    """One station with its most recent status, or None if it does not exist."""
    conn = connect_to_db()
    try:
        with conn.cursor() as cur:
            cur.execute(_STATION_QUERY + " WHERE s.station_id = %s", (station_id,))
            row = cur.fetchone()
            return _station_row_to_dict(row) if row else None
    finally:
        conn.close()


def connect_to_db():
    return psycopg2.connect(DATABASE_URL)


def save_snapshot(vehicle_types: list, stations: list, station_status: dict, bikes: dict):
    """Store one poll of the GBFS feeds in a single transaction.

    station_status and bikes are the full feed payloads (with last_updated);
    vehicle_types and stations are the lists from their feeds' data section.
    """
    conn = connect_to_db()
    try:
        with conn, conn.cursor() as cur:
            execute_values(cur, """
                INSERT INTO vehicle_types (vehicle_type_id, name, form_factor, propulsion_type, max_range_meters, rider_capacity)
                VALUES %s
                ON CONFLICT (vehicle_type_id) DO UPDATE SET
                    name = EXCLUDED.name,
                    form_factor = EXCLUDED.form_factor,
                    propulsion_type = EXCLUDED.propulsion_type,
                    max_range_meters = EXCLUDED.max_range_meters,
                    rider_capacity = EXCLUDED.rider_capacity,
                    updated_at = now()
            """, [
                (v["vehicle_type_id"], v.get("name"), v["form_factor"], v["propulsion_type"],
                 v.get("max_range_meters"), v.get("rider_capacity"))
                for v in vehicle_types
            ])

            execute_values(cur, """
                INSERT INTO stations (station_id, name, address, latitude, longitude, capacity, is_virtual_station)
                VALUES %s
                ON CONFLICT (station_id) DO UPDATE SET
                    name = EXCLUDED.name,
                    address = EXCLUDED.address,
                    latitude = EXCLUDED.latitude,
                    longitude = EXCLUDED.longitude,
                    capacity = EXCLUDED.capacity,
                    is_virtual_station = EXCLUDED.is_virtual_station,
                    updated_at = now()
            """, [
                (s["station_id"], s["name"], s.get("address"), s["lat"], s["lon"],
                 s.get("capacity"), s.get("is_virtual_station", False))
                for s in stations
            ])

            # Duplicate feed timestamps (feed not refreshed since last poll) are skipped by the primary key
            execute_values(cur, """
                INSERT INTO station_status (station_id, feed_updated_at, last_reported, num_bikes_available,
                    num_docks_available, vehicle_types_available, is_installed, is_renting, is_returning)
                VALUES %s
                ON CONFLICT (station_id, feed_updated_at) DO NOTHING
            """, [
                (s["station_id"], station_status["last_updated"], s.get("last_reported"), s["num_bikes_available"],
                 s.get("num_docks_available"), json.dumps(s.get("vehicle_types_available")),
                 s["is_installed"], s["is_renting"], s["is_returning"])
                for s in station_status["data"]["stations"]
            ], template="(%s, to_timestamp(%s), to_timestamp(%s), %s, %s, %s, %s, %s, %s)")

            cur.execute(
                "SELECT 1 FROM bike_status WHERE feed_updated_at = to_timestamp(%s) LIMIT 1",
                (bikes["last_updated"],),
            )
            if cur.fetchone() is None:
                execute_values(cur, """
                    INSERT INTO bike_status (feed_updated_at, vehicle_type_id, latitude, longitude,
                        is_reserved, is_disabled, current_range_meters, last_reported)
                    VALUES %s
                """, [
                    (bikes["last_updated"], b.get("vehicle_type_id"), b["lat"], b["lon"],
                     b["is_reserved"], b["is_disabled"], b.get("current_range_meters"), b.get("last_reported"))
                    for b in bikes["data"]["bikes"]
                ], template="(to_timestamp(%s), %s, %s, %s, %s, %s, %s, to_timestamp(%s))")
    finally:
        conn.close()
