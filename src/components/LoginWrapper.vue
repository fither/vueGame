<template>
  <div id="login-wrapper">
      <div class="login-table">
        <span>Kullanıcı adınızı girin: </span>
        <input id="player-name" type="text"><br>
        <span v-if="returnIfUserFound"> {{ isUserFoundMessage }} </span>
        <input v-if="returnIfUserFound" id="player-password" type="password"><br>
        <input v-model="rememberMe" type="checkbox"> <span>Remember me?</span><br>
        <button v-on:click="proceedLogin()">Click To Log-in</button>
        <p v-if="returnError"> {{ errorMessage }} </p>
      </div>
  </div>
</template>

<script>
import md5 from 'md5';

export default {
    name: 'login-wrapper',
    methods: {
        proceedLogin() {
            this.playerName = document.getElementById("player-name").value;

            if(this.isUserFoundResponse == null) {
                this.socket.emit("checkUser", this.playerName);
            } else {
                this.playerPassword = md5(document.getElementById("player-password").value);
                if(this.isUserExist == true) {
                    this.socket.emit("loginorsign", {
                        playerName: this.playerName,
                        playerPassword: this.playerPassword,
                        type: "login"
                    });
                } else {
                    this.socket.emit("loginorsign", {
                        playerName: this.playerName,
                        playerPassword: this.playerPassword,
                        type: "signin"
                    });
                }
            }
        }
    },
    data() {
        return {
            socket: {},
            playerName: String,
            playerPassword: String,
            isThereError: false,
            isUserFoundResponse: null,
            isUserExist: null,
            isUserFoundMessage: String,
            errorMessage: String,
            rememberMe: false
        }
    },
    computed: {
        returnError() {
            return this.isThereError;
        },
        returnIfUserFound() {
            return this.isUserFoundResponse;
        }
    },
    created() {
        this.socket = this.$store.getters.getSocket;
        if(localStorage.getItem("game") != null) {
            this.playerName = JSON.parse(localStorage.getItem("game")).playerName;
            this.playerPassword = JSON.parse(localStorage.getItem("game")).playerPassword;
            this.socket.emit("loginorsign", {
                playerName: this.playerName,
                playerPassword: this.playerPassword,
                type: "login"
            });
        }
    },
    mounted() {
        const playerUsernameWrapper = document.getElementById("player-name");
        if(playerUsernameWrapper != null) {
            document.getElementById("player-name").addEventListener("keydown", (event) => {
                if(event.key == "Enter") {
                    this.proceedLogin();
                }
            });
        }

        this.socket.on("checkUser", (response) => {
            this.isUserFoundResponse = true;
            this.isUserFoundMessage = response["reason"];
            this.isUserExist = response["result"];

            if(this.isUserExist) {
                // delayed for creating dom element duration
                setTimeout(() => {
                    const playerPasswordWrapper = document.getElementById("player-password");
                    if(playerPasswordWrapper != null) {
                        playerPasswordWrapper.addEventListener("keydown", (event) => {
                            if(event.key == "Enter") {
                                this.proceedLogin();
                            }
                        });
                    }
                }, 200);
            }
        });

        this.socket.on("loginStatus", (response) => {
            if(response["result"] == true) {
                this.$store.commit("login", { playerName: this.playerName, playerPassword: this.playerPassword });
                this.$store.commit("changeScene", "BlockGame");
                if(this.rememberMe) {
                    localStorage.setItem("game", JSON.stringify({
                        "playerName": this.playerName, 
                        "playerPassword": this.playerPassword 
                        }));
                } else {
                    localStorage.removeItem("game");
                }
            } else {
                this.isThereError = true;
                this.errorMessage = response["reason"];
            }
        });
    },
    destroyed() {
        // console.log("disconnecting");
        // this.socket.disconnect();
    },
    watch: {
        // rememberMe: (newValue, oldValue) => {
        //     console.log(oldValue + " -> " + newValue);
        // }
    }
}
</script>

<style>
    .login-table {
        position: absolute;
        width: auto;
        height: auto;
        left: 50%;
        top: 50%;
        transform: translate(-49%, -49%);
        display: grid;
    }
</style>