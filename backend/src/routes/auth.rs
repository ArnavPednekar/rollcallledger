use axum::extract::State;
use axum::routing::post;
use axum::{Json, Router};

use crate::auth::{issue_token, Role};
use crate::error::{ApiError, ApiResult};
use crate::models::auth::{
    LoginResponse, StaffLoginRequest, StaffLoginRow, StudentLoginRequest, StudentLoginRow,
};
use crate::state::AppState;
use crate::utils::audit;
use crate::utils::password::verify_password;

pub fn router() -> Router<AppState> {
    Router::new()
        .route("/staff/login", post(staff_login))
        .route("/student/login", post(student_login))
}

async fn staff_login(
    State(state): State<AppState>,
    Json(body): Json<StaffLoginRequest>,
) -> ApiResult<Json<LoginResponse>> {
    let row = sqlx::query_as::<_, StaffLoginRow>(
        "SELECT staff_id, s_name, password FROM staffs WHERE emailid = $1",
    )
    .bind(&body.email)
    .fetch_optional(&state.pool)
    .await?
    .ok_or(ApiError::Unauthorized)?;

    if !verify_password(&body.password, &row.password) {
        return Err(ApiError::Unauthorized);
    }

    let token = issue_token(&row.staff_id.to_string(), Role::Staff, &state.jwt_secret)?;
    audit::record(&state.pool, Some(row.staff_id), "LOGIN").await?;

    Ok(Json(LoginResponse {
        token,
        token_type: "Bearer",
        id: row.staff_id.to_string(),
        name: row.s_name,
        role: "staff".to_string(),
    }))
}

async fn student_login(
    State(state): State<AppState>,
    Json(body): Json<StudentLoginRequest>,
) -> ApiResult<Json<LoginResponse>> {
    let row = sqlx::query_as::<_, StudentLoginRow>(
        "SELECT usn, s_name, stud_pw FROM students WHERE usn = $1 OR emailid = $1",
    )
    .bind(&body.identifier)
    .fetch_optional(&state.pool)
    .await?
    .ok_or(ApiError::Unauthorized)?;

    if !verify_password(&body.password, &row.stud_pw) {
        return Err(ApiError::Unauthorized);
    }

    let token = issue_token(&row.usn, Role::Student, &state.jwt_secret)?;

    Ok(Json(LoginResponse {
        token,
        token_type: "Bearer",
        id: row.usn,
        name: row.s_name,
        role: "student".to_string(),
    }))
}
