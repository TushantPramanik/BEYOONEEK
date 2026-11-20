import os
import pathlib
import hashlib
from typing import Optional, List
from fastapi import FastAPI, Depends, HTTPException, Query, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
from sqlalchemy.orm import Session
from datetime import datetime

from database import engine, get_db, Base
from models import User, Movie, WatchHistory, Watchlist, PaymentTransaction
from schemas import (
    UserRegister, UserLogin, UserResponse,
    PlanUpgradeRequest, PlanInfo,
    MovieResponse, HistoryUpdateRequest, HistoryResponse, WatchlistToggleRequest
)
from seed_data import seed_database

# Ensure database tables exist and are seeded
seed_database()

app = FastAPI(
    title="BEYOONEEK OTT Platform",
    description="Futuristic, Next-Generation Web Streaming Platform",
    version="2.0.0"
)

# Enable CORS for rich interactions
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

STATIC_DIR = pathlib.Path(__file__).parent.resolve() / "static"

def hash_pw(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

# ----------------- SUBSCRIPTION PLANS (B_account_type.py) -----------------
PLANS = [
    {
        "id": 1,
        "name": "Free Plan",
        "price": 0.0,
        "badge": "FREE",
        "resolution": "Standard Definition (480p)",
        "screens": 1,
        "ads": True,
        "features": [
            "Standard quality streaming (480p)",
            "Watch with ads",
            "1 concurrent active screen",
            "Standard sound output",
            "Access to selected library"
        ]
    },
    {
        "id": 2,
        "name": "Silver Plan",
        "price": 10.0,
        "badge": "HD",
        "resolution": "High Definition (720p/1080p)",
        "screens": 1,
        "ads": False,
        "features": [
            "HD quality streaming (1080p)",
            "100% Ad-free streaming",
            "1 active screen",
            "Dolby Digital 5.1 audio",
            "Full library access",
            "Offline downloads on 1 device"
        ]
    },
    {
        "id": 3,
        "name": "Gold Plan",
        "price": 15.0,
        "badge": "FULL HD",
        "resolution": "Full HD (1080p 60fps)",
        "screens": 2,
        "ads": False,
        "features": [
            "Full HD quality (1080p 60fps)",
            "100% Ad-free streaming",
            "2 concurrent active screens",
            "Dolby Atmos audio experience",
            "Full library + Early VIP access",
            "Offline downloads on 2 devices"
        ]
    },
    {
        "id": 4,
        "name": "Platinum Plan",
        "price": 20.0,
        "badge": "4K ULTRA HD",
        "resolution": "4K Ultra HD + HDR10 + Dolby Vision",
        "screens": 4,
        "ads": False,
        "features": [
            "Ultra HD (4K) + HDR10 & Dolby Vision",
            "100% Ad-free streaming",
            "4 concurrent active screens",
            "Spatial Audio & Dolby Atmos",
            "Exclusive Premieres & Live Events",
            "Unlimited downloads on 4 devices"
        ]
    }
]

# ----------------- AUTH APIS (A_main.py) -----------------

@app.post("/api/auth/register", response_model=UserResponse)
def register_user(req: UserRegister, db: Session = Depends(get_db)):
    if req.password != req.confirm_password:
        raise HTTPException(status_code=400, detail="Passwords do not match. Confirm your password carefully.")
    
    if len(req.username.strip()) < 3:
        raise HTTPException(status_code=400, detail="Username must be at least 3 characters.")
        
    existing = db.query(User).filter(User.username == req.username.strip()).first()
    if existing:
        raise HTTPException(status_code=400, detail="Username already exists. Please login or choose another.")
        
    new_user = User(
        username=req.username.strip(),
        password_hash=hash_pw(req.password),
        plan_name="Free Plan",
        avatar="avatar-cyber-1"
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@app.post("/api/auth/login", response_model=UserResponse)
def login_user(req: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == req.username.strip()).first()
    if not user:
        raise HTTPException(status_code=404, detail="Username not found. You are not registered yet.")
        
    if user.password_hash != hash_pw(req.password):
        raise HTTPException(status_code=400, detail="Wrong password. Try again.")
        
    return user

@app.get("/api/auth/me", response_model=UserResponse)
def get_current_user_profile(username: str = Query(...), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == username.strip()).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@app.post("/api/auth/avatar")
def update_avatar(username: str = Query(...), avatar: str = Query(...), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == username.strip()).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.avatar = avatar
    db.commit()
    return {"message": "Avatar updated successfully", "avatar": avatar}

# ----------------- SUBSCRIPTION APIS (B_account_type.py) -----------------

@app.get("/api/plans")
def get_plans():
    return {"plans": PLANS}

@app.post("/api/subscription/upgrade", response_model=UserResponse)
def upgrade_plan(req: PlanUpgradeRequest, username: str = Query(...), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == username.strip()).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    # Check plan validity
    plan_found = next((p for p in PLANS if p["name"].lower() == req.plan_name.lower()), None)
    if not plan_found:
        raise HTTPException(status_code=400, detail="Invalid plan selection.")
        
    # Process simulated purchase transaction
    tx = PaymentTransaction(
        user_id=user.id,
        plan_name=plan_found["name"],
        amount=plan_found["price"],
        payment_method=req.payment_method or "Credit Card",
        status="SUCCESS",
        created_at=datetime.utcnow()
    )
    db.add(tx)
    
    user.plan_name = plan_found["name"]
    db.commit()
    db.refresh(user)
    return user

# ----------------- MOVIES APIS (D_trending.py & E_explore.py) -----------------

@app.get("/api/movies")
def get_movies(
    category: Optional[str] = None,
    genre: Optional[str] = None,
    search: Optional[str] = None,
    trending_only: bool = False,
    explore_only: bool = False,
    db: Session = Depends(get_db)
):
    query = db.query(Movie)
    
    if category and category.lower() != "all":
        query = query.filter(Movie.category.ilike(category))
        
    if trending_only:
        query = query.filter(Movie.is_trending == True).order_by(Movie.rank_trending.asc().nullslast())
        
    if explore_only:
        query = query.filter(Movie.is_explore == True)
        
    if genre and genre.lower() != "all":
        query = query.filter(Movie.genres.ilike(f"%{genre}%"))
        
    if search:
        s = f"%{search.strip()}%"
        query = query.filter(
            (Movie.title.ilike(s)) | 
            (Movie.cast.ilike(s)) | 
            (Movie.director.ilike(s)) | 
            (Movie.genres.ilike(s))
        )
        
    movies = query.all()
    return {"total": len(movies), "movies": movies}

@app.get("/api/movies/hero")
def get_hero_movies(db: Session = Depends(get_db)):
    # Curate high-impact marquee movies for hero banner
    hero_titles = ["Chhaava", "Mission: Impossible - The Final Reckoning", "Superman", "Dhurandhar", "Avatar", "Oppenheimer"]
    movies = db.query(Movie).filter(Movie.title.in_(hero_titles)).all()
    return {"hero_movies": movies}

@app.get("/api/movies/trending")
def get_trending_categorized(db: Session = Depends(get_db)):
    """Matches D_trending.py: Bollywood Top 10 and Hollywood Top 10"""
    bollywood_trending = (
        db.query(Movie)
        .filter(Movie.category == "Bollywood", Movie.is_trending == True)
        .order_by(Movie.rank_trending.asc())
        .limit(10)
        .all()
    )
    hollywood_trending = (
        db.query(Movie)
        .filter(Movie.category == "Hollywood", Movie.is_trending == True)
        .order_by(Movie.rank_trending.asc())
        .limit(10)
        .all()
    )
    return {
        "bollywood_trending": bollywood_trending,
        "hollywood_trending": hollywood_trending
    }

@app.get("/api/movies/explore")
def get_explore_categorized(db: Session = Depends(get_db)):
    """Matches E_explore.py: Explore Bollywood and Explore Hollywood"""
    bollywood_explore = (
        db.query(Movie)
        .filter(Movie.category == "Bollywood", Movie.is_explore == True)
        .all()
    )
    hollywood_explore = (
        db.query(Movie)
        .filter(Movie.category == "Hollywood", Movie.is_explore == True)
        .all()
    )
    return {
        "bollywood_explore": bollywood_explore,
        "hollywood_explore": hollywood_explore
    }

@app.get("/api/movies/{movie_id}")
def get_movie_detail(movie_id: int, db: Session = Depends(get_db)):
    movie = db.query(Movie).filter(Movie.id == movie_id).first()
    if not movie:
        raise HTTPException(status_code=404, detail="Movie not found")
        
    # Get similar recommendations based on category and genres
    first_genre = movie.genres.split(",")[0].strip() if movie.genres else ""
    similar = (
        db.query(Movie)
        .filter(Movie.id != movie.id, (Movie.category == movie.category) | (Movie.genres.ilike(f"%{first_genre}%")))
        .limit(6)
        .all()
    )
    return {
        "movie": movie,
        "similar": similar
    }

# ----------------- CONTINUE WATCHING & HISTORY (F_continue_watching.py & C_dashboard.py) -----------------

@app.get("/api/history")
def get_user_history(username: str = Query(...), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == username.strip()).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    history_records = (
        db.query(WatchHistory)
        .filter(WatchHistory.user_id == user.id)
        .order_by(WatchHistory.last_watched_at.desc())
        .all()
    )
    
    result = []
    for h in history_records:
        result.append({
            "id": h.id,
            "movie_id": h.movie_id,
            "movie": h.movie,
            "progress_seconds": h.progress_seconds,
            "duration_seconds": h.duration_seconds,
            "progress_percentage": h.progress_percentage,
            "last_watched_at": h.last_watched_at.isoformat()
        })
        
    return {"history": result}

@app.post("/api/history/update")
def update_user_history(req: HistoryUpdateRequest, username: str = Query(...), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == username.strip()).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    movie = db.query(Movie).filter(Movie.id == req.movie_id).first()
    if not movie:
        raise HTTPException(status_code=404, detail="Movie not found")
        
    entry = db.query(WatchHistory).filter(
        WatchHistory.user_id == user.id,
        WatchHistory.movie_id == req.movie_id
    ).first()
    
    pct = int((req.progress_seconds / max(req.duration_seconds, 1)) * 100)
    pct = min(max(pct, 1), 100)
    
    if entry:
        entry.progress_seconds = req.progress_seconds
        entry.duration_seconds = req.duration_seconds
        entry.progress_percentage = pct
        entry.last_watched_at = datetime.utcnow()
    else:
        entry = WatchHistory(
            user_id=user.id,
            movie_id=req.movie_id,
            progress_seconds=req.progress_seconds,
            duration_seconds=req.duration_seconds,
            progress_percentage=pct,
            last_watched_at=datetime.utcnow()
        )
        db.add(entry)
        
    db.commit()
    return {"message": "Watch progress updated", "progress_percentage": pct}

@app.delete("/api/history/{movie_id}")
def delete_history_item(movie_id: int, username: str = Query(...), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == username.strip()).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    entry = db.query(WatchHistory).filter(
        WatchHistory.user_id == user.id,
        WatchHistory.movie_id == movie_id
    ).first()
    
    if entry:
        db.delete(entry)
        db.commit()
        return {"message": "Removed from continue watching"}
    return {"message": "Item not found in history"}

# ----------------- WATCHLIST APIS -----------------

@app.get("/api/watchlist")
def get_user_watchlist(username: str = Query(...), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == username.strip()).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    items = (
        db.query(Watchlist)
        .filter(Watchlist.user_id == user.id)
        .order_by(Watchlist.created_at.desc())
        .all()
    )
    movies = [i.movie for i in items if i.movie]
    return {"watchlist": movies}

@app.post("/api/watchlist/toggle")
def toggle_watchlist(req: WatchlistToggleRequest, username: str = Query(...), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == username.strip()).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    movie = db.query(Movie).filter(Movie.id == req.movie_id).first()
    if not movie:
        raise HTTPException(status_code=404, detail="Movie not found")
        
    existing = db.query(Watchlist).filter(
        Watchlist.user_id == user.id,
        Watchlist.movie_id == req.movie_id
    ).first()
    
    if existing:
        db.delete(existing)
        db.commit()
        return {"in_watchlist": False, "message": f"Removed '{movie.title}' from My List"}
    else:
        new_item = Watchlist(user_id=user.id, movie_id=req.movie_id)
        db.add(new_item)
        db.commit()
        return {"in_watchlist": True, "message": f"Added '{movie.title}' to My List"}

# ----------------- STATIC ASSETS & ROOT SPA -----------------

# Mount static folder
if STATIC_DIR.exists():
    app.mount("/static", StaticFiles(directory=str(STATIC_DIR)), name="static")

@app.get("/")
def serve_index():
    index_file = STATIC_DIR / "index.html"
    if index_file.exists():
        return FileResponse(str(index_file))
    return JSONResponse(
        content={
            "status": "online",
            "platform": "BEYOONEEK OTT",
            "message": "FastAPI backend running. Please create static/index.html to view the front end."
        }
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="127.0.0.1", port=8000, reload=True)
