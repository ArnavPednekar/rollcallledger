use serde::{Deserialize, Serialize};
use sqlx::FromRow;

#[derive(Debug, Deserialize)]
pub struct CreateClassRequest {
    pub class_name: String,
    pub class_pro: Option<String>,
    pub room_no: Option<String>,
    pub schedule: Option<String>,
    pub staff_id: Option<i32>,
}

#[derive(Debug, Deserialize)]
pub struct UpdateClassRequest {
    pub class_name: String,
    pub class_pro: Option<String>,
    pub room_no: Option<String>,
    pub schedule: Option<String>,
    pub staff_id: Option<i32>,
}

#[derive(Debug, Serialize, FromRow)]
pub struct Class {
    pub class_id: i32,
    pub class_name: String,
    pub class_pro: Option<String>,
    pub room_no: Option<String>,
    pub schedule: Option<String>,
    pub staff_id: Option<i32>,
}
