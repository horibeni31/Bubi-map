import logging
from contextlib import asynccontextmanager
from datetime import datetime

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from app.database_manager import get_bikes, get_bike, get_station, get_stations, get_station_history
from app.gbfs_poller import poll_gbfs
from apscheduler.schedulers.background import BackgroundScheduler

logging.basicConfig(level=logging.INFO)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # poll every minute, starting immediately
    scheduler = BackgroundScheduler()
    scheduler.add_job(poll_gbfs, 'interval', minutes=1, next_run_time=datetime.now(), max_instances=1, coalesce=True)
    scheduler.start()
    yield
    scheduler.shutdown(wait=False)


app = FastAPI(lifespan=lifespan)


# Data model
class User(BaseModel):
    name: str
    email: str


# Temporary in-memory database
users = {}


@app.get("/bike")
def get_bikes_endpoint():
    return get_bikes()

@app.get("/bike/{bike_id}")
def get_bike_endpoint(bike_id: int):
    return get_bike(bike_id)

@app.get("/station/{station_id}")
def get_station_endpoint(station_id: str):
    station = get_station(station_id)
    if station is None:
        raise HTTPException(status_code=404, detail="Station not found")
    return station

@app.get("/stations")
def get_stations_endpoint():
    return get_stations()

@app.get("/stations/{station_id}/history")
def get_station_history_endpoint(station_id: str):
    history = get_station_history(station_id)
    if history is None:
        raise HTTPException(status_code=404, detail="Station not found")
    return history
