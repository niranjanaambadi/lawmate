# tests/conftest.py

import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from fastapi.testclient import TestClient
import boto3
from moto import mock_s3, mock_dynamodb
from datetime import datetime
import uuid

from app.main import app
from app.db.database import Base, get_db
from app.db.models import User, Case, Document, AIAnalysis
from app.core.security import get_password_hash

# Test database URL (use in-memory SQLite)
TEST_DATABASE_URL = "sqlite:///:memory:"

@pytest.fixture(scope="function")
def db_engine():
    """Create test database engine."""
    engine = create_engine(
        TEST_DATABASE_URL,
        connect_args={"check_same_thread": False}
    )
    Base.metadata.create_all(bind=engine)
    yield engine
    Base.metadata.drop_all(bind=engine)

@pytest.fixture(scope="function")
def db_session(db_engine):
    """Create test database session."""
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=db_engine)
    session = TestingSessionLocal()
    yield session
    session.close()

@pytest.fixture(scope="function")
def client(db_session):
    """Create test client with database override."""
    def override_get_db():
        try:
            yield db_session
        finally:
            pass
    
    app.dependency_overrides[get_db] = override_get_db
    
    with TestClient(app) as test_client:
        yield test_client
    
    app.dependency_overrides.clear()

@pytest.fixture(scope="function")
def test_user(db_session):
    """Create test user."""
    user = User(
        id=uuid.uuid4(),
        email="test@lawmate.in",
        mobile="9876543210",
        password_hash=get_password_hash("testpassword"),
        khc_advocate_id="KHC/TEST/001",
        khc_advocate_name="Test Advocate",
        role="advocate",
        is_active=True,
        is_verified=True,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user

@pytest.fixture(scope="function")
def test_case(db_session, test_user):
    """Create test case."""
    case = Case(
        id=uuid.uuid4(),
        advocate_id=test_user.id,
        case_number="WP(C) 123/2026",
        efiling_number="EKHC/2026/WPC/00123",
        case_type="WP(C)",
        case_year=2026,
        party_role="petitioner",
        petitioner_name="John Doe",
        respondent_name="State of Kerala",
        efiling_date=datetime(2026, 1, 5),
        status="pending",
        is_visible=True,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    db_session.add(case)
    db_session.commit()
    db_session.refresh(case)
    return case

@pytest.fixture(scope="function")
def test_document(db_session, test_case):
    """Create test document."""
    document = Document(
        id=uuid.uuid4(),
        case_id=test_case.id,
        khc_document_id="DOC001",
        category="case_file",
        title="Main Petition",
        s3_key=f"KHC-TEST-001/WPC-123-2026/case_file/petition.pdf",
        s3_bucket="test-bucket",
        file_size=1024000,
        upload_status="completed",
        uploaded_at=datetime.utcnow(),
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    db_session.add(document)
    db_session.commit()
    db_session.refresh(document)
    return document

@pytest.fixture(scope="function")
def auth_headers(client, test_user):
    """Get authentication headers for test user."""
    response = client.post(
        "/api/v1/auth/login",
        json={
            "email": test_user.email,
            "password": "testpassword"
        }
    )
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}

@pytest.fixture(scope="function")
def mock_s3_bucket():
    """Create mock S3 bucket for testing."""
    with mock_s3():
        s3 = boto3.client('s3', region_name='ap-south-1')
        s3.create_bucket(
            Bucket='test-bucket',
            CreateBucketConfiguration={'LocationConstraint': 'ap-south-1'}
        )
        yield s3

@pytest.fixture(scope="function")
def mock_dynamodb_table():
    """Create mock DynamoDB table for testing."""
    with mock_dynamodb():
        dynamodb = boto3.resource('dynamodb', region_name='ap-south-1')
        table = dynamodb.create_table(
            TableName='test-activity-trail',
            KeySchema=[
                {'AttributeName': 'user_id', 'KeyType': 'HASH'},
                {'AttributeName': 'timestamp', 'KeyType': 'RANGE'}
            ],
            AttributeDefinitions=[
                {'AttributeName': 'user_id', 'AttributeType': 'S'},
                {'AttributeName': 'timestamp', 'AttributeType': 'N'}
            ],
            BillingMode='PAY_PER_REQUEST'
        )
        yield table