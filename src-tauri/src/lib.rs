pub mod commands {
    pub mod vault;
    pub mod network;
    pub mod model;
    pub mod memory;
}

use commands::vault::{VaultManager, vault_get_status, vault_unlock, vault_lock, vault_export_backup};
use commands::network::{NetworkBrokerManager, network_get_state, network_set_mode, network_validate_url};
use commands::model::model_check_runtime;
use commands::memory::memory_query;

pub fn run() {
    tauri::Builder::default()
        .manage(VaultManager::new())
        .manage(NetworkBrokerManager::new())
        .invoke_handler(tauri::generate_handler![
            vault_get_status,
            vault_unlock,
            vault_lock,
            vault_export_backup,
            network_get_state,
            network_set_mode,
            network_validate_url,
            model_check_runtime,
            memory_query
        ])
        .run(tauri::generate_context!())
        .expect("error while running Proofline Tauri desktop application");
}
