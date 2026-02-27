from pydantic_settings import BaseSettings
from typing import List, Union
import json

class Settings(BaseSettings):
    # API Settings
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "AI Market Pulse"
    
    # CORS - Can be a JSON string or a list
    CORS_ORIGINS: Union[List[str], str] = [
        "http://localhost:3000",
        "http://localhost:8000",
    ]
    
    # Database
    DATABASE_URL: str = "postgresql://admin:password@localhost:5432/aimarketpulse"
    
    # JWT
    SECRET_KEY: str = "your-secret-key-change-this-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    # AWS
    AWS_REGION: str = "ap-south-1"
    AWS_ACCESS_KEY_ID: str = ""
    AWS_SECRET_ACCESS_KEY: str = ""
    S3_BUCKET_RAW_DATA: str = "ai-market-pulse-raw-data"
    S3_BUCKET_PROCESSED_DATA: str = "ai-market-pulse-processed-data"
    
    # Redis
    REDIS_HOST: str = "localhost"
    REDIS_PORT: int = 6379
    
    # Environment
    ENVIRONMENT: str = "development"
    
    class Config:
        env_file = ".env"
        case_sensitive = True
        extra = "allow"  # Allow extra fields from .env
    
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        # Convert CORS_ORIGINS string to list if needed
        if isinstance(self.CORS_ORIGINS, str):
            try:
                self.CORS_ORIGINS = json.loads(self.CORS_ORIGINS)
            except json.JSONDecodeError:
                # If it's a simple string like "*", wrap it in a list
                self.CORS_ORIGINS = [self.CORS_ORIGINS]

settings = Settings()
