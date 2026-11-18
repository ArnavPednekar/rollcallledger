use serde::{Deserialize, Serialize};
use sqlx::FromRow;

#[derive(Debug, Deserialize)]
pub struct CreateStudentRequest {
    pub usn: String,
    pub s_name: String,
    pub password: String,
    pub sem: Option<i16>,
    pub ph_no: Option<String>,
    pub emailid: String,
}

#[derive(Debug, Deserialize)]
pub struct UpdateStudentRequest {
    pub s_name: String,
    pub password: Option<String>,
    pub sem: Option<i16>,
    pub ph_no: Option<String>,
    pub emailid: String,
}

#[derive(Debug, Serialize, FromRow)]
pub struct Student {
    pub usn: String,
    pub s_name: String,
    pub sem: Option<i16>,
    pub ph_no: Option<String>,
    pub emailid: String,
}
