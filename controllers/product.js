//[Dependencies and Modules]

const Product = require("../models/Product");


module.exports.addProduct = (req, res) => {

		let newProduct = new Product({
			name : req.body.name,
			description : req.body.description,
			price : req.body.price
		});
		Product.findOne({name: req.body.name})
		.then(existingProduct =>{
			if(existingProduct){
				return res.status(409).send({error:'Product already exists'});
			}
			return newProduct.save()
			.then(savedProduct =>{
				return res.status(201).send({ savedProduct });
			})
			.catch(saveErr =>{
				console.error("Error in saving the Product: ", saveErr)
				return res.status(500).send({error:'Failed to save the Product'})
			})

		})
		.catch(findErr =>{
			console.error("Error in finding the Product: ", findErr)
			return res.status(500).send({error: 'Error finding the Product'})
		})
		
}; 

module.exports.getAllProducts = (req, res) => {
    
    return Product.find({})
    .then(products => {
        if(products.length > 0){
            return res.status(200).send({ products })
        }
        else{
            return res.status(200).send({ message: 'No product found.' })
        }
    })
	.catch(err => {
		console.error("Error in finding all product:", err)
		return res.status(500).send({error: 'Error finding product.'})	
	})
};

module.exports.getAllActive = (req, res) => {

	Product.find({ isActive: true }).then(products => {

		if(products.length>0){
			return res.status(200).send({products});
		}
		else{
			return res.status(200).send({message:'No active product found.'})
		}
	})
	.catch(err => {
		console.error("Eror in finding active product: ", err)
		return res.status(500).send({error: 'Error finding active product'})
	});
};

module.exports.getProduct = (req, res) => {
	const productId = req.params.productId;

	Product.findById(productId)
	.then(product => {
		if (!product) {
			return res.status(404).send({ error: 'Product not found' });
		}
		return res.status(200).send({ product });
	})
	.catch(err => {
		console.error("Error in fetching the product: ", err)
		return res.status(500).send({ error: 'Failed to fetch product' });
	})
};

module.exports.updateProduct = (req,res)=>{

	const productId = req.params.productId;

	let updatedProduct = {
		name : req.body.name,
		description : req.body.description,
		price : req.body.price
	}
	return Product.findByIdAndUpdate(productId, updatedProduct)
	.then(updatedProduct =>{

		if(!updatedProduct){
			return res.status(404).send({error:'Product not found'})
		}


		return res.status(200).send({
			message: 'Product updated successfully',
			updatedProduct: updatedProduct
		})
		
	}).catch(err=>{

		console.error("Error in updating a product: ", err)
		return res.status(500).send({error: 'Error in updating a product.'})

	});

}

module.exports.archiveProduct = (req, res) => {

    let updateActiveField = {
        isActive: false
    }
    
    return Product.findByIdAndUpdate(req.params.productId, updateActiveField)
    .then(archiveProduct => {
        if (!archiveProduct) {
        	return res.status(404).send({ error: 'Product not found' });
        }
        return res.status(200).send({ 
        	message: 'Product archived successfully', 
        	archiveProduct: archiveProduct 
        });
    })
    .catch(err => {
    	console.error("Error in archiving a product: ", err)
    	return res.status(500).send({ error: 'Failed to archive product' })
    });

};

module.exports.activateProduct = (req, res) => {

    let updateActiveField = {
        isActive: true
    }
    
    return Product.findByIdAndUpdate(req.params.productId, updateActiveField)
    .then(activateProduct => {
        if (!activateProduct) {
        	return res.status(404).send({ error: 'Product not found' });
        }
        return res.status(200).send({ 
        	message: 'Product activated successfully', 
        	activateProduct: activateProduct
        });
    })
    .catch(err => {
    	console.error("Error in activating a product: ", err)
    	return res.status(500).send({ error: 'Failed to activating a product' })
    });
};

module.exports.searchByName = (req, res) => {
    const productName = req.body.productName;

    // Perform case-insensitive search for products with matching names
    Product.find({ name: { $regex: new RegExp(productName, 'i') } })
    .then(products => {
        res.status(200).json(products);
    })
    .catch(error => {
        console.error("Error in searching products: ", error);
        res.status(500).send({ error: 'Internal server error' });
    });
};

module.exports.searchByPrice = (req, res) => {
    const minPrice = req.body.minPrice;
    const maxPrice = req.body.maxPrice;

    // Perform search for products within the price range
    Product.find({ price: { $gte: minPrice, $lte: maxPrice } })
    .then(products => {
        res.status(200).send(products);
    })
    .catch(error => {
        console.error("Error in searching products by price: ", error);
        res.status(500).json({ error: 'Internal server error' });
    });
};

