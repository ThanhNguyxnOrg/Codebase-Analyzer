use locsight_lib::engine::assets::get_asset_config;

#[test]
fn test_get_asset_config() {
    let png_cfg = get_asset_config("png").expect("PNG should be registered");
    assert_eq!(png_cfg.name, "PNG");
    assert_eq!(png_cfg.category, "multimedia");
    assert_eq!(png_cfg.subcategory, "image");

    let fbx_cfg = get_asset_config("fbx").expect("FBX should be registered");
    assert_eq!(fbx_cfg.name, "FBX");
    assert_eq!(fbx_cfg.category, "game_3d");

    let dxf_cfg = get_asset_config("dxf").expect("DXF should be registered");
    assert_eq!(dxf_cfg.name, "DXF");
    assert_eq!(dxf_cfg.category, "cad_drawing");
}
