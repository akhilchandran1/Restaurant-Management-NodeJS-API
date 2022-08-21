const express = require("express");
const connection = require("../connection/connection");
const router = express.Router();
var auth = require("../services/authentication");
var checkRole = require("../services/checkRole");
require("dotenv").config();

router.post("/add", auth.authenticateToken, checkRole.checkRole, (req, res, next) => {
    const product = req.body;
    if(product.name == null|| product.categoryId == null || product.description == null || product.price == null){
        return res.status(400).json({message: "Please enter product name, categoryId, description and price"})
    }
    const query = "INSERT INTO "+process.env.DB_PRODUCT_TABLE+" (name, categoryId, description, price, status) VALUES (?,?,?,?,'true')";
    connection.query(query, [product.name, product.categoryId, product.description, product.price], (err, results) => {
        if(!err){
            return res.status(200).json({message: "Product added successfully"});
        }else{
            return res.status(500).json(err);
        }
    });
});

router.get("/get", auth.authenticateToken, (req, res, next) => {
    const query = "SELECT p.id, p.name, p.description, p.price, p.status, c.id AS categoryId, c.name as categoryName FROM "+process.env.DB_PRODUCT_TABLE+" as p INNER JOIN "+process.env.DB_CATEGORY_TABLE+" as c where p.categoryId = c.id";
    connection.query(query, (err, results) => {
        if(!err){
            return res.status(200).json(results);
        }else{
            return res.status(500).json(err);
        }
    })
});

router.get("/getByCategory/:id", auth.authenticateToken, (req, res, next) => {
    const id = req.params.id;
    const query = "SELECT id, name FROM product WHERE categoryId=? AND status='true'";
    connection.query(query, [id], (err, results) => {
        if(!err){
            return res.status(200).json(results);
        }else{
            return res.status(500).json(err);
        }
    });
});

router.get("/getById/:id", auth.authenticateToken, (req, res, next) => {
    const id = req.params.id;
    const query = "SELECT id, name, description, price FROM "+process.env.DB_PRODUCT_TABLE+" WHERE id=?";
    connection.query(query, [id], (err, results) => {
        if(!err){
            return res.status(200).json(results[0]);
        }else{
            return res.status(500).json(err);
        }
    });
});

router.patch("/update", auth.authenticateToken, checkRole.checkRole, (req, res, next) => {
    const product = req.body;
    if(product.id == null || product.name == null || product.categoryId == null || product.description == null || product.price == null){
        return res.status(400).json({message: "Please enter values in all the required field."})
    }
    const query = "UPDATE "+process.env.DB_PRODUCT_TABLE+" SET name=?, categoryId=?, description=?, price=? WHERE id=?";
    connection.query(query, [product.name, product.categoryId, product.description, product.price, product.id], (err, results) => {
        if(!err){
            if(results.affectedRows == 0){
                return res.status(404).json({message: "Product ID does not found"});
            }
            return res.status(200).json({message: "Product update successfully"})
        }else{
            return res.status(500).json(err);
        }
    });
});

module.exports = router;