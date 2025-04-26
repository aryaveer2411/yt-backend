//require("dotenv").config({path:"./env"})

import mongoose from "mongoose";
import { DB_NAME } from "./constants.js";
import express from "express";
import dotenv from "dotenv";
import connectDB from "./db/index.js";
import app from "./app.js";

dotenv.config({
    path: "./env"
})

const port = process.env.PORT;

connectDB().then(() => {

    app.on("error", (error) => {
        console.log("err:", error);
        throw error;
    })
    app.listen(port, () => {
        console.log(`Listining on Port: ${port}`)
    })
}).catch((err) => {
    console.error("Mongo db connection failed!!!", err);
});

/*
const app = express();
; (async () => {
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
        app.on("error", (error) => {
            console.log("err:", error);
            throw error;
        })

        app.listen(process.env.PORT, () => {
            console.log(`App is listening on port ${process.env.PORT}`);
        })
     }
    catch (error) {
        console.error("Error", error);
        throw error;
    }
})()
    */ 