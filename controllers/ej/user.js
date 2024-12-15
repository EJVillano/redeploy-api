//[Dependencies and Modules]
const bcrypt = require("bcrypt")

const User = require("../models/User.js");

const { verify, isLoggedIn } = require("../auth.js");

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

module.exports.authenticationUser = (req,res) => {


    if(req.body.email.includes("@")){

        return User.find({ email : req.body.email })
        .then(result => {

            if (result.length > 0) {
                return res.status(409).send({message : "Duplicate Email Found"});
            } else {
                return res.status(404).send({message : "Email not found"});
            };
        })
        .catch(err => res.status(400).send({message : "Invalid email"}));           

    }else{
        res.status(500).send({message : "Invalid email"});
    }

};

module.exports.getProfile = (req, res) => {
    const userId = req.user.id;

    User.findById(userId)
    .then(user => {
        if (!user) {
            return res.status(404).send({ error: 'User not found' });
        }

        // Exclude sensitive information like password
        user.password = undefined;

        return res.status(200).send({ user });
    })
    .catch(err => {
        console.error("Error in fetching user profile", err)
        return res.status(500).send({ error: 'Failed to fetch user profile' })
    });
};

module.exports.setAsAdmin = (req, res) => {

    let updateAdminField = {
        isAdmin: true
    }
    
    return User.findByIdAndUpdate(req.params.userId, updateAdminField)
    .then(updateAdmin => {
        if (!updateAdmin) {
            return res.status(404).send({ error: 'User not found' });
        }
        
        return res.status(200).send({ 
            message: 'User admin status updated successfully', 
            updateAdmin: updateAdmin
        });
    })
    .catch(err => {
        console.error("Error in updating admin status: ", err)
        return res.status(500).send({ error: 'Failed to updating admin status' })
    });
};

module.exports.updatePassword = (req , res) => {

	return User.findOne({email : req.body.email})
    .then(result =>{
		if(!result){
            return res.status(404).send({ error: 'User not found' }); 
        }
        else{
            result.password = bcrypt.hashSync(req.body.password, 10);
            result.save()
            return res.status(200).send({ 
                message: 'User password updated successfully', 
            });
        }
		
	}).catch(err=> res.status(500).send({ error: 'Failed to updating password' }))
	

}