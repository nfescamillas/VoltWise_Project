def test_catalog_counts_and_camel_case_contract(client):
    stats = client.get("/api/v1/stats")
    assert stats.status_code == 200
    assert stats.json() == {
        "topicCount": 12,
        "categoryCount": 10,
        "standardCount": 3,
        "reviewedCount": 0,
    }

    categories = client.get("/api/v1/categories").json()
    assert len(categories) == 10
    assert categories[0]["shortName"] == "Conductors"

    standards = client.get("/api/v1/standards").json()
    assert [item["id"] for item in standards] == ["pec", "pdc", "pgc"]
    assert [item["status"] for item in standards] == ["active", "planned", "planned"]


def test_featured_and_recent_defaults(client):
    featured = client.get("/api/v1/topics/featured")
    recent = client.get("/api/v1/topics/recent")
    assert [item["id"] for item in featured.json()] == [
        "motor-branch-circuit-conductors",
        "motor-full-load-current",
        "motor-overload-protection",
        "motor-short-circuit-and-ground-fault-protection",
    ]
    assert len(recent.json()) == 5
    assert recent.json()[0]["id"] == "services-and-service-equipment"


def test_lookup_filtering_and_unknown_behavior(client):
    motors = client.get("/api/v1/categories/motors/topics").json()
    assert len(motors) == 3
    assert all(topic["categoryId"] == "motors" for topic in motors)
    assert client.get("/api/v1/categories/not-real/topics").json() == []

    pec = client.get("/api/v1/standards/pec/topics")
    assert pec.status_code == 200
    assert len(pec.json()) == 12
    assert client.get("/api/v1/standards/not-real/topics").status_code == 422

    topic = client.get("/api/v1/topics/conductor-ampacity")
    assert "edition needs verification" in topic.json()["standards"]["pec"]["edition"]
    assert client.get("/api/v1/topics/not-real").json() is None


def test_search_matches_service_ranking_and_filters(client):
    ranked = client.get("/api/v1/topics/search", params={"q": "motor breaker"})
    assert ranked.status_code == 200
    assert any(item["id"] == "motor-short-circuit-and-ground-fault-protection" for item in ranked.json())

    filtered = client.get(
        "/api/v1/topics/search",
        params={"q": "4.30.2.2", "categoryId": "motors", "standardId": "pec"},
    )
    assert len(filtered.json()) == 1
    assert all(item["categoryId"] == "motors" for item in filtered.json())

    filter_only = client.get("/api/v1/topics/search", params={"q": "", "limit": 2})
    assert len(filter_only.json()) == 2
    assert client.get("/api/v1/topics/search").status_code == 422


def test_related_topics_are_resolved(client):
    related = client.get("/api/v1/topics/working-clearances/related")
    assert related.status_code == 200
    assert related.json()
    assert all(item["id"] != "working-clearances" for item in related.json())
    assert client.get("/api/v1/topics/not-real/related").json() == []


def test_openapi_operation_ids_and_path_parameter_names(client):
    schema = client.get("/openapi.json").json()
    expected = {
        "/api/v1/categories": "getCategories",
        "/api/v1/standards": "getStandards",
        "/api/v1/stats": "getStats",
        "/api/v1/topics/featured": "getFeaturedTopics",
        "/api/v1/topics/recent": "getRecentTopics",
        "/api/v1/topics/search": "searchTopics",
        "/api/v1/categories/{categoryId}/topics": "getTopicsByCategory",
        "/api/v1/standards/{standardId}/topics": "getTopicsByStandard",
        "/api/v1/topics/{topicId}": "getTopic",
        "/api/v1/topics/{topicId}/related": "getRelatedTopics",
    }
    for path, operation_id in expected.items():
        assert schema["paths"][path]["get"]["operationId"] == operation_id

