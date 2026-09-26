pub mod commands {
    pub mod vault;
    pub mod network;
    pub mod model;
    pub mod memory;
    pub mod storage;
}

use commands::vault::{VaultManager, vault_get_status, vault_unlock, vault_lock, vault_export_backup};
use commands::network::{NetworkBrokerManager, network_get_state, network_set_mode, network_validate_url};
use commands::model::model_check_runtime;
use commands::memory::memory_query;
use commands::storage::{
    NativeStorageManager, native_storage_save, native_storage_load_all, native_storage_get_status
};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let storage_mgr = NativeStorageManager::new().expect("Failed to initialize native SQLite storage");

    tauri::Builder::default()
        .manage(VaultManager::new())
        .manage(NetworkBrokerManager::new())
        .manage(storage_mgr)
        .invoke_handler(tauri::generate_handler![
            vault_get_status,
            vault_unlock,
            vault_lock,
            vault_export_backup,
            network_get_state,
            network_set_mode,
            network_validate_url,
            model_check_runtime,
            memory_query,
            native_storage_save,
            native_storage_load_all,
            native_storage_get_status
        ])
        .run(tauri::generate_context!())
        .expect("error while running Atkin application");
}
