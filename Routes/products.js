const express=require('express');
const router=express.Router();

const dynamodb = require('../config');

router.post('/addProduct', async (req, res) => {
    try {
        const { name, price, description, category } = req.body;
        let categoryId = null;
        const { v4: uuidv4 } = require('uuid');
        const id = uuidv4();

        const scanParams = {
            TableName: 'Categories',
            FilterExpression: 'catName = :catName',
            ExpressionAttributeValues: { ':catName': category },
        };

        console.log("🔍 Checking email with params:", scanParams);
        const existingCategories = await dynamodb.scan(scanParams).promise();
        if (existingCategories.Items && existingCategories.Items.length > 0) {
            console.log("⚠️ User already exists:", existingCategories.Items);
            categoryId = existingCategories.Items[0]?.id;
        } else{
            return res.status(400).json({ message: "Category Doesn't Exist" });

        }
        const newProduct = {
            id,
            name,
            price,
            description,
            category: categoryId
        }
        const putParams = {
            TableName: 'products',
            Item: newProduct,
        };
        console.log("🆕 New Product Data:", newProduct);
        await dynamodb.put(putParams).promise();

        console.log("✅ Product Added Successfully:", newProduct);

        res.status(201).json({ message: "Product added successfully!", product: newProduct });

    } catch (error) {
        console.log("❌ Error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});
router.get('/getProducts',async(req,res)=>{
    try {
        const scanParams = {
            TableName: 'products',
        };
        const result = await dynamodb.scan(scanParams).promise();
        const products = result.Items || [];

        res.status(200).json(products); 

    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
})
router.get('/getProductByCategory/:categoryId',async(req,res)=>{
    try {
        const {categoryId}=req.params;
        const scanParams = {
            TableName: 'products',
            FilterExpression: 'category = :category',
            ExpressionAttributeValues: { ':category': categoryId }, }
            const result = await dynamodb.scan(scanParams).promise();
            const products = result.Items || [];
        res.status(200).json(products);
    } catch (error) {
        console.log("❌ Error:", error)
        res.status(500).json({ error: "Internal Server Error" });
    }
})
module.exports=router;