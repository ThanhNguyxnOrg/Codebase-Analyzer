use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct FileInfo {
    pub name: String,
    pub path: String,
    pub lang: String,
    pub loc: u64,
    pub code: u64,
    pub comments: u64,
    pub blanks: u64,
    pub size_bytes: u64,
    pub complexity: f64,
}
