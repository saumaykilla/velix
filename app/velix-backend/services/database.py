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

    @staticmethod
    def get_brand(workspace_id: str) -> dict:
        conn = psycopg2.connect(settings.DATABASE_URL)
        try:
            with conn:
                with conn.cursor() as cur:
                    cur.execute(
                        """
                        SELECT core_mission, target_audience, personality_traits, competitor
                        FROM public.brand
                        WHERE workspace_id = %s;
                        """,
                        (workspace_id,)
                    )
                    row = cur.fetchone()
                    if not row:
                        return {}
                    return {
                        "core_mission": row[0],
                        "target_audience": row[1],
                        "personality_traits": row[2],
                        "competitor": row[3],
                    }
        except Exception as e:
            raise Exception(f"Failed to fetch brand: {str(e)}")
        finally:
            conn.close()

    @staticmethod
    def create_campaign_transaction(
        workspace_id: str,
        name: str,
        targeted_platforms: list,
        purpose: str,
        strategy: dict,
        personas: list
    ) -> str:
        import json
        import logging
        logger = logging.getLogger("database")
        db_input = {
            "workspace_id": workspace_id,
            "name": name,
            "targeted_platforms": targeted_platforms,
            "purpose": purpose,
            "strategy": strategy,
            "personas": personas
        }
        logger.info("Database Insert Transaction Input JSON:\n%s", json.dumps(db_input, indent=2))
        
        conn = psycopg2.connect(settings.DATABASE_URL)
        try:
            with conn:
                with conn.cursor() as cur:
                    # 1. Insert campaign
                    cur.execute(
                        """
                        INSERT INTO public.campaign (workspace_id, name, targeted_platform, purpose)
                        VALUES (%s, %s, %s::public.platform_type[], %s)
                        RETURNING id;
                        """,
                        (workspace_id, name, targeted_platforms, purpose)
                    )
                    campaign_id = cur.fetchone()[0]

                    # 2. Insert strategy
                    cur.execute(
                        """
                        INSERT INTO public.strategy (campaign_id, objective, kpis)
                        VALUES (%s, %s, %s);
                        """,
                        (campaign_id, strategy.get("objective"), Json(strategy.get("kpis", [])))
                    )

                    # 3. Insert personas
                    for persona in personas:
                        cur.execute(
                            """
                            INSERT INTO public.persona (campaign_id, name, role, demographics, motivations, pain_points)
                            VALUES (%s, %s, %s, %s, %s, %s);
                            """,
                            (
                                campaign_id,
                                persona.get("name"),
                                persona.get("role"),
                                Json(persona.get("demographics", {})),
                                persona.get("motivations", []),
                                persona.get("pain_points", [])
                            )
                        )

                    return str(campaign_id)
        except Exception as e:
            raise Exception(f"Database campaign transaction failed: {str(e)}")
        finally:
            conn.close()

    @staticmethod
    def get_strategy(campaign_id: str) -> dict:
        conn = psycopg2.connect(settings.DATABASE_URL)
        try:
            with conn:
                with conn.cursor() as cur:
                    cur.execute(
                        """
                        SELECT objective, kpis
                        FROM public.strategy
                        WHERE campaign_id = %s;
                        """,
                        (campaign_id,)
                    )
                    row = cur.fetchone()
                    if not row:
                        return {}
                    return {
                        "objective": row[0],
                        "kpis": row[1]
                    }
        except Exception as e:
            raise Exception(f"Failed to fetch strategy: {str(e)}")
        finally:
            conn.close()

    @staticmethod
    def get_personas(campaign_id: str) -> list:
        conn = psycopg2.connect(settings.DATABASE_URL)
        try:
            with conn:
                with conn.cursor() as cur:
                    cur.execute(
                        """
                        SELECT name, role, demographics, motivations, pain_points
                        FROM public.persona
                        WHERE campaign_id = %s;
                        """,
                        (campaign_id,)
                    )
                    rows = cur.fetchall()
                    personas = []
                    for row in rows:
                        personas.append({
                            "name": row[0],
                            "role": row[1],
                            "demographics": row[2],
                            "motivations": row[3],
                            "pain_points": row[4]
                        })
                    return personas
        except Exception as e:
            raise Exception(f"Failed to fetch personas: {str(e)}")
        finally:
            conn.close()

    @staticmethod
    def insert_asset(
        campaign_id: str,
        platform: str,
        asset_type: str,
        media_url: str,
        caption: str = "",
        status: str = "approved",
        notes: str = ""
    ) -> str:
        conn = psycopg2.connect(settings.DATABASE_URL)
        try:
            with conn:
                with conn.cursor() as cur:
                    cur.execute(
                        """
                        INSERT INTO public.asset (campaign_id, platform, asset_type, media_url, caption, status, notes, is_deleted)
                        VALUES (%s, %s::public.platform_type, %s::public.asset_type_enum, %s, %s, %s::public.asset_status_enum, %s, false)
                        RETURNING id;
                        """,
                        (campaign_id, platform, asset_type, media_url, caption, status, notes)
                    )
                    asset_id = cur.fetchone()[0]
                    return str(asset_id)
        except Exception as e:
            raise Exception(f"Failed to insert asset: {str(e)}")
        finally:
            conn.close()

    @staticmethod
    def get_campaign_notes_and_previous_assets(campaign_id: str) -> dict:
        conn = psycopg2.connect(settings.DATABASE_URL)
        try:
            with conn:
                with conn.cursor() as cur:
                    # 1. Fetch campaign purpose
                    cur.execute(
                        """
                        SELECT purpose FROM public.campaign WHERE id = %s;
                        """,
                        (campaign_id,)
                    )
                    row = cur.fetchone()
                    purpose = row[0] if row else ""
                    
                    # 2. Fetch last 10 assets
                    cur.execute(
                        """
                        SELECT caption, notes, media_url
                        FROM public.asset
                        WHERE campaign_id = %s AND is_deleted = false AND asset_type = 'image'
                        ORDER BY id DESC
                        LIMIT 10;
                        """,
                        (campaign_id,)
                    )
                    rows = cur.fetchall()
                    previous_assets = []
                    for r in rows:
                        previous_assets.append({
                            "caption": r[0],
                            "notes": r[1],
                            "media_url": r[2]
                        })
                    return {
                        "purpose": purpose,
                        "previous_assets": previous_assets
                    }
        except Exception as e:
            raise Exception(f"Failed to fetch campaign notes and previous assets: {str(e)}")
        finally:
            conn.close()

