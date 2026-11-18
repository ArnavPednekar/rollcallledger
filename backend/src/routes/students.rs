use axum::extract::{Path, State};
use axum::routing::{get, put};
use axum::{Json, Router};

use crate::auth::StaffClaims;
use crate::error::{ApiError, ApiResult};
use crate::models::student::{CreateStudentRequest, Student, UpdateStudentRequest};
use crate::state::AppState;
use crate::utils::audit;
use crate::utils::password::{hash_password, validate_password};

pub fn router() -> Router<AppState> {
    Router::new()
        .route("/", get(list).post(create))
        .route("/{usn}", put(update).delete(remove))
}

async fn list(State(state): State<AppState>, _: StaffClaims) -> ApiResult<Json<Vec<Student>>> {
    let students = sqlx::query_as::<_, Student>(
        "SELECT usn, s_name, sem, ph_no, emailid FROM students ORDER BY usn",
    )
    .fetch_all(&state.pool)
    .await?;

    Ok(Json(students))
}

async fn create(
    State(state): State<AppState>,
    staff: StaffClaims,
    Json(body): Json<CreateStudentRequest>,
) -> ApiResult<Json<Student>> {
    validate_password(&body.password)?;
    let password_hash = hash_password(&body.password)?;

    let student = sqlx::query_as::<_, Student>(
        "INSERT INTO students (usn, s_name, stud_pw, sem, ph_no, emailid) \
         VALUES ($1, $2, $3, $4, $5, $6) \
         RETURNING usn, s_name, sem, ph_no, emailid",
    )
    .bind(body.usn)
    .bind(body.s_name)
    .bind(password_hash)
    .bind(body.sem)
    .bind(body.ph_no)
    .bind(body.emailid)
    .fetch_one(&state.pool)
    .await?;

    audit::record(&state.pool, Some(staff.id()), "CREATE_STUDENT").await?;

    Ok(Json(student))
}

async fn update(
    State(state): State<AppState>,
    staff: StaffClaims,
    Path(usn): Path<String>,
    Json(body): Json<UpdateStudentRequest>,
) -> ApiResult<Json<Student>> {
    let password_hash = match &body.password {
        Some(password) => {
            validate_password(password)?;
            Some(hash_password(password)?)
        }
        None => None,
    };

    let student = sqlx::query_as::<_, Student>(
        "UPDATE students SET s_name = $2, stud_pw = COALESCE($3, stud_pw), \
         sem = $4, ph_no = $5, emailid = $6 WHERE usn = $1 \
         RETURNING usn, s_name, sem, ph_no, emailid",
    )
    .bind(&usn)
    .bind(body.s_name)
    .bind(password_hash)
    .bind(body.sem)
    .bind(body.ph_no)
    .bind(body.emailid)
    .fetch_optional(&state.pool)
    .await?
    .ok_or(ApiError::NotFound(format!("student {usn} not found")))?;

    audit::record(&state.pool, Some(staff.id()), "UPDATE_STUDENT").await?;

    Ok(Json(student))
}

async fn remove(
    State(state): State<AppState>,
    staff: StaffClaims,
    Path(usn): Path<String>,
) -> ApiResult<axum::http::StatusCode> {
    let result = sqlx::query("DELETE FROM students WHERE usn = $1")
        .bind(&usn)
        .execute(&state.pool)
        .await?;

    if result.rows_affected() == 0 {
        return Err(ApiError::NotFound(format!("student {usn} not found")));
    }

    audit::record(&state.pool, Some(staff.id()), "DELETE_STUDENT").await?;

    Ok(axum::http::StatusCode::NO_CONTENT)
}
