use std::sync::Arc;

use sqlx::PgPool;

#[derive(Debug, Clone)]
pub struct AppState {
    pub pool: PgPool,
    pub jwt_secret: Arc<String>,
}
