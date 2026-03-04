from sqlalchemy import Column, Integer, String, Float
from database import Base

class Appliance(Base):
    __tablename__ = "appliances"

    id = Column(Integer, primary_key=True, index=True)
    category = Column(String, index=True)          # e.g., "refrigerator", "washing_machine"
    brand = Column(String, index=True)
    model = Column(String, unique=True, index=True)
    price_lkr = Column(Float)
    lifespan_years = Column(Integer)               # Expected product lifespan
    energy_consumption_kwh_yr = Column(Float)      # Annual energy use (kWh)
    maintenance_cost_yr = Column(Float)            # Annual maintenance cost (LKR)
    operation_cost_yr = Column(Float, default=0.0) # Annual operational cost beyond electricity (LKR)
    quality_tier = Column(String, default="mid")   # "budget", "mid", "premium"
    efficiency_decay_rate = Column(Float, default=0.02)  # Annual efficiency degradation (e.g., 0.02 = 2%)

class EconomicFactor(Base):
    __tablename__ = "economic_factors"
    
    id = Column(Integer, primary_key=True, index=True)
    inflation_rate_percent = Column(Float)               # General inflation (CBSL)
    electricity_rate_lkr_kwh = Column(Float)             # CEB electricity tariff
    electricity_escalation_rate_percent = Column(Float, default=8.0)  # Annual electricity price hike %
    last_updated = Column(String)
