use crate::models::CocomoResult;

pub fn calculate_cocomo(loc: u64, monthly_rate_usd: f64) -> CocomoResult {
    let kloc = (loc as f64) / 1000.0;
    
    // Fallback if KLOC is 0
    if kloc <= 0.0 {
        return CocomoResult {
            effort_person_months: 0.0,
            development_time_months: 0.0,
            estimated_cost_usd: 0.0,
            team_size: 0.0,
        };
    }

    // COCOMO Organic mode parameters
    let effort = 2.4 * kloc.powf(1.05);
    let dev_time = 2.5 * effort.powf(0.38);
    let team_size = if dev_time > 0.0 { effort / dev_time } else { 0.0 };
    let cost = effort * monthly_rate_usd;

    CocomoResult {
        effort_person_months: (effort * 10.0).round() / 10.0,
        development_time_months: (dev_time * 10.0).round() / 10.0,
        estimated_cost_usd: cost.round(),
        team_size: (team_size * 10.0).round() / 10.0,
    }
}
