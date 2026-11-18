use axum::extract::{Query, State};
use axum::routing::get;
use axum::{Json, Router};
use serde::Deserialize;

use crate::auth::StaffClaims;
use crate::error::ApiResult;
use crate::models::report::AttendanceSummary;
use crate::state::AppState;

pub fn router() -> Router<AppState> {
    Router::new().route("/attendance", get(summary))
}

#[derive(Debug, Deserialize)]
pub struct SummaryFilter {
    pub usn: Option<String>,
}

async fn summary(
    State(state): State<AppState>,
    _: StaffClaims,
    Query(filter): Query<SummaryFilter>,
) -> ApiResult<Json<Vec<AttendanceSummary>>> {
    let rows = sqlx::query_as::<_, AttendanceSummary>(
        "SELECT usn, student_name, class_id, class_name, total_classes, \
         present_count, absent_count, late_count, excused_count, \
         attendance_percentage::double precision AS attendance_percentage \
         FROM v_student_attendance_summary \
         WHERE ($1::text IS NULL OR usn = $1) \
         ORDER BY usn, class_id",
    )
    .bind(filter.usn.as_deref())
    .fetch_all(&state.pool)
    .await?;

    Ok(Json(rows))
}
