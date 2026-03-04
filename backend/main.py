from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Optional

import models, schemas
from database import engine, get_db
import data_service
from recommendation_engine import compare_appliances

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Appliance Economic Analysis API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def _appliances():
    """
    Full Sri Lanka market appliance catalog.
    Fields: category, brand, model, price_lkr, lifespan_years,
            energy_consumption_kwh_yr, maintenance_cost_yr,
            operation_cost_yr, quality_tier, efficiency_decay_rate
    """
    return [
        # ─────────────────────────────────────────────
        # REFRIGERATORS
        # ─────────────────────────────────────────────
        # Budget
        models.Appliance(
            category="refrigerator", brand="Singer", model="Geo 189L Direct Cool",
            price_lkr=89_999, lifespan_years=8,
            energy_consumption_kwh_yr=340, maintenance_cost_yr=5_000,
            operation_cost_yr=2_500, quality_tier="budget", efficiency_decay_rate=0.035),
        models.Appliance(
            category="refrigerator", brand="Sisil", model="120L Single Door",
            price_lkr=55_000, lifespan_years=7,
            energy_consumption_kwh_yr=390, maintenance_cost_yr=6_000,
            operation_cost_yr=3_000, quality_tier="budget", efficiency_decay_rate=0.04),
        models.Appliance(
            category="refrigerator", brand="Abans", model="135L No Frost",
            price_lkr=69_999, lifespan_years=8,
            energy_consumption_kwh_yr=360, maintenance_cost_yr=5_500,
            operation_cost_yr=2_800, quality_tier="budget", efficiency_decay_rate=0.038),
        # Mid
        models.Appliance(
            category="refrigerator", brand="Singer", model="Geo Smart Inverter 220L",
            price_lkr=124_999, lifespan_years=10,
            energy_consumption_kwh_yr=210, maintenance_cost_yr=3_000,
            operation_cost_yr=1_500, quality_tier="mid", efficiency_decay_rate=0.025),
        models.Appliance(
            category="refrigerator", brand="Beko", model="250L No Frost Inverter",
            price_lkr=179_999, lifespan_years=12,
            energy_consumption_kwh_yr=215, maintenance_cost_yr=2_800,
            operation_cost_yr=1_200, quality_tier="mid", efficiency_decay_rate=0.022),
        models.Appliance(
            category="refrigerator", brand="Haier", model="276L Bottom Mount Inverter",
            price_lkr=159_999, lifespan_years=10,
            energy_consumption_kwh_yr=230, maintenance_cost_yr=3_200,
            operation_cost_yr=1_400, quality_tier="mid", efficiency_decay_rate=0.025),
        models.Appliance(
            category="refrigerator", brand="Whirlpool", model="265L Multi-Door Inverter",
            price_lkr=185_000, lifespan_years=12,
            energy_consumption_kwh_yr=225, maintenance_cost_yr=2_900,
            operation_cost_yr=1_300, quality_tier="mid", efficiency_decay_rate=0.023),
        # Premium
        models.Appliance(
            category="refrigerator", brand="LG", model="Smart Inverter 260L",
            price_lkr=225_999, lifespan_years=15,
            energy_consumption_kwh_yr=185, maintenance_cost_yr=1_500,
            operation_cost_yr=800, quality_tier="premium", efficiency_decay_rate=0.015),
        models.Appliance(
            category="refrigerator", brand="Samsung", model="Double Door Digital Inverter 253L",
            price_lkr=199_999, lifespan_years=14,
            energy_consumption_kwh_yr=200, maintenance_cost_yr=1_800,
            operation_cost_yr=900, quality_tier="premium", efficiency_decay_rate=0.018),
        models.Appliance(
            category="refrigerator", brand="Hitachi", model="Bottom Freeze Inverter 330L",
            price_lkr=285_999, lifespan_years=15,
            energy_consumption_kwh_yr=240, maintenance_cost_yr=2_200,
            operation_cost_yr=1_000, quality_tier="premium", efficiency_decay_rate=0.015),
        models.Appliance(
            category="refrigerator", brand="Mitsubishi", model="French Door 450L Inverter",
            price_lkr=369_999, lifespan_years=18,
            energy_consumption_kwh_yr=265, maintenance_cost_yr=2_500,
            operation_cost_yr=1_100, quality_tier="premium", efficiency_decay_rate=0.012),
        models.Appliance(
            category="refrigerator", brand="Panasonic", model="Prime Fresh 387L Inverter",
            price_lkr=319_999, lifespan_years=15,
            energy_consumption_kwh_yr=250, maintenance_cost_yr=2_000,
            operation_cost_yr=950, quality_tier="premium", efficiency_decay_rate=0.014),

        # ─────────────────────────────────────────────
        # WASHING MACHINES
        # ─────────────────────────────────────────────
        # Budget
        models.Appliance(
            category="washing_machine", brand="Singer", model="7kg Twin Tub",
            price_lkr=45_999, lifespan_years=7,
            energy_consumption_kwh_yr=280, maintenance_cost_yr=4_500,
            operation_cost_yr=3_500, quality_tier="budget", efficiency_decay_rate=0.04),
        models.Appliance(
            category="washing_machine", brand="Sisil", model="6.5kg Semi-Auto",
            price_lkr=38_000, lifespan_years=6,
            energy_consumption_kwh_yr=310, maintenance_cost_yr=5_000,
            operation_cost_yr=3_800, quality_tier="budget", efficiency_decay_rate=0.045),
        models.Appliance(
            category="washing_machine", brand="Abans", model="7kg Top Load Basic",
            price_lkr=52_000, lifespan_years=7,
            energy_consumption_kwh_yr=295, maintenance_cost_yr=4_800,
            operation_cost_yr=3_200, quality_tier="budget", efficiency_decay_rate=0.042),
        # Mid
        models.Appliance(
            category="washing_machine", brand="LG", model="8kg Top Load Inverter Direct Drive",
            price_lkr=98_999, lifespan_years=12,
            energy_consumption_kwh_yr=170, maintenance_cost_yr=2_000,
            operation_cost_yr=1_200, quality_tier="mid", efficiency_decay_rate=0.022),
        models.Appliance(
            category="washing_machine", brand="Samsung", model="8kg EcoBubble Top Load",
            price_lkr=109_999, lifespan_years=12,
            energy_consumption_kwh_yr=165, maintenance_cost_yr=2_200,
            operation_cost_yr=1_300, quality_tier="mid", efficiency_decay_rate=0.021),
        models.Appliance(
            category="washing_machine", brand="Whirlpool", model="7.5kg Front Load Inverter",
            price_lkr=115_000, lifespan_years=12,
            energy_consumption_kwh_yr=155, maintenance_cost_yr=2_400,
            operation_cost_yr=1_100, quality_tier="mid", efficiency_decay_rate=0.02),
        models.Appliance(
            category="washing_machine", brand="Haier", model="8kg Front Load 1200RPM",
            price_lkr=94_999, lifespan_years=10,
            energy_consumption_kwh_yr=175, maintenance_cost_yr=2_600,
            operation_cost_yr=1_400, quality_tier="mid", efficiency_decay_rate=0.024),
        # Premium
        models.Appliance(
            category="washing_machine", brand="LG", model="9kg Front Load AI DD Inverter",
            price_lkr=189_999, lifespan_years=15,
            energy_consumption_kwh_yr=135, maintenance_cost_yr=1_200,
            operation_cost_yr=700, quality_tier="premium", efficiency_decay_rate=0.015),
        models.Appliance(
            category="washing_machine", brand="Samsung", model="9kg QuickDrive Front Load",
            price_lkr=175_000, lifespan_years=14,
            energy_consumption_kwh_yr=140, maintenance_cost_yr=1_400,
            operation_cost_yr=800, quality_tier="premium", efficiency_decay_rate=0.016),
        models.Appliance(
            category="washing_machine", brand="Bosch", model="8kg Serie 6 Front Load",
            price_lkr=215_000, lifespan_years=15,
            energy_consumption_kwh_yr=128, maintenance_cost_yr=1_100,
            operation_cost_yr=600, quality_tier="premium", efficiency_decay_rate=0.013),

        # ─────────────────────────────────────────────
        # AIR CONDITIONERS
        # ─────────────────────────────────────────────
        # Budget
        models.Appliance(
            category="air_conditioner", brand="Abans", model="1.0T Non-Inverter Split",
            price_lkr=79_999, lifespan_years=7,
            energy_consumption_kwh_yr=1_800, maintenance_cost_yr=6_000,
            operation_cost_yr=4_000, quality_tier="budget", efficiency_decay_rate=0.04),
        models.Appliance(
            category="air_conditioner", brand="Sisil", model="1.5T Non-Inverter Split",
            price_lkr=89_999, lifespan_years=7,
            energy_consumption_kwh_yr=2_100, maintenance_cost_yr=6_500,
            operation_cost_yr=4_500, quality_tier="budget", efficiency_decay_rate=0.042),
        models.Appliance(
            category="air_conditioner", brand="Singer", model="1.0T Fixed Speed Split",
            price_lkr=84_999, lifespan_years=8,
            energy_consumption_kwh_yr=1_850, maintenance_cost_yr=5_800,
            operation_cost_yr=3_800, quality_tier="budget", efficiency_decay_rate=0.038),
        # Mid
        models.Appliance(
            category="air_conditioner", brand="LG", model="1.5T Dual Inverter S4-Q18KL3AA",
            price_lkr=149_999, lifespan_years=12,
            energy_consumption_kwh_yr=1_200, maintenance_cost_yr=3_000,
            operation_cost_yr=1_500, quality_tier="mid", efficiency_decay_rate=0.022),
        models.Appliance(
            category="air_conditioner", brand="Samsung", model="1.5T WindFree Inverter",
            price_lkr=159_999, lifespan_years=12,
            energy_consumption_kwh_yr=1_150, maintenance_cost_yr=3_200,
            operation_cost_yr=1_600, quality_tier="mid", efficiency_decay_rate=0.021),
        models.Appliance(
            category="air_conditioner", brand="Panasonic", model="1.5T Inverter CS-YU18WKY",
            price_lkr=142_000, lifespan_years=12,
            energy_consumption_kwh_yr=1_180, maintenance_cost_yr=3_100,
            operation_cost_yr=1_400, quality_tier="mid", efficiency_decay_rate=0.022),
        models.Appliance(
            category="air_conditioner", brand="Haier", model="2.0T Inverter AS24CB2HRA",
            price_lkr=172_000, lifespan_years=11,
            energy_consumption_kwh_yr=1_420, maintenance_cost_yr=3_500,
            operation_cost_yr=1_700, quality_tier="mid", efficiency_decay_rate=0.024),
        # Premium
        models.Appliance(
            category="air_conditioner", brand="Mitsubishi", model="2.0T Inverter MSZ-AP50VGD",
            price_lkr=269_999, lifespan_years=18,
            energy_consumption_kwh_yr=950, maintenance_cost_yr=2_000,
            operation_cost_yr=1_000, quality_tier="premium", efficiency_decay_rate=0.012),
        models.Appliance(
            category="air_conditioner", brand="Daikin", model="1.5T FTKF50TV Inverter",
            price_lkr=235_000, lifespan_years=15,
            energy_consumption_kwh_yr=980, maintenance_cost_yr=2_200,
            operation_cost_yr=1_100, quality_tier="premium", efficiency_decay_rate=0.014),
        models.Appliance(
            category="air_conditioner", brand="Toshiba", model="2.0T Shorai Edge Inverter",
            price_lkr=248_000, lifespan_years=15,
            energy_consumption_kwh_yr=1_010, maintenance_cost_yr=2_100,
            operation_cost_yr=1_050, quality_tier="premium", efficiency_decay_rate=0.013),

        # ─────────────────────────────────────────────
        # TELEVISIONS
        # ─────────────────────────────────────────────
        # Budget
        models.Appliance(
            category="television", brand="Singer", model='32" HD LED',
            price_lkr=39_999, lifespan_years=7,
            energy_consumption_kwh_yr=146, maintenance_cost_yr=2_500,
            operation_cost_yr=1_500, quality_tier="budget", efficiency_decay_rate=0.03),
        models.Appliance(
            category="television", brand="Abans", model='43" FHD LED',
            price_lkr=55_000, lifespan_years=7,
            energy_consumption_kwh_yr=190, maintenance_cost_yr=2_800,
            operation_cost_yr=1_800, quality_tier="budget", efficiency_decay_rate=0.032),
        models.Appliance(
            category="television", brand="Sisil", model='40" FHD Smart LED',
            price_lkr=48_000, lifespan_years=6,
            energy_consumption_kwh_yr=175, maintenance_cost_yr=3_000,
            operation_cost_yr=2_000, quality_tier="budget", efficiency_decay_rate=0.035),
        # Mid
        models.Appliance(
            category="television", brand="TCL", model='55" 4K UHD Android TV S5400A',
            price_lkr=89_999, lifespan_years=10,
            energy_consumption_kwh_yr=160, maintenance_cost_yr=1_500,
            operation_cost_yr=800, quality_tier="mid", efficiency_decay_rate=0.022),
        models.Appliance(
            category="television", brand="Hisense", model='50" 4K ULED U6H',
            price_lkr=99_999, lifespan_years=10,
            energy_consumption_kwh_yr=155, maintenance_cost_yr=1_600,
            operation_cost_yr=850, quality_tier="mid", efficiency_decay_rate=0.02),
        models.Appliance(
            category="television", brand="LG", model='50" 4K UHD UR80 WebOS',
            price_lkr=119_999, lifespan_years=12,
            energy_consumption_kwh_yr=148, maintenance_cost_yr=1_200,
            operation_cost_yr=700, quality_tier="mid", efficiency_decay_rate=0.018),
        models.Appliance(
            category="television", brand="Samsung", model='55" 4K Crystal UHD TU7000',
            price_lkr=129_999, lifespan_years=12,
            energy_consumption_kwh_yr=150, maintenance_cost_yr=1_300,
            operation_cost_yr=750, quality_tier="mid", efficiency_decay_rate=0.019),
        # Premium
        models.Appliance(
            category="television", brand="Samsung", model='65" Neo QLED 4K QN85B',
            price_lkr=399_999, lifespan_years=15,
            energy_consumption_kwh_yr=210, maintenance_cost_yr=2_000,
            operation_cost_yr=1_000, quality_tier="premium", efficiency_decay_rate=0.014),
        models.Appliance(
            category="television", brand="LG", model='65" OLED evo C3 4K',
            price_lkr=449_999, lifespan_years=15,
            energy_consumption_kwh_yr=195, maintenance_cost_yr=1_800,
            operation_cost_yr=900, quality_tier="premium", efficiency_decay_rate=0.013),
        models.Appliance(
            category="television", brand="Sony", model='55" BRAVIA XR A80L OLED',
            price_lkr=379_999, lifespan_years=15,
            energy_consumption_kwh_yr=200, maintenance_cost_yr=1_900,
            operation_cost_yr=950, quality_tier="premium", efficiency_decay_rate=0.013),
        models.Appliance(
            category="television", brand="Sony", model='75" BRAVIA XR X95L Mini LED',
            price_lkr=589_999, lifespan_years=15,
            energy_consumption_kwh_yr=280, maintenance_cost_yr=2_200,
            operation_cost_yr=1_100, quality_tier="premium", efficiency_decay_rate=0.012),
    ]


