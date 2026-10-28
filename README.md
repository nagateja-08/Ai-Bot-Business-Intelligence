# SalesIQ — AI-Powered Business Intelligence Assistant

SalesIQ is an enterprise-grade AI Business Intelligence web application that connects directly to a MySQL database populated with cleaned sales transaction records. It integrates Groq's high-speed LPU inference engine to interpret user questions in natural language and synthesize grounded business answers, paired with an executive React + Vite + TypeScript dashboard built with Tailwind CSS and Recharts.

---

## 1. Key Features

- **Executive KPI Dashboard**: Real-time display of Total Net Revenue, Completed Orders, Average Order Value (AOV), and Total Discounts.
- **Interactive Visualizations**:
  - **Monthly Revenue Area Chart**: Tracks month-over-month trajectory from January through June 2026.
  - **Regional Performance Bar Chart**: Visualizes sales distribution and market share across South, North, East, and West territories.
  - **Top Products Ranked Table**: Visual progress bars and metrics for all 7 tracked products.
- **AI BI Assistant (Groq Cloud)**:
  - Multi-stage query-intent architecture.
  - Grounded answering directly from MySQL results (zero mathematical hallucination).
  - Quick-prompt suggestions for core business questions.
  - Fallback deterministic engine ensuring 100% uptime even if Groq API is offline.
- **Sales Transaction Explorer**:
  - Full-text search by Transaction ID, Product, or Region.
  - Interactive multi-parameter filters (Region, Category, Status).
  - One-click CSV export of filtered views.
- **Security & Integrity**:
  - Strict allowlist validation — no arbitrary SQL execution.
  - Idempotent database initialization preventing duplicate records on restart.
  - Zero SQLite usage — 100% MySQL from development to cloud deployment.

---

## 2. Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite, TypeScript, Tailwind CSS, Recharts, Lucide Icons, Axios |
| **Backend** | Python 3.11+, FastAPI, Pydantic v2, Uvicorn |
| **AI Engine** | Groq Cloud API (`groq` official SDK, `llama-3.3-70b-versatile` / `llama-3.1-8b-instant`) |
| **Database** | MySQL 8.0, SQLAlchemy 2.0 ORM, PyMySQL driver, Cryptography |
| **Data Processing** | Pandas |
| **Testing** | Pytest, Pytest-Asyncio, FastAPI TestClient, unittest.mock |
| **Cloud Target** | Render (Monorepo Web Service + Static Site Blueprint) |

---

## 3. Dataset & Data Cleaning Decisions

SalesIQ is built upon the cleaned dataset `ai_bi_assistant_sales_data_cleaned.csv` containing transactions from **January 3, 2026** to **June 28, 2026**.

During dataset preprocessing, the following deliberate data cleaning decisions were applied:
1. **Laptop Stand Unit Price Imputation**: The missing unit price for Laptop Stand was filled using the consistent unit price observed across other records for the identical product (**₹1,200.00**).
2. **Zero-Quantity Order Handling**: Transaction `TXN0034` had a recorded quantity of 0. In our revenue logic, $0 \times \text{Unit Price} = ₹0.00$. It is safely tracked with ₹0.00 contribution without artificially inflating completed order revenue.
3. **Returned Order Preservation**: Transaction `TXN0033` (2 Monitors at ₹9,500.00 = ₹19,000.00) has status `Returned`. Rather than discarding customer history, the transaction was preserved in MySQL for return-rate tracking, but excluded from realized net sales figures.

### Revenue Calculation Formulas:
$$\text{Gross Revenue} = \text{Quantity} \times \text{Unit Price}$$
$$\text{Net Revenue} = (\text{Quantity} \times \text{Unit Price}) - \text{Discount Amount} - \text{Returns}$$

- **Total Completed Gross Revenue**: ₹1,449,700.00
- **Total Discounts Deducted**: ₹4,500.00
- **Customer Returns Deducted**: ₹19,000.00
- **Total Realized Net Revenue**: ₹14,26,200.00
- **Total Transactions in Database**: 50 total records (49 completed orders + 1 return)

---

## 4. Local Development Setup

### Prerequisites
- Python 3.11 or higher
- Node.js 18+ and npm
- Local MySQL Server 8.0 (running on port 3306)

---

### Step 1: Clone and Configure Environment

```bash
# Clone the repository
git clone <your-repo-url>
cd "BI Assistant"

# Copy environment template for backend
cp .env.example backend/.env
```

