use rusqlite::{params, Connection};
use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;
use std::sync::Mutex;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct NativeStorageStatus {
    pub database_path: String,
    pub matters_count: usize,
    pub documents_count: usize,
    pub drafts_count: usize,
    pub memories_count: usize,
    pub is_operational: bool,
}

pub struct NativeStorageManager {
    pub db_path: PathBuf,
    pub conn: Mutex<Connection>,
}

impl NativeStorageManager {
    pub fn new() -> Result<Self, String> {
        let base_dir = dirs::data_local_dir()
            .map(|p| p.join("Atkin"))
            .unwrap_or_else(|| PathBuf::from("./.atkin_data"));

        fs::create_dir_all(&base_dir).map_err(|e| format!("Failed to create storage dir: {}", e))?;
        let db_path = base_dir.join("atkin_store.db");

        let conn = Connection::open(&db_path).map_err(|e| format!("Failed to open sqlite db: {}", e))?;

        // Initialize tables for offline-first legal workspace mirroring
        conn.execute_batch(
            "CREATE TABLE IF NOT EXISTS user_profiles (
                id TEXT PRIMARY KEY,
                json TEXT NOT NULL,
                updated_at TEXT NOT NULL
            );
            CREATE TABLE IF NOT EXISTS matters (
                id TEXT PRIMARY KEY,
                json TEXT NOT NULL,
                updated_at TEXT NOT NULL
            );
            CREATE TABLE IF NOT EXISTS documents (
                id TEXT PRIMARY KEY,
                matter_id TEXT NOT NULL,
                sha256 TEXT,
                json TEXT NOT NULL,
                updated_at TEXT NOT NULL
            );
            CREATE TABLE IF NOT EXISTS drafts (
                id TEXT PRIMARY KEY,
                matter_id TEXT NOT NULL,
                json TEXT NOT NULL,
                updated_at TEXT NOT NULL
            );
            CREATE TABLE IF NOT EXISTS memories (
                id TEXT PRIMARY KEY,
                matter_id TEXT,
                scope TEXT NOT NULL,
                json TEXT NOT NULL,
                updated_at TEXT NOT NULL
            );"
        ).map_err(|e| format!("Failed to create sqlite tables: {}", e))?;

        Ok(Self {
            db_path,
            conn: Mutex::new(conn),
        })
    }
}

#[tauri::command]
pub async fn native_storage_save(
    state: tauri::State<'_, NativeStorageManager>,
    table: String,
    id: String,
    parent_id: Option<String>,
    json_data: String,
) -> Result<bool, String> {
    let conn = state.conn.lock().map_err(|e| e.to_string())?;
    let now = chrono::Utc::now().to_rfc3339();

    match table.as_str() {
        "user_profiles" => {
            conn.execute(
                "INSERT INTO user_profiles (id, json, updated_at) VALUES (?1, ?2, ?3)
                 ON CONFLICT(id) DO UPDATE SET json = excluded.json, updated_at = excluded.updated_at",
                params![id, json_data, now],
            ).map_err(|e| e.to_string())?;
        }
        "matters" => {
            conn.execute(
                "INSERT INTO matters (id, json, updated_at) VALUES (?1, ?2, ?3)
                 ON CONFLICT(id) DO UPDATE SET json = excluded.json, updated_at = excluded.updated_at",
                params![id, json_data, now],
            ).map_err(|e| e.to_string())?;
        }
        "documents" => {
            let pid = parent_id.unwrap_or_default();
            conn.execute(
                "INSERT INTO documents (id, matter_id, sha256, json, updated_at) VALUES (?1, ?2, '', ?3, ?4)
                 ON CONFLICT(id) DO UPDATE SET json = excluded.json, updated_at = excluded.updated_at",
                params![id, pid, json_data, now],
            ).map_err(|e| e.to_string())?;
        }
        "drafts" => {
            let pid = parent_id.unwrap_or_default();
            conn.execute(
                "INSERT INTO drafts (id, matter_id, json, updated_at) VALUES (?1, ?2, ?3, ?4)
                 ON CONFLICT(id) DO UPDATE SET json = excluded.json, updated_at = excluded.updated_at",
                params![id, pid, json_data, now],
            ).map_err(|e| e.to_string())?;
        }
        "memories" => {
            let pid = parent_id;
            conn.execute(
                "INSERT INTO memories (id, matter_id, scope, json, updated_at) VALUES (?1, ?2, 'matter', ?3, ?4)
                 ON CONFLICT(id) DO UPDATE SET json = excluded.json, updated_at = excluded.updated_at",
                params![id, pid, json_data, now],
            ).map_err(|e| e.to_string())?;
        }
        _ => return Err(format!("Unsupported table: {}", table)),
    }

    Ok(true)
}

