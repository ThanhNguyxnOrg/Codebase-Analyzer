use std::collections::HashMap;
use std::fs;
use std::path::Path;
use std::time::Instant;
use rayon::prelude::*;
use walkdir::WalkDir;

use crate::models::{FileInfo, LanguageStats, ProjectSummary};
use super::complexity::analyze_complexity;
use super::duplicate::find_duplicates;

#[derive(Clone, Copy)]
struct LanguageConfig {
    name: &'static str,
    single_line_comment: &'static str,
    multi_line_start: &'static str,
    multi_line_end: &'static str,
}

const LANGUAGE_CONFIGS: &[(&str, LanguageConfig)] = &[
    ("rs", LanguageConfig { name: "Rust", single_line_comment: "//", multi_line_start: "/*", multi_line_end: "*/" }),
    ("js", LanguageConfig { name: "JavaScript", single_line_comment: "//", multi_line_start: "/*", multi_line_end: "*/" }),
    ("jsx", LanguageConfig { name: "JavaScript", single_line_comment: "//", multi_line_start: "/*", multi_line_end: "*/" }),
    ("ts", LanguageConfig { name: "TypeScript", single_line_comment: "//", multi_line_start: "/*", multi_line_end: "*/" }),
    ("tsx", LanguageConfig { name: "TypeScript", single_line_comment: "//", multi_line_start: "/*", multi_line_end: "*/" }),
    ("py", LanguageConfig { name: "Python", single_line_comment: "#", multi_line_start: "\"\"\"", multi_line_end: "\"\"\"" }),
    ("cpp", LanguageConfig { name: "C/C++", single_line_comment: "//", multi_line_start: "/*", multi_line_end: "*/" }),
    ("cc", LanguageConfig { name: "C/C++", single_line_comment: "//", multi_line_start: "/*", multi_line_end: "*/" }),
    ("c", LanguageConfig { name: "C/C++", single_line_comment: "//", multi_line_start: "/*", multi_line_end: "*/" }),
    ("h", LanguageConfig { name: "C/C++", single_line_comment: "//", multi_line_start: "/*", multi_line_end: "*/" }),
    ("hpp", LanguageConfig { name: "C/C++", single_line_comment: "//", multi_line_start: "/*", multi_line_end: "*/" }),
    ("java", LanguageConfig { name: "Java", single_line_comment: "//", multi_line_start: "/*", multi_line_end: "*/" }),
    ("cs", LanguageConfig { name: "C#", single_line_comment: "//", multi_line_start: "/*", multi_line_end: "*/" }),
    ("go", LanguageConfig { name: "Go", single_line_comment: "//", multi_line_start: "/*", multi_line_end: "*/" }),
    ("html", LanguageConfig { name: "HTML", single_line_comment: "", multi_line_start: "<!--", multi_line_end: "-->" }),
    ("htm", LanguageConfig { name: "HTML", single_line_comment: "", multi_line_start: "<!--", multi_line_end: "-->" }),
    ("css", LanguageConfig { name: "CSS", single_line_comment: "", multi_line_start: "/*", multi_line_end: "*/" }),
    ("toml", LanguageConfig { name: "TOML", single_line_comment: "#", multi_line_start: "", multi_line_end: "" }),
    ("yaml", LanguageConfig { name: "YAML", single_line_comment: "#", multi_line_start: "", multi_line_end: "" }),
    ("yml", LanguageConfig { name: "YAML", single_line_comment: "#", multi_line_start: "", multi_line_end: "" }),
    ("json", LanguageConfig { name: "JSON", single_line_comment: "", multi_line_start: "", multi_line_end: "" }),
    ("md", LanguageConfig { name: "Markdown", single_line_comment: "", multi_line_start: "<!--", multi_line_end: "-->" }),
];

fn get_language_config(extension: &str) -> Option<LanguageConfig> {
    LANGUAGE_CONFIGS.iter().find(|&&(ext, _)| ext == extension).map(|&(_, config)| config)
}

