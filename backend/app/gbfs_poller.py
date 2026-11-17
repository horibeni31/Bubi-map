import json
import logging
import urllib.request

from app.database_manager import save_snapshot

GBFS_BASE_URL = "https://gbfs.urbansharing.com/molbubi.hu"

logger = logging.getLogger(__name__)


def fetch_feed(name: str) -> dict:
    with urllib.request.urlopen(f"{GBFS_BASE_URL}/{name}.json", timeout=20) as resp:
        return json.load(resp)


def poll_gbfs():
    try:
        vehicle_types = fetch_feed("vehicle_types")["data"]["vehicle_types"]
        stations = fetch_feed("station_information")["data"]["stations"]
        station_status = fetch_feed("station_status")
        bikes = fetch_feed("free_bike_status")

        save_snapshot(vehicle_types, stations, station_status, bikes)
        logger.info(
            "Stored GBFS snapshot: %d stations, %d free bikes",
            len(station_status["data"]["stations"]), len(bikes["data"]["bikes"]),
        )
    except Exception:
        # Keep the scheduler alive; the next run will try again
        logger.exception("GBFS poll failed")
