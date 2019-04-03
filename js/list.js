$(document).ready(() => {
    console.log("list.js has been loaded")
    let vm = new Vue({
        el: '#app',
        data: {
            books: {},
            failure: false,
        },
        // function to run an ajax call to the server to receive information on books to load
        created: function () {
            var xhttp = new XMLHttpRequest();
            xhttp.onreadystatechange = () => {
                if (xhttp.readyState == 4 && xhttp.status == 200) {
                    this.books = JSON.parse(xhttp.response);
                    console.log(this.books);

                    if (this.books == null || this.books.length == 0) {
                        this.failure = true;
                    } else {
                        console.log(this.books);
                    }
                }
            }
            xhttp.open('POST', '/load_list', true);
            xhttp.setRequestHeader("Content-type", "text");
            xhttp.send("load");

            $.ajax({
                url: "/checkSession",
                type: "POST",
                data: {
                    status: "success"
                },
                success: (data) => {
                    //check if user is logged in              
                    if (data.status === "failed") {
                        document.getElementById("checkout").style.display = "none";
                    }
                },
                error: function (data) {
                    console.log('An error occurred. checkOUT in cart.js');
                    console.log(data);
                },
            })
        },
        methods: {
            // view more information on a book
            moreInfo: function (book_name) {
                var xhttp = new XMLHttpRequest();
                xhttp.onreadystatechange = () => {
                    if (xhttp.readyState == 4 && xhttp.status == 200) {
                        if (xhttp.response == "failure") {
                            alert("Cannot find book information");
                        } else {
                            window.location.href = "/book.html";
                        }
                    }
                }
                xhttp.open('POST', '/moreInfo');
                xhttp.setRequestHeader("Content-type", "application/json");
                xhttp.send(JSON.stringify({ title: book_name }));
            },
            openForm: () => {
                document.getElementById("myForm").style.display = "block";
            },
            closeform: () => {
                document.getElementById("myForm").style.display = "none";
            },
            addBooktoCart: (book) => {
                console.log("adding " + book + "to backend")
                console.log("adding to cart user session")

                $.ajax({
                    url: "/addBookToCart",
                    type: "POST",
                    data: {
                        status: "success",
                        book: book
                    },
                    success: (data) => {
                        if (data.status === "failed") {
                            document.getElementById("myForm").style.display = "block";
                        } else {
                            window.alert("You book was successfully added to the cart")
                        }
                    }
                })
            },
            

            
        }
    })

})
