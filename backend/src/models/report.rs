use serde::Serialize;
use sqlx::FromRow;

#[derive(Debug, Serialize, FromRow)]
pub struct AttendanceSummary {
    pub usn: String,
    pub student_name: String,
    pub class_id: i32,
    pub class_name: String,
    pub total_classes: i64,
    pub present_count: i64,
    pub absent_count: i64,
    pub late_count: i64,
    pub excused_count: i64,
    pub attendance_percentage: f64,
}
