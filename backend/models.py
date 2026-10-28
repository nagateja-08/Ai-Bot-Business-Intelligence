from sqlalchemy import Column, String, Integer, Numeric, Date, Index
from sqlalchemy.orm import declarative_base
from decimal import Decimal

Base = declarative_base()

class Sale(Base):
    """
    SQLAlchemy Model for the 'sales' table.
    Represents individual sales transaction records.
    """
    __tablename__ = "sales"

    transaction_id = Column(String(20), primary_key=True, index=True, doc="Unique Transaction ID (e.g. TXN0001)")
    order_date = Column(Date, nullable=False, index=True, doc="Date the order was placed")
    product = Column(String(100), nullable=False, index=True, doc="Product name")
    category = Column(String(50), nullable=False, index=True, doc="Product category")
    region = Column(String(50), nullable=False, index=True, doc="Sales region (North, South, East, West)")
    sales_channel = Column(String(50), nullable=False, doc="Channel through which sale occurred (Online, Retail)")
    quantity = Column(Integer, nullable=False, default=1, doc="Units purchased")
    unit_price = Column(Numeric(10, 2), nullable=False, doc="Unit price of the item")
    discount_amount = Column(Numeric(10, 2), nullable=False, default=Decimal("0.00"), doc="Flat discount applied to transaction")
    status = Column(String(20), nullable=False, default="Completed", index=True, doc="Order status (Completed, Returned)")

    @property
    def gross_revenue(self) -> Decimal:
        """Gross Revenue = Quantity * Unit_price"""
        return Decimal(str(self.quantity)) * Decimal(str(self.unit_price))

    @property
    def net_revenue(self) -> Decimal:
        """Net Revenue = (Quantity * Unit_price) - Discount_amount"""
        return self.gross_revenue - Decimal(str(self.discount_amount))

    def to_dict(self):
        """Serialize model instance to standard dict"""
        return {
            "transaction_id": self.transaction_id,
            "order_date": self.order_date.isoformat() if self.order_date else None,
            "product": self.product,
            "category": self.category,
            "region": self.region,
            "sales_channel": self.sales_channel,
            "quantity": self.quantity,
            "unit_price": float(self.unit_price) if self.unit_price is not None else 0.0,
            "discount_amount": float(self.discount_amount) if self.discount_amount is not None else 0.0,
            "status": self.status,
            "gross_revenue": float(self.gross_revenue),
            "net_revenue": float(self.net_revenue)
        }

    def __repr__(self):
        return f"<Sale(id='{self.transaction_id}', product='{self.product}', net={self.net_revenue}, status='{self.status}')>"
