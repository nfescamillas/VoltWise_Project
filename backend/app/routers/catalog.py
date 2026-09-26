from fastapi import APIRouter

from ..models import Category, DashboardStats, Standard
from ..store import store

router = APIRouter()


@router.get("/categories", response_model=list[Category], tags=["Categories"], operation_id="getCategories")
def get_categories() -> list[Category]:
    return store.categories()


@router.get("/standards", response_model=list[Standard], tags=["Standards"], operation_id="getStandards")
def get_standards() -> list[Standard]:
    return store.standards()


@router.get("/stats", response_model=DashboardStats, tags=["Dashboard"], operation_id="getStats")
def get_stats() -> DashboardStats:
    return store.stats()

