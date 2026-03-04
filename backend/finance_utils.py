import numpy_financial as npf
import math

def calculate_cash_flows(appliance, eco_factors, years=None):
    """
    Calculate the yearly cash flows representing ALL costs (negative values) for TCO.
    
    Costs included:
    - Year 0: purchase price (initial investment)
    - Year 1..N: electricity + maintenance + operation costs
    
    Escalation rates:
    - Electricity cost grows at electricity_escalation_rate_percent per year
    - Maintenance and operational costs grow at general inflation_rate_percent per year
    - Energy consumption (kWh) increases at efficiency_decay_rate per year (appliance degrades)
    
    Lifespan is used if `years` is not provided.
    """
    if years is None:
        years = appliance.lifespan_years

    cash_flows = [-appliance.price_lkr]

    elec_rate = eco_factors.electricity_rate_lkr_kwh
    inflation = eco_factors.inflation_rate_percent / 100.0
    elec_escalation = (eco_factors.electricity_escalation_rate_percent or 8.0) / 100.0
    decay_rate = appliance.efficiency_decay_rate if hasattr(appliance, 'efficiency_decay_rate') and appliance.efficiency_decay_rate else 0.02

    current_consumption = appliance.energy_consumption_kwh_yr
    current_maintenance = appliance.maintenance_cost_yr
    current_operation = appliance.operation_cost_yr if hasattr(appliance, 'operation_cost_yr') and appliance.operation_cost_yr else 0.0

    for year in range(1, years + 1):
        # Electricity cost: tariff escalates + consumption grows due to efficiency decay
        yearly_elec_cost = current_consumption * elec_rate

        # Total operating cost for the year
        yearly_total_cost = yearly_elec_cost + current_maintenance + current_operation

        cash_flows.append(-yearly_total_cost)

        # Escalate electricity tariff
        elec_rate *= (1 + elec_escalation)
        # Efficiency decay: appliance uses more energy each year
        current_consumption *= (1 + decay_rate)
        # maintenance and operational costs rise with inflation
        current_maintenance *= (1 + inflation)
        current_operation *= (1 + inflation)

    return cash_flows


def calculate_tco_cumulative(appliance, eco_factors, years=None):
    """Returns a cumulative list of total costs year by year (absolute values)."""
    if years is None:
        years = appliance.lifespan_years
    cash_flows = calculate_cash_flows(appliance, eco_factors, years)
    
    cumulative_tco = []
    current_sum = 0
    for flow in cash_flows:
        current_sum += abs(flow)
        cumulative_tco.append(round(current_sum, 2))
    return cumulative_tco


def calculate_npv(appliance, eco_factors, discount_rate=0.10, years=None):
    """NPV of total cost stream; more negative = more expensive in PV terms."""
    if years is None:
        years = appliance.lifespan_years
    cash_flows = calculate_cash_flows(appliance, eco_factors, years)
    return round(npf.npv(discount_rate, cash_flows), 2)


def calculate_annual_cost_breakdown(appliance, eco_factors, years=None):
    """
    Returns a list of per-year dictionaries breaking down electricity, maintenance, and operation costs.
    Useful for the frontend to display cost composition year by year.
    """
    if years is None:
        years = appliance.lifespan_years

    elec_rate = eco_factors.electricity_rate_lkr_kwh
    inflation = eco_factors.inflation_rate_percent / 100.0
    elec_escalation = (eco_factors.electricity_escalation_rate_percent or 8.0) / 100.0
    decay_rate = appliance.efficiency_decay_rate if hasattr(appliance, 'efficiency_decay_rate') and appliance.efficiency_decay_rate else 0.02

    current_consumption = appliance.energy_consumption_kwh_yr
    current_maintenance = appliance.maintenance_cost_yr
    current_operation = appliance.operation_cost_yr if hasattr(appliance, 'operation_cost_yr') and appliance.operation_cost_yr else 0.0

    breakdown = []
    for year in range(1, years + 1):
        elec = round(current_consumption * elec_rate, 2)
        maint = round(current_maintenance, 2)
        ops = round(current_operation, 2)
        breakdown.append({
            "year": year,
            "electricity": elec,
            "maintenance": maint,
            "operation": ops,
            "total": round(elec + maint + ops, 2)
        })

        elec_rate *= (1 + elec_escalation)
        current_consumption *= (1 + decay_rate)
        current_maintenance *= (1 + inflation)
        current_operation *= (1 + inflation)

    return breakdown


def calculate_advanced_metrics(model_cheap, model_expensive, eco_factors, discount_rate=0.10):
    """
    Calculate IRR, BCR (Benefit-Cost Ratio), and Payback Period comparing
    the expensive model vs. the cheap one. Uses each model's own lifespan for
    its calculations; comparison uses the shorter lifespan for fair comparison.
    """
    years = min(model_cheap.lifespan_years, model_expensive.lifespan_years)

    cf_cheap = calculate_cash_flows(model_cheap, eco_factors, years)
    cf_exp = calculate_cash_flows(model_expensive, eco_factors, years)

    # Differential cash flows: benefit of choosing expensive over cheap
    # Year 0: extra upfront cost (negative)
    # Year 1..N: operational savings (positive if expensive is cheaper to run)
    cf_diff = [exp - cheap for exp, cheap in zip(cf_exp, cf_cheap)]

    extra_cost = abs(cf_diff[0])

    # NPV of operational savings (Years 1..N only)
    npv_savings = npf.npv(discount_rate, [0] + cf_diff[1:])

    # Benefit-Cost Ratio: if >1 the premium pays off
    bcr = round(float(npv_savings) / extra_cost, 3) if extra_cost > 0 else float('inf')

    # IRR on the differential stream
    try:
        irr_val = npf.irr(cf_diff)
        if irr_val is None or (isinstance(irr_val, float) and math.isnan(irr_val)):
            irr = None
        else:
            irr = round(float(irr_val) * 100, 2)
    except Exception:
        irr = None

    # Simple Payback Period (non-discounted)
    payback_period = None
    cumulative = 0
    for i, cf in enumerate(cf_diff):
        cumulative += cf
        if cumulative >= 0 and i > 0:
            prev_cum = cumulative - cf
            fraction = abs(prev_cum) / cf if cf > 0 else 0
            payback_period = round((i - 1) + fraction, 1)
            break

    return {
        "irr_percent": irr,
        "bcr": bcr,
        "payback_period_years": payback_period,
        "comparison_years": years,
        "npv_savings": round(float(npv_savings), 2)
    }
