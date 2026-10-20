from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from app.database_manager import get_bikes, get_bike, get_station, get_stations
app = FastAPI()


# Data model
class User(BaseModel):
    name: str
    email: str


# Temporary in-memory database
users = {}


@app.get("/bike")
def get_bikes():
    return get_bikes()

@app.get("/bike/{bike_id}")
def get_bike_endpoint(bike_id: int):
    return get_bike(bike_id)

@app.get("/station/{station_id}")
def get_station_endpoint(station_id: int):
    return get_station(station_id)

@app.get("/stations")
def get_stations_endpoint():
    return get_stations()

