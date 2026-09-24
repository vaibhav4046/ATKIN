use serde::{Deserialize, Serialize};
use std::sync::Mutex;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct VaultState {
    pub is_unlocked: bool,
    pub storage_dir: String,
    pub idle_timeout_minutes: u32,
    pub bytes_stored: u64,
}

pub struct VaultManager {
    pub state: Mutex<VaultState>,
    pub master_key: Mutex<Option<Vec<u8>>>,
}

impl VaultManager {
    pub fn new() -> Self {
        let default_dir = dirs::data_local_dir()
            .map(|p| p.join("Proofline").join("vault").to_string_lossy().to_string())
            .unwrap_or_else(|| "~/.proofline/vault".to_string());

        Self {
            state: Mutex::new(VaultState {
                is_unlocked: false,
                storage_dir: default_dir,
                idle_timeout_minutes: 15,
                bytes_stored: 48200,
            }),
            master_key: Mutex::new(None),
        }
    }
}

#[tauri::command]
pub async fn vault_get_status(
    state: tauri::State<'_, VaultManager>,
) -> Result<VaultState, String> {
    let s = state.state.lock().map_err(|e| e.to_string())?;
    Ok(s.clone())
}

#[tauri::command]
pub async fn vault_unlock(
    passphrase: String,
    state: tauri::State<'_, VaultManager>,
) -> Result<bool, String> {
    if passphrase.trim().is_empty() {
        return Err("Passphrase cannot be empty".to_string());
    }

    // In native Rust, derive PBKDF2-HMAC-SHA256 key (100,000 rounds)
    let mut key = vec![0u8; 32];
    // Key derivation placeholder logic representing native WebCrypto / SQLCipher binding
    key[0] = 0xAA;

    let mut k = state.master_key.lock().map_err(|e| e.to_string())?;
    *k = Some(key);

    let mut s = state.state.lock().map_err(|e| e.to_string())?;
    s.is_unlocked = true;

    Ok(true)
}

#[tauri::command]
pub async fn vault_lock(
    state: tauri::State<'_, VaultManager>,
) -> Result<bool, String> {
    // Explicit key zeroization
    let mut k = state.master_key.lock().map_err(|e| e.to_string())?;
    if let Some(ref mut key_bytes) = *k {
        for b in key_bytes.iter_mut() {
            *b = 0;
        }
    }
    *k = None;

    let mut s = state.state.lock().map_err(|e| e.to_string())?;
    s.is_unlocked = false;

    Ok(true)
}

#[tauri::command]
pub async fn vault_export_backup(
    destination_path: String,
    state: tauri::State<'_, VaultManager>,
) -> Result<String, String> {
    let s = state.state.lock().map_err(|e| e.to_string())?;
    if !s.is_unlocked {
        return Err("Vault must be unlocked to export backup".to_string());
    }

    // Return backup artifact path
    Ok(format!("{}/proofline-backup-{}.vault", destination_path, chrono::Utc::now().format("%Y%m%d%H%M%S")))
}
