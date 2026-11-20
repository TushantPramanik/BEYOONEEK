from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel

# Auth Schemas
class UserRegister(BaseModel):
    username: str
    password: str
    confirm_password: str

class UserLogin(BaseModel):
    username: str
    password: str

class UserResponse(BaseModel):
    id: int
    username: str
    plan_name: str
    avatar: str

    class Config:
        from_attributes = True

# Plan Schemas
class PlanUpgradeRequest(BaseModel):
    plan_name: str
    payment_method: Optional[str] = "Credit Card"
    card_number: Optional[str] = None
    upi_id: Optional[str] = None

class PlanInfo(BaseModel):
    id: int
    name: str
    price: float
    resolution: str
    screens: int
    ads: bool
    features: List[str]

# Movie Schemas
class MovieResponse(BaseModel):
    id: int
    title: str
    category: str
    is_trending: bool
    is_explore: bool
    rank_trending: Optional[int]
    year: int
    duration: str
    duration_seconds: int
    rating: float
    match_pct: int
    maturity_rating: str
    genres: str
    description: str
    cast: str
    director: str
    poster_url: str
    backdrop_url: str
    video_url: str
    trailer_url: str
    quality: str
    audio_languages: str
    subtitles: str

    class Config:
        from_attributes = True

# History & Watchlist Schemas
class HistoryUpdateRequest(BaseModel):
    movie_id: int
    progress_seconds: int
    duration_seconds: int

class HistoryResponse(BaseModel):
    id: int
    movie_id: int
    movie: MovieResponse
    progress_seconds: int
    duration_seconds: int
    progress_percentage: int
    last_watched_at: datetime

    class Config:
        from_attributes = True

class WatchlistToggleRequest(BaseModel):
    movie_id: int
