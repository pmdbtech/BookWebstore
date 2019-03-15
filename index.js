const mysql = require('mysql');
const express = require('express');
const path = require('path');
const app = express();

var connection = mysql.createConnection({
    host: 'dbproject.chw0z33b0eoj.us-west-2.rds.amazonaws.com',
    user: 'bookadmin',
    password: 'proj1234',
    database: 'bookstoredb'
});

connection.connect(function (err) {
    if (err) {
        console.error('error connecting: ' + err.stack);
        return;
    }

    console.log('connected as id ' + connection.threadId);
});


app.use("/scripts", express.static("build"));
app.use("/styles", express.static("styles"));
app.use("/images", express.static("images"));


app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, "/public/book.html"));
})


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Listening on PORT ${PORT}`))


connection.end((err) => {
    if (err) {
        console.log("Closing Error")
    } else {
        console.log("Closing server Connection")
    }
});