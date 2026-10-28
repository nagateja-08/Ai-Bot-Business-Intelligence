from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from backend.database import get_db
from backend.services.groq_service import groq_service
from backend.schemas import ChatRequest, ChatResponse, SuggestionList

router = APIRouter(prefix="/api", tags=["AI Chat & Suggestions"])

SUGGESTED_QUESTIONS = [
    "What is the total revenue?",
    "Which product generated the highest revenue?",
    "What is the monthly revenue trend?",
    "Which region generated the highest sales?",
    "How did revenue change between two months?",
    "What is the revenue breakdown by product category?"
]

@router.post("/chat", response_model=ChatResponse)
def handle_chat_message(request: ChatRequest, db: Session = Depends(get_db)):
    """
    Main AI BI Assistant endpoint:
    1. Interprets question via Groq LLM (with deterministic fallback).
    2. Validates analytical intent against security allowlist.
    3. Runs parameterized database query.
    4. Generates factual answer strictly grounded in database results.
    """
    clean_question = request.question.strip()
    if not clean_question:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Question cannot be empty.")

    try:
        response = groq_service.process_chat_query(clean_question, db)
        return response
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing question: {str(e)}"
        )

@router.get("/suggestions", response_model=SuggestionList)
def get_suggestions():
    """
    Returns list of guaranteed supported natural language questions.
    """
    return SuggestionList(suggestions=SUGGESTED_QUESTIONS)
