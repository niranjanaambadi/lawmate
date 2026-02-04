"""
Test all imports are working
"""
import sys
from pathlib import Path

# Add backend to path
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

print("Testing imports...\n")

try:
    print("1. Testing app.core.config...")
    from app.core.config import settings
    print(f"   ✅ Settings loaded: {settings.APP_NAME}")
except Exception as e:
    print(f"   ❌ Error: {e}")

try:
    print("2. Testing app.core.security...")
    from app.core.security import get_password_hash
    print(f"   ✅ Security functions loaded")
except Exception as e:
    print(f"   ❌ Error: {e}")

try:
    print("3. Testing app.db.database...")
    from app.db.database import get_db
    print(f"   ✅ Database connection loaded")
except Exception as e:
    print(f"   ❌ Error: {e}")

try:
    print("4. Testing app.db.models...")
    from app.db.models import User
    print(f"   ✅ Models loaded")
except Exception as e:
    print(f"   ❌ Error: {e}")

try:
    print("5. Testing app.api.deps...")
    from app.api.deps import get_current_user
    print(f"   ✅ Dependencies loaded")
except Exception as e:
    print(f"   ❌ Error: {e}")

try:
    print("6. Testing app.api.v1.api...")
    from app.api.v1.api import api_router
    print(f"   ✅ API router loaded")
except Exception as e:
    print(f"   ❌ Error: {e}")

try:
    print("7. Testing app.main...")
    from app.main import app
    print(f"   ✅ FastAPI app loaded")
except Exception as e:
    print(f"   ❌ Error: {e}")

print("\n" + "="*50)
print("✅ All imports successful!" if all else "❌ Some imports failed")