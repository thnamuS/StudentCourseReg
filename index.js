const express=require('express');
const app=express();
const bodyparser=require("body-parser");
app.set('view engine','ejs');
app.use(bodyparser.urlencoded({
    extended:false
}));

app.use(bodyparser.json())
app.use(express.static("public"));
const sd=require("./routes/routes");
app.use('/',sd);

app.listen(process.env.PORT || 3000, (err)=>{
    if(err) throw err;
    console.log("connected");
})