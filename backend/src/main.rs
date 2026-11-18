mod auth;
mod db;
mod error;
mod models;
mod routes;
mod state;
mod utils;

use std::sync::Arc;

use axum::http::HeaderValue;
use axum::Router;
use tokio::net::TcpListener;
use tower_http::cors::{Any, CorsLayer};
use tower_http::trace::TraceLayer;
use tracing_subscriber::EnvFilter;

use crate::state::AppState;

#[tokio::main]
async fn main() {
    dotenvy::dotenv().ok();

    tracing_subscriber::fmt()
        .with_env_filter(
            EnvFilter::try_from_default_env().unwrap_or_else(|_| EnvFilter::new("info")),
        )
        .init();

    let database_url = std::env::var("DATABASE_URL")
        .unwrap_or_else(|_| "postgres://postgres@127.0.0.1:5432/rollcallledger".to_string());
    let jwt_secret = std::env::var("JWT_SECRET")
        .expect("JWT_SECRET must be set (see backend/.env.example)");
    let port = std::env::var("PORT").ok().and_then(|v| v.parse().ok()).unwrap_or(3000);

    let cors_origins = std::env::var("CORS_ORIGIN")
        .unwrap_or_else(|_| "http://localhost:5173,http://127.0.0.1:5173".to_string())
        .split(',')
        .map(|origin| origin.trim().parse::<HeaderValue>())
        .collect::<Result<Vec<_>, _>>()
        .expect("CORS_ORIGIN must be valid comma-separated origins");

    let pool = db::connect(&database_url)
        .await
        .expect("failed to connect to PostgreSQL");

    let state = AppState {
        pool,
        jwt_secret: Arc::new(jwt_secret),
    };

    let cors = CorsLayer::new()
        .allow_origin(cors_origins)
        .allow_methods(Any)
        .allow_headers(Any);

    let app: Router = routes::router(state)
        .layer(cors)
        .layer(TraceLayer::new_for_http());

    let listener = TcpListener::bind(("0.0.0.0", port))
        .await
        .expect("failed to bind address");

    tracing::info!("listening on http://0.0.0.0:{port}");
    axum::serve(listener, app)
        .await
        .expect("server failed");
}
