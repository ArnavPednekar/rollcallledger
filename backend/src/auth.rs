use axum::extract::FromRequestParts;
use axum::http::header::AUTHORIZATION;
use axum::http::request::Parts;
use chrono::Utc;
use jsonwebtoken::{decode, encode, Algorithm, DecodingKey, EncodingKey, Header, Validation};
use serde::{Deserialize, Serialize};

use crate::error::{ApiError, ApiResult};
use crate::state::AppState;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "lowercase")]
pub enum Role {
    Staff,
    Student,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Claims {
    pub sub: String,
    pub role: Role,
    pub exp: i64,
}

#[derive(Debug, Clone)]
pub struct StaffClaims(pub Claims);

#[derive(Debug, Clone)]
pub struct StudentClaims(pub Claims);

pub fn issue_token(subject: &str, role: Role, secret: &str) -> ApiResult<String> {
    let claims = Claims {
        sub: subject.to_string(),
        role,
        exp: Utc::now().timestamp() + 86_400,
    };
    Ok(encode(
        &Header::default(),
        &claims,
        &EncodingKey::from_secret(secret.as_bytes()),
    )?)
}

async fn extract_claims(parts: &Parts, state: &AppState) -> ApiResult<Claims> {
    let header = parts
        .headers
        .get(AUTHORIZATION)
        .and_then(|value| value.to_str().ok())
        .ok_or(ApiError::Unauthorized)?;

    let token = header
        .strip_prefix("Bearer ")
        .ok_or(ApiError::Unauthorized)?
        .trim();

    let data = decode::<Claims>(
        token,
        &DecodingKey::from_secret(state.jwt_secret.as_bytes()),
        &Validation::new(Algorithm::HS256),
    )?;

    Ok(data.claims)
}

impl StaffClaims {
    pub fn id(&self) -> i32 {
        self.0.sub.parse().unwrap_or(0)
    }
}

impl FromRequestParts<AppState> for StaffClaims {
    type Rejection = ApiError;

    async fn from_request_parts(parts: &mut Parts, state: &AppState) -> Result<Self, Self::Rejection> {
        let claims = extract_claims(parts, state).await?;
        if claims.role != Role::Staff {
            return Err(ApiError::Forbidden);
        }
        Ok(StaffClaims(claims))
    }
}

impl FromRequestParts<AppState> for StudentClaims {
    type Rejection = ApiError;

    async fn from_request_parts(parts: &mut Parts, state: &AppState) -> Result<Self, Self::Rejection> {
        let claims = extract_claims(parts, state).await?;
        if claims.role != Role::Student {
            return Err(ApiError::Forbidden);
        }
        Ok(StudentClaims(claims))
    }
}