#[tauri::command]
pub async fn native_storage_load_all(
    state: tauri::State<'_, NativeStorageManager>,
    table: String,
    parent_id: Option<String>,
) -> Result<Vec<String>, String> {
    let conn = state.conn.lock().map_err(|e| e.to_string())?;
    let mut results = Vec::new();

    match table.as_str() {
        "user_profiles" => {
            let mut stmt = conn.prepare("SELECT json FROM user_profiles").map_err(|e| e.to_string())?;
            let rows = stmt.query_map([], |row| row.get::<_, String>(0)).map_err(|e| e.to_string())?;
            for r in rows {
                results.push(r.map_err(|e| e.to_string())?);
            }
        }
        "matters" => {
            let mut stmt = conn.prepare("SELECT json FROM matters ORDER BY updated_at DESC").map_err(|e| e.to_string())?;
            let rows = stmt.query_map([], |row| row.get::<_, String>(0)).map_err(|e| e.to_string())?;
            for r in rows {
                results.push(r.map_err(|e| e.to_string())?);
            }
        }
        "documents" => {
            if let Some(pid) = parent_id {
                let mut stmt = conn.prepare("SELECT json FROM documents WHERE matter_id = ?1").map_err(|e| e.to_string())?;
                let rows = stmt.query_map([pid], |row| row.get::<_, String>(0)).map_err(|e| e.to_string())?;
                for r in rows {
                    results.push(r.map_err(|e| e.to_string())?);
                }
            } else {
                let mut stmt = conn.prepare("SELECT json FROM documents").map_err(|e| e.to_string())?;
                let rows = stmt.query_map([], |row| row.get::<_, String>(0)).map_err(|e| e.to_string())?;
                for r in rows {
                    results.push(r.map_err(|e| e.to_string())?);
                }
            }
        }
        "drafts" => {
            if let Some(pid) = parent_id {
                let mut stmt = conn.prepare("SELECT json FROM drafts WHERE matter_id = ?1").map_err(|e| e.to_string())?;
                let rows = stmt.query_map([pid], |row| row.get::<_, String>(0)).map_err(|e| e.to_string())?;
                for r in rows {
                    results.push(r.map_err(|e| e.to_string())?);
                }
            } else {
                let mut stmt = conn.prepare("SELECT json FROM drafts").map_err(|e| e.to_string())?;
                let rows = stmt.query_map([], |row| row.get::<_, String>(0)).map_err(|e| e.to_string())?;
                for r in rows {
                    results.push(r.map_err(|e| e.to_string())?);
                }
            }
        }
        "memories" => {
            let mut stmt = conn.prepare("SELECT json FROM memories").map_err(|e| e.to_string())?;
            let rows = stmt.query_map([], |row| row.get::<_, String>(0)).map_err(|e| e.to_string())?;
            for r in rows {
                results.push(r.map_err(|e| e.to_string())?);
            }
        }
        _ => return Err(format!("Unsupported table: {}", table)),
    }

    Ok(results)
}

#[tauri::command]
pub async fn native_storage_get_status(
    state: tauri::State<'_, NativeStorageManager>,
) -> Result<NativeStorageStatus, String> {
    let conn = state.conn.lock().map_err(|e| e.to_string())?;

    let matters_count: usize = conn.query_row("SELECT COUNT(*) FROM matters", [], |r| r.get(0)).unwrap_or(0);
    let documents_count: usize = conn.query_row("SELECT COUNT(*) FROM documents", [], |r| r.get(0)).unwrap_or(0);
    let drafts_count: usize = conn.query_row("SELECT COUNT(*) FROM drafts", [], |r| r.get(0)).unwrap_or(0);
    let memories_count: usize = conn.query_row("SELECT COUNT(*) FROM memories", [], |r| r.get(0)).unwrap_or(0);

    Ok(NativeStorageStatus {
        database_path: state.db_path.to_string_lossy().to_string(),
        matters_count,
        documents_count,
        drafts_count,
        memories_count,
        is_operational: true,
    })
}
