# System Architecture: SalesIQ

## 1. High-Level Architecture Overview

SalesIQ is an AI-powered Business Intelligence application designed with clean separation of concerns, enterprise security guardrails, and cloud deployment compatibility.

```mermaid
graph TD
    subgraph ClientLayer ["Client Layer (React 18 + Vite)"]
        UI["SalesIQ Web App<br/>(Tailwind CSS + Lucide Icons)"]
        Recharts["Recharts Visualization Engine<br/>(AreaChart, BarChart)"]
        ChatUI["Interactive AI Assistant<br/>(Pill Suggestions, Chat Stream)"]
        UI --> Recharts
        UI --> ChatUI
    end

    subgraph APILayer ["API Layer (FastAPI)"]
        RouterHealth["/api/health"]
        RouterAnalytics["/api/analytics/*<br/>(overview, monthly, regional, top-products)"]
        RouterChat["/api/chat & /api/suggestions"]
        CORS["CORS & Request Validation<br/>(Pydantic v2 Schemas)"]
    end

    subgraph ServiceLayer ["Service Layer"]
        GroqService["Groq AI Service<br/>(Llama 3.3 via Groq SDK)"]
        FallbackEngine["Deterministic Classifier<br/>(Fail-safe Regex Engine)"]
        AnalyticsService["Analytics Calculation Service<br/>(Deterministic SQL/Pandas Logic)"]
    end

    subgraph DataLayer ["Data & Storage Layer"]
        Engine["SQLAlchemy 2.0 ORM Engine<br/>(Connection Pooling, PyMySQL)"]
        MySQL[("MySQL 8.0 Server<br/>(salesiq_db database)")]
        SalesTable["sales Table<br/>(50 Cleaned Transactions)"]
    end

    %% Connections
    ChatUI -->|POST /api/chat| RouterChat
    UI -->|GET /api/analytics/*| RouterAnalytics
    UI -->|GET /api/health| RouterHealth

    RouterChat --> CORS
    RouterAnalytics --> CORS

    CORS --> GroqService
    GroqService -.->|Fallback on error| FallbackEngine
    GroqService -->|Allowlisted Intent| AnalyticsService
    FallbackEngine -->|Allowlisted Intent| AnalyticsService
    RouterAnalytics --> AnalyticsService

    AnalyticsService --> Engine
    Engine --> MySQL
    MySQL --> SalesTable
```

---

## 2. Request Lifecycle & Intent Execution Flow

When a user submits a question in the AI Assistant (e.g. *"What is the monthly revenue trend?"*):

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant Frontend as React Chat
    participant FastAPI as FastAPI Router
    participant Groq as Groq API (LPU)
    participant Validator as Allowlist Validator
    participant Service as Analytics Service
    participant MySQL as MySQL Database

    User->>Frontend: Types question / clicks suggestion
    Frontend->>FastAPI: POST /api/chat { question }
    FastAPI->>Groq: Stage 1: Classify natural language into Intent JSON
    Groq-->>FastAPI: { "intent": "monthly_trend", "parameters": {} }
    FastAPI->>Validator: Verify intent is in INTENT_ALLOWLIST
    Validator-->>FastAPI: Intent verified: monthly_trend
    FastAPI->>Service: Call get_monthly_revenue(db)
    Service->>MySQL: SELECT order_date, unit_price, quantity, discount_amount, status FROM sales WHERE status = 'Completed'
    MySQL-->>Service: Return matching rows
    Service-->>FastAPI: Return grouped monthly revenue array
    FastAPI->>Groq: Stage 2: Summarize exact MySQL payload for user
    Groq-->>FastAPI: "Between Jan and Jun 2026, revenue trended from ₹210,250 to ₹217,250..."
    FastAPI-->>Frontend: Return ChatResponse with answer & visual_type: "line_chart"
    Frontend-->>User: Render formatted narrative & dynamic monthly chart
```

---

## 3. Database Schema & Data Dictionary

Database Name: `salesiq_db`  
Table Name: `sales`

| Column | MySQL Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `transaction_id` | `VARCHAR(20)` | `PRIMARY KEY, NOT NULL` | Unique Transaction Identifier (e.g. `TXN0001` - `TXN0051`) |
| `order_date` | `DATE` | `NOT NULL, INDEX` | Transaction date (parsed from `DD-MM-YYYY`) |
| `product` | `VARCHAR(100)` | `NOT NULL, INDEX` | Name of the purchased item |
| `category` | `VARCHAR(50)` | `NOT NULL, INDEX` | Item category: Accessories, Furniture, Electronics |
| `region` | `VARCHAR(50)` | `NOT NULL, INDEX` | Territory: North, South, East, West |
| `sales_channel` | `VARCHAR(50)` | `NOT NULL` | Purchasing channel: Online, Retail |
| `quantity` | `INT` | `NOT NULL` | Units purchased (≥ 0) |
| `unit_price` | `DECIMAL(10, 2)` | `NOT NULL` | Per-unit currency price |
| `discount_amount` | `DECIMAL(10, 2)` | `NOT NULL, DEFAULT 0.00` | Flat discount currency amount applied to the transaction |
| `status` | `VARCHAR(20)` | `NOT NULL, INDEX` | Order status (`Completed` or `Returned`) |

---

## 4. Business Mathematics & Revenue Definitions

$$\text{Gross Revenue} = \text{Quantity} \times \text{Unit Price}$$

$$\text{Net Revenue} = (\text{Quantity} \times \text{Unit Price}) - \text{Discount Amount}$$

- **Realized Revenue Rules**:
  - `Completed` (50 transactions): Included in realized net revenue, gross revenue, monthly charts, and product ranking.
  - `Returned` (1 transaction: `TXN0033`, ₹19,000.00): Preserved in the database for tracking return rates and inventory auditing, but strictly excluded from realized sales.
  - **Zero-Quantity Order** (`TXN0034`, quantity = 0): Correctly evaluated to ₹0.00 without corrupting transaction averages or sales totals.

---

## 5. Security & Isolation Model

1. **No Direct SQL Generation**:
   The Groq LLM never generates SQL text. It acts exclusively as an intent classifier producing structured JSON. All SQL statements are predefined, parameterized SQLAlchemy queries in `AnalyticsService`.
2. **Credential Isolation**:
   No passwords or API keys are stored in source code. Credentials reside solely in `.env` files and environment variables, protected by `.gitignore`.
3. **Database Health Ping**:
   FastAPI uses SQLAlchemy connection pooling with `pool_pre_ping=True` and `pool_recycle=1800` to prevent stale socket errors across idle connections.
4. **Test Isolation**:
   The automated test suite runs hermetically using mock sessions and isolated fixtures, guaranteeing zero risk of altering or dropping production data.
