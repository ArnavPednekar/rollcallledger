use axum::extract::{Query, State};
use axum::routing::get;
use axum::{Json, Router};

use crate::auth::StaffClaims;
use crate::error::ApiResult;
use crate::models::audit::{AuditEntry, AuditFilter};
use crate::state::AppState;

pub fn router() -> Router<AppState> {
    Router::new().route("/", get(list))
}

async fn list(
    State(state): State<AppState>,
    _: StaffClaims,
    Query(filter): Query<AuditFilter>,
) -> ApiResult<Json<Vec<AuditEntry>>> {
    let entries = sqlx::query_as::<_, AuditEntry>(
        "SELECT log_id, staff_id, action_type, action_timestamp \
         FROM audit_log ORDER BY log_id DESC LIMIT $1::bigint",
    )
    .bind(filter.limit.unwrap_or(100).clamp(1, 500))
    .fetch_all(&state.pool)
    .await?;

    Ok(Json(entries))
}
