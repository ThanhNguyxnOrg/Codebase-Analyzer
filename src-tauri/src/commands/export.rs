use std::fs::File;
use std::io::Write;
use crate::models::ProjectSummary;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ExportOptions {
    pub include_code: bool,
    pub include_multimedia: bool,
    pub include_game: bool,
    pub include_cad: bool,
    pub include_documents: bool,
}

#[tauri::command]
pub async fn export_report(
    path: String,
    format: String,
    mut summary: ProjectSummary,
    options: ExportOptions,
) -> Result<(), String> {
    let content = match format.to_lowercase().as_str() {
        "json" => {
            // Filter summary fields based on options before JSON serialization
            if !options.include_code {
                summary.files = vec![];
                summary.languages = vec![];
                summary.total_files = 0;
                summary.total_loc = 0;
                summary.total_code = 0;
                summary.total_comments = 0;
                summary.total_blanks = 0;
                summary.average_complexity = 0.0;
                summary.complexity_dist = vec![];
            }
            if !options.include_multimedia || !options.include_game || !options.include_cad || !options.include_documents {
                if let Some(ref mut ar) = summary.asset_report {
                    ar.assets.retain(|a| {
                        let is_multimedia = a.category == "multimedia";
                        let is_game = a.category == "game_3d";
                        let is_cad = a.category == "cad_drawing";
                        let is_doc = a.category == "document" || a.category == "font" || a.category == "archive" || a.category == "data";

                        (is_multimedia && options.include_multimedia)
                            || (is_game && options.include_game)
                            || (is_cad && options.include_cad)
                            || (is_doc && options.include_documents)
                    });
                    
                    ar.orphans.retain(|o| {
                        let is_multimedia = o.category == "multimedia";
                        let is_game = o.category == "game_3d";
                        let is_cad = o.category == "cad_drawing";
                        let is_doc = o.category == "document" || o.category == "font" || o.category == "archive" || o.category == "data";

                        (is_multimedia && options.include_multimedia)
                            || (is_game && options.include_game)
                            || (is_cad && options.include_cad)
                            || (is_doc && options.include_documents)
                    });

                    ar.duplicates.retain(|d| {
                        if d.files.is_empty() {
                            return false;
                        }
                        if let Some(ext) = d.files[0].split('.').last() {
                            let ext_lower = ext.to_lowercase();
                            if let Some(cfg) = crate::engine::assets::get_asset_config(&ext_lower) {
                                let is_multimedia = cfg.category == "multimedia";
                                let is_game = cfg.category == "game_3d";
                                let is_cad = cfg.category == "cad_drawing";
                                let is_doc = cfg.category == "document" || cfg.category == "font" || cfg.category == "archive" || cfg.category == "data";

                                return (is_multimedia && options.include_multimedia)
                                    || (is_game && options.include_game)
                                    || (is_cad && options.include_cad)
                                    || (is_doc && options.include_documents);
                            }
                        }
                        true
                    });

                    ar.optimization_hints.retain(|h| {
                        if let Some(ext) = h.path.split('.').last() {
                            let ext_lower = ext.to_lowercase();
                            if let Some(cfg) = crate::engine::assets::get_asset_config(&ext_lower) {
                                let is_multimedia = cfg.category == "multimedia";
                                let is_game = cfg.category == "game_3d";
                                let is_cad = cfg.category == "cad_drawing";
                                let is_doc = cfg.category == "document" || cfg.category == "font" || cfg.category == "archive" || cfg.category == "data";

                                return (is_multimedia && options.include_multimedia)
                                    || (is_game && options.include_game)
                                    || (is_cad && options.include_cad)
                                    || (is_doc && options.include_documents);
                            }
                        }
                        true
                    });
                }
            }

            serde_json::to_string_pretty(&summary)
                .map_err(|e| format!("Failed to generate JSON: {}", e))?
        }
        "csv" => {
            let mut csv = String::new();
            csv.push_str("File Name,Path,Category/Language,Lines of Code (LOC),Source Code,Comments,Blanks,Size (Bytes),Complexity\n");
            
            if options.include_code {
                for f in &summary.files {
                    let name = f.name.replace('"', "\"\"");
                    let fpath = f.path.replace('"', "\"\"");
                    csv.push_str(&format!(
                        "\"{}\",\"{}\",\"{}\",{},{},{},{},{},{:.1}\n",
                        name, fpath, f.lang, f.loc, f.code, f.comments, f.blanks, f.size_bytes, f.complexity
                    ));
                }
            }

            if let Some(ref ar) = summary.asset_report {
                for a in &ar.assets {
                    let is_multimedia = a.category == "multimedia";
                    let is_game = a.category == "game_3d";
                    let is_cad = a.category == "cad_drawing";
                    let is_doc = a.category == "document" || a.category == "font" || a.category == "archive" || a.category == "data";

                    if (is_multimedia && options.include_multimedia)
                        || (is_game && options.include_game)
                        || (is_cad && options.include_cad)
                        || (is_doc && options.include_documents)
                    {
                        let name = a.name.replace('"', "\"\"");
                        let fpath = a.path.replace('"', "\"\"");
                        csv.push_str(&format!(
                            "\"{}\",\"{}\",\"{}\",0,0,0,0,{},0.0\n",
                            name, fpath, a.category, a.size
                        ));
                    }
                }
            }
            csv
        }
        "markdown" => {
            let mut md = String::new();
            md.push_str(&format!("# Codebase Analysis Report: {}\n\n", summary.path));
            md.push_str(&format!("*Scan Duration:* {} ms\n\n", summary.scan_duration_ms));
            
            if options.include_code {
                md.push_str("## Project Summary (Code)\n\n");
                md.push_str(&format!("- **Total Files:** {}\n", summary.total_files));
                md.push_str(&format!("- **Total Languages:** {}\n", summary.total_languages));
                md.push_str(&format!("- **Total Lines of Code (LOC):** {} (Code: {}, Comments: {}, Blanks: {})\n", summary.total_loc, summary.total_code, summary.total_comments, summary.total_blanks));
                md.push_str(&format!("- **Average Cyclomatic Complexity:** {:.1}\n", summary.average_complexity));
                md.push_str(&format!("- **Duplicate Files:** {}\n\n", summary.duplicates));

                md.push_str("## Language Distribution\n\n");
                md.push_str("| Language | Files | Code Lines | Comment Lines | Blank Lines | Percentage |\n");
                md.push_str("| --- | --- | --- | --- | --- | --- |\n");
                for l in &summary.languages {
                    md.push_str(&format!(
                        "| {} | {} | {} | {} | {} | {:.1}% |\n",
                        l.name, l.files, l.code, l.comments, l.blanks, l.pct
                    ));
                }
                md.push_str("\n");
            }

            if let Some(ref ar) = summary.asset_report {
                if options.include_multimedia {
                    let count = ar.summary.category_counts.get("multimedia").copied().unwrap_or(0);
                    let size = ar.summary.category_sizes.get("multimedia").copied().unwrap_or(0) as f64 / (1024.0 * 1024.0);
                    md.push_str("## Multimedia Assets\n\n");
                    md.push_str(&format!("- **Total Files:** {}\n", count));
                    md.push_str(&format!("- **Total Size:** {:.2} MB\n\n", size));
                }
                if options.include_game {
                    let count = ar.summary.category_counts.get("game_3d").copied().unwrap_or(0);
                    let size = ar.summary.category_sizes.get("game_3d").copied().unwrap_or(0) as f64 / (1024.0 * 1024.0);
                    md.push_str("## Game & 3D Assets\n\n");
                    md.push_str(&format!("- **Total Files:** {}\n", count));
                    md.push_str(&format!("- **Total Size:** {:.2} MB\n\n", size));
                }
                if options.include_cad {
                    let count = ar.summary.category_counts.get("cad_drawing").copied().unwrap_or(0);
                    let size = ar.summary.category_sizes.get("cad_drawing").copied().unwrap_or(0) as f64 / (1024.0 * 1024.0);
                    md.push_str("## CAD Drawings\n\n");
                    md.push_str(&format!("- **Total Files:** {}\n", count));
                    md.push_str(&format!("- **Total Size:** {:.2} MB\n\n", size));
                }
                if options.include_documents {
                    let doc_count = ar.summary.category_counts.get("document").copied().unwrap_or(0);
                    let doc_size = ar.summary.category_sizes.get("document").copied().unwrap_or(0) as f64 / (1024.0 * 1024.0);
                    md.push_str("## Documents & Other Assets\n\n");
                    md.push_str(&format!("- **Total Files:** {}\n", doc_count));
                    md.push_str(&format!("- **Total Size:** {:.2} MB\n\n", doc_size));
                }
            }
            md
        }
        "html" => {
            let mut html = String::new();
            html.push_str("<!DOCTYPE html>\n<html>\n<head>\n");
            html.push_str("<title>Codebase Analysis Report</title>\n");
            html.push_str("<style>\n");
            html.push_str("body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0d0c15; color: #e2e1e6; margin: 40px; }\n");
            html.push_str("h1, h2 { color: #f59e0b; }\n");
            html.push_str("table { width: 100%; border-collapse: collapse; margin-top: 20px; }\n");
            html.push_str("th, td { border: 1px solid #2a2935; padding: 12px; text-align: left; }\n");
            html.push_str("th { background-color: #1a1825; }\n");
            html.push_str("tr:nth-child(even) { background-color: #14121e; }\n");
            html.push_str("</style>\n</head>\n<body>\n");
            html.push_str(&format!("<h1>Codebase Analysis Report</h1>\n"));
            html.push_str(&format!("<p><strong>Target Directory:</strong> {}</p>\n", summary.path));
            html.push_str(&format!("<p><strong>Scan Duration:</strong> {} ms</p>\n", summary.scan_duration_ms));
            
            if options.include_code {
                html.push_str("<h2>Summary Metrics (Code)</h2>\n<ul>\n");
                html.push_str(&format!("<li><strong>Total Files:</strong> {}</li>\n", summary.total_files));
                html.push_str(&format!("<li><strong>Total Lines of Code (LOC):</strong> {}</li>\n", summary.total_loc));
                html.push_str(&format!("<li><strong>Average Complexity:</strong> {:.1}</li>\n", summary.average_complexity));
                html.push_str("</ul>\n");
                
                html.push_str("<h2>Language Distribution</h2>\n<table>\n<thead>\n<tr>\n<th>Language</th><th>Files</th><th>Code</th><th>Comments</th><th>Blanks</th><th>Percentage</th>\n</tr>\n</thead>\n<tbody>\n");
                for l in &summary.languages {
                    html.push_str(&format!(
                        "<tr><td>{}</td><td>{}</td><td>{}</td><td>{}</td><td>{}</td><td>{:.1}%</td></tr>\n",
                        l.name, l.files, l.code, l.comments, l.blanks, l.pct
                    ));
                }
                html.push_str("</tbody>\n</table>\n");
            }

            if let Some(ref ar) = summary.asset_report {
                if options.include_multimedia {
                    let count = ar.summary.category_counts.get("multimedia").copied().unwrap_or(0);
                    let size = ar.summary.category_sizes.get("multimedia").copied().unwrap_or(0) as f64 / (1024.0 * 1024.0);
                    html.push_str(&format!("<h2>Multimedia Assets</h2>\n<p><strong>Total Files:</strong> {}</p>\n<p><strong>Total Size:</strong> {:.2} MB</p>\n", count, size));
                }
                if options.include_game {
                    let count = ar.summary.category_counts.get("game_3d").copied().unwrap_or(0);
                    let size = ar.summary.category_sizes.get("game_3d").copied().unwrap_or(0) as f64 / (1024.0 * 1024.0);
                    html.push_str(&format!("<h2>Game & 3D Assets</h2>\n<p><strong>Total Files:</strong> {}</p>\n<p><strong>Total Size:</strong> {:.2} MB</p>\n", count, size));
                }
                if options.include_cad {
                    let count = ar.summary.category_counts.get("cad_drawing").copied().unwrap_or(0);
                    let size = ar.summary.category_sizes.get("cad_drawing").copied().unwrap_or(0) as f64 / (1024.0 * 1024.0);
                    html.push_str(&format!("<h2>CAD Drawings</h2>\n<p><strong>Total Files:</strong> {}</p>\n<p><strong>Total Size:</strong> {:.2} MB</p>\n", count, size));
                }
                if options.include_documents {
                    let count = ar.summary.category_counts.get("document").copied().unwrap_or(0);
                    let size = ar.summary.category_sizes.get("document").copied().unwrap_or(0) as f64 / (1024.0 * 1024.0);
                    html.push_str(&format!("<h2>Documents & Other Assets</h2>\n<p><strong>Total Files:</strong> {}</p>\n<p><strong>Total Size:</strong> {:.2} MB</p>\n", count, size));
                }
            }
            
            html.push_str("</body>\n</html>\n");
            html
        }
        _ => return Err(format!("Unsupported export format: {}", format)),
    };

    let mut file = File::create(path).map_err(|e| format!("Failed to create export file: {}", e))?;
    file.write_all(content.as_bytes())
        .map_err(|e| format!("Failed to write export file: {}", e))?;

    Ok(())
}
