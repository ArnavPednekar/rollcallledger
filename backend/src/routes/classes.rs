use axum::extract::{Path, State};
use axum::routing::{get, put};
use axum::{Json, Router};

use crate::auth::StaffClaims;
use crate::error::ApiResult;
use crate::models::class::{Class, CreateClassRequest, UpdateClassRequest};
use crate::state::AppState;
use crate::utils::audit;

pub fn router() -> Router<AppState> {
    Router::new()
        .route("/", get(list).post(create))
        .route("/{id}", put(update).delete(remove))
}

async fn list(State(state): State<AppState>, _: StaffClaims) -> ApiResult<Json<Vec<Class>>> {
    let classes = sqlx::query_as::<_, Class>(
        "SELECT class_id, class_name, class_pro, room_no, schedule, staff_id \
         FROM classes ORDER BY class_id",
    )
    .fetch_all(&state.pool)
    .await?;

    Ok(Json(classes))
}

async fn create(
    State(state): State<AppState>,
    staff: StaffClaims,
    Json(body): Json<CreateClassRequest>,
) -> ApiResult<Json<Class>> {
    let class = sqlx::query_as::<_, Class>(
        "INSERT INTO classes (class_name, class_pro, room_no, schedule, staff_id) \
         VALUES ($1, $2, $3, $4, $5) \
         RETURNING class_id, class_name, class_pro, room_no, schedule, staff_id",
    )
    .bind(body.class_name)
    .bind(body.class_pro)
    .bind(body.room_no)
    .bind(body.schedule)
    .bind(body.staff_id.unwrap_or_else(|| staff.id()))
    .fetch_one(&state.pool)
    .await?;

    audit::record(&state.pool, Some(staff.id()), "CREATE_CLASS").await?;

    Ok(Json(class))
}

async fn update(
    State(state): State<AppState>,
    staff: StaffClaims,
    Path(id): Path<i32>,
    Json(body): Json<UpdateClassRequest>,
) -> ApiResult<Json<Class>> {
    let class = sqlx::query_as::<_, Class>(
        "UPDATE classes SET class_name = $2, class_pro = $3, room_no = $4, \
         schedule = $5, staff_id = $6 WHERE class_id = $1 \
         RETURNING class_id, class_name, class_pro, room_no, schedule, staff_id",
    )
    .bind(id)
    .bind(body.class_name)
    .bind(body.class_pro)
    .bind(body.room_no)
    .bind(body.schedule)
    .bind(body.staff_id)
    .fetch_optional(&state.pool)
    .await?
    .ok_or(crate::error::ApiError::NotFound(format!("class {id} not found")))?;

    audit::record(&state.pool, Some(staff.id()), "UPDATE_CLASS").await?;

    Ok(Json(class))
}

async fn remove(
    State(state): State<AppState>,
    staff: StaffClaims,
    Path(id): Path<i32>,
) -> ApiResult<axum::http::StatusCode> {
    let result = sqlx::query("DELETE FROM classes WHERE class_id = $1")
        .bind(id)
        .execute(&state.pool)
        .await?;

    if result.rows_affected() == 0 {
        return Err(crate::error::ApiError::NotFound(format!(
            "class {id} not found"
        )));
    }

    audit::record(&state.pool, Some(staff.id()), "DELETE_CLASS").await?;

    Ok(axum::http::StatusCode::NO_CONTENT)
}
