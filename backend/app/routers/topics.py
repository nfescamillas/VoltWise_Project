from typing import Annotated

from fastapi import APIRouter, Path, Query

from ..models import StandardId, Topic
from ..store import store

router = APIRouter()


@router.get("/topics/featured", response_model=list[Topic], response_model_exclude_none=True, tags=["Topics"], operation_id="getFeaturedTopics")
def get_featured_topics(limit: int = 4) -> list[Topic]:
    return store.featured_topics(limit)


@router.get("/topics/recent", response_model=list[Topic], response_model_exclude_none=True, tags=["Topics"], operation_id="getRecentTopics")
def get_recent_topics(limit: int = 5) -> list[Topic]:
    return store.recent_topics(limit)


@router.get("/topics/search", response_model=list[Topic], response_model_exclude_none=True, tags=["Topics"], operation_id="searchTopics")
def search_topics(
    q: str = Query(...),
    category_id: str | None = Query(None, alias="categoryId"),
    standard_id: StandardId | None = Query(None, alias="standardId"),
    limit: int | None = None,
) -> list[Topic]:
    return store.search_topics(q, category_id, standard_id, limit)


@router.get("/categories/{categoryId}/topics", response_model=list[Topic], response_model_exclude_none=True, tags=["Topics", "Categories"], operation_id="getTopicsByCategory")
def get_topics_by_category(category_id: Annotated[str, Path(alias="categoryId")]) -> list[Topic]:
    return store.topics_by_category(category_id)


@router.get("/standards/{standardId}/topics", response_model=list[Topic], response_model_exclude_none=True, tags=["Topics", "Standards"], operation_id="getTopicsByStandard")
def get_topics_by_standard(standard_id: Annotated[StandardId, Path(alias="standardId")]) -> list[Topic]:
    return store.topics_by_standard(standard_id)


@router.get("/topics/{topicId}", response_model=Topic | None, response_model_exclude_none=True, tags=["Topics"], operation_id="getTopic")
def get_topic(topic_id: Annotated[str, Path(alias="topicId")]) -> Topic | None:
    return store.topic(topic_id)


@router.get("/topics/{topicId}/related", response_model=list[Topic], response_model_exclude_none=True, tags=["Topics"], operation_id="getRelatedTopics")
def get_related_topics(topic_id: Annotated[str, Path(alias="topicId")]) -> list[Topic]:
    return store.related_topics(topic_id)

