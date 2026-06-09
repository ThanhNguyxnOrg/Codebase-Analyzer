use std::fs;
use locsight_lib::engine::assets::scan_assets;

#[test]
fn test_cad_assets_classification() {
    let temp_dir = std::env::temp_dir().join("locsight_test_cad_classification");
    let _ = fs::create_dir_all(&temp_dir);

    // CAD drawing extensions from assets.toml
    let cad_exts = vec!["dxf", "dwg", "step", "stp", "iges", "igs"];
    let mut asset_paths = Vec::new();

    for (i, ext) in cad_exts.iter().enumerate() {
        let path = temp_dir.join(format!("blueprint_{}.{}", i, ext));
        fs::write(&path, b"mock-cad-drawing-data").unwrap();
        asset_paths.push(path);
    }

    let report = scan_assets(&asset_paths, &temp_dir, &[]);

    // Verify category and subcategory mapping
    assert_eq!(report.summary.total_files, cad_exts.len() as u32);
    assert_eq!(report.summary.category_counts.get("cad_drawing").copied(), Some(cad_exts.len() as u32));
    assert_eq!(report.summary.subcategory_counts.get("drawing").copied(), Some(cad_exts.len() as u32));

    let _ = fs::remove_dir_all(&temp_dir);
}

#[test]
fn test_cad_xref_graph() {
    let temp_dir = std::env::temp_dir().join("locsight_test_cad_xref");
    let _ = fs::create_dir_all(&temp_dir);

    // 1. Create a parent DXF file referencing child_drawing.dxf as an Xref
    let dxf_parent_path = temp_dir.join("parent_layout.dxf");
    fs::write(&dxf_parent_path, b"0\nSECTION\n2\nBLOCKS\n0\nBLOCK\n2\nchild_drawing.dxf\n1\nC:\\Project\\child_drawing.dxf\nENDSEC").unwrap();

    // 2. Create the child DXF drawing
    let dxf_child_path = temp_dir.join("child_drawing.dxf");
    fs::write(&dxf_child_path, b"mock-child-dxf-content").unwrap();

    let asset_paths = vec![dxf_parent_path, dxf_child_path];
    let report = scan_assets(&asset_paths, &temp_dir, &[]);

    // Verify relationship edge was detected (parent_layout.dxf -> child_drawing.dxf)
    assert!(!report.edges.is_empty());
    let edge_exists = report.edges.iter().any(|(src, dest)| src == "parent_layout.dxf" && dest == "child_drawing.dxf");
    assert!(edge_exists, "Expected xref parent_layout.dxf -> child_drawing.dxf, edges: {:?}", report.edges);

    let _ = fs::remove_dir_all(&temp_dir);
}
