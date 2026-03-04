from pydantic import BaseModel
from typing import Optional, List

class ApplianceBase(BaseModel):
    category: str
    brand: str
    model: str
    price_lkr: float
    lifespan_years: int
    energy_consumption_kwh_yr: float
    maintenance_cost_yr: float
    operation_cost_yr: float = 0.0
    quality_tier: str = "mid"          # "budget", "mid", "premium"
    efficiency_decay_rate: float = 0.02  # e.g., 0.02 = 2% per year

class ApplianceCreate(ApplianceBase):
    pass

class Appliance(ApplianceBase):
    id: int
    class Config:
        from_attributes = True

class EconomicFactorBase(BaseModel):
    inflation_rate_percent: float
    electricity_rate_lkr_kwh: float
    electricity_escalation_rate_percent: float = 8.0
    last_updated: str

class EconomicFactorCreate(EconomicFactorBase):
    pass

class EconomicFactor(EconomicFactorBase):
    id: int
    class Config:
        from_attributes = True

class TCOComparisonRequest(BaseModel):
    model_a_id: int
    model_b_id: int
    budget_lkr: float
    discount_rate: float = 0.10
