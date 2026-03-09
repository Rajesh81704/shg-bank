from app.api.database import engine
from sqlalchemy import text

tables = ['users', 'payments', 'loans']

try:
    with engine.connect() as connection:
        for table in tables:
            print(f"\n--- Fixing {table} table ---")
            
            # Check if sequence exists
            result = connection.execute(text(f"""
                SELECT EXISTS (
                    SELECT 1 FROM pg_class WHERE relname = '{table}_id_seq'
                )
            """))
            sequence_exists = result.fetchone()[0]
            
            if not sequence_exists:
                print(f"Creating sequence for {table}.id...")
                connection.execute(text(f"CREATE SEQUENCE {table}_id_seq"))
                connection.commit()
            else:
                print(f"Sequence {table}_id_seq already exists")
            
            # Set the sequence as default for id column
            print(f"Setting default value for {table}.id...")
            connection.execute(text(f"""
                ALTER TABLE {table} 
                ALTER COLUMN id SET DEFAULT nextval('{table}_id_seq')
            """))
            connection.commit()
            
            # Set the sequence ownership
            print(f"Setting sequence ownership...")
            connection.execute(text(f"ALTER SEQUENCE {table}_id_seq OWNED BY {table}.id"))
            connection.commit()
            
            # Sync sequence with current max id
            print(f"Syncing sequence with current data...")
            connection.execute(text(f"""
                SELECT setval('{table}_id_seq', COALESCE((SELECT MAX(id) FROM {table}), 0) + 1, false)
            """))
            connection.commit()
            
            print(f"✓ {table} table fixed successfully!")
        
        print("\n✓ All tables fixed successfully!")
        
except Exception as e:
    print(f"✗ Failed to fix tables: {e}")
