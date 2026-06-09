use std::fs;
use locsight_lib::engine::techstack::detect_tech_stack;

#[test]
fn test_detect_game_engines_tech_stack() {
    let temp_dir = std::env::temp_dir().join("locsight_test_techstack_game");
    let _ = fs::create_dir_all(&temp_dir);

    // 1. Setup Unity mock (ProjectSettings/ProjectVersion.txt)
    let unity_project_dir = temp_dir.join("unity_project");
    let unity_settings_dir = unity_project_dir.join("ProjectSettings");
    fs::create_dir_all(&unity_settings_dir).unwrap();
    fs::write(unity_settings_dir.join("ProjectVersion.txt"), b"m_EditorVersion: 2022.3.0f1").unwrap();

    // 2. Setup Godot mock (project.godot)
    let godot_project_dir = temp_dir.join("godot_project");
    fs::create_dir_all(&godot_project_dir).unwrap();
    fs::write(godot_project_dir.join("project.godot"), b"config_version=5").unwrap();

    // 3. Setup Unreal mock (*.uproject at root)
    let unreal_project_dir = temp_dir.join("unreal_project");
    fs::create_dir_all(&unreal_project_dir).unwrap();
    fs::write(unreal_project_dir.join("MyAwesomeGame.uproject"), b"{}").unwrap();

    // Test Unity detection
    let detected_unity = detect_tech_stack(&unity_project_dir);
    let unity_item = detected_unity.iter().find(|i| i.name == "Unity").expect("Should detect Unity");
    assert_eq!(unity_item.category, "Game Engine");
    assert_eq!(unity_item.icon.as_deref(), Some("package"));

    // Test Godot detection
    let detected_godot = detect_tech_stack(&godot_project_dir);
    let godot_item = detected_godot.iter().find(|i| i.name == "Godot").expect("Should detect Godot");
    assert_eq!(godot_item.category, "Game Engine");
    assert_eq!(godot_item.icon.as_deref(), Some("compass"));

    // Test Unreal detection
    let detected_unreal = detect_tech_stack(&unreal_project_dir);
    let unreal_item = detected_unreal.iter().find(|i| i.name == "Unreal Engine").expect("Should detect Unreal Engine");
    assert_eq!(unreal_item.category, "Game Engine");
    assert_eq!(unreal_item.icon.as_deref(), Some("compass"));

    let _ = fs::remove_dir_all(&temp_dir);
}

#[test]
fn test_detect_cad_and_blender_tech_stack() {
    let temp_dir = std::env::temp_dir().join("locsight_test_techstack_cad");
    let _ = fs::create_dir_all(&temp_dir);

    // 1. Setup CAD mock (drawing.dwg at root)
    let cad_project_dir = temp_dir.join("cad_project");
    fs::create_dir_all(&cad_project_dir).unwrap();
    fs::write(cad_project_dir.join("blueprint.dwg"), b"dwg-data").unwrap();

    // 2. Setup Blender mock (model.blend at root)
    let blender_project_dir = temp_dir.join("blender_project");
    fs::create_dir_all(&blender_project_dir).unwrap();
    fs::write(blender_project_dir.join("character.blend"), b"blend-data").unwrap();

    // Test CAD detection
    let detected_cad = detect_tech_stack(&cad_project_dir);
    let cad_item = detected_cad.iter().find(|i| i.name == "CAD Drawings").expect("Should detect CAD Drawings");
    assert_eq!(cad_item.category, "CAD Tool");
    assert_eq!(cad_item.icon.as_deref(), Some("layers"));

    // Test Blender detection
    let detected_blender = detect_tech_stack(&blender_project_dir);
    let blender_item = detected_blender.iter().find(|i| i.name == "Blender").expect("Should detect Blender");
    assert_eq!(blender_item.category, "3D Design");
    assert_eq!(blender_item.icon.as_deref(), Some("box"));

    let _ = fs::remove_dir_all(&temp_dir);
}