@app.on_event("startup")
def on_startup():
    db = next(get_db())
    if not db.query(models.EconomicFactor).first():
        eco = models.EconomicFactor(**data_service.get_latest_economic_factors())
        db.add(eco)
        db.commit()

    if not db.query(models.Appliance).first():
        db.add_all(_appliances())
        db.commit()


@app.get("/appliances", response_model=List[schemas.Appliance])
def get_appliances(
    category: Optional[str] = Query(None, description="Filter by category"),
    skip: int = 0,
    limit: int = 200,
    db: Session = Depends(get_db),
):
    q = db.query(models.Appliance)
    if category:
        q = q.filter(models.Appliance.category == category)
    return q.offset(skip).limit(limit).all()


@app.get("/categories")
def get_categories(db: Session = Depends(get_db)):
    """Return distinct appliance categories with display labels."""
    rows = db.query(models.Appliance.category).distinct().all()
    label_map = {
        "refrigerator": "Refrigerator",
        "washing_machine": "Washing Machine",
        "air_conditioner": "Air Conditioner",
        "television": "Television",
    }
    return [
        {"value": r[0], "label": label_map.get(r[0], r[0].replace("_", " ").title())}
        for r in rows
    ]


@app.get("/economic-factors", response_model=schemas.EconomicFactor)
def get_economic_factors(db: Session = Depends(get_db)):
    return db.query(models.EconomicFactor).first()


@app.post("/compare")
def compare(request: schemas.TCOComparisonRequest, db: Session = Depends(get_db)):
    model_a = db.query(models.Appliance).filter(models.Appliance.id == request.model_a_id).first()
    model_b = db.query(models.Appliance).filter(models.Appliance.id == request.model_b_id).first()

    if not model_a or not model_b:
        raise HTTPException(status_code=404, detail="Appliance not found")
    if model_a.category != model_b.category:
        raise HTTPException(status_code=400, detail="Both appliances must be from the same category for a fair comparison.")

    eco_factors = db.query(models.EconomicFactor).first()
    result = compare_appliances(model_a, model_b, request.budget_lkr, eco_factors)

    return {
        "model_a": schemas.Appliance.model_validate(model_a),
        "model_b": schemas.Appliance.model_validate(model_b),
        "eco_factors": schemas.EconomicFactor.model_validate(eco_factors),
        "comparison_result": result,
    }
