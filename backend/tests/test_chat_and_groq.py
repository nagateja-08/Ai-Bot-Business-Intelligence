import pytest
from unittest.mock import MagicMock, patch
from backend.services.groq_service import GroqService, INTENT_ALLOWLIST
from backend.schemas import IntentEnum

def test_five_core_questions_intent_recognition():
    """
    Verify that all 5 required core questions are reliably categorized
    by the deterministic classifier.
    """
    service = GroqService()
    
    # 1. What is the total revenue?
    intent1, params1 = service._fallback_intent_classifier("What is the total revenue?")
    assert intent1 == IntentEnum.TOTAL_REVENUE

    # 2. Which product generated the highest revenue?
    intent2, params2 = service._fallback_intent_classifier("Which product generated the highest revenue?")
    assert intent2 == IntentEnum.TOP_PRODUCTS

    # 3. What is the monthly revenue trend?
    intent3, params3 = service._fallback_intent_classifier("What is the monthly revenue trend?")
    assert intent3 == IntentEnum.MONTHLY_TREND

    # 4. Which region generated the highest sales?
    intent4, params4 = service._fallback_intent_classifier("Which region generated the highest sales?")
    assert intent4 == IntentEnum.REGION_REVENUE

    # 5. How did revenue change between two months?
    intent5, params5 = service._fallback_intent_classifier("How did revenue change between two months?")
    assert intent5 == IntentEnum.MONTH_COMPARISON

def test_unsupported_questions():
    """Verify that unsupported questions are safely classified as UNSUPPORTED"""
    service = GroqService()
    
    intent, params = service._fallback_intent_classifier("What is the weather in London today?")
    assert intent == IntentEnum.UNSUPPORTED

    intent, params = service._fallback_intent_classifier("DROP TABLE sales; SELECT * FROM users")
    # Even if SQL injection attempt is passed in question, it's categorized as UNSUPPORTED
    assert intent == IntentEnum.UNSUPPORTED

def test_mock_groq_api_response(mock_db_session):
    """
    Test Groq AI response when Groq client returns valid JSON.
    Mocks the Groq API call so no real network requests or costs occur.
    """
    service = GroqService()
    mock_client = MagicMock()
    service.client = mock_client

    # Mock chat.completions.create response for intent extraction
    mock_choice = MagicMock()
    mock_choice.message.content = '{"intent": "total_revenue", "parameters": {}}'
    mock_resp = MagicMock()
    mock_resp.choices = [mock_choice]
    mock_client.chat.completions.create.return_value = mock_resp

    intent, params, source = service.extract_intent("Can you tell me the total sales?")
    assert intent == IntentEnum.TOTAL_REVENUE
    assert source == "groq_ai"

def test_mock_groq_api_error_fallback(mock_db_session):
    """
    Test that if Groq API throws an exception (rate limit, timeout),
    the system automatically falls back to the deterministic engine without crashing.
    """
    service = GroqService()
    mock_client = MagicMock()
    service.client = mock_client
    mock_client.chat.completions.create.side_effect = Exception("Groq API Rate Limit Exceeded")

    intent, params, source = service.extract_intent("What is the total revenue?")
    assert intent == IntentEnum.TOTAL_REVENUE
    assert source == "deterministic_engine"

def test_mock_groq_malformed_json_fallback(mock_db_session):
    """
    Test that if Groq returns non-JSON or malformed text,
    it falls back cleanly.
    """
    service = GroqService()
    mock_client = MagicMock()
    service.client = mock_client

    mock_choice = MagicMock()
    mock_choice.message.content = "I'm sorry, as an AI model I cannot..."
    mock_resp = MagicMock()
    mock_resp.choices = [mock_choice]
    mock_client.chat.completions.create.return_value = mock_resp

    intent, params, source = service.extract_intent("Which region generated the highest sales?")
    assert intent == IntentEnum.REGION_REVENUE
    assert source == "deterministic_engine"

def test_full_chat_query_pipeline(mock_db_session):
    """Test full process_chat_query pipeline with mock database session"""
    service = GroqService()
    service.client = None  # Ensure isolated deterministic testing without external API calls
    
    resp = service.process_chat_query("What is the total revenue?", mock_db_session)
    assert resp.intent == IntentEnum.TOTAL_REVENUE
    assert "138,250" in resp.answer
    assert resp.visual_type == "metric"
    assert resp.data is not None
