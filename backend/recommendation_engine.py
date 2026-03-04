from finance_utils import calculate_tco_cumulative, calculate_npv, calculate_advanced_metrics, calculate_annual_cost_breakdown

def compare_appliances(model_a, model_b, budget_lkr, eco_factors):
    """
    Compares two appliances across all economic dimensions:
    - Lifespan-aware TCO
    - NPV (discounted total cost)
    - IRR, BCR, Payback Period (for the premium upgrade case)
    - Per-model annual cost breakdowns (electricity, maintenance, operation)
    Returns a comprehensive dict for frontend display.
    """
    discount_rate = 0.10  # 10% discount rate
    years_a = model_a.lifespan_years
    years_b = model_b.lifespan_years
    analysis_years = min(years_a, years_b)  # fair apples-to-apples comparison

    tco_a = calculate_tco_cumulative(model_a, eco_factors, analysis_years)
    tco_b = calculate_tco_cumulative(model_b, eco_factors, analysis_years)

    npv_a = calculate_npv(model_a, eco_factors, discount_rate, analysis_years)
    npv_b = calculate_npv(model_b, eco_factors, discount_rate, analysis_years)

    breakdown_a = calculate_annual_cost_breakdown(model_a, eco_factors, analysis_years)
    breakdown_b = calculate_annual_cost_breakdown(model_b, eco_factors, analysis_years)

    # Advanced metrics (IRR, BCR, Payback) — compare cheaper vs pricier model
    if model_a.price_lkr <= model_b.price_lkr:
        model_cheap, model_exp = model_a, model_b
    else:
        model_cheap, model_exp = model_b, model_a

    adv = calculate_advanced_metrics(model_cheap, model_exp, eco_factors, discount_rate)

    # Winner: the model with less-negative NPV (lower total cost in PV terms)
    if npv_a > npv_b:
        winner = model_a
        loser = model_b
    else:
        winner = model_b
        loser = model_a

    savings_npv = round(abs(npv_a - npv_b), 2)
    inflation = eco_factors.inflation_rate_percent
    elec_rate = eco_factors.electricity_rate_lkr_kwh
    elec_esc = eco_factors.electricity_escalation_rate_percent or 8.0
    decay_a = (model_a.efficiency_decay_rate or 0.02) * 100
    decay_b = (model_b.efficiency_decay_rate or 0.02) * 100

    # Build rich justification text
    justification = (
        f"Over a {analysis_years}-year analysis window using {inflation}% inflation and "
        f"{elec_esc}% annual electricity tariff escalation (current: LKR {elec_rate}/kWh), "
        f"the {winner.brand} {winner.model} emerges as the better long-term investment."
    )

    if winner.price_lkr > loser.price_lkr:
        premium = winner.price_lkr - loser.price_lkr
        justification += (
            f" Despite a higher purchase price of LKR {premium:,.0f}, "
            f"its lower energy consumption, superior build quality, "
            f"and reduced maintenance/operation costs save approximately "
            f"LKR {savings_npv:,.0f} in present-value terms."
        )
    else:
        justification += (
            f" It also has a lower initial purchase price, making it superior on both "
            f"upfront cost and long-term economics — saving LKR {savings_npv:,.0f} in NPV terms."
        )

    if winner.price_lkr > budget_lkr:
        over = winner.price_lkr - budget_lkr
        justification += (
            f" ⚠️ Note: The recommended model exceeds your budget by LKR {over:,.0f}. "
            f"Consider financing options or the alternative if cash is constrained."
        )

    return {
        "winner_id": winner.id,
        "justification": justification,
        "analysis_years": analysis_years,
        "model_a_tco": tco_a,
        "model_b_tco": tco_b,
        "model_a_npv": npv_a,
        "model_b_npv": npv_b,
        "model_a_breakdown": breakdown_a,
        "model_b_breakdown": breakdown_b,
        "irr_percent": adv["irr_percent"],
        "bcr": adv["bcr"],
        "payback_period_years": adv["payback_period_years"],
        "npv_savings": adv["npv_savings"],
        "inflation_rate_percent": inflation,
        "electricity_rate_lkr_kwh": elec_rate,
        "electricity_escalation_rate_percent": elec_esc,
        "model_a_decay_rate_percent": decay_a,
        "model_b_decay_rate_percent": decay_b,
        "model_a_lifespan": years_a,
        "model_b_lifespan": years_b,
    }
