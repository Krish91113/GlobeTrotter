from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse
from recommender import ActivityRecommender
from schemas import (
    RecommendationRequest,
    RecommendationResponse
)

recommender = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    global recommender
    print("Loading recommendation engine...")
    recommender = ActivityRecommender("Travel_Dataset.xlsx")
    print(f"Loaded {len(recommender.data)} activities")
    yield
    recommender = None
    print("Recommendation engine stopped.")

# 1. First, create the 'app'
app = FastAPI(
    title="GlobeTrotter Recommendation Engine",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Or specify your frontend URL e.g., ["http://localhost:3000"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 2. Now you can use @app.get because 'app' exists!
@app.get("/", include_in_schema=False)
def root():
    # Redirects the root URL to the Swagger UI docs
    return RedirectResponse(url="/docs")


@app.get("/health")
def health():
    return {
        "status": "ok",
        "service": "recommendation-engine"
    }


@app.post(
    "/recommendations/activities",
    response_model=RecommendationResponse
)
def recommend_activities(
    request: RecommendationRequest
):
    recommendations = recommender.recommend_api(
        city=request.city,
        interests=request.interests,
        budget=request.budget,
        available_minutes=request.available_minutes,
        already_selected=request.already_selected,
        limit=request.limit
    )

    return {
        "recommendations": recommendations
    }


@app.get("/catalog")
def get_catalog(query: str = None, category: str = None, limit: int = 50):
    # Safety check if data isn't loaded yet
    if recommender is None or recommender.data is None:
        return {"activities": []}
        
    df = recommender.data.copy()
    
    # 1. Filter by Search Query (checks name and category)
    if query:
        mask = (
            df["Destination Name"].str.contains(query, case=False, na=False) | 
            df["Primary Category"].str.contains(query, case=False, na=False)
        )
        df = df[mask]
        
    # 2. Filter by Category tab
    if category and category.lower() != "all":
        df = df[df["Primary Category"].str.lower() == category.lower()]
        
    # 3. Limit results so the browser doesn't lag
    df = df.head(limit)
    
    # 4. Format the output for React
    results = []
    for _, row in df.iterrows():
        results.append({
            "id": str(row["Item ID"]),
            "name": str(row["Destination Name"]),
            "city": str(row["City"]),
            "category": str(row["Primary Category"]),
            "rating": float(row["Rating"]),
            "estimatedCost": float(row["Estimated Cost"]),
            "durationMinutes": float(row["Duration (mins)"])
        })
        
    return {"activities": results}