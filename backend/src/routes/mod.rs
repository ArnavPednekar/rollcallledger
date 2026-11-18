use axum::routing::get;
use axum::Router;

use crate::state::AppState;

mod attendance;
mod audit;
mod auth;
mod classes;
mod reports;
mod staff;
mod student;
mod students;

pub fn router(state: AppState) -> Router {
    Router::<AppState>::new()
        .route("/api/health", get(health))
        .nest("/api/auth", auth::router())
        .nest("/api/staff", staff::router())
        .nest("/api/students", students::router())
        .nest("/api/classes", classes::router())
        .nest("/api/attendance", attendance::router())
        .nest("/api/reports", reports::router())
        .nest("/api/audit", audit::router())
        .nest("/api/me", student::router())
        .with_state(state)
}

async fn health() -> &'static str {
    "ok"
}
