# GlobeTrotter recommendation engine

FastAPI service for scoring and ranking travel activities using TF-IDF content filtering and multi-factor ranking (rating, cost, duration, popularity, and diversity).

## Requirements

- Python 3.10+
- Dependencies listed in `requirements.txt`

## Installation

From the `recommendation-engine/` directory, install the required packages:

```powershell
python -m pip install -r requirements.txt
```

## Running the service locally

Start the FastAPI server using Uvicorn:

```powershell
python -m uvicorn main:app --reload --port 8000
```

When started, the server loads `Travel_Dataset.xlsx` into memory and initializes the TF-IDF feature matrix.

## Viewing Swagger documentation

Once the server is running, open the interactive API docs in your browser:

- Swagger UI: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- ReDoc: [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc)

## API endpoints

### 1. Health check

- **Method:** `GET`
- **Path:** `/health`
- **Response:**
  ```json
  {
    "status": "ok",
    "service": "recommendation-engine"
  }
  ```

### 2. Activity recommendations

- **Method:** `POST`
- **Path:** `/recommendations/activities`
- **Request payload:**
  ```json
  {
    "city": "Paris",
    "interests": ["history", "photography", "art", "architecture"],
    "budget": 60.0,
    "available_minutes": 360,
    "already_selected": [],
    "limit": 8
  }
  ```
- **Response payload:**
  ```json
  {
    "recommendations": [
      {
        "activity_id": "ITEM-0012",
        "name": "Montmartre & Place du Tertre Walking Tour",
        "city": "Paris",
        "country": "FR",
        "category": "Neighborhood Walk",
        "tags": "Walking Tour, Photo Spot, Romantic, Art Culture",
        "rating": 4.7,
        "estimated_cost": 0.0,
        "currency": "EUR",
        "duration_minutes": 120.0,
        "score": 0.67
      }
    ]
  }
  ```

## Running the standalone CLI script

You can also run the recommender directly in your terminal without the web server:

```powershell
python recommender.py
```
