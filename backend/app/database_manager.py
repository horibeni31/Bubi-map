
def get_bike(bike_id: int):
    return {"bike_id": bike_id, "lat": 0.0, "lon": 0.0, "is_reserved": False, "is_disabled": False}

def get_bikes():
    return {"bikes": []}

def get_stations():
    return {"stations": []}

def get_station(station_id: int):

    return {"station_id": station_id, "name": "Station Name", "lat": 0.0, "lon": 0.0}