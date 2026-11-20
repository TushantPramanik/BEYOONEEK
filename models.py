from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, Boolean, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    plan_name = Column(String(50), default="Free Plan")
    avatar = Column(String(255), default="avatar-1")
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    history = relationship("WatchHistory", back_populates="user", cascade="all, delete-orphan")
    watchlist = relationship("Watchlist", back_populates="user", cascade="all, delete-orphan")
    transactions = relationship("PaymentTransaction", back_populates="user", cascade="all, delete-orphan")

class Movie(Base):
    __tablename__ = "movies"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(100), unique=True, index=True, nullable=False)
    category = Column(String(50), index=True)  # "Bollywood" or "Hollywood"
    is_trending = Column(Boolean, default=False)
    is_explore = Column(Boolean, default=False)
    rank_trending = Column(Integer, nullable=True)  # 1 to 10 for Top 10 rank
    year = Column(Integer, default=2024)
    duration = Column(String(20), default="2h 15m")
    duration_seconds = Column(Integer, default=8100)
    rating = Column(Float, default=8.5)
    match_pct = Column(Integer, default=95)
    maturity_rating = Column(String(20), default="U/A 16+")
    genres = Column(String(100), default="Action, Drama")
    description = Column(Text, default="")
    cast = Column(String(255), default="")
    director = Column(String(100), default="")
    poster_url = Column(String(500), default="")
    backdrop_url = Column(String(500), default="")
    video_url = Column(String(500), default="")
    trailer_url = Column(String(500), default="")
    quality = Column(String(50), default="4K Ultra HD")
    audio_languages = Column(String(100), default="Hindi, English")
    subtitles = Column(String(100), default="English, Hindi")

    # Relationships
    history_entries = relationship("WatchHistory", back_populates="movie", cascade="all, delete-orphan")
    watchlist_entries = relationship("Watchlist", back_populates="movie", cascade="all, delete-orphan")

class WatchHistory(Base):
    __tablename__ = "watch_history"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    movie_id = Column(Integer, ForeignKey("movies.id"), nullable=False)
    progress_seconds = Column(Integer, default=0)
    duration_seconds = Column(Integer, default=1)
    progress_percentage = Column(Integer, default=0)
    last_watched_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="history")
    movie = relationship("Movie", back_populates="history_entries")

class Watchlist(Base):
    __tablename__ = "watchlist"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    movie_id = Column(Integer, ForeignKey("movies.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="watchlist")
    movie = relationship("Movie", back_populates="watchlist_entries")

class PaymentTransaction(Base):
    __tablename__ = "payment_transactions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    plan_name = Column(String(50), nullable=False)
    amount = Column(Float, nullable=False)
    payment_method = Column(String(50), default="Credit Card")
    status = Column(String(50), default="SUCCESS")
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="transactions")
