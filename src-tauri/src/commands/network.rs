use serde::{Deserialize, Serialize};
use std::sync::Mutex;

#[derive(Debug, Serialize, Deserialize, Clone, PartialEq)]
#[serde(rename_all = "snake_case")]
pub enum NetworkMode {
    Offline,
    PublicResearch,
    ConnectedImports,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct NetworkBrokerState {
    pub current_mode: NetworkMode,
    pub whitelisted_domains: Vec<String>,
    pub blocked_requests_count: u64,
}

pub struct NetworkBrokerManager {
    pub state: Mutex<NetworkBrokerState>,
}

impl NetworkBrokerManager {
    pub fn new() -> Self {
        Self {
            state: Mutex::new(NetworkBrokerState {
                current_mode: NetworkMode::Offline,
                whitelisted_domains: vec![
                    "legislation.gov.uk".to_string(),
                    "caselaw.nationalarchives.gov.uk".to_string(),
                    "courtlistener.com".to_string(),
                    "eur-lex.europa.eu".to_string(),
                    "indiacode.nic.in".to_string(),
                ],
                blocked_requests_count: 0,
            }),
        }
    }
}

#[tauri::command]
pub async fn network_get_state(
    state: tauri::State<'_, NetworkBrokerManager>,
) -> Result<NetworkBrokerState, String> {
    let s = state.state.lock().map_err(|e| e.to_string())?;
    Ok(s.clone())
}

#[tauri::command]
pub async fn network_set_mode(
    mode: NetworkMode,
    state: tauri::State<'_, NetworkBrokerManager>,
) -> Result<NetworkBrokerState, String> {
    let mut s = state.state.lock().map_err(|e| e.to_string())?;
    s.current_mode = mode;
    Ok(s.clone())
}

#[tauri::command]
pub async fn network_validate_url(
    target_url: String,
    state: tauri::State<'_, NetworkBrokerManager>,
) -> Result<bool, String> {
    let mut s = state.state.lock().map_err(|e| e.to_string())?;
    
    if s.current_mode == NetworkMode::Offline {
        s.blocked_requests_count += 1;
        return Ok(false);
    }

    if s.current_mode == NetworkMode::PublicResearch {
        let is_allowed = s.whitelisted_domains.iter().any(|d| target_url.contains(d));
        if !is_allowed {
            s.blocked_requests_count += 1;
        }
        return Ok(is_allowed);
    }

    Ok(true)
}
