use crate::models::{ProjectSummary, CocomoResult};
use crate::engine::scanner::scan_project_directory;
use crate::engine::cocomo::calculate_cocomo;

#[tauri::command]
pub async fn scan_directory(path: String) -> Result<ProjectSummary, String> {
    scan_project_directory(&path)
}

#[tauri::command]
pub fn get_cocomo_estimate(loc: u64, monthly_rate_usd: f64) -> Result<CocomoResult, String> {
    Ok(calculate_cocomo(loc, monthly_rate_usd))
}
