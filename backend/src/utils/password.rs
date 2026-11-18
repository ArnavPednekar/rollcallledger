use argon2::password_hash::SaltString;
use argon2::{Argon2, PasswordHash, PasswordHasher, PasswordVerifier};
use rand::rngs::OsRng;

use crate::error::{ApiError, ApiResult};

pub fn hash_password(password: &str) -> ApiResult<String> {
    let salt = SaltString::generate(&mut OsRng);
    Ok(Argon2::default()
        .hash_password(password.as_bytes(), &salt)?
        .to_string())
}

pub fn verify_password(password: &str, stored_hash: &str) -> bool {
    let Ok(parsed) = PasswordHash::new(stored_hash) else {
        return false;
    };
    Argon2::default()
        .verify_password(password.as_bytes(), &parsed)
        .is_ok()
}

pub fn validate_password(password: &str) -> ApiResult<()> {
    if password.len() < 8 {
        return Err(ApiError::BadRequest(
            "password must be at least 8 characters".to_string(),
        ));
    }
    Ok(())
}
