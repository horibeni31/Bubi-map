import json
import os
history = {}
insert_into_command = "INSERT INTO bikes (bike_id, lat, lon, is_reserved, is_disabled,times) VALUES (%s, %s, %s, %s, %s)"
def parse_json_file(file_path,i):
    global history, insert_into_command
    with open(file_path, "r") as f:
        data = json.load(f)
    bikes = data["data"]["bikes"]
    for bike in bikes:
        bike_id = bike["bike_id"]
        lat = bike["lat"]
        lon = bike["lon"]
        is_reserved = bike["is_reserved"]
        is_disabled = bike["is_disabled"]
        if bike_id not in history:
            history[bike_id] = [i]
        else:
            history[bike_id].append(i)
        
        insert_into_command += f"({bike_id}, {lat}, {lon}, {is_reserved}, {is_disabled}), "
        # bikes[bike_id] = {
        #     "lat": lat,
        #     "lon": lon,
        #     "is_reserved": is_reserved,
        #     "is_disabled": is_disabled
        # }
        # print(f"Bike ID: {bike_id}, Lat: {lat}, Lon: {lon}, Reserved: {is_reserved}, Disabled: {is_disabled}")
    return data


if __name__ == "__main__":
    file_path = "data/sample.json"
    #loop through the data folder and parse all json files
    for i, file in enumerate(os.listdir("data")):
        if file.endswith(".json"):
            file_path = os.path.join("data", file)
            parse_json_file(file_path, i)
    for i,(bike_id, timestamps) in enumerate(history.items()):
        print(f"{i}: Bike ID: {bike_id}, Timestamps: {len(timestamps )}")

    insert_into_command = insert_into_command[:-2] + ";"
    with open("insert_into_command.sql", "w") as f:
        f.write(insert_into_command)