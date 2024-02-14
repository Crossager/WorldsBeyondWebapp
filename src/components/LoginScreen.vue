<template>
    <div class="authContainer">
        <h2>Welcome to Worlds Beyond!</h2>
        <p>Appears you have not been logged in on this device yet.</p> 
    
        <div id="newUserError" class="errorContainer">Error occourred starting new account, try again later.</div>
        <button id="newUserButton" class="authButton" @click="startNewUser">Start as New User</button>
        
        <p>Have you played before?</p>
    
        <div id="loginError" class="errorContainer">Error occourred logging in, is your token valid?</div>

        <input type="text" id="loginTokenInput" placeholder="Paste your login token here">
        
        <button id="loginButton" class="authButton" @click="loginWithToken">Login as Existing User</button>
      </div>
</template>

<script>
import { callEndpoint, fetchUser, setCookie, setToken, setUser } from '../main'
export default {
    name: 'LoginScreen',
    methods: {
        startNewUser() {
            var startButton = document.getElementById("newUserButton");
            startButton.classList.add("authButtonDisabled");
            const thisRef = this;

            callEndpoint('create-token', 'POST')
                .then((token) => {
                    setCookie('gametoken', token, 999);
                    setToken(token)
                    callEndpoint('user', 'GET')
                        .then((user) => {
                            setUser(user);
                            thisRef.$emit('load');
                        });
                })
                .catch((error) => {
                    console.error("Error creating token:", error);
                    document.getElementById("newUserError").style.display = 'block';
                    startButton.classList.remove("authButtonDisabled");
                });
        },
        loginWithToken() {
            var token = document.getElementById('loginTokenInput').value; 

            setToken(token);
            var startButton = document.getElementById("loginButton");
            startButton.classList.add("authButtonDisabled");
            const thisRef = this;

            callEndpoint('validate-token', 'GET')
                .then(function (data) {
                    setCookie('gametoken', token, 999);
                    console.log(data);
                    callEndpoint('user', 'GET')
                        .then((user) => {
                            setUser(user);
                            thisRef.$emit('load');
                        });
                })
                .catch(function (error) {
                    console.error("Error logging in:", error);
                    document.getElementById("loginError").style.display = 'block';
                    loginButton.classList.remove("authButtonDisabled");
                });
        }
    }
}
</script>

<style scoped>
    .errorContainer {
        color: red;
        margin-top: 10px;
        display: none;
    }

    .authContainer {
        text-align: center;
        border-radius: 5px;
        border: 2px solid #3498db;
        padding: 5%;
        max-width: 400px; /* Set a maximum width for better responsiveness */
        margin: 0 auto; /* Center the container horizontally */
        background-color: #fff; /* Add a background color */
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); /* Add a subtle box shadow */
    }

    /* Additional styles for better readability */
    .authContainer h2 {
        color: #3498db;
    }

    .authContainer p {
        color: #555;
        margin-bottom: 20px;
    }

    .authButton {
        display: block;
        width: 100%;
        padding: 10px;
        margin: 10px 0;
        font-size: 16px;
        cursor: pointer;
        border: 2px solid #3498db;
        border-radius: 5px;
        background-color: #3498db;
        color: #fff;
        text-decoration: none;
        transition: background-color 0.3s ease;
    }

    .authButton:hover {
        background-color: #2980b9;
        border-color: #2980b9;
    }

    .authButtonDisabled {
        cursor: not-allowed;
        background-color: #bdc3c7;
        border: 2px solid #bdc3c7;
    }

    .authButtonDisabled:hover {
        background-color: #bdc3c7;
        border-color: #bdc3c7;
    }

    #loginTokenInput {
        width: 300px;
        padding: 8px;
        margin-top: 20px;
        font-size: 16px;
        text-align: center;
    }
</style>