use axum::extract::State;
use axum::routing::get;
use axum::{Json, Router};

use crate::auth::StudentClaims;
use crate::error::ApiResult;
use crate::models::attendance::AttendanceRecord;
use crate::models::report::AttendanceSummary;
use crate::state::AppState;

pub fn router() -> Router<AppState> {
    Router::new()
        .route("/attendance", get(attendance))
        .route("/summary", get(summary))
}

async fn attendance(
    State(state): State<AppState>,
    StudentClaims(claims): StudentClaims,
) -> ApiResult<Json<Vec<AttendanceRecord>>> {
    let records = sqlx::query_as::<_, AttendanceRecord>(
        "SELECT rec_id, usn, class_id, staff_id, date, status, \"timestamp\" \
         FROM attendance_records WHERE usn = $1 \
         ORDER BY date DESC, rec_id DESC LIMIT 200",
    )
    .bind(&claims.sub)
    .fetch_all(&state.pool)
    .await?;

    Ok(Json(records))
}

async fn summary(
    State(state): State<AppState>,
    StudentClaims(claims): StudentClaims,
) -> ApiResult<Json<Vec<AttendanceSummary>>> {
    let rows = sqlx::query_as::<_, AttendanceSummary>(
        "SELECT usn, student_name, class_id, class_name, total_classes, \
         present_count, absent_count, late_count, excused_count, \
         attendance_percentage::double precision AS attendance_percentage \
         FROM v_student_attendance_summary WHERE usn = $1 \
         ORDER BY class_id",
    )
    .bind(&claims.sub)
    .fetch_all(&state.pool)
    .await?;

    Ok(Json(rows))
}
