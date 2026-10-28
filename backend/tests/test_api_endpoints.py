import pytest

def test_root_endpoint(client):
    """Test GET / returns basic service info"""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["service"] == "SalesIQ API"

def test_health_endpoint(client):
    """Test GET /api/health returns health status"""
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert "status" in data
    assert "database_connected" in data
    assert "groq_configured" in data

def test_analytics_overview_endpoint(client):
    """Test GET /api/analytics/overview returns KPI numbers"""
    response = client.get("/api/analytics/overview")
    assert response.status_code == 200
    data = response.json()
    assert "total_net_revenue" in data
    assert "total_gross_revenue" in data
    assert "total_discounts" in data
    assert "completed_transactions" in data
    assert data["total_net_revenue"] > 0

def test_analytics_monthly_revenue_endpoint(client):
    """Test GET /api/analytics/monthly-revenue returns monthly list"""
    response = client.get("/api/analytics/monthly-revenue")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0
    assert "month" in data[0]
    assert "net_revenue" in data[0]

def test_analytics_region_revenue_endpoint(client):
    """Test GET /api/analytics/region-revenue returns region list"""
    response = client.get("/api/analytics/region-revenue")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0
    assert "region" in data[0]
    assert "revenue_percentage" in data[0]

def test_analytics_top_products_endpoint(client):
    """Test GET /api/analytics/top-products returns top products"""
    response = client.get("/api/analytics/top-products?limit=3")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) <= 3
    assert "product" in data[0]
    assert "net_revenue" in data[0]

def test_chat_endpoint_valid(client):
    """Test POST /api/chat with valid question"""
    payload = {"question": "What is the total revenue?"}
    response = client.post("/api/chat", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["question"] == "What is the total revenue?"
    assert data["intent"] == "total_revenue"
    assert "138,250" in data["answer"] or "₹" in data["answer"] or "$" in data["answer"]
    assert data["visual_type"] == "metric"

def test_chat_endpoint_empty_question(client):
    """Test POST /api/chat with empty question returns 400 Bad Request"""
    payload = {"question": "   "}
    response = client.post("/api/chat", json=payload)
    assert response.status_code == 400

def test_suggestions_endpoint(client):
    """Test GET /api/suggestions returns suggestions list"""
    response = client.get("/api/suggestions")
    assert response.status_code == 200
    data = response.json()
    assert "suggestions" in data
    assert len(data["suggestions"]) >= 5
