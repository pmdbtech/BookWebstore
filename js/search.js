$(document).ready(() => {
    new Vue({
        el: '#app',
        data: {
            title: "",
            login: false,
            num: 100,
            featuredBooks: {},
            select: "",
        },
        // function run to send a request to the server to find feature books on webpage load
        created: function () {
            let xhttp = new XMLHttpRequest();
            xhttp.onreadystatechange = () => {
                if (xhttp.readyState == 4 && xhttp.status == 200) {
                    this.featuredBooks = JSON.parse(xhttp.response);
                    

                }
            }
            xhttp.open("POST", "/featureBook");
            xhttp.setRequestHeader("Content-type", "text");
            xhttp.send("load");

        },
        methods: {

            // function to search books for a tag or title
            search: function () {
                var xhttp = new XMLHttpRequest();
                xhttp.onreadystatechange = () => {
                    if (xhttp.readyState == 4 && xhttp.status == 200) {
                        window.location.href = "/list.html";
                    }
                }
                
                if (this.select === "Tags") {
                    xhttp.open('POST', "/searchTags", true);
                    xhttp.setRequestHeader("Content-type", "application/json");
                    xhttp.send(JSON.stringify({ title: this.title }));
                } else {
                    xhttp.open('POST', "/search", true);
                    xhttp.setRequestHeader("Content-type", "application/json");
                    xhttp.send(JSON.stringify({ title: this.title }));
                }

            },
            // view information for a book
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
            }
        }
    })

})

