const mysql = require('mysql');
const express = require('express');
const session = require("express-session");
const bP = require("body-parser");
const path = require('path');
const app = express();
// import {clearNode} from "./js/utils";

var connection = mysql.createConnection({
    host: 'dbproject.chw0z33b0eoj.us-west-2.rds.amazonaws.com',
    user: 'bookadmin',
    password: 'proj1234',
    database: 'bookstoredb'
});

// connection.connect(function (err) {
//     if (err) {
//         console.error('error connecting: ' + err.stack);
//         return;
//     }

//     console.log('connected as id ' + connection.threadId);
// });

//provide pathing for client
app.use("/scripts", express.static("build"));
app.use("/styles", express.static("styles"));
app.use("/images", express.static("images"));
app.use(session({
    secret: "pepperoni_sticks_thisisarandomhighentropystringcreatedtoencryptthecookie",
    resave: true,
    saveUninitialized: true
}));

//allows use of .body method
app.use(bP.json());
app.use(bP.urlencoded({
    extended: true
}));


app.get('/', (req, res) => {

    res.sendFile(path.join(__dirname, "/public/book.html"));

    // if (req.session.username) {

        

    //     $("/public/book.html").ready(() => {
    //         console.log("setting session vars for local host")
    //         let cleanNode = document.getElementById("userLogin");
    //         while (cleanNode.lastChild) {
    //             cleanNode.removeChild(cleanNode.lastChild);
    //         }
    //         let newDiv = document.createElement('h3');

    //         newDiv.innerText = "Welcome " + req.session.username;
    //         // newDiv.id = "hello";
    //         document.getElementById("userLogin").appendChild(newDiv);


    //         //test code
    //         // let newbtn = document.createElement('button');
    //         // newbtn.innerText = "LogOut";
    //         // newbtn.onclick(()=>{
    //         //     req.session.destroy();
    //         //     $.ajax({
    //         //         url: "/",
    //         //         type:"POST"
    //         //     })
    //         // });
    //         // document.getElementById("userLogin").appendChild(newbtn);

    //     })


    // } else {
    //     console.log("Sending localhost page")
    //     res.sendFile(path.join(__dirname, "/public/book.html"));
    // }


})

app.post("/checkSession", (req, res)=>{
    if (req.session.username) {
        res.json({
            status: "success",
            name: req.session.username,
        })
    } else {
        res.json({
            status: "failed",
            name: req.session.username,
        })
    }
})

app.post("/userInfo", (req, res) => {
    console.log((req.body))
    if (req.body.type === "getUserInfo") {
        // console.log("post sucessful");
        // console.log(req.body)        

        let username = req.body.user;
        let psw = req.body.psw;

        // //have to validate data ???
        let mysqlStatement = "SELECT first_name, last_name FROM users WHERE username = " + "'" + username + "'" + " AND pass = '" + psw + "';";
        console.log(mysqlStatement);
        connection.query(mysqlStatement, (error, results, fields) => {
            if (error) {
                return console.error(error.message);
            }
            // console.log(!results);
            if (!results) {
                console.log("..hellow" + results + "...no match")
                res.send({ status: "failed" });
            } else {
                // console.log(results[0].first_name);
                // console.log(results[0].last_name);
                console.log("Server sending sql result to client")
                res.json({
                    status: "success",
                    first: results[0].first_name,
                    second: results[0].last_name

                });
            }
        })

        //save sessions
        req.session.username = username;
        req.session.psw = psw;
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Listening on PORT ${PORT}`))

// .connection.end((err) => {
//     if (err) {
//         console.log("Closing Error")
//     } else {
//         console.log("Closing server Connection")
//     }
// });

function queryDb() {

}