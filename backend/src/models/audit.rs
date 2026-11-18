use serde::{Deserialize, Serialize};
use sqlx::FromRow;

#[derive(Debug, Serialize, FromRow)]
pub struct AuditEntry {
    pub log_id: i64,
    pub staff_id: Option<i32>,
    pub action_type: String,
    pub action_timestamp: chrono::NaiveDateTime,
}

#[derive(Debug, Deserialize)]
pub struct AuditFilter {
    pub limit: Option<i64>,
}
