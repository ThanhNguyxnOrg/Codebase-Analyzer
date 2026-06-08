use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct LanguageStats {
    pub name: String,
    pub files: u32,
    pub code: u64,
    pub comments: u64,
    pub blanks: u64,
    pub pct: f64,
}
