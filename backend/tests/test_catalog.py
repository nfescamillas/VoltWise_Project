def test_catalog_counts_and_camel_case_contract(client):
    stats = client.get("/api/v1/stats")
    assert stats.status_code == 200
    assert stats.json() == {
        "topicCount": 63,
        "categoryCount": 8,
        "standardCount": 3,
        "reviewedCount": 63,
    }

    categories = client.get("/api/v1/categories").json()
    assert len(categories) == 8
    assert categories[0]["shortName"] == "Conductors"

    standards = client.get("/api/v1/standards").json()
    assert [item["id"] for item in standards] == ["iec", "nec", "pec"]


def test_featured_and_recent_defaults(client):
    featured = client.get("/api/v1/topics/featured")
    recent = client.get("/api/v1/topics/recent")
    assert [item["id"] for item in featured.json()] == [
        "motor-overload-protection",
        "conductor-ampacity",
        "generator-neutral-grounding",
        "working-clearances",
    ]
    assert len(recent.json()) == 5
    assert recent.json()[0]["id"] == "emergency-stop-electrical-considerations"


def test_lookup_filtering_and_unknown_behavior(client):
    motors = client.get("/api/v1/categories/motors/topics").json()
    assert len(motors) == 10
    assert all(topic["categoryId"] == "motors" for topic in motors)
    assert client.get("/api/v1/categories/not-real/topics").json() == []

    nec = client.get("/api/v1/standards/nec/topics")
    assert nec.status_code == 200
    assert len(nec.json()) == 63
    assert client.get("/api/v1/standards/not-real/topics").status_code == 422

    topic = client.get("/api/v1/topics/conductor-ampacity")
    assert topic.json()["standards"]["nec"]["edition"] == "2023"
    assert client.get("/api/v1/topics/not-real").json() is None


def test_search_matches_service_ranking_and_filters(client):
    ranked = client.get("/api/v1/topics/search", params={"q": "motor breaker"})
    assert ranked.status_code == 200
    assert ranked.json()[0]["id"] == "motor-short-circuit-protection"

    filtered = client.get(
        "/api/v1/topics/search",
        params={"q": "Article 430", "categoryId": "motors", "standardId": "nec"},
    )
    assert len(filtered.json()) == 10
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

