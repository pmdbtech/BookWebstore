$(document).ready(() => {
    new Vue({
        el: '#app',
        data: {
            username: "",
            password: "",
            firstname: "",
            lastname: "",
            retypedPassword: "",
        },
        methods: {
            signUp: function () {                
                if (this.username.length === 0 || this.password.length === 0 || this.firstname === 0 || this.lastname === 0) {
                    window.alert("All fields must be completed");
                } else if (this.password != this.retypedPassword) {
                    window.alert("Passwords Must Match");
                } else {
                    let xhttp = new XMLHttpRequest();
                    xhttp.onreadystatechange = () => {
                        if (xhttp.readyState == 4 && xhttp.status == 200) {
                            if(xhttp.response == "failed") {
                                window.alert("Username taken, choose another");
                            } else {
                                window.alert("Your account has been created");
                                window.location.href = "/search.html"
                            }
                        }
                    }
                    xhttp.open("POST", "/signUp");
                    xhttp.setRequestHeader("Content-type", "application/json;charset=UTF-8");
                    xhttp.send(JSON.stringify({username: this.username, firstname: this.firstname, lastname: this.lastname, password: this.password}));
                }
            }
        }
    })

})

