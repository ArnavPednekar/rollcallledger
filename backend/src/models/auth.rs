use serde::{Deserialize, Serialize};
use sqlx::FromRow;

#[derive(Debug, Deserialize)]
pub struct StaffLoginRequest {
    pub email: String,
    pub password: String,
}

#[derive(Debug, Deserialize)]
pub struct StudentLoginRequest {
    pub identifier: String,
    pub password: String,
}

#[derive(Debug, Serialize)]
pub struct LoginResponse {
    pub token: String,
    pub token_type: &'static str,
    pub id: String,
    pub name: String,
    pub role: String,
}

#[derive(Debug, FromRow)]
pub struct StaffLoginRow {
    pub staff_id: i32,
    pub s_name: String,
    pub password: String,
}

#[derive(Debug, FromRow)]
pub struct StudentLoginRow {
    pub usn: String,
    pub s_name: String,
    pub stud_pw: String,
}

#[derive(Debug, Serialize, FromRow)]
pub struct StaffProfile {
    pub staff_id: i32,
    pub s_name: String,
    pub emailid: String,
    pub ph_no: Option<String>,
}
