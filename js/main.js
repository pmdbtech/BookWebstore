
// import {clearNode} from "./utils";

//check session variable
$(document).ready(
    () => {
        // console.log("helloworld")
        // let frm = $("#userInfoForm");



        $.ajax({
            url:"/checkSession",
            type:"POST",
            success: (data)=>{
                if (data.status === "success"){
                    let cleanNode = document.getElementById("userLogin");
                    while (cleanNode.lastChild) {
                        cleanNode.removeChild(cleanNode.lastChild);
                    }
                    let newDiv = document.createElement('h3');
                    newDiv.innerText = "Welcome " + data.name;

                    document.getElementById("userLogin").appendChild(newDiv);
                }
            }
        })


        $("#userInfoForm").submit((e) => {
            // console.log("cheese");
            e.preventDefault();           

            $.ajax({
                url: "/userInfo",
                type: "POST",
                req_type: "getUserInfo",
                data: {
                    type: "getUserInfo",
                    user: document.getElementById("getUserID").value,
                    psw: document.getElementById("psw").value
                },
                success: (data) => {

                    // document.getElementById("myForm").style.display = "none";
                    let cleanNode = document.getElementById("userLogin");
                    while (cleanNode.lastChild) {
                        cleanNode.removeChild(cleanNode.lastChild);
                    }
                    let newDiv = document.createElement('h3');

                    // clearNode("userLogin");
                    // let newDiv = document.createElement('h3');

                    if (data.status === "success") {
                        console.log("client work happening")
                        let f = data.first.trim();
                        let fmod = f.charAt(0).toUpperCase() + f.substring(1, f.length);
                        let l = data.second
                        let lmod = l.charAt(0).toUpperCase() + l.substring(1, l.length);
                        let fullname = fmod + " " + lmod;


                        newDiv.innerText = fullname;
                        // newDiv.id = "hello";

                        document.getElementById("userLogin").appendChild(newDiv);

                    } else {
                        newDiv.innerText = "YOUR USERNAME OR PASSWORD DOESNT EXIST";
                        // newDiv.id = "hello";

                        document.getElementById("userLogin").appendChild(newDiv);
                    }
                },
                error: function (data) {
                    console.log('An error occurred.');
                    console.log(data);
                },

            })

        })
    }
)
