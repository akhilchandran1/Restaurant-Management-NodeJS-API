const express = require("express");
const connection = require("../connection/connection");
const router = express.Router();
var auth = require("../services/authentication");
require("dotenv").config();

router.get("/details", auth.authenticateToken, (req, res, next) => {
    var categoryCount, productCount, billCount;
    var categoryCountQuery = "SELECT COUNT(id) AS categoryCount FROM "+process.env.DB_CATEGORY_TABLE ;
    var productCountQuery = "SELECT COUNT(id) AS productCount FROM "+process.env.DB_PRODUCT_TABLE ;
    var billCountQuery = "SELECT COUNT(id) AS billCount FROM "+process.env.DB_BILL_TABLE ;

    connection.query(categoryCountQuery, (err, results) => {
        if(!err){
            categoryCount = results[0].categoryCount;
        }else{
            return res.status(500).json(err);
        }
    });
    connection.query(productCountQuery, (err, results) => {
        if(!err){
            productCount = results[0].productCount;
        }else{
            return res.status(500).json(err);
        }
    });
    connection.query(billCountQuery, (err, results) => {
        if(!err){
            billCount = results[0].billCount;
            var data = {
                category: categoryCount,
                product: productCount,
                bill: billCount
            };
            return res.status(200).json(data);
        }else{
            return res.status(500).json(err);
        }
    });

});

module.exports = router;