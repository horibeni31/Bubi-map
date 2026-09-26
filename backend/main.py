from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

app = FastAPI()


# Data model
class User(BaseModel):
    name: str
    email: str


# Temporary in-memory database
users = {}


# GET /users
@app.get("/users")
def get_users():
    return users


# GET /users/{user_id}
@app.get("/users/{user_id}")
def get_user(user_id: int):
    if user_id not in users:
        raise HTTPException(status_code=404, detail="User not found")

    return users[user_id]


# POST /users
@app.post("/users")
def create_user(user: User):
    user_id = len(users) + 1
    users[user_id] = user

    return {
        "id": user_id,
        "user": user
    }


# PUT /users/{user_id}
@app.put("/users/{user_id}")
def update_user(user_id: int, user: User):
    if user_id not in users:
        raise HTTPException(status_code=404, detail="User not found")

    users[user_id] = user

    return {
        "id": user_id,
        "user": user
    }


# DELETE /users/{user_id}
@app.delete("/users/{user_id}")
def delete_user(user_id: int):
    if user_id not in users:
        raise HTTPException(status_code=404, detail="User not found")

    del users[user_id]

    return {"message": "User deleted"}
