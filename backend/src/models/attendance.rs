use chrono::NaiveDate;
use serde::{Deserialize, Serialize};
use sqlx::FromRow;

use crate::error::{ApiError, ApiResult};

pub const STATUSES: [&str; 4] = ["Present", "Absent", "Late", "Excused"];

#[derive(Debug, Deserialize)]
pub struct AttendanceFilter {
    pub usn: Option<String>,
    pub class_id: Option<i32>,
    pub date: Option<NaiveDate>,
    pub status: Option<String>,
    pub limit: Option<i64>,
}

#[derive(Debug, Deserialize)]
pub struct MarkAttendanceRequest {
    pub usn: String,
    pub class_id: i32,
    pub date: NaiveDate,
    pub status: String,
}

#[derive(Debug, Deserialize)]
pub struct UpdateAttendanceRequest {
    pub status: String,
}

#[derive(Debug, Serialize, FromRow)]
pub struct AttendanceRecord {
    pub rec_id: i64,
    pub usn: String,
    pub class_id: i32,
    pub staff_id: Option<i32>,
    pub date: NaiveDate,
    pub status: String,
    #[serde(rename = "timestamp")]
    #[sqlx(rename = "timestamp")]
    pub recorded_at: chrono::NaiveDateTime,
}

pub fn validate_status(status: &str) -> ApiResult<()> {
    if STATUSES.contains(&status) {
        Ok(())
    } else {
        Err(ApiError::BadRequest(format!(
            "status must be one of {}",
            STATUSES.join(", ")
        )))
    }
}
