use std::collections::HashMap;
use std::fs::File;
use std::io::{self, Read};
use std::path::Path;
use sha2::{Digest, Sha256};

pub fn compute_sha256(path: &Path) -> io::Result<String> {
    let mut file = File::open(path)?;
    let mut hasher = Sha256::new();
    let mut buffer = [0; 8192];

    loop {
        let count = file.read(&mut buffer)?;
        if count == 0 {
            break;
        }
        hasher.update(&buffer[..count]);
    }

    Ok(hex::encode(hasher.finalize()))
}

pub fn find_duplicates(file_paths: &[String]) -> (u32, Vec<Vec<String>>) {
    let mut hash_map: HashMap<String, Vec<String>> = HashMap::new();

    for path_str in file_paths {
        let path = Path::new(path_str);
        if path.is_file() {
            if let Ok(hash) = compute_sha256(path) {
                hash_map.entry(hash).or_default().push(path_str.clone());
            }
        }
    }

    let mut duplicate_groups = Vec::new();
    let mut duplicate_count = 0;

    for (_, paths) in hash_map {
        if paths.len() > 1 {
            duplicate_count += paths.len() as u32;
            duplicate_groups.push(paths);
        }
    }

    (duplicate_count, duplicate_groups)
}
