from app.api.database import engine
from sqlalchemy import text
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Hash the password
hashed_password = pwd_context.hash("5555")

try:
    with engine.connect() as connection:
        # Insert admin user
        connection.execute(
            text("""
                INSERT INTO public.users(id, phone, name, password, is_admin, join_date, is_active)
                VALUES(:id, :phone, :name, :password, :is_admin, now(), :is_active)
                ON CONFLICT (id) DO NOTHING
            """),
            {
                "id": 0,
                "phone": "9315341037",
                "name": "admin",
                "password": hashed_password,
                "is_admin": True,
                "is_active": True
            }
        )
        connection.commit()
        print("✓ Admin user created successfully!")
        print("Phone: 9315341037")
        print("Password: 5555")
except Exception as e:
    print(f"✗ Failed to create admin user: {e}")
