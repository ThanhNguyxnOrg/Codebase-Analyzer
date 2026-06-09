use std::collections::HashMap;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AssetInfo {
    pub path: String,
    pub name: String,
    pub extension: String,
    pub size: u64,
    pub category: String,
    pub subcategory: String,
    pub description: String,
    pub sha256: Option<String>,
    pub metadata: HashMap<String, String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AssetSummary {
    pub total_files: u32,
    pub total_size: u64,
    pub category_counts: HashMap<String, u32>,
    pub category_sizes: HashMap<String, u64>,
    pub subcategory_counts: HashMap<String, u32>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AssetDuplicate {
    pub sha256: String,
    pub size: u64,
    pub files: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct OrphanAsset {
    pub path: String,
    pub name: String,
    pub category: String,
    pub size: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct OptimizationHint {
    pub path: String,
    pub name: String,
    pub message: String,
    pub severity: String, // "info", "warning", "critical"
    pub potential_savings: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AssetReport {
    pub summary: AssetSummary,
    pub assets: Vec<AssetInfo>,
    pub duplicates: Vec<AssetDuplicate>,
    pub orphans: Vec<OrphanAsset>,
    pub optimization_hints: Vec<OptimizationHint>,
    pub edges: Vec<(String, String)>,
}
