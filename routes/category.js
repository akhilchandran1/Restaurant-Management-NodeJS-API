const express = require("express");
const connection = require("../connection/connection");
const router = express.Router();
var auth = require("../services/authentication");
var checkRole = require("../services/checkRole");
require("dotenv").config();

router.post("/add", auth.authenticateToken, checkRole.checkRole, (req, res, next) => {
    const category = req.body;
    const query = "INSERT INTO "+process.env.DB_CATEGORY_TABLE+" (name) VALUES (?)";
    connection.query(query, [category.name], (err, results) => {
        if(!err){
            return res.status(200).json({message: "Category added successfully"});
        }else{
            return res.status(500).json(err);
        }
    });
});

router.get("/get", auth.authenticateToken, (req, res, next) => {
    const query = "SELECT * FROM "+process.env.DB_CATEGORY_TABLE+" ORDER BY name";
    connection.query(query, (err, results) => {
        if(!err){
            return res.status(200).json(results);
        }else{
            return res.status(500).json(err);
        }
    });
});

router.patch("/update", auth.authenticateToken, checkRole.checkRole, (req, res, next) => {
    const product = req.body;
    const query = "UPDATE "+process.env.DB_CATEGORY_TABLE+" SET name=? WHERE id=?";
    connection.query(query, [product.name, product.id], (err, results) => {
        if(!err){
            if(results.affectedRows == 0){
                return res.status(404).json({message: "Category ID does not found"});
            }
            return res.status(200).json({message: "Category updated successfully"})
        }else{
            return res.status(500).json(err);
        }
    });
});


module.exports = router;