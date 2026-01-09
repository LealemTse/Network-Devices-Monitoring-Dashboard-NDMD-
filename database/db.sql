USE testbackend;

/*this is the users table*/

create table users(
                      id INT AUTO_INCREMENT PRIMARY KEY,
                      username VARCHAR(255) NOT NULL UNIQUE,
                      password VARCHAR(255) NOT NULL,
                      role VARCHAR(50) DEFAULT 'admin',
                      security_question_1 VARCHAR(255) NOT NULL,
                      security_answer_1_hash VARCHAR(255) NOT NULL,
                      security_question_2 VARCHAR(255) NOT NULL,
                      security_answer_2_hash VARCHAR(255) NOT NULL,
                      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

/*Devices table*/

create table devices(
                        id INT AUTO_INCREMENT PRIMARY KEY,
                        name VARCHAR(255) NOT NULL,
                        ip_address VARCHAR(45) NOT NULL UNIQUE,
                        mac_address VARCHAR(17) NOT NULL,
                        status ENUM('online','offline','unstable') DEFAULT 'offline',
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

/*STATUS LOG*/

CREATE TABLE status_logs (
                             id INT AUTO_INCREMENT PRIMARY KEY,
                             device_id INT NOT NULL,
                             status ENUM('online', 'offline', 'unstable') NOT NULL,
                             latency INT,
                             timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                             FOREIGN KEY (device_id) REFERENCES devices(id) ON DELETE CASCADE
);

/*REFRESH TOKENS*/
CREATE TABLE refresh_tokens (
                                id INT AUTO_INCREMENT PRIMARY KEY,
                                user_id INT NOT NULL,
                                token VARCHAR(512) NOT NULL,
                                expiry_date DATETIME NOT NULL,
                                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

/*CONFIGURATION SETTING*/

CREATE TABLE configuration_settings (
                                        id INT AUTO_INCREMENT PRIMARY KEY,
                                        refresh_interval INT DEFAULT 60000
);

INSERT INTO configuration_settings (refresh_interval) VALUES (60000);

