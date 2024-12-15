//[Dependencies and Modules]
const bcrypt = require("bcrypt")
const User = require("../models/User.js");
const Enrollment = require("../models/Enrollment.js");
const auth = require("../auth.js")


module.exports.registerUser = (req,res) => {

    let newUser = new User({
        firstName : req.body.firstName,
        lastName : req.body.lastName,
        email : req.body.email,
        mobileNo : req.body.mobileNo,
        password : bcrypt.hashSync(req.body.password, 10)
    })

    return newUser.save()
    .then((result) => res.status(201).send(result))
    .catch(err => res.status(500).send(err))

};

module.exports.loginUser = (req, res) =>{
    
    if(req.body.email.includes("@")){

        return User.findOne({email:req.body.email}).then(result=>{
            if(result == null){
                return res.status(404).send({message : "No Email Found"});
            }else{

                const isPasswordCorrect = bcrypt.compareSync(req.body.password, result.password);
                if(isPasswordCorrect){
                    return res.status(200).send({access: auth.createAccessToken(result)})
                }else{
                    return res.status(401).send({message : "Email and password do not match"}
                        );
                }
            }
        }).catch(err=>res.status(500).send({message : "Error in find"}))

    }else{
        return res.status(400).send({message : "Invalid email"})
    }
};