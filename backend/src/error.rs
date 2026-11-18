use axum::http::StatusCode;
use axum::response::{IntoResponse, Response};
use axum::Json;
use serde_json::json;

#[derive(Debug)]
pub enum ApiError {
    BadRequest(String),
    Unauthorized,
    Forbidden,
    NotFound(String),
    Database(sqlx::Error),
    Hash(argon2::password_hash::Error),
    Token(jsonwebtoken::errors::Error),
}

impl IntoResponse for ApiError {
    fn into_response(self) -> Response {
        let (status, code, message) = match self {
            ApiError::BadRequest(msg) => (StatusCode::BAD_REQUEST, "bad_request", msg),
            ApiError::Unauthorized => (
                StatusCode::UNAUTHORIZED,
                "unauthorized",
                "authentication required".to_string(),
            ),
            ApiError::Forbidden => (
                StatusCode::FORBIDDEN,
                "forbidden",
                "insufficient permissions".to_string(),
            ),
            ApiError::NotFound(msg) => (StatusCode::NOT_FOUND, "not_found", msg),
            ApiError::Database(err) => {
                if let sqlx::Error::Database(db_err) = &err {
                    if db_err.code().as_deref() == Some("23505") {
                        return (
                            StatusCode::CONFLICT,
                            Json(json!({ "error": "conflict", "message": db_err.message() })),
                        )
                            .into_response();
                    }
                    if db_err.code().as_deref() == Some("23503") {
                        return (
                            StatusCode::BAD_REQUEST,
                            Json(json!({ "error": "bad_request", "message": db_err.message() })),
                        )
                            .into_response();
                    }
                }
                (
                    StatusCode::INTERNAL_SERVER_ERROR,
                    "database_error",
                    "database operation failed".to_string(),
                )
            }
            ApiError::Hash(err) => (
                StatusCode::INTERNAL_SERVER_ERROR,
                "hash_error",
                err.to_string(),
            ),
            ApiError::Token(err) => (
                StatusCode::UNAUTHORIZED,
                "invalid_token",
                err.to_string(),
            ),
        };

        (status, Json(json!({ "error": code, "message": message }))).into_response()
    }
}

impl From<sqlx::Error> for ApiError {
    fn from(err: sqlx::Error) -> Self {
        ApiError::Database(err)
    }
}

impl From<argon2::password_hash::Error> for ApiError {
    fn from(err: argon2::password_hash::Error) -> Self {
        ApiError::Hash(err)
    }
}

impl From<jsonwebtoken::errors::Error> for ApiError {
    fn from(err: jsonwebtoken::errors::Error) -> Self {
        ApiError::Token(err)
    }
}

pub type ApiResult<T> = Result<T, ApiError>;
