# import sys
# sys.path.append('.')
# from app.db.database import SessionLocal
# from app.db.models import User
# from passlib.context import CryptContext

# pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
# db = SessionLocal()

# user = User(
#     email="test@lawmate.in",
#     password_hash=pwd_context.hash("Test@123456"),
#     khc_advocate_id="KHC/001/2020",
#     khc_advocate_name="Test Advocate",
#     mobile="+919876543210",
#     role="advocate",
#     is_active=True,
#     is_verified=True
# )
# db.add(user)
# db.commit()
# print("✅ User created: test@lawmate.in / Test@123456")

# scripts/create_test_user.py
import sys
sys.path.append('.')
from app.db.database import SessionLocal
from app.db.models import User
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
db = SessionLocal()

# Delete existing user if exists
existing = db.query(User).filter(User.email == "test@lawmate.in").first()
if existing:
    db.delete(existing)
    db.commit()
    print("Deleted existing user")

user = User(
    email="test@lawmate.in",
    password_hash=pwd_context.hash("Test@123456"),
    khc_advocate_id="KHC/001/2020",
    khc_advocate_name="Test Advocate",
    mobile="+919876543210",
    role="advocate",  # ← Changed to lowercase
    is_active=True,
    is_verified=True
)
db.add(user)
db.commit()
print("✅ User created: test@lawmate.in / Test@123456")
db.close()