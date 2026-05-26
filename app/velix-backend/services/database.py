import psycopg2
from psycopg2.extras import Json
from config import settings

class DatabaseService:
    @staticmethod
    def create_workspace_and_brand(
        profile_id: str,
        workspace_name: str,
        website_url: str,
        core_mission: str,
        target_audience: str,
        personality_traits: list,
        brand_colors: dict,
        competitor: dict
    ) -> str:
        # Establish connection to PostgreSQL
        conn = psycopg2.connect(settings.DATABASE_URL)
        try:
            # psycopg2 connection context manager automatically commits on success and rolls back on exception
            with conn:
                with conn.cursor() as cur:
                    # 1. Insert into workspace table
                    cur.execute(
                        """
                        INSERT INTO public.workspace (profile_id, name, website_url)
                        VALUES (%s, %s, %s)
                        RETURNING id;
                        """,
                        (profile_id, workspace_name, website_url)
                    )
                    workspace_id = cur.fetchone()[0]

                    # 2. Insert into brand table
                    cur.execute(
                        """
                        INSERT INTO public.brand (
                            workspace_id, 
                            core_mission, 
                            target_audience, 
                            personality_traits, 
                            brand_colors, 
                            competitor
                        )
                        VALUES (%s, %s, %s, %s, %s, %s);
                        """,
                        (
                            workspace_id,
                            core_mission,
                            target_audience,
                            personality_traits,
                            Json(brand_colors),
                            Json(competitor)
                        )
                    )
                    return str(workspace_id)
        except Exception as e:
            raise Exception(f"Database transaction failed: {str(e)}")
        finally:
            conn.close()
