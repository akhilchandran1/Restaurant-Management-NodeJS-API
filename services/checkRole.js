require("dotenv").config();

function checkRole(req, res, next){
    if(req.locals.role == process.env.USER){
        return res.sendStatus(401);
    }else{
        next();
    }
    
}

module.exports = { checkRole: checkRole}