//Constants

// use express dependency
const express = require('express');
// use path dependency
const path = require('path');
// use mysql dependency
const mysql = require('mysql');
// use bodyParser dependency
const bodyParser = require('body-parser');
// use express-session dependency
const session = require('express-session');
// set up server
const app = express();
// set port number for server
const PORT = process.env.PORT || 3000;

// set static folder
//provide pathing scripts for client
app.use("/scripts", express.static("build"));
app.use("/styles", express.static("css"));
app.use("/img", express.static("images"));

// used to extract data from client
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

// setUp express-session
app.use(session({
    secret: "bookstoredb",
    resave: true,
    saveUninitialized: false
}));

// pool used for pooling sql connections
var pool = mysql.createPool({
    host: "dbproject.chw0z33b0eoj.us-west-2.rds.amazonaws.com",
    user: "bookadmin",
    password: "proj1234",
    database: "bookstoredb",
    connectionLimit: 10,
});

//Establish a connection to mysql database.
let connection = mysql.createConnection({
    host: 'dbproject.chw0z33b0eoj.us-west-2.rds.amazonaws.com',
    user: 'bookadmin',
    password: 'proj1234',
    database: 'bookstoredb'
});


// get request for landing page, send search.html upon loading
app.get("/", (req, res) => {
    res.sendFile("search.html", { root: __dirname + "/public" });
});

// get request for /search.html url, send search.html
app.get("/search.html", (req, res) => {
    res.sendFile("search.html", { root: __dirname + "/public" });
});

// get request for /list.html, send list.html
app.get("/list.html", (req, res) => {
    res.sendFile("list.html", { root: __dirname + "/public" });
});

// get request for /book.html, send book.html
app.get("/book.html", (req, res) => {
    res.sendFile("book.html", { root: __dirname + "/public" });
});
// get request for /book.html, send book.html
app.get("/about.html", (req, res) => {
    res.sendFile("about.html", { root: __dirname + "/public" });
});

//cart page
app.get("/cart.html", (req, res) => {
    if (req.session.username) {
        res.sendFile(path.join(__dirname, "/public/cart.html"));
    } else {
        res.send("Error 404 Page not found")
    }
});

//signup page
app.get("/signup.html", (req, res) => {
    res.sendFile(path.join(__dirname, "/public/signup.html"));
})

// post request from the client 
app.post("/featureBook", (req, res) => {

    // mysql query to find 4 books with the features tag
    let featureBookQuery = `SELECT book_picture, book_title FROM books JOIN book_tags ON books.book_id = 
            book_tags.book_id JOIN tags ON book_tags.tag_id = tags.tag_id WHERE tags.tag_name = "features" ORDER BY RAND() LIMIT 4;`

    // mysql connection to run query; pool.query will automatically released
    // connection once query is finished
    pool.query(featureBookQuery, (err, result) => {
        if (err) throw err;

        res.send(JSON.stringify(result));
    })
})

// post request for the search function on the search page
app.post("/search", function (req, res) {

    // user input; case insensitive; stripped whitespace
    const title = req.body.title.trim().toLowerCase();

    // object to store book results;
    var books = null;

    // find all books that have the same name as the user input
    const search_books_query = `SELECT * FROM books WHERE book_title like 
    "%${title}%" OR book_title like "%${title}" OR book_title like "${title}%" 
    OR book_title = "${title}"`;

    // Promise to ensure that all queries get completed before sending data
    let promise = new Promise((resolve) => {

        // pool query to run the search_books_query
        pool.query(search_books_query, (err, result) => {
            if (err) {
                throw err;
            }

            // if the query finds an object, then set the books variable to this result

            books = result;
            resolve();

        })
    })

    // when the promise resolves, then set the session variable to the data and
    // send a result 
    promise.then(() => {
        req.session.searchQuery = JSON.stringify(books);
        console.log("sending" + req.session.searchQuery);
        res.send("success");
    })
});

