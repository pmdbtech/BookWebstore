new Vue({
    el: '#app',
    data: {
        title: "",
        login: false,
        num: 100
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
        }
    }
})
