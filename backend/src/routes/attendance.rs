use axum::extract::{Path, Query, State};
use axum::routing::{get, put};
use axum::{Json, Router};

use crate::auth::StaffClaims;
use crate::error::{ApiError, ApiResult};
use crate::models::attendance::{
    validate_status, AttendanceFilter, AttendanceRecord, MarkAttendanceRequest,
    UpdateAttendanceRequest,
};
use crate::state::AppState;

pub fn router() -> Router<AppState> {
    Router::new()
        .route("/", get(list).post(mark))
        .route("/{id}", put(update).delete(remove))
}

async fn list(
    State(state): State<AppState>,
    _: StaffClaims,
    Query(filter): Query<AttendanceFilter>,
) -> ApiResult<Json<Vec<AttendanceRecord>>> {
    if let Some(status) = &filter.status {
        validate_status(status)?;
    }

    let records = sqlx::query_as::<_, AttendanceRecord>(
        "SELECT rec_id, usn, class_id, staff_id, date, status, \"timestamp\" \
         FROM attendance_records \
         WHERE ($1::text IS NULL OR usn = $1) \
           AND ($2::integer IS NULL OR class_id = $2) \
           AND ($3::date IS NULL OR date = $3) \
           AND ($4::text IS NULL OR status = $4) \
         ORDER BY date DESC, rec_id DESC LIMIT $5::bigint",
    )
    .bind(filter.usn.as_deref())
    .bind(filter.class_id)
    .bind(filter.date)
    .bind(filter.status.as_deref())
    .bind(filter.limit.unwrap_or(200).clamp(1, 1000))
    .fetch_all(&state.pool)
    .await?;

    Ok(Json(records))
}

async fn mark(
    State(state): State<AppState>,
    staff: StaffClaims,
    Json(body): Json<MarkAttendanceRequest>,
) -> ApiResult<Json<AttendanceRecord>> {
    validate_status(&body.status)?;

    let record = sqlx::query_as::<_, AttendanceRecord>(
        "INSERT INTO attendance_records (usn, class_id, staff_id, date, status) \
         VALUES ($1, $2, $3, $4, $5) \
         ON CONFLICT (usn, class_id, date) DO UPDATE \
         SET status = EXCLUDED.status, staff_id = EXCLUDED.staff_id, \
             \"timestamp\" = CURRENT_TIMESTAMP \
         RETURNING rec_id, usn, class_id, staff_id, date, status, \"timestamp\"",
    )
    .bind(body.usn)
    .bind(body.class_id)
    .bind(staff.id())
    .bind(body.date)
    .bind(body.status)
    .fetch_one(&state.pool)
    .await?;

    Ok(Json(record))
}

async fn update(
    State(state): State<AppState>,
    StaffClaims(_): StaffClaims,
    Path(id): Path<i64>,
    Json(body): Json<UpdateAttendanceRequest>,
) -> ApiResult<Json<AttendanceRecord>> {
    validate_status(&body.status)?;

    let record = sqlx::query_as::<_, AttendanceRecord>(
        "UPDATE attendance_records SET status = $2, \"timestamp\" = CURRENT_TIMESTAMP \
         WHERE rec_id = $1 \
         RETURNING rec_id, usn, class_id, staff_id, date, status, \"timestamp\"",
    )
    .bind(id)
    .bind(body.status)
    .fetch_optional(&state.pool)
    .await?
    .ok_or(ApiError::NotFound(format!("attendance record {id} not found")))?;

    Ok(Json(record))
}

async fn remove(
    State(state): State<AppState>,
    StaffClaims(_): StaffClaims,
    Path(id): Path<i64>,
) -> ApiResult<axum::http::StatusCode> {
    let result = sqlx::query("DELETE FROM attendance_records WHERE rec_id = $1")
        .bind(id)
        .execute(&state.pool)
        .await?;

    if result.rows_affected() == 0 {
        return Err(ApiError::NotFound(format!("attendance record {id} not found")));
    }

    Ok(axum::http::StatusCode::NO_CONTENT)
}
