use std::env;

use argon2::password_hash::SaltString;
use argon2::{Argon2, PasswordHasher};
use rand::rngs::OsRng;

fn main() {
    let password = env::args().nth(1).unwrap_or_else(|| "pass123".to_string());
    let salt = SaltString::generate(&mut OsRng);
    let hash = Argon2::default()
        .hash_password(password.as_bytes(), &salt)
        .expect("failed to hash password");
    println!("{hash}");
}
