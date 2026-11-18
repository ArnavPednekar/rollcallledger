use sqlx::PgPool;

use crate::error::ApiResult;

pub async fn record(pool: &PgPool, staff_id: Option<i32>, action: &str) -> ApiResult<()> {
    sqlx::query("INSERT INTO audit_log (staff_id, action_type) VALUES ($1, $2)")
        .bind(staff_id)
        .bind(action)
        .execute(pool)
        .await?;
    Ok(())
}
