var mysql = require('mysql');

var con = mysql.createConnection({
    host: "dbproject.chw0z33b0eoj.us-west-2.rds.amazonaws.com",
    user: "bookadmin",
    password: "proj1234",
    database: "bookstoredb"
})

let table = "books";
let name = "1984";
let author = "George Orwell";
let book_description = `1984, Winston Smith wrestles with oppression in Oceania,
 a place where the Party scrutinizes human actions with ever-watchful Big Brother. 
 Defying a ban on individuality, Winston dares to express his thoughts in a diary and 
 pursues a relationship with Julia. These criminal deeds bring Winston into the eye of the 
 opposition, who then must reform the nonconformist. George Orwell\'s 1984 introduced the watchwords
 life without freedom: BIG BROTHER IS WATCHING YOU.`;


con.connect(function (err) {
    if (err) return console.log("Error Occured in connect");
    console.log("Connected");

    con.query(`INSERT INTO ${table} (book_title, book_author, book_description) 
    VALUES ("${name}", "${author}", "${book_description}");`, (err, result) => {
        if (err) return console.log("Failed to insert book " + err.message);
        console.log("Added Book!");
    });

    con.query("SELECT * FROM books;", (err, result) => {
        if (err) return console.log("Error Occured in selecting data: " + err.message);
        console.log(result);
    })


    con.end((err) => {
        if (err) {
            return console.log(`error: ${err.message}`);
        }
    
        console.log("Closed the database connection");
    })
})

