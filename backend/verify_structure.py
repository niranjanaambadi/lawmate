"""
Verify backend file structure
"""
from pathlib import Path

required_files = [
    "app/__init__.py",
    "app/main.py",
    "app/api/__init__.py",
    "app/api/deps.py",
    "app/api/v1/__init__.py",
    "app/api/v1/api.py",
    "app/api/v1/endpoints/__init__.py",
    "app/api/v1/endpoints/auth.py",
    "app/api/v1/endpoints/cases.py",
    "app/api/v1/endpoints/documents.py",
    "app/api/v1/endpoints/identity.py",
    "app/api/v1/endpoints/sync.py",
    "app/api/v1/endpoints/upload.py",
    "app/api/v1/endpoints/analysis.py",
    "app/api/v1/endpoints/dashboard.py",
    "app/api/v1/endpoints/sse.py",
    "app/api/v1/endpoints/subscription.py",
    "app/core/config.py",
    "app/core/security.py",
    "app/core/logger.py",
    "app/db/database.py",
    "app/db/models.py",
    "app/db/schemas.py",
    "app/services/case_service.py",
    "app/services/document_service.py",
    "app/services/s3_service.py",
    "app/services/ai_service.py",
    "app/services/audit_service.py",
    "app/services/subscription_service.py",
    "app/utils/__init__.py",
    "app/utils/validators.py",
    "app/utils/helpers.py",
    "app/utils/exceptions.py",
]

backend_dir = Path(__file__).parent
missing = []
found = []

for file in required_files:
    file_path = backend_dir / file
    if file_path.exists():
        found.append(f"✅ {file}")
    else:
        missing.append(f"❌ {file}")

print("=" * 60)
print("BACKEND FILE STRUCTURE VERIFICATION")
print("=" * 60)

if missing:
    print("\n❌ MISSING FILES:")
    for f in missing:
        print(f"   {f}")
else:
    print("\n✅ ALL FILES PRESENT!")

print(f"\nFound: {len(found)}/{len(required_files)} files")

if missing:
    print("\n🔧 Create missing files:")
    for f in missing:
        file_path = f.replace("❌ ", "")
        print(f"   touch {file_path}")