from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str
    NIMBLE_API_KEY: str = ""
    GOOGLE_PROJECT_ID: str = ""  # Should be set by user or environment
    GOOGLE_LOCATION: str = "us-central1"

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
