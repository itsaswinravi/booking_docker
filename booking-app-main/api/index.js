
const express = require('express');


const cors = require('cors');
const User =require('./models/User.js')
require('dotenv').config()
const app = express();
const mongoose =require("mongoose");
const bcrypt =require('bcryptjs');
const Place=require('./models/place.js')
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const Booking = require('./models/booking.js');
const imageDownloader = require('image-downloader');
const multer =require('multer');
const fs =require('fs');

// const [redirect,setRedirect] =useState('');


const bcryptSalt = bcrypt.genSaltSync(10);
const jwtSecret ='bxusbxnsnqlxqjnjsxn';

app.use(express.json());
app.use(cookieParser());
app.use("/uploads",express.static(__dirname+"/uploads"));

app.use(cors({
    credentials:true,
    origin:'http://localhost:5173',
})) ;
// cors is used for cross origin resource sharing, it allows us to send http requests from one domain to another domain.

console.log(process.env.MONGO_URL)
mongoose.connect(process.env.MONGO_URL);
mongoose.connection.on("connected",()=>{
    console.log("connected to the database")
})
function getUserDataFromReq(req) {
    return new Promise((resolve, reject) => {
    jwt.verify(req.cookies.token, jwtSecret, {},async (err, userData) => {
        if (err) throw err;
       resolve(userData);
    
    });
});
}


app.get('/test',(req,res) =>{
    res.json('test ok');
});
// 
app.post('/register', async (req,res) =>{
    const {name,email,password} =req.body;
console.log("aaaaaaaaaaaaaaaaaaaaa")
    try {

    
 const userDoc = await User.create({
    name,
    email,
    password:bcrypt.hashSync(password, bcryptSalt),
});    
res.json({userDoc});
}
    catch (e){
        console.log(e);
        res.status(422).json(e);
    }
});
app.post('/login', async (req,res) => {
   const{email,password} = req.body;
   try{
   const userDoc= await User.findOne({email});
   

   if(userDoc){
    const passOk = bcrypt.compareSync(password, userDoc.password);
    if(passOk){
           jwt.sign({
            email:userDoc.email , 
            id:userDoc._id,
            
        },
             jwtSecret, {}, (err,token) =>{
               if(err) throw err;
               res.cookie('token',token).json(userDoc);
           } );
        
    } else{
        res.status(422).json('pass not ok');
    }
   } else{
    res.status(404).json('not found');
   }
}catch (err){
    res.status(500).json(err);
}});


app.get('/profile', (req,res) =>{
    const {token} = req.cookies;
if (token){
   jwt.verify(token, jwtSecret, {}, async (err, userData) => {
    if(err) throw err;
    const { name,email,_id}=await User.findById(userData.id);
    res.json({name,email,_id});
   });
} else{
    res.json(null);
}
});
app.post('/logout', (req,res) =>{
    res.cookie('token', '').json(true);
})



app.post('/upload-by-link', async(req,res) =>{
const {link} = req.body;
const newName= 'photo' +Date.now() + '.jpg';
// console.log(link)
await imageDownloader.image({
    url:link,
    dest:__dirname +'/uploads/' +newName,
});
res.json(newName);
});

const photosMiddleware = multer({dest:'uploads/'});

app.post('/upload', photosMiddleware.array('photos',100),(req,res) => {
    // console.log(req.files);
    const uploadedFiles =[];
    for (let i=0; i < req.files.length; i++){
        const{path,originalname} = req.files[i];
        const parts = originalname.split(',');
        const ext = parts[parts.length -1];
        const newPath = path + '.' +ext;
        fs.renameSync(path, newPath);
        uploadedFiles.push(newPath.replace('uploads\\',''));
    }
    // console.log(uploadedFiles)
   res.json(uploadedFiles); 
});
app.post('/places',  (req,res) =>{
    // console.log("abc")
    // console.log(req.cookies)
    const {token} = req.cookies;
    // console.log(token)
    const {title,address,addedPhotos,description,perks,extraInfo,checkIn
    ,checkOUt,maxGuests,price} = req.body;
    jwt.verify(token, jwtSecret, {},async (err, userData) => {
        if(err) throw err;
       
   
    const placeDoc=await Place.create({
    owner:userData.id,price,
    title,address,photos:addedPhotos,description,perks,extraInfo,checkIn
    ,checkOUt,maxGuests,
});
res.json(placeDoc);
});
});
app.get('/user-places', (req,res) =>{
    const {token} = req.cookies;
    // console.log(req.cookies)
    jwt.verify(token, jwtSecret, {},async (err, userData) => {
const {id} = userData;
res.json(await Place.find({owner:id}));
    });
});
app.get('/places/:id',async (req,res) =>{
    console.log("sbsbbs");
const {id} =req.params;
res.json(await Place.findById (id));
});
app.put('/places',async(req,res) =>{
    
    const {token} = req.cookies;
    // console.log(token)
    const {id,title,address,addedPhotos,description,perks,extraInfo,checkIn
    ,checkOUt,maxGuests,price,} = req.body;
    jwt.verify(token, jwtSecret, {},async (err, userData) => {
        if(err) throw err;
    const placeDoc = await Place.findById(id);
        if(userData.id ===placeDoc.owner.toString() ){
          placeDoc.set({
           
            title,address,photos:addedPhotos,description,perks,extraInfo,checkIn
            ,checkOUt,maxGuests,price,
        

          })  ;
      await placeDoc.save();
      res.json('ok');
        }
});

});

app.get('/places',async(req,res) =>{
    res.json(await Place.find());
});
app.post('/bookings',async (req,res) =>{
    const userData = await getUserDataFromReq(req);
    const{
        place,checkIn,checkOut,numerOfGuests,name,phone,price,
    }=    req.body;
    console.log(req.body);
    Booking.create({
        place,checkIn,checkOut,numerOfGuests,name,phone,price,
        user:userData.id,
    }) .then((doc)=>{
       
        res.json(doc);
    }).catch((err)=>{
        throw err;
    });
});


app.get('/bookings',async (req,res)  =>{
  const userData = await getUserDataFromReq(req); 
  res.json( await Booking.find({user:userData.id}).populate('place'));
});

app.listen(4000);


//  create a route for getting number of users
// app.get('/users',async(req, res) =>{
//     res.json(await User.find().count());
// }
// )

