
-- To create user table
CREATE TABLE user (
    id int primary key AUTO_INCREMENT,
    name varchar(250),
    contactNumber varchar(20),
    email varchar(50),
    password varchar(250),
    status varchar(20),
    role varchar(20),
    UNIQUE (email)
);

-- To add user
INSERT INTO user (name, contactNumber, email, password, status, role) VALUES ("admin", "123456789", "admin@gmail.com", "admin", "true", "admin");

-- To create category table
CREATE TABLE category (
    id int NOT NULL AUTO_INCREMENT,
    name varchar(255) NOT NULL,
    primary key(id)
);

-- To create product table
CREATE TABLE product (
    id int NOT NULL AUTO_INCREMENT,
    name varchar(255) NOT NULL,
    categoryId int NOT NULL,
    description varchar(255),
    price double,
    status varchar(20),
    primary key(id) 
);