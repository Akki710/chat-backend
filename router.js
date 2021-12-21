const express=require('express');
const router=express.Router();

router.get("/",(req,res)=>{
    res.send("Hello welcome to the chat app backend!!!!");
})

module.exports=router;