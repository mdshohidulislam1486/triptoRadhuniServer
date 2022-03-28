const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
const cors = require('cors')
const express = require('express')
const app = express()
const port = process.env.PORT || 5000;
require('dotenv').config();


app.use(cors());
app.use(express.json())



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.o6aff.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run(){
    try{
    await client.connect()
    const dataBase = client.db('triptoRadhuni')
    const productsCollection = dataBase.collection('products')
    const addressCollection = dataBase.collection('address')
    const usersCollection = dataBase.collection('users')
    const ordersCollection = dataBase.collection('orders')
    
 
    //get API
     app.get("/products", async (req, res) =>{
       console.log(req.query)
        const cursor = productsCollection.find({});
        const page = req.query.page;
        const size = parseInt(req.query.size);
        const count = await cursor.count();
        let products;
        if(page){
        products = await cursor.skip(page*size).limit(size).toArray()
        }else{
         products = await cursor.toArray()
        }
        
        res.send({
            count,
             products
            }) 
    })  
 
   /*  app.get("/products", async (req, res) =>{
        const cursor = productsCollection.find({});
         const products = await cursor.limit(8).toArray()
         res.send(products)
    })

 */

     // Get all order list 
     app.get('/orderslist', async(req, res) =>{
        const cursor = ordersCollection.find({})
        const ordersList = await cursor.toArray()
        res.send(ordersList)
    })
 
    //get product 
    app.get("/products/:id", async (req, res) =>{
        const id = req.params.id
        const query = {_id: ObjectId(id)}
        const product = await productsCollection.findOne(query)
        res.send(product)
    })


 
    //get shipping address 
    app.get("/shippingaddress/:email", async (req, res) =>{
        const email = req.params.email
        const query = {email:email}
        const address = await addressCollection.findOne(query)
        res.send(address)
    })

    // upsesert data 

    app.put("/shippingaddress", async (req, res) =>{
        const user = req.body
        const query = {email: user.email}
        const options = {upsert:true}
        const updateDoc = {$set:user}
        const address = await addressCollection.updateOne(query, updateDoc, options )
        res.send(address) 
    })

    //post  product 
    app.post('/products', async(req, res) =>{
        const product = req.body;
        const result = await productsCollection.insertOne(product)
        res.json(result)
    }) 

    //post new orders 
    app.post('/placeOrder', async(req, res) => {
      const orders = req.body;
      orders.createdAt = new Date()
      orders.confirmed = false
      orders.shippedAt=false
      orders.deliveredAt= false
      const result = await ordersCollection.insertOne(orders)
      res.json(result) 
    })

   

    // post Shipping Address
    app.post('/shipping', async(req, res) =>{
        const address = req.body;
        const result = await addressCollection.insertOne(address)
        res.json(result)
    })

    // get api chekc if the user is a admin
    app.get('/users/:email', async(req, res) =>{
        const email = req.params.email
        const query = {email:email}
        const user = await usersCollection.findOne(query)
        let isAdmin =false
        if(user?.role === "admin"){
            isAdmin= true;
        }
        res.json({admin: isAdmin})
    }) 

    // Post Users register
    app.post('/users', async(req, res) => {
        const user = req.body;
        const result = await usersCollection.insertOne(user)
        res.json(result)
        console.log(result)
    }) 

    // Post Users with google 
    app.put('/users', async(req, res)=> {
        const user = req.body; 
        const filter = {email: user.email}
        const options = {upsert: true}
        const updateDoc = {$set: user}
        const result = usersCollection.updateOne(filter, updateDoc, options)
        res.json(result)
    }); 

    // update all orders list  
    app.put("/orderslist/:id",  (req, res) =>{
        const id = req.params.id;
        const orders = req.body;
        const filter = { _id: ObjectId(id) };
        const updateDoc = {
            $set:{
                confirmed:orders?.confirmed,
                shippedAt:orders?.shippedAt,
                deliveredAt:orders?.deliveredAt
            }
        };
        const result =  ordersCollection.updateOne(filter, updateDoc);
        res.json(result)
          
    })

    app.put('/users/admin', async(req, res) =>{
        const user = req.body;
        const filter = {email: user.email}
        const updateDoc = {$set:{role:'admin'}}
        const result = await usersCollection.updateOne(filter, updateDoc)
        res.json(result)
    })


    }
    finally{
        // await client.close()
    }

}
run().catch(console.dir)

app.get('/', (req, res) => {
    res.send('Running Curd Server')
})

app.listen(port, () =>{
console.log('Running server on port', port)
})