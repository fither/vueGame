<template>
  <div id="BlockGame">
    <button v-on:click="signOut()" id="signoutButton">Sign Out</button>
    <div id="camera">
        <div id="game-wrapper">
            <div class="player-wrapper" data-id="12345">

            </div>
        </div>
        <!-- <canvas id="game-canvas"></canvas> -->
    </div>
  </div>
</template>

<script>
    export default {
        name: 'BlockGame',
        data() {
            return {
                socket: {},
                keysPressed: [],
                keyBindings: {
                    "keyLeft": ["a", "ArrowLeft"],
                    "keyUp": ["w", "ArrowUp"],
                    "keyRight": ["d", "ArrowRight"],
                    "keyDown": ["s", "ArrowDown"]
                }
            }
        },
        created() {
            this.socket = this.$store.getters.getSocket;
        },
        mounted() {
            this.resizeCanvas();
            window.addEventListener("resize", this.resizeCanvas);
            this.socket.emit("giveMePlayers", this.$store.getters.getPlayerName);
            this.socket.on("players", players => {
                    this.renderPlayers(players);
                }
            );
        
            this.socket.on("logout", () => {
                localStorage.removeItem("game");
                this.$store.commit("logout");
                this.$store.commit("changeScene", "LoginWrapper");
            });

            document.addEventListener("keydown", (event) => {
                this.handleKeyEvent(event);
            });

            document.addEventListener("keyup", (event) => {
                this.keysPressed.splice(this.keysPressed.indexOf(event.key), 1);
            });
        },
        destroyed() {
            document.removeEventListener("keydown", (event));
            document.removeEventListener("keyup", (event));
        },
        updated() {
            console.log("updated");
        },
        methods: {
            resizeCanvas() {
                const gameWrapper = document.getElementById("game-wrapper");
                if(gameWrapper != null) {
                    gameWrapper.style.width = innerWidth + "px";
                    gameWrapper.style.height = innerHeight + "px";
                }
                // const canvas = document.querySelector("canvas");
                // if(canvas != null) {
                //     canvas.width = innerWidth;
                //     canvas.height = innerHeight;
                // }
            },
            move(direction) {
                this.socket.emit("move", { 
                    "playerName": this.$store.getters.getPlayerName, 
                    "direction": direction
                    }
                );
            },
            handleKeyEvent(event) {
                event.preventDefault();
                
                if(this.keysPressed.indexOf(event.key) < 0) {
                    this.keysPressed.push(event.key);
                }

                if(typeof(this.keysPressed) != "undefined" && this.keysPressed.length > 0) {
                    var keyFirst = this.keysPressed[0];
                    var keySecond = this.keysPressed[1];
                    if(this.keyBindings.keyLeft.indexOf(keyFirst) > -1) {
                        if(typeof(keySecond) != "undefined") {
                            if(this.keyBindings.keyUp.indexOf(keySecond) > -1) {
                                this.move("upleft");
                            } else if(this.keyBindings.keyDown.indexOf(keySecond) > -1) {
                                this.move("downleft");
                            }
                        } else {this.move("left");}
                    } else if(this.keyBindings.keyUp.indexOf(keyFirst) > -1) {
                        if(typeof(keySecond) != "undefined") {
                            if(this.keyBindings.keyLeft.indexOf(keySecond) > -1) {
                                this.move("upleft");
                            } else if(this.keyBindings.keyRight.indexOf(keySecond) > -1) {
                                this.move("upright");
                            }
                        } else {this.move("up");}
                    } else if(this.keyBindings.keyRight.indexOf(keyFirst) > -1) {
                        if(typeof(keySecond) != "undefined") {
                            if(this.keyBindings.keyUp.indexOf(keySecond) > -1) {
                                this.move("upright");
                            } else if(this.keyBindings.keyDown.indexOf(keySecond) > -1) {
                                this.move("downright");
                            }
                        } else {this.move("right");}
                    } else if(this.keyBindings.keyDown.indexOf(keyFirst) > -1) {
                        if(typeof(keySecond) != "undefined") {
                            if(this.keyBindings.keyRight.indexOf(keySecond) > -1) {
                                this.move("downright");
                            } else if(this.keyBindings.keyLeft.indexOf(keySecond) > -1) {
                                this.move("downleft");
                            }
                        } else {this.move("down");}
                    }
                }
            },
            signOut() {
                this.socket.emit("signOut");
            },
            renderPlayers(players) {
                let gameWrapper = document.getElementById("game-wrapper");

                // first delete players on wrapper that not exist in players
                let playersOnWrapper = document.getElementsByClassName("player-wrapper");
                playersOnWrapper.forEach(playerOnWrapper => {
                    let isPlayerExist = false;
                    players.forEach(player => {
                        let playerID = playerOnWrapper.getAttribute("data-id");
                        if(playerID == player._id) {
                            isPlayerExist = true;
                            // update player position 
                            playerOnWrapper.style.transform = `translate3d(${player.xPos}px, ${player.yPos}px, 0)`;
                            playerOnWrapper.style.width = player.size + "px";
                            playerOnWrapper.style.height = player.size + "px";

                            // that's me :)
                            if(player.name == this.$store.getters.getPlayerName) {
                                let centeredPlayerXPos = -player.xPos / 2;
                                let centeredPlayerYPos = -player.yPos / 2;
                                gameWrapper.style.transform = `translate3d(${centeredPlayerXPos}px, ${centeredPlayerYPos}px, 0)`;
                            }
                        }
                    });

                    if(!isPlayerExist) {
                        playerOnWrapper.remove();
                    }
                });

                // second insert not existing players to wrapper
                players.forEach(player => {
                    let isPlayerExist = false;
                    playersOnWrapper.forEach(playerOnWrapper => {
                        let playerID = playerOnWrapper.getAttribute("data-id");
                        if(player._id == playerID) {
                            isPlayerExist = true;
                        }
                    });

                    if(!isPlayerExist) {
                        let playerWrapper = document.createElement("div");
                        playerWrapper.setAttribute("data-id", player._id);
                        playerWrapper.classList.add("player-wrapper");
                        playerWrapper.style.transform = `translate3d(${player.xPos}px, ${player.yPos}px, 0)`;
                        playerWrapper.style.width = player.size + "px";
                        playerWrapper.style.height = player.size + "px";
                        document.getElementById("game-wrapper").appendChild(playerWrapper);
                    }
                });

                // const canvas = document.querySelector("canvas");
                // const context = canvas.getContext("2d");
                // context.clearRect(0, 0, canvas.width, canvas.height);
                // if(players.length > 0) {
                //     context.beginPath();
                //     players.forEach(player => {
                //         context.arc(player["xPos"], player["yPos"], player["size"], 0, Math.PI * 2, false);
                //         context.fillStyle = "red";
                //         context.fill();
                //     });
                // }
            }
        }
    }
</script>

<style lang="scss">
    body {
        margin: 0;
        padding: 0;
    }

    #camera {
        position: absolute;
        width: 50%;
        height: 50%;
        left: 50%;
        top: 50%;
        transform: translate3d(-50%, -50%, 0);
        border: 1px solid red;
        overflow: hidden;
    }

    #game-wrapper {
        position: absolute;
        background-image: url("../assets/gameMap.jpg");
    }

    .player-wrapper {
        position: relative;
        background: black;
    }

    canvas {
        position: absolute;
    }

    #signoutButton {
        position: absolute;
        left: 0;
        top: 0;
    }

</style>