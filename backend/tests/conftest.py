import os
import tempfile

import pytest
from fastapi.testclient import TestClient

_test_database_dir = tempfile.TemporaryDirectory(prefix="voltwise-tests-")
os.environ["DATABASE_URL"] = f"sqlite:///{_test_database_dir.name}/test.db"

from app.main import app
from app.store import store


@pytest.fixture(scope="session", autouse=True)
def close_test_database():
    yield
    store.engine.dispose()
    _test_database_dir.cleanup()


@pytest.fixture
def client() -> TestClient:
    return TestClient(app)

