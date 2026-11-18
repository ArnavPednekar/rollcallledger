-- ============================================================
-- RollCallLedger - Attendance Management System
-- Database schema derived from:
--   database/dbmsminiprojectERdiagram.drawio.png
--   database/dbmsminiprojectSchemadiagram.drawio.png
--
-- Target: MySQL 8.0+
-- Usage:  mysql -u root -p < database/schema.sql
-- ============================================================

CREATE DATABASE IF NOT EXISTS rollcallledger
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE rollcallledger;

-- Drop in dependency order so the script can be re-run safely.
DROP VIEW IF EXISTS v_student_attendance_summary;
DROP VIEW IF EXISTS v_attendance_detail;
DROP TABLE IF EXISTS audit_log;
DROP TABLE IF EXISTS attendance_records;
DROP TABLE IF EXISTS students;
DROP TABLE IF EXISTS classes;
DROP TABLE IF EXISTS staffs;

-- ------------------------------------------------------------
-- STAFFS
-- ------------------------------------------------------------
CREATE TABLE staffs (
  staff_id   INT UNSIGNED NOT NULL AUTO_INCREMENT,
  s_name     VARCHAR(100) NOT NULL,
  password   VARCHAR(255) NOT NULL,
  ph_no      VARCHAR(20)  NULL,
  email_id   VARCHAR(150) NOT NULL,
  PRIMARY KEY (staff_id),
  UNIQUE KEY uq_staffs_email (email_id)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- CLASSES
-- ------------------------------------------------------------
CREATE TABLE classes (
  class_id   INT UNSIGNED NOT NULL AUTO_INCREMENT,
  class_name VARCHAR(100) NOT NULL,
  class_pro  VARCHAR(100) NULL,
  room_no    VARCHAR(20)  NULL,
  schedule   VARCHAR(100) NULL,
  staff_id   INT UNSIGNED NULL,
  PRIMARY KEY (class_id),
  KEY idx_classes_staff (staff_id),
  CONSTRAINT fk_classes_staff
    FOREIGN KEY (staff_id) REFERENCES staffs (staff_id)
    ON DELETE SET NULL
    ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- STUDENTS
-- ------------------------------------------------------------
CREATE TABLE students (
  usn       VARCHAR(20)  NOT NULL,
  s_name    VARCHAR(100) NOT NULL,
  stud_pw   VARCHAR(255) NOT NULL,
  sem       TINYINT UNSIGNED NULL,
  ph_no     VARCHAR(20)  NULL,
  email_id  VARCHAR(150) NOT NULL,
  PRIMARY KEY (usn),
  UNIQUE KEY uq_students_email (email_id),
  CONSTRAINT chk_students_sem CHECK (sem IS NULL OR sem BETWEEN 1 AND 8)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- ATTENDANCE_RECORDS
-- ------------------------------------------------------------
CREATE TABLE attendance_records (
  rec_id    BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  usn       VARCHAR(20)  NOT NULL,
  class_id  INT UNSIGNED NOT NULL,
  staff_id  INT UNSIGNED NULL,
  date      DATE NOT NULL,
  status    ENUM('Present','Absent','Late','Excused') NOT NULL DEFAULT 'Absent',
  timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (rec_id),
  UNIQUE KEY uq_attendance_student_class_date (usn, class_id, date),
  KEY idx_attendance_class_date (class_id, date),
  KEY idx_attendance_staff (staff_id),
  CONSTRAINT fk_attendance_student
    FOREIGN KEY (usn) REFERENCES students (usn)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT fk_attendance_class
    FOREIGN KEY (class_id) REFERENCES classes (class_id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT fk_attendance_staff
    FOREIGN KEY (staff_id) REFERENCES staffs (staff_id)
    ON DELETE SET NULL
    ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- AUDIT_LOG
-- ------------------------------------------------------------
CREATE TABLE audit_log (
  log_id           BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  staff_id         INT UNSIGNED NULL,
  action_type      VARCHAR(50) NOT NULL,
  action_timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (log_id),
  KEY idx_audit_staff (staff_id),
  KEY idx_audit_timestamp (action_timestamp),
  CONSTRAINT fk_audit_staff
    FOREIGN KEY (staff_id) REFERENCES staffs (staff_id)
    ON DELETE SET NULL
    ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- Triggers: keep the audit log in sync with attendance changes
-- ------------------------------------------------------------
DELIMITER $$

DROP TRIGGER IF EXISTS trg_attendance_after_insert$$
CREATE TRIGGER trg_attendance_after_insert
AFTER INSERT ON attendance_records
FOR EACH ROW
BEGIN
  INSERT INTO audit_log (staff_id, action_type)
  VALUES (NEW.staff_id, CONCAT('ATTENDANCE_INSERT rec_id=', NEW.rec_id));
END$$

DROP TRIGGER IF EXISTS trg_attendance_after_update$$
CREATE TRIGGER trg_attendance_after_update
AFTER UPDATE ON attendance_records
FOR EACH ROW
BEGIN
  INSERT INTO audit_log (staff_id, action_type)
  VALUES (NEW.staff_id, CONCAT('ATTENDANCE_UPDATE rec_id=', NEW.rec_id));
END$$

DROP TRIGGER IF EXISTS trg_attendance_after_delete$$
CREATE TRIGGER trg_attendance_after_delete
AFTER DELETE ON attendance_records
FOR EACH ROW
BEGIN
  INSERT INTO audit_log (staff_id, action_type)
  VALUES (OLD.staff_id, CONCAT('ATTENDANCE_DELETE rec_id=', OLD.rec_id));
END$$

DELIMITER ;

-- ------------------------------------------------------------
-- Views
-- ------------------------------------------------------------
CREATE VIEW v_attendance_detail AS
SELECT
  ar.rec_id,
  ar.date,
  ar.status,
  ar.timestamp,
  s.usn,
  s.s_name AS student_name,
  s.sem,
  c.class_id,
  c.class_name,
  c.class_pro,
  c.room_no,
  st.staff_id,
  st.s_name AS staff_name
FROM attendance_records ar
JOIN students s ON s.usn = ar.usn
JOIN classes  c ON c.class_id = ar.class_id
LEFT JOIN staffs st ON st.staff_id = ar.staff_id;

CREATE VIEW v_student_attendance_summary AS
SELECT
  s.usn,
  s.s_name AS student_name,
  c.class_id,
  c.class_name,
  COUNT(ar.rec_id) AS total_classes,
  SUM(ar.status = 'Present') AS present_count,
  SUM(ar.status = 'Absent')  AS absent_count,
  SUM(ar.status = 'Late')    AS late_count,
  SUM(ar.status = 'Excused') AS excused_count,
  ROUND(
    COALESCE(SUM(ar.status IN ('Present', 'Late')) / NULLIF(COUNT(ar.rec_id), 0) * 100, 0),
    2
  ) AS attendance_percentage
FROM students s
JOIN attendance_records ar ON ar.usn = s.usn
JOIN classes c ON c.class_id = ar.class_id
GROUP BY s.usn, s.s_name, c.class_id, c.class_name;

-- ------------------------------------------------------------
-- Demo data
-- NOTE: Demo password for every seeded account is "pass12345".
-- Password hashes below were generated with backend/src/bin/hash_password.rs.
-- ------------------------------------------------------------
INSERT INTO staffs (staff_id, s_name, password, ph_no, email_id) VALUES
  (1, 'Dr. Anita Rao', '$argon2id$v=19$m=19456,t=2,p=1$0TlKPaV2VrKhoJRz41Gczw$FJCQGEE+W1KvaXnO/o5nKRRshj/I9vNGENcDE/I+RrU', '9876500001', 'anita.rao@college.edu'),
  (2, 'Prof. Vikram Shetty', '$argon2id$v=19$m=19456,t=2,p=1$0TlKPaV2VrKhoJRz41Gczw$FJCQGEE+W1KvaXnO/o5nKRRshj/I9vNGENcDE/I+RrU', '9876500002', 'vikram.shetty@college.edu'),
  (3, 'Dr. Meera Iyer', '$argon2id$v=19$m=19456,t=2,p=1$0TlKPaV2VrKhoJRz41Gczw$FJCQGEE+W1KvaXnO/o5nKRRshj/I9vNGENcDE/I+RrU', '9876500003', 'meera.iyer@college.edu');

INSERT INTO classes (class_id, class_name, class_pro, room_no, schedule, staff_id) VALUES
  (1, 'BCA 3A', 'Bachelor of Computer Applications', 'Room 204', 'Mon/Wed 09:00-10:00', 1),
  (2, 'BCA 3B', 'Bachelor of Computer Applications', 'Room 205', 'Tue/Thu 10:00-11:00', 2),
  (3, 'BSc CS 2A', 'BSc Computer Science', 'Room 301', 'Mon/Fri 11:00-12:00', 3);

INSERT INTO students (usn, s_name, stud_pw, sem, ph_no, email_id) VALUES
  ('1BCA21CS001', 'Aarav Sharma', '$argon2id$v=19$m=19456,t=2,p=1$0TlKPaV2VrKhoJRz41Gczw$FJCQGEE+W1KvaXnO/o5nKRRshj/I9vNGENcDE/I+RrU', 3, '9880000001', 'aarav.sharma@student.edu'),
  ('1BCA21CS002', 'Diya Patel', '$argon2id$v=19$m=19456,t=2,p=1$0TlKPaV2VrKhoJRz41Gczw$FJCQGEE+W1KvaXnO/o5nKRRshj/I9vNGENcDE/I+RrU', 3, '9880000002', 'diya.patel@student.edu'),
  ('1BCA21CS003', 'Kabir Nair', '$argon2id$v=19$m=19456,t=2,p=1$0TlKPaV2VrKhoJRz41Gczw$FJCQGEE+W1KvaXnO/o5nKRRshj/I9vNGENcDE/I+RrU', 3, '9880000003', 'kabir.nair@student.edu'),
  ('1BCA21CS004', 'Sneha Reddy', '$argon2id$v=19$m=19456,t=2,p=1$0TlKPaV2VrKhoJRz41Gczw$FJCQGEE+W1KvaXnO/o5nKRRshj/I9vNGENcDE/I+RrU', 3, '9880000004', 'sneha.reddy@student.edu'),
  ('1BSC22CS001', 'Rohan Verma', '$argon2id$v=19$m=19456,t=2,p=1$0TlKPaV2VrKhoJRz41Gczw$FJCQGEE+W1KvaXnO/o5nKRRshj/I9vNGENcDE/I+RrU', 2, '9880000005', 'rohan.verma@student.edu');

INSERT INTO attendance_records (usn, class_id, staff_id, date, status) VALUES
  ('1BCA21CS001', 1, 1, '2026-11-16', 'Present'),
  ('1BCA21CS002', 1, 1, '2026-11-16', 'Present'),
  ('1BCA21CS003', 1, 1, '2026-11-16', 'Absent'),
  ('1BCA21CS004', 1, 1, '2026-11-16', 'Late'),
  ('1BCA21CS001', 1, 1, '2026-11-18', 'Present'),
  ('1BCA21CS002', 1, 1, '2026-11-18', 'Absent'),
  ('1BCA21CS003', 1, 2, '2026-11-17', 'Present'),
  ('1BSC22CS001', 3, 3, '2026-11-17', 'Present');

-- The inserts above fire the audit triggers automatically. Add one manual
-- login-style audit entry to demonstrate who performed an action.
INSERT INTO audit_log (staff_id, action_type) VALUES
  (1, 'LOGIN');
