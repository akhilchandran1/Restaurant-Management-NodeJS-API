const express = require("express");
const connection = require("../connection/connection");
const router = express.Router();
let ejs = require("ejs");
let pdf = require("html-pdf");
let path = require("path");
var fs = require("fs");
var uuid = require("uuid");
var auth = require("../services/authentication");
var checkRole = require("../services/checkRole");
require("dotenv").config();

router.post("/generateReport", auth.authenticateToken, (req, res, next) => {
    const generatedUuid = uuid.v1();
    const orderDetails = req.body;
    var productDetailsReport = JSON.parse(orderDetails.productDetails);

    const query = "INSERT INTO "+process.env.DB_BILL_TABLE+" (name, uuid, email, contactNumber, paymentMethod, total, productDetails, createdBy) VALUES (?,?,?,?,?,?,?,?)";
    connection.query(query, [orderDetails.name, generatedUuid, orderDetails.email, orderDetails.contactNumber, orderDetails.paymentMethod, orderDetails.totalAmount, orderDetails.productDetails, res.locals.email], (err, results) => {
        if(!err){
            ejs.renderFile(path.join(__dirname, '', "report.ejs"), {productDetails: productDetailsReport, name: orderDetails.name, email: orderDetails.email, contactNumber: orderDetails.contactNumber, paymentMethod: orderDetails.paymentMethod, totalAmount: orderDetails.totalAmount}, (err, results) => {
                if(err){
                    console.log(err)
                    return res.status(500).json(err);
                }else{
                    pdf.create(results).toFile("./generated_pdf/"+generatedUuid+".pdf", function(err, data){
                        if(err){
                            return res.status(500).json(err);
                        }else{
                            return res.status(200).json({uuid: generatedUuid});
                        }
                    });
                }
            });
        }else{
            return res.status(500).json(err);
        }
    });
});


router.post("/getReport", auth.authenticateToken, (req, res, next) => {
    const orderDetails = req.body;
    const pdfPath = "./generated_pdf/"+orderDetails.uuid+".pdf";
    if(fs.existsSync(pdfPath)){
        res.contentType("application/pdf");
        fs.createReadStream(pdfPath).pipe(res);
    }else{
        return res.status(400).json({message:"Reposr not generated / Not found. "});
    }
});

router.get("/getBills", auth.authenticateToken, (req, res, next) => {
    const query = "SELECT *FROM "+process.env.DB_BILL_TABLE+" ORDER BY id DESC";
    connection.query(query, (err, results) => {
        if(!err){
            return res.status(200).json(results);
        }else{
            return res.status(500).json(err);
        }
    });
});

router.delete("/delete/:id", auth.authenticateToken, checkRole.checkRole, (req, res, next) => {
    const id = req.params.id;
    const query = "DELETE FROM "+process.env.DB_BILL_TABLE+" WHERE id=?";
    connection.query(query, [id], (err, results) => {
        if(!err){
            if(results.affectedRows == 0){
                return res.status(404).json({message: "Bill ID does not fount"});
            }
            return res.status(200).json({message: "Bill deleted successfully"});
        }else{
            return res.status(500).json(err);
        }
    });
});

module.exports = router;