Open `backend/.env` and update your MySQL credentials and Groq API key:
```env
DATABASE_URL=mysql+pymysql://root:YOUR_MYSQL_PASSWORD@127.0.0.1:3306/salesiq_db
GROQ_API_KEY=gsk_your_groq_api_key_here
GROQ_MODEL=llama-3.3-70b-versatile
FRONTEND_ORIGIN=http://localhost:5173
PORT=8000
```
> **Tip**: You can get a free, instant Groq API key at [console.groq.com/keys](https://console.groq.com/keys).

---

### Step 2: Install Backend Dependencies & Initialize MySQL Database

```bash
# Install backend requirements
python -m pip install -r backend/requirements.txt

# Run the idempotent database initialization script
python backend/init_db.py
```

`backend/init_db.py` will:
1. Connect to your local MySQL instance.
2. Automatically create the database `salesiq_db` if it does not exist.
3. Create the `sales` table with proper `DECIMAL(10, 2)` monetary columns and indexes.
4. Idempotently import all transactions from `ai_bi_assistant_sales_data_cleaned.csv`.
5. Verify and print row counts and revenue totals.

---

### Step 3: Start FastAPI Backend Server

```bash
# From the project root:
python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
```
- API Docs: [http://localhost:8000/docs](http://localhost:8000/docs)
- Health Check: [http://localhost:8000/api/health](http://localhost:8000/api/health)

---

### Step 4: Install Frontend Dependencies & Start React App

Open a new terminal window:
```bash
cd frontend

# Install npm packages
npm install

# Start Vite development server
npm run dev
```
Open your browser and navigate to **`http://localhost:5173`**.

---

## 5. Running Automated Tests

SalesIQ includes a comprehensive Pytest suite that verifies MySQL schemas, revenue math, returned order isolation, Groq intent parsing, security allowlists, and FastAPI endpoints.

```bash
# Run backend test suite
python -m pytest backend/tests/ -v
```

```bash
# Verify frontend TypeScript build
cd frontend
npm run build
```

---

## 6. Supported AI Questions

The AI Assistant reliably answers all 5 core evaluation questions grounded directly in MySQL query results:

1. **"What is the total revenue?"**  
   *Answer*: Highlights total net revenue of **₹14,26,200.00** (gross ₹1,449,700.00 minus ₹4,500.00 discounts and ₹19,000.00 customer returns).
2. **"Which product generated the highest revenue?"**  
   *Answer*: Identifies **Monitor** generating **₹473,000.00** net revenue across 50 units sold.
3. **"What is the monthly revenue trend?"**  
   *Answer*: Shows revenue trajectory from January (₹210,250.00) peaking in May (₹318,500.00).
4. **"Which region generated the highest sales?"**  
   *Answer*: Identifies the **South** region generating **₹411,200.00** (28.4% market share).
5. **"How did revenue change between two months?"** (e.g. April and May)  
   *Answer*: Explains revenue increased by **₹77,800.00** (+32.3%) from April (₹240,700.00) to May (₹318,500.00).

---

## 7. Render Cloud Deployment

The repository is structured as a Render monorepo with `render.yaml`.

### Cloud MySQL Database Setup
Because your local laptop's MySQL is private, your deployed backend on Render must connect to a cloud-hosted MySQL database. Recommended free/compatible cloud MySQL providers:
- **Aiven for MySQL**: Managed MySQL with SSL connection URI.
- **TiDB Cloud**: Fully MySQL 8.0-compatible serverless database.
- **PlanetScale**: MySQL-compatible cloud database.
- **Railway**: Instant hosted MySQL instance.

#### Cloud Database Migration:
1. Create a database named `salesiq_db` on your cloud provider.
2. Set `DATABASE_URL` in your Render backend service environment variables:
   ```env
   DATABASE_URL=mysql+pymysql://USER:PASSWORD@HOST:PORT/salesiq_db?ssl_ca=/etc/ssl/certs/ca-certificates.crt
   ```
3. Run the import script against your cloud database:
   ```bash
   DATABASE_URL="mysql+pymysql://..." python backend/init_db.py
   ```

### Deploying via Render Blueprint:
1. Push your repository to GitHub.
2. In the Render Dashboard, click **New > Blueprint**.
3. Select your repository. Render will detect `render.yaml` and configure:
   - **`salesiq-backend`** (Python Web Service running `uvicorn backend.main:app`)
   - **`salesiq-frontend`** (Static Site publishing `frontend/dist`)
4. Fill in the required environment variables:
   - `DATABASE_URL` (your cloud MySQL connection string)
   - `GROQ_API_KEY` (your Groq key)
   - `FRONTEND_ORIGIN` (e.g. `https://salesiq-frontend.onrender.com`)
   - `VITE_API_BASE_URL` (e.g. `https://salesiq-backend.onrender.com`)
5. Click **Apply**.

---

## 8. License & Attribution

Built for the **SalesIQ AI Business Intelligence Assessment**.  
All rights reserved.