// post request for the search function on the search page
app.post("/searchTags", function (req, res) {

    // user input; case insensitive; stripped whitespace
    const title = req.body.title.trim().toLowerCase();

    // object to store book results;
    var books = null;

    // object to store tag id if user input is a tag;
    var tagid = null;


    // find the tag id of the tag with the same name as the user input
    const find_tag_query = `SELECT tag_id FROM tags WHERE tag_name = "${title}"`;

    // Promise to ensure that all queries get completed before sending data
    let promise = new Promise((resolve) => {

        // Tag promise to ensure that finding the tag_id query occurs first
        // before searching all tags with that tag id
        let tag_promise = new Promise((resolve, reject) => {
            pool.query(find_tag_query, (err, result) => {
                if (err) throw err;

                // if we find a result then resolve the promise
                if (result.length != 0) {
                    tagid = result[0].tag_id;
                    resolve();
                } else {
                    // if we don't find a result, reject the promise
                    reject();

                }
            })
        })

        // if promise is resolved then query for all tags with that tag id
        tag_promise.then(() => {
            const search_tag_query = `SELECT * FROM books JOIN book_tags ON books.book_id = book_tags.book_id JOIN tags ON book_tags.tag_id = tags.tag_id WHERE tags.tag_id = ${tagid};`

            if (tagid != null) {
                pool.query(search_tag_query, (err, result) => {
                    if (err) throw err;

                    // if books is currently null, assign books to the result
                    books = result;

                    resolve();
                })
            }
        })

        // if the promise failed, just resolve the original promise
        tag_promise.catch(() => {
            resolve();
        })
    })

    // when the promise resolves, then set the session variable to the data and
    // send a result 
    promise.then(() => {
        req.session.searchQuery = JSON.stringify(books);
        console.log("sending from tags query" + req.session.searchQuery);
        res.send("success");
    })

});

// post request for /load_list url on the list page. Send search results to client
app.post("/load_list", (req, res) => {
    res.send(req.session.searchQuery);
})

// post request for /moreInfo url on the list page. Query data for a specified book
app.post("/moreInfo", (req, res) => {
    if (req.body.title) {
        // object to store book information
        let book_information = {};

        // query to find the book information
        let bookInformationQuery = `SELECT * FROM books WHERE book_title = "${req.body.title}"`

        // query to find all tags that the book have
        let tagInformationQuery = `SELECT book_title, tag_name FROM book_tags JOIN tags ON book_tags.tag_id = 
        tags.tag_id JOIN books ON book_tags.book_id = books.book_id WHERE book_title =  "${req.body.title}";`

        // Used for recommendedBook query
        req.session.bookTitle = req.body.title;

        let detailsPromise = new Promise((resolve, reject) => {
            pool.query(bookInformationQuery, (err, result) => {
                if (err) {
                    reject();
                    throw err;
                }
                book_information.details = result[0];
                resolve();
            });
        })

        detailsPromise.catch(() => {
            console.log("error");
        })

        detailsPromise.then(() => {
            pool.query(tagInformationQuery, (err, result) => {
                if (err) throw err;
                req.session.bookTags = result[0];
                book_information.tags = result;
                req.session.bookInfo = JSON.stringify(book_information);
                res.send("success");
            })
        })
    } else {
        res.send("failure");
    }
})

// post request to send information to the client
app.post("/moreBookInfo", (req, res) => {
    res.send(req.session.bookInfo);
})

// post request to get the recommended books on the book page
app.post("/recommendedBooks", (req, res) => {

    // stores the tag that the book has
    let bookTag = req.session.bookTags.tag_name;

    // query to find other books with the same tag
    let recommendedBookQuery = `SELECT * FROM books JOIN book_tags ON books.book_id = 
    book_tags.book_id JOIN tags ON book_tags.tag_id = tags.tag_id WHERE tags.tag_name = "${bookTag}" AND books.book_title <> "${req.session.bookTitle}" ORDER BY RAND() LIMIT 3;`

    // queries data and sends information to client
    pool.query(recommendedBookQuery, (err, result) => {
        if (err) {
            throw err;
        }
        res.send(JSON.stringify(result));
    })
})

