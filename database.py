import os
import pathlib
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

def get_db_file_path() -> pathlib.Path:
    workspace_db = pathlib.Path(__file__).parent.resolve() / "beyooneek.db"
    try:
        # Check if local directory is writable
        with open(workspace_db, "a"):
            pass
        return workspace_db
    except (PermissionError, OSError):
        temp_dir = pathlib.Path(os.environ.get("TEMP", ".")) / "beyooneek_ott"
        temp_dir.mkdir(parents=True, exist_ok=True)
        return temp_dir / "beyooneek.db"

DB_FILE = get_db_file_path()
DATABASE_URL = f"sqlite:///{DB_FILE.as_posix()}"

engine = create_engine(
    DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
