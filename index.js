//Constants
const express = require('express');
const path = require('path');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const session = require('express-session');
const app = express();
const PORT = process.env.PORT || 3000;

//Establish a connection to mysql database.
let connection = mysql.createConnection({
    host: 'dbproject.chw0z33b0eoj.us-west-2.rds.amazonaws.com',
    user: 'bookadmin',
    password: 'proj1234',
    database: 'bookstoredb'
});

//provide pathing for client
app.use("/scripts", express.static("build"));
app.use("/styles", express.static("styles"));
app.use("/images", express.static("images"));

//allows use of express session
app.use(session({
    secret: "pepperoni_sticks_thisisarandomhighentropystringcreatedtoencryptthecookie",
    resave: true,
    saveUninitialized: true
}));

// set static folder
// app.use(express.static(path.join(__dirname)));


//allows use of .body method
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

//???
app.use(express.json());


//Handle Get requests

app.get("/", (req, res) => {
    res.sendFile("search.html", { root: __dirname + "/public" });
});

app.get("/search.html", (req, res) => {
    res.sendFile("search.html", { root: __dirname + "/public" });
});

app.get("/list.html", (req, res) => {
    res.sendFile("list.html", { root: __dirname + "/public" });
});

app.get("/book.html", (req, res) => {
    res.sendFile("book.html", { root: __dirname + "/public" });
});


//Handle Post Requests
app.post("/search", function (req, res) {

    const title = req.body.title.trim().toLowerCase();
    var re = new RegExp(';')
    var test = re.test(title);

    if (test) {
        console.log("failed");

    } else {

        var books = null;
        var tagid = null;
        var books_with_tags = null;

        var con = mysql.createConnection({
            host: "dbproject.chw0z33b0eoj.us-west-2.rds.amazonaws.com",
            user: "bookadmin",
            password: "proj1234",
            database: "bookstoredb"
        });

        const search_books_query = `SELECT * FROM books WHERE book_title = "${title}"`;
        const find_tag_query = `SELECT tag_id FROM tags WHERE tag_name = "${title}"`;
        
        let promise = new Promise((resolve, reject) => {
            con.connect((err) => {
                if (err) {
                    throw err;
                }
    
                con.query(search_books_query, (err, result) => {
                    if (err) {
                        console.log("Error");
                    } else {
                        if (result.length != 0) {
                            books = result;
                        }
                    }
                })
    
                let tag_promise = new Promise((resolve, reject) => {
                    con.query(find_tag_query, (err, result) => {
                        if (err) {
                            console.log("Error");
                        } 
                        if (result.length != 0) {
                            tagid = result[0].tag_id;
                            resolve();
                        } else {
                            reject();
                            console.log("Found No Selections");
                        }
                    })
                })

                tag_promise.then(() => {
                    const search_tag_query = `SELECT * FROM books JOIN book_tags ON books.book_id = book_tags.book_id JOIN tags ON book_tags.tag_id = tags.tag_id WHERE tags.tag_id = ${tagid};`

                    if (tagid != null) {
                        con.query(search_tag_query, (err, result) => {
                            if (err) {
                                console.log("error");
                            }
                            
                            if (books == null) {
                                books = result;
                  
                            } else if (books.length > 0) {
                                books.concat(result);
                            }
                        })
                    }

                    con.end((err) => {
                        if (err) {
                            throw err;
                        }
                        console.log("Database connection closed");
                        resolve();
                    })
                })
                
                tag_promise.catch(() => {
                    con.end((err) => {
                        if (err) {
                            throw err;
                        }
                        console.log("Database connection closed");
                        resolve();
                    })
                })

            });
        })

        promise.then(() => {
            req.session.searchQuery = JSON.stringify(books);
            res.send("success");

        })
       
    }
});

app.post("/load_list", (req, res) => {
    res.send(req.session.searchQuery);
})

app.post("/moreInfo", (req, res) => {
    if (req.body.title) {
        var con = mysql.createConnection({
            host: "dbproject.chw0z33b0eoj.us-west-2.rds.amazonaws.com",
            user: "bookadmin",
            password: "proj1234",
            database: "bookstoredb"
        });

        let bookInformationQuery = `SELECT * FROM books WHERE book_title = "${req.body.title}"`

        con.connect( err => {
            if (err) {
                throw err;
            };

            con.query(bookInformationQuery, (err, result) => {
                if (err) {
                    throw err;
                }
                
                req.session.bookInfo = JSON.stringify(result[0]);
                console.log(req.session.bookInfo);
            });
        })
        res.send("success");
    } else {
        res.send("failure");
    }
})

//checks for a logged in session variable
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

//Handles a login request.
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



app.listen(PORT, (err) => {
    if (err) { console.log("Error"); }
    console.log(`Server started on port ${PORT}`)
    console.log(`Listening on PORT ${PORT}`)
});













