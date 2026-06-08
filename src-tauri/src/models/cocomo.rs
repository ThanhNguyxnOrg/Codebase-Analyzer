use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CocomoResult {
    pub effort_person_months: f64,
    pub development_time_months: f64,
    pub estimated_cost_usd: f64,
    pub team_size: f64,
}
