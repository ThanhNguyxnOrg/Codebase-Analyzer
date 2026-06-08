use std::fs::File;
use std::io::Write;
use crate::models::ProjectSummary;

#[tauri::command]
pub async fn export_report(path: String, format: String, summary: ProjectSummary) -> Result<(), String> {
    let content = match format.to_lowercase().as_str() {
        "json" => {
            serde_json::to_string_pretty(&summary)
                .map_err(|e| format!("Failed to generate JSON: {}", e))?
        }
        "csv" => {
            let mut csv = String::new();
            csv.push_str("File Name,Path,Language,Lines of Code (LOC),Source Code,Comments,Blanks,Size (Bytes),Complexity\n");
            for f in &summary.files {
                // Escape commas or quotes in names
                let name = f.name.replace('"', "\"\"");
                let fpath = f.path.replace('"', "\"\"");
                csv.push_str(&format!(
                    "\"{}\",\"{}\",\"{}\",{},{},{},{},{},{:.1}\n",
                    name, fpath, f.lang, f.loc, f.code, f.comments, f.blanks, f.size_bytes, f.complexity
                ));
            }
            csv
        }
        "markdown" => {
            let mut md = String::new();
            md.push_str(&format!("# Codebase Analysis Report: {}\n\n", summary.path));
            md.push_str(&format!("*Scan Duration:* {} ms\n\n", summary.scan_duration_ms));
            md.push_str("## Project Summary\n\n");
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
            html.push_str("<h2>Summary Metrics</h2>\n<ul>\n");
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
            html.push_str("</tbody>\n</table>\n</body>\n</html>\n");
            html
        }
        _ => return Err(format!("Unsupported export format: {}", format)),
    };

    let mut file = File::create(path).map_err(|e| format!("Failed to create export file: {}", e))?;
    file.write_all(content.as_bytes())
        .map_err(|e| format!("Failed to write export file: {}", e))?;

    Ok(())
}
