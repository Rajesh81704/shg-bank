from app.api.database import engine
from sqlalchemy import text

try:
    with engine.connect() as connection:
        # Check if sequence exists
        result = connection.execute(text("""
            SELECT EXISTS (
                SELECT 1 FROM pg_class WHERE relname = 'users_id_seq'
            )
        """))
        sequence_exists = result.fetchone()[0]
        
        if not sequence_exists:
            print("Creating sequence for users.id...")
            connection.execute(text("CREATE SEQUENCE users_id_seq"))
            connection.commit()
        
        # Set the sequence as default for id column
        print("Setting default value for users.id...")
        connection.execute(text("""
            ALTER TABLE users 
            ALTER COLUMN id SET DEFAULT nextval('users_id_seq')
        """))
        connection.commit()
        
        # Set the sequence ownership
        print("Setting sequence ownership...")
        connection.execute(text("ALTER SEQUENCE users_id_seq OWNED BY users.id"))
        connection.commit()
        
        # Sync sequence with current max id
        print("Syncing sequence with current data...")
        connection.execute(text("""
            SELECT setval('users_id_seq', COALESCE((SELECT MAX(id) FROM users), 0) + 1, false)
        """))
        connection.commit()
        
        print("✓ Users table fixed successfully!")
        
except Exception as e:
    print(f"✗ Failed to fix users table: {e}")
