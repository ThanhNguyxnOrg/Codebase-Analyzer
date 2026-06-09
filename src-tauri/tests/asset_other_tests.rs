use std::fs;
use locsight_lib::engine::assets::scan_assets;

#[test]
fn test_other_assets_classification() {
    let temp_dir = std::env::temp_dir().join("locsight_test_other_classification");
    let _ = fs::create_dir_all(&temp_dir);

    // Extensions from assets.toml
    let font_exts = vec!["ttf", "otf", "woff", "woff2"];
    let doc_exts = vec!["pdf", "docx", "doc", "xlsx", "xls", "pptx", "ppt"];
    let archive_exts = vec!["zip", "tar", "gz", "tgz", "7z", "rar"];
    let data_exts = vec!["sqlite", "db", "parquet", "arrow"];

    let mut asset_paths = Vec::new();

    // Fonts
    for (i, ext) in font_exts.iter().enumerate() {
        let path = temp_dir.join(format!("font_{}.{}", i, ext));
        fs::write(&path, b"mock-font").unwrap();
        asset_paths.push(path);
    }

    // Docs
    for (i, ext) in doc_exts.iter().enumerate() {
        let path = temp_dir.join(format!("doc_{}.{}", i, ext));
        fs::write(&path, b"mock-doc").unwrap();
        asset_paths.push(path);
    }

    // Archives
    for (i, ext) in archive_exts.iter().enumerate() {
        let path = temp_dir.join(format!("archive_{}.{}", i, ext));
        fs::write(&path, b"mock-archive").unwrap();
        asset_paths.push(path);
    }

    // Data
    for (i, ext) in data_exts.iter().enumerate() {
        let path = temp_dir.join(format!("db_{}.{}", i, ext));
        fs::write(&path, b"mock-db").unwrap();
        asset_paths.push(path);
    }

    let report = scan_assets(&asset_paths, &temp_dir, &[]);

    // Verify category counts
    assert_eq!(report.summary.category_counts.get("font").copied(), Some(font_exts.len() as u32));
    assert_eq!(report.summary.category_counts.get("document").copied(), Some(doc_exts.len() as u32));
    assert_eq!(report.summary.category_counts.get("archive").copied(), Some(archive_exts.len() as u32));
    assert_eq!(report.summary.category_counts.get("data").copied(), Some(data_exts.len() as u32));

    // Verify subcategory counts
    assert_eq!(report.summary.subcategory_counts.get("typography").copied(), Some(font_exts.len() as u32));
    assert_eq!(report.summary.subcategory_counts.get("office").copied(), Some(doc_exts.len() as u32));
    assert_eq!(report.summary.subcategory_counts.get("compress").copied(), Some(archive_exts.len() as u32));
    assert_eq!(report.summary.subcategory_counts.get("database").copied(), Some(data_exts.len() as u32));

    let _ = fs::remove_dir_all(&temp_dir);
}
