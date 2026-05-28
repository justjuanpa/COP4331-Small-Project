//add an event listener to the login form to handle the login process
const loginForm = document.getElementById("loginForm");
if (loginForm) {
    loginForm.addEventListener("submit", async function(event) {
        event.preventDefault();

        //get the login and password values from the form
        const login = document.getElementById("login").value;
        const password = document.getElementById("password").value;

        //send a POST request to the server with the login and password
        const response = await fetch("LAMPAPI/Login.php", {
            method: "POST",
            headers: {
               "Content-Type": "application/json"
            },
            body: JSON.stringify({
                login: login,
                password: password
            })
        });

        //parse the response from the server
        const data = await response.json();

        //if the login was successful, store the user information in a cookie and redirect to the contacts page
        if (data.error === "") {
            let minutes = 20;
            let date = new Date();
            date.setTime(date.getTime() + (minutes * 60 * 1000));

            document.cookie = "firstName=" + data.firstName +
                                ",lastName=" + data.lastName +
                                ",userId=" + data.id +
                                ";expires=" + date.toGMTString();

            window.location.href = "contacts.html";
        } else {
            alert(data.error);
        }
    });
}

//add an event listener to the registration form to handle the registration process
const registerForm = document.getElementById("registerForm");
if (registerForm) {
    registerForm.addEventListener("submit", async function(event) {
        event.preventDefault();

        //get the form values
        const firstName = document.getElementById("firstName").value;
        const lastName = document.getElementById("lastName").value;
        const login = document.getElementById("login").value;
        const password = document.getElementById("password").value;

        //send a POST request to the server with the registration information
        const response = await fetch("LAMPAPI/Register.php", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                firstName: firstName,
                lastName: lastName,
                login: login,
                password: password
            })
        });

        //parse the response from the server
        const data = await response.json();

        //if the registration was successful, redirect to the login page
        if (data.error === "") {
            window.location.href = "index.html";
        } else {
            alert(data.error);
        }
    });
}