fn parse_gitignore_rules(root: &Path) -> Vec<String> {
    let gitignore_path = root.join(".gitignore");
    let mut rules = vec![
        ".git".to_string(),
        "node_modules".to_string(),
        "target".to_string(),
        "build".to_string(),
        "dist".to_string(),
        ".svelte-kit".to_string(),
        ".next".to_string(),
        "out".to_string(),
        ".idea".to_string(),
        ".vscode".to_string(),
        ".gemini".to_string(),
        "Cargo.lock".to_string(),
        "package-lock.json".to_string(),
        "pnpm-lock.yaml".to_string(),
        "yarn.lock".to_string(),
    ];

    if gitignore_path.exists() {
        if let Ok(content) = fs::read_to_string(gitignore_path) {
            for line in content.lines() {
                let trimmed = line.trim();
                if trimmed.is_empty() || trimmed.starts_with('#') {
                    continue;
                }
                // Convert simple gitignore rules to standard check patterns
                let cleaned = trimmed.trim_start_matches('/').trim_end_matches('/');
                if !cleaned.is_empty() {
                    rules.push(cleaned.to_string());
                }
            }
        }
    }
    rules
}

fn should_ignore(path: &Path, root: &Path, ignore_rules: &[String]) -> bool {
    let relative_path = match path.strip_prefix(root) {
        Ok(p) => p,
        Err(_) => path,
    };

    let path_str = relative_path.to_string_lossy().replace('\\', "/");
    let components: Vec<&str> = path_str.split('/').collect();

    for rule in ignore_rules {
        let rule_cleaned = rule.replace('\\', "/");
        // Check directory/file match in components
        if components.iter().any(|&c| c == rule_cleaned || c == rule) {
            return true;
        }
        // Check wildcard match
        if path_str.contains(&rule_cleaned) {
            return true;
        }
    }
    false
}

pub fn scan_project_directory(root_path: &str) -> Result<ProjectSummary, String> {
    let start_time = Instant::now();
    let root = Path::new(root_path);
    if !root.exists() || !root.is_dir() {
        return Err("Target path does not exist or is not a directory".to_string());
    }

    let ignore_rules = parse_gitignore_rules(root);
    let mut files_to_scan = Vec::new();

    for entry in WalkDir::new(root).into_iter().filter_map(|e| e.ok()) {
        let path = entry.path();
        if path.is_file() {
            if !should_ignore(path, root, &ignore_rules) {
                if let Some(ext) = path.extension().and_then(|s| s.to_str()) {
                    let ext_lower = ext.to_lowercase();
                    if get_language_config(&ext_lower).is_some() {
                        files_to_scan.push(path.to_path_buf());
                    }
                }
            }
        }
    }

    let target_stems: Vec<(String, String)> = files_to_scan
        .iter()
        .filter_map(|p| {
            let stem = p.file_stem()?.to_string_lossy().to_string();
            let relative = p.strip_prefix(root).ok()?.to_string_lossy().to_string();
            Some((stem, relative))
        })
        .collect();

    // Parallel scan using rayon
    let results: Vec<(FileInfo, Vec<(String, String)>)> = files_to_scan
        .par_iter()
        .filter_map(|path| {
            let relative_path = path.strip_prefix(root).ok()?.to_string_lossy().to_string();
            let name = path.file_name()?.to_string_lossy().to_string();
            let extension = path.extension()?.to_string_lossy().to_lowercase();
            let config = get_language_config(&extension)?;

            let content = match fs::read_to_string(path) {
                Ok(c) => c,
                Err(_) => {
                    // Fallback to lossy reading if not clean UTF-8 (e.g. encoded text files)
                    let bytes = fs::read(path).ok()?;
                    String::from_utf8_lossy(&bytes).into_owned()
                }
            };

            let size_bytes = fs::metadata(path).ok()?.len();
            
            // Core line counting logic
            let mut code = 0;
            let mut comments = 0;
            let mut blanks = 0;
            let mut in_multiline = false;

            let ml_start = config.multi_line_start;
            let ml_end = config.multi_line_end;
            let sl_comment = config.single_line_comment;

            for line in content.lines() {
                let trimmed = line.trim();
                if trimmed.is_empty() {
                    blanks += 1;
                    continue;
                }

                if in_multiline {
                    comments += 1;
                    if !ml_end.is_empty() && trimmed.contains(ml_end) {
                        in_multiline = false;
                    }
                    continue;
                }

                if !ml_start.is_empty() && trimmed.starts_with(ml_start) {
                    comments += 1;
                    if !ml_end.is_empty() && !trimmed.ends_with(ml_end) {
                        in_multiline = true;
                    }
                    continue;
                }

                if !sl_comment.is_empty() && trimmed.starts_with(sl_comment) {
                    comments += 1;
                    continue;
                }

                code += 1;
            }

            let complexity = analyze_complexity(&content, &extension);

            let mut file_edges = Vec::new();
            for (stem, rel_target) in &target_stems {
                if rel_target != &relative_path && stem.len() > 3 {
                    if content.contains(stem) {
                        file_edges.push((relative_path.clone(), rel_target.clone()));
                    }
                }
            }

            Some((
                FileInfo {
                    name,
                    path: relative_path,
                    lang: config.name.to_string(),
                    loc: code + comments + blanks,
                    code,
                    comments,
                    blanks,
                    size_bytes,
                    complexity,
                },
                file_edges
            ))
        })
        .collect();

    let mut file_infos = Vec::new();
    let mut edges = Vec::new();
    for (info, mut fedges) in results {
        file_infos.push(info);
        edges.append(&mut fedges);
    }

    // Aggregate statistics
    let mut total_code = 0;
    let mut total_comments = 0;
    let mut total_blanks = 0;
    let mut lang_groups: HashMap<String, (u32, u64, u64, u64)> = HashMap::new();
    let mut file_paths_list = Vec::new();
    
    // For average complexity and histogram
    let mut total_complexity = 0.0;
    let mut complexity_dist = vec![0u32; 10]; // 10 bins

    for f in &file_infos {
        total_code += f.code;
        total_comments += f.comments;
        total_blanks += f.blanks;
        
        let entry = lang_groups
            .entry(f.lang.clone())
            .or_insert((0, 0, 0, 0));
        entry.0 += 1; // files
        entry.1 += f.code;
        entry.2 += f.comments;
        entry.3 += f.blanks;

        file_paths_list.push(root.join(&f.path).to_string_lossy().to_string());
        total_complexity += f.complexity;

        // Complexity histogram binning (bins: 1, 2-3, 4-5, 6-7, 8-9, 10-12, 13-15, 16-18, 19-20, 20+)
        let comp_idx = match f.complexity as u32 {
            0..=1 => 0,
            2..=3 => 1,
            4..=5 => 2,
            6..=7 => 3,
            8..=9 => 4,
            10..=12 => 5,
            13..=15 => 6,
            16..=18 => 7,
            19..=20 => 8,
            _ => 9,
        };
        complexity_dist[comp_idx] += 1;
    }

    let total_loc = total_code + total_comments + total_blanks;
    let mut languages: Vec<LanguageStats> = lang_groups
        .into_iter()
        .map(|(name, (files, code, comments, blanks))| {
            let pct = if total_loc > 0 {
                ((code + comments + blanks) as f64 / total_loc as f64) * 100.0
            } else {
                0.0
            };
            LanguageStats { name, files, code, comments, blanks, pct }
        })
        .collect();

    // Sort languages by loc descending
    languages.sort_by(|a, b| (b.code + b.comments + b.blanks).cmp(&(a.code + a.comments + a.blanks)));

    // Duplicate detection
    let (duplicates, duplicate_groups) = find_duplicates(&file_paths_list);

    // Make paths in duplicate groups relative to root for clean display
    let relative_duplicate_groups = duplicate_groups
        .into_iter()
        .map(|group| {
            group
                .into_iter()
                .filter_map(|abs_path| {
                    Path::new(&abs_path)
                        .strip_prefix(root)
                        .ok()
                        .map(|p| p.to_string_lossy().to_string())
                })
                .collect()
        })
        .collect();

    let average_complexity = if !file_infos.is_empty() {
        total_complexity / file_infos.len() as f64
    } else {
        1.0
    };

    let scan_duration_ms = start_time.elapsed().as_millis() as u64;

    Ok(ProjectSummary {
        path: root_path.to_string(),
        total_files: file_infos.len() as u32,
        total_languages: languages.len() as u32,
        total_code,
        total_comments,
        total_blanks,
        total_loc,
        languages,
        files: file_infos,
        duplicates,
        duplicate_groups: relative_duplicate_groups,
        average_complexity: (average_complexity * 10.0).round() / 10.0,
        complexity_dist,
        edges,
        scan_duration_ms,
    })
}
