from contextlib import asynccontextmanager

from fastapi import FastAPI

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

    recommender = ActivityRecommender(
        "Travel_Dataset.xlsx"
    )

    print(
        f"Loaded {len(recommender.data)} activities"
    )

    yield

    recommender = None

    print("Recommendation engine stopped.")


app = FastAPI(
    title="GlobeTrotter Recommendation Engine",
    version="1.0.0",
    lifespan=lifespan
)


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