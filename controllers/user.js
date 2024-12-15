//[Dependencies and Modules]
const bcrypt = require("bcrypt")

const User = require("../models/User.js");

const auth = require("../auth.js")


module.exports.registerUser = (req,res) => {
	// checks if the email is in the right format
	if (!req.body.email.includes("@")){
		return res.status(400).send({ error: "Email invalid" });
	}
	// checks if the mobile number has the correct number of characters
	else if (req.body.mobileNo.length !== 11){
		return res.status(400).send({ error: "Mobile number invalid" });
	}
	// checks if the password has atleast 8 characters
	else if (req.body.password.length < 8) {
		return res.status(400).send({ error: "Password must be atleast 8 characters" });
	}
	// if all needed formats are achieved
	else {

        User.find({ email : req.body.email })
        .then((existingUser) => {

            if (existingUser.length > 0) {
				return res.status(409).send({ error: "Duplicate Email Found" });
			} else {
				let newUser = new User({
                    firstName : req.body.firstName,
                    lastName : req.body.lastName,
                    email : req.body.email,
                    mobileNo : req.body.mobileNo,
                    password : bcrypt.hashSync(req.body.password, 10)
                })
                // Saves the created object to our database
                return newUser.save()
                .then((user) => res.status(201).send({ message: "Registered Successfully" }))
                .catch(err => {
                    console.error("Error in saving: ", err)
                    return res.status(500).send({ error: "Error in save"})
                })
			};
        })
	}
};




module.exports.loginUser = (req, res) =>{
    
    if(req.body.email.includes("@")){

        return User.findOne({email : req.body.email})
        .then(result=>{
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
        }).catch(err => {
            console.error("Error in finding user:", err); // Log the error
            return res.status(500).json({ message: "Error in finding user" });
        });

    }else{
        return res.status(400).send({message : "Invalid email"})
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


module.exports.updatePassword = (req, res) => {

    const userId = req.user.id;

    User.findById(userId)
    .then(result => {
        if (!result) {
            return res.status(404).send({ error: 'User not found' });
        } else {
            // Update the user's password
            result.password = bcrypt.hashSync(req.body.password, 10);
            result.save()
                .then(() => {
                    return res.status(200).send({
                        message: 'User password updated successfully',
                    });
                })
                .catch(err => {
                    return res.status(500).send({ error: 'Failed to update password' });
                });
        }
    })
    .catch(err => res.status(500).send({ error: 'Failed to find user' }));

};


