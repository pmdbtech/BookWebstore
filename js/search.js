new Vue({
    el: '#app',
    data: {
        title: "",
        login: false,
        num: 100,
        featuredBooks: {},
    },
    created: function() {
        let xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = () => {
            if(xhttp.readyState == 4 && xhttp.status == 200) {
                this.featuredBooks = JSON.parse(xhttp.response);
                
            }
        }
        xhttp.open("POST", "/featureBook");
        xhttp.setRequestHeader("Content-type", "text");
        xhttp.send("load");
        console.log('sending');
    },
    methods: {
        search: function() {
            var xhttp = new XMLHttpRequest();
            xhttp.onreadystatechange = () => {
                if (xhttp.readyState == 4 && xhttp.status == 200) {
                    window.location.href = "/list.html";
                }
            }
            xhttp.open('POST', "/search", true);
            xhttp.setRequestHeader("Content-type", "application/json");
            xhttp.send(JSON.stringify({title: this.title}));
            console.log(this.title);
        },

        moreInfo: function(book_name) {
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
            xhttp.send(JSON.stringify({title: book_name}));

        },
    }
})
