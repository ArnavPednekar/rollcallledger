use axum::extract::State;
use axum::routing::get;
use axum::{Json, Router};

use crate::auth::StaffClaims;
use crate::error::{ApiError, ApiResult};
use crate::models::auth::StaffProfile;
use crate::state::AppState;

pub fn router() -> Router<AppState> {
    Router::new().route("/me", get(me))
}

async fn me(
    State(state): State<AppState>,
    StaffClaims(claims): StaffClaims,
) -> ApiResult<Json<StaffProfile>> {
    let profile = sqlx::query_as::<_, StaffProfile>(
        "SELECT staff_id, s_name, emailid, ph_no FROM staffs WHERE staff_id = $1",
    )
    .bind(claims.sub.parse::<i32>().map_err(|_| ApiError::Unauthorized)?)
    .fetch_optional(&state.pool)
    .await?
    .ok_or(ApiError::NotFound("staff member not found".to_string()))?;

    Ok(Json(profile))
}
