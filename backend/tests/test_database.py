from sqlalchemy import create_engine

from app.database import DATABASE_URL_ENV, create_database_engine, database_url
from app.store import DatabaseStore


def test_database_url_comes_from_environment(monkeypatch):
    configured = "postgresql+psycopg://voltwise:secret@db.example/voltwise"
    monkeypatch.setenv(DATABASE_URL_ENV, configured)

    assert database_url() == configured


def test_sqlite_store_persists_users_and_seeds_catalog_once(tmp_path):
    engine = create_engine(f"sqlite:///{tmp_path / 'persistent.db'}")
    first = DatabaseStore(engine)
    first.add_user("PersistentUser", "persistent-password")

    second = DatabaseStore(engine)

    assert second.authenticate("persistentuser", "persistent-password") is not None
    assert second.stats().topic_count == 12
    assert len(second.categories()) == 10
    assert len(second.standards()) == 3
    engine.dispose()


def test_in_memory_sqlite_is_shared_across_store_sessions():
    engine = create_database_engine("sqlite:///:memory:")
    repository = DatabaseStore(engine)

    assert repository.stats().topic_count == 12
    assert repository.topic("conductor-ampacity") is not None

    engine.dispose()
