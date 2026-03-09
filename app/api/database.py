from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

load_dotenv()

# PostgreSQL connection string
DATABASE_URL = f"postgresql://{os.getenv('PGUSER')}:{os.getenv('PGPASSWORD')}@{os.getenv('PGHOST')}/{os.getenv('PGDATABASE')}?sslmode={os.getenv('PGSSLMODE', 'require')}"

engine = create_engine(DATABASE_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    """Dependency for getting database session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    """Initialize database tables"""
    Base.metadata.create_all(bind=engine)
