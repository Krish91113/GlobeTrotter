from pydantic import BaseModel, Field


class RecommendationRequest(BaseModel):
    city: str
    interests: list[str] = Field(default_factory=list)
    budget: float = Field(ge=0)
    available_minutes: int = Field(gt=0)
    already_selected: list[str] = Field(default_factory=list)
    limit: int = Field(default=8, ge=1, le=20)


class Recommendation(BaseModel):
    activity_id: str
    name: str
    city: str
    country: str
    category: str
    tags: str
    rating: float
    estimated_cost: float
    currency: str
    duration_minutes: float
    score: float


class RecommendationResponse(BaseModel):
    recommendations: list[Recommendation]