const express=require('express');
const router=express.Router();
const dynamodb = require('../config');

router.post('/addCategory',async(req,res)=>{
    try {
        const {catName,description}=req.body;
        const { v4: uuidv4 } = require('uuid');
        const id = uuidv4();
        const newCategory={id,catName,description}
        const putParams = {
            TableName: 'Categories',
            Item: newCategory,
        };
        console.log("💾 Saving user with params:", putParams);

        await dynamodb.put(putParams).promise();

        res.status(201).json({ message: "Category added successfully!" });
    } catch (error) {
        console.log("❌ Error:", error)
        res.status(500).json({ error: "Internal Server Error" });
    }  
})
router.get('/getCategories',async(req,res)=>{
    try {
        const scanParams = {
            TableName: 'Categories',
        };
        const result = await dynamodb.scan(scanParams).promise();
        const categories = result.Items || [];

        res.status(200).json(categories)

    } catch (error) {
         console.log("❌ Error:", error)
        res.status(500).json({ error: "Internal Server Error" });
    }
})
router.put('/updateCategory/:categoryId',async(req,res)=>{
    try {
        const {categoryId}=req.params;
        const {name,description}=req.body;
        const updateParams = {
            TableName: 'Categories',
            Key: { id: categoryId },
            UpdateExpression: 'set catName = :name, description = :description',
            ExpressionAttributeValues: {
                ':name': name,
                ':description': description,
            },
        };
        console.log("🔄 Updating category with params:", updateParams)
        await dynamodb.update(updateParams).promise();
        res.status(200).json({ message: "Category updated successfully!" });

    } catch (error) {
        console.log("❌ Error:", error)
        res.status(500).json({ error: "Internal Server Error" });
    }
})
router.delete('/deleteCategory/:categoryId',async(req,res)=>{
    try {
        const {categoryId}=req.params;
        const params = {
            TableName: 'Categories',
            Key: { id: categoryId },}
        await dynamodb.delete(params).promise();
        res.status(200).json({ message: "Category deleted successfully!" });
    } catch (error) {
        console.log("❌ Error:", error)
        res.status(500).json({ error: "Internal Server Error" });
    }
})
module.exports=router;