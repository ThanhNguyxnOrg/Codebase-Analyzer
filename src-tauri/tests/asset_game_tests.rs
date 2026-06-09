use std::fs;
use locsight_lib::engine::assets::scan_assets;

#[test]
fn test_game_assets_classification() {
    let temp_dir = std::env::temp_dir().join("locsight_test_game_classification");
    let _ = fs::create_dir_all(&temp_dir);

    // List of all supported Game/3D extensions from assets.toml
    let model_exts = vec!["fbx", "obj", "gltf", "glb", "blend", "stl", "dae"];
    let texture_exts = vec!["tga", "dds"];
    let config_exts = vec!["meta", "prefab", "unity", "asset", "uasset", "umap", "uproject", "tscn", "tres", "gdns", "gdnlib", "import"];

    let mut asset_paths = Vec::new();

    // Models
    for (i, ext) in model_exts.iter().enumerate() {
        let path = temp_dir.join(format!("test_model_{}.{}", i, ext));
        fs::write(&path, b"mock-model-data").unwrap();
        asset_paths.push(path);
    }

    // Textures
    for (i, ext) in texture_exts.iter().enumerate() {
        let path = temp_dir.join(format!("test_tex_{}.{}", i, ext));
        fs::write(&path, b"mock-texture-data").unwrap();
        asset_paths.push(path);
    }

    // Configs
    for (i, ext) in config_exts.iter().enumerate() {
        let path = temp_dir.join(format!("test_cfg_{}.{}", i, ext));
        fs::write(&path, b"mock-config-data").unwrap();
        asset_paths.push(path);
    }

    let report = scan_assets(&asset_paths, &temp_dir, &[]);

    // Verify category mapping
    assert_eq!(report.summary.total_files, (model_exts.len() + texture_exts.len() + config_exts.len()) as u32);
    assert_eq!(report.summary.category_counts.get("game_3d").copied(), Some(report.summary.total_files));

    // Verify subcategories
    assert_eq!(report.summary.subcategory_counts.get("model").copied(), Some(model_exts.len() as u32));
    assert_eq!(report.summary.subcategory_counts.get("texture").copied(), Some(texture_exts.len() as u32));
    assert_eq!(report.summary.subcategory_counts.get("config").copied(), Some(config_exts.len() as u32));

    let _ = fs::remove_dir_all(&temp_dir);
}

#[test]
fn test_game_engine_relations_and_orphans() {
    let temp_dir = std::env::temp_dir().join("locsight_test_game_relations");
    let _ = fs::create_dir_all(&temp_dir);

    // 1. Create a scene file (Godot .tscn)
    let scene_path = temp_dir.join("level1.tscn");
    fs::write(&scene_path, b"[ext_resource type=\"Texture2D\" path=\"res://character_skin.png\" id=\"1\"]").unwrap();

    // 2. Create character_skin.png referenced by scene
    let texture_path = temp_dir.join("character_skin.png");
    fs::write(&texture_path, b"mock-texture-bytes").unwrap();

    // 3. Create a background texture NOT referenced anywhere
    let bg_path = temp_dir.join("unused_bg.png");
    fs::write(&bg_path, b"mock-bg-texture-bytes").unwrap();

    // 4. Create a main.cs code file referencing the level1.tscn
    let code_path = temp_dir.join("GameController.cs");
    fs::write(&code_path, b"LoadScene(\"level1.tscn\");").unwrap();

    let asset_paths = vec![scene_path, texture_path, bg_path];
    let code_paths = vec![code_path];

    let report = scan_assets(&asset_paths, &temp_dir, &code_paths);

    // Verify relationship edges
    assert!(!report.edges.is_empty());
    let edge_exists = report.edges.iter().any(|(src, dest)| src == "level1.tscn" && dest == "character_skin.png");
    assert!(edge_exists, "Expected relation level1.tscn -> character_skin.png, got: {:?}", report.edges);

    // Verify orphans
    // - level1.tscn is referenced by GameController.cs -> not orphan
    // - character_skin.png is referenced by level1.tscn -> not orphan
    // - unused_bg.png is not referenced anywhere -> orphan
    let orphan_paths: std::collections::HashSet<String> = report.orphans.iter().map(|o| o.path.clone()).collect();
    
    assert!(!orphan_paths.contains("level1.tscn"));
    assert!(!orphan_paths.contains("character_skin.png"));
    assert!(orphan_paths.contains("unused_bg.png"));

    let _ = fs::remove_dir_all(&temp_dir);
}