//checks for a logged in session variable
app.post("/checkSession", (req, res) => {
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
                // res.send({status: "failed"})
            }
            // console.log(results);
            // console.log(fields)
            if (results[0] == null || results[0] == undefined) {
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

app.post("/addBookToCart", (req, res) => {
    //Check session tokens
    if (req.session.username) {
        console.log("adBOOKstocart, user is logged in")
        //add book to mysql database        
        // console.log(req.body);
        let username = req.session.username;
        let book_id = req.body.book.book_id;
        let mysqlStatement = `INSERT INTO cart (username, book_id) VALUES ("${username}", ${book_id});`;

        let success = connection.query(mysqlStatement, (error, results, fields) => {
            if (error) {
                return console.error(error.message);
            }
        })
        if (success) {
            console.log("Book added to database")
        } else {
            console.log("Book was not added to database")
        }

        // console.log(mysqlStatement);
        res.json({
            status: "success",
            name: req.session.username,
        })
    } else {
        console.log("adBOOKstocart, user is NOT logged in")
        res.json({
            status: "failed",
            name: req.session.username,
        })
    }

})

app.post("/getCart", (req, res) => {
    //Check session tokens
    if (req.session.username) {
        console.log("Getting Cart")
        //add book to mysql database        
        // console.log(req.body);
        let username = req.session.username;

        let mysqlStatement = `SELECT DISTINCT cart.book_id, book_title, book_author, book_picture,
         book_price FROM cart JOIN bookstoredb.books ON cart.book_id = books.book_id WHERE username = "${username}"`;

        let success = connection.query(mysqlStatement, (error, results, fields) => {
            if (error) {
                return console.error(error.message);
            }

            if (!results) {
                console.log("..hellow" + results + "There was an error getting the cart, getCart, returns no results")
                res.send({ status: "failed" });
            } else {
                console.log("Server sending sqL CART data to client")
                console.log(results)
                res.send(
                    {
                        status: "success",
                        cart: results
                    }
                );
            }
        })
        // if (success) {
        //     console.log("Books received from cart");
        // } else {
        //     console.log("Books NOT received from cart");
        // }

        // console.log(mysqlStatement);

    } else {
        console.log("adBOOKstocart, user is NOT logged in")
        res.json({
            status: "failed",
            name: req.session.username,
        })
    }
})

app.post("/removeBookFromCart", (req, res) => {
    //Check session tokens
    if (req.session.username) {

        let username = req.session.username;
        console.log("Deleting " + username + "..." + req.body.book.book_id)


        let mysqlStatement = `DELETE FROM cart WHERE username = "${username}" AND book_id = ${req.body.book.book_id};`;


        let success = connection.query(mysqlStatement, (error) => {
            if (error) {
                return console.error(error.message);
            }
        })
        if (success) {
            console.log("sucessful delete")
            res.json({
                status: "successful Delete"
            })
        } else {
            res.json({
                status: "failed Delete"
            })
        }

    }
    else {
        console.log("Error removeBookFromCart, user is NOT logged in")
        // res.json({
        //     status: "failed",
        //     name: req.session.username,
        // })
    }
})

app.post("/signUp", (req, res) => {

    let check_username_query = "INSERT INTO users VALUES (?, ?, ?, ?);";

    pool.query(check_username_query, [req.body.username, req.body.firstname, req.body.lastname, req.body.password],
        (error, results, fields) => {
            if (error) {
                res.send("failed");
            } else {
                res.send("success");
            }
        })
})


app.post("/endSession", (req, res) => {
    //Check session tokens
    if (req.session.username) {
        req.session.destroy();
        res.send({ status: "success" })
    }
    else {
        console.log("Error removeBookFromCart, user is NOT logged in")

    }
})

// port to host the server
app.listen(PORT, (err) => {
    if (err) { console.log("Error"); }
    console.log(`Server started on port ${PORT}`)
    console.log(`Listening on PORT ${PORT}`)
});