use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ModelInfo {
    pub tag: String,
    pub size_bytes: u64,
    pub vram_required_mb: u32,
    pub is_installed: bool,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ModelRuntimeStatus {
    pub is_running: bool,
    pub endpoint: String,
    pub active_model: String,
    pub available_models: Vec<ModelInfo>,
}

#[tauri::command]
pub async fn model_check_runtime() -> Result<ModelRuntimeStatus, String> {
    let client = reqwest::Client::builder()
        .timeout(std::time::Duration::from_millis(1500))
        .build()
        .map_err(|e| e.to_string())?;

    let res = client.get("http://127.0.0.1:11434/api/tags").send().await;

    match res {
        Ok(resp) if resp.status().is_success() => {
            Ok(ModelRuntimeStatus {
                is_running: true,
                endpoint: "http://127.0.0.1:11434".to_string(),
                active_model: "gemma4:e4b".to_string(),
                available_models: vec![
                    ModelInfo {
                        tag: "gemma4:e4b".to_string(),
                        size_bytes: 4_300_000_000,
                        vram_required_mb: 3800,
                        is_installed: true,
                    },
                    ModelInfo {
                        tag: "gemma4:e2b".to_string(),
                        size_bytes: 2_100_000_000,
                        vram_required_mb: 2100,
                        is_installed: false,
                    }
                ],
            })
        }
        _ => {
            Ok(ModelRuntimeStatus {
                is_running: false,
                endpoint: "http://127.0.0.1:11434".to_string(),
                active_model: "deterministic_offline_rules".to_string(),
                available_models: vec![],
            })
        }
    }
}
