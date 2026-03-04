# Mocked data service for Sri Lankan context (CBSL, CEB)
# In a real app, this would use `httpx` or `requests` to fetch from actual APIs or parse web pages

def get_latest_economic_factors():
    """
    Returns mocked current economic factors for Sri Lanka.
    - Inflation: ~5.9% currently (mocked, from CBSL)
    - Electricity Rate: ~50 LKR/kWh avg household (mocked, from CEB)
    - Electricity Escalation: ~8% annual price increase (historical trend)
    """
    return {
        "inflation_rate_percent": 5.9,
        "electricity_rate_lkr_kwh": 50.0,
        "electricity_escalation_rate_percent": 8.0,
        "last_updated": "2026-03-04"
    }
