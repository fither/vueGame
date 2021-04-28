// socket connection
const Express = require("express")();
const Http = require("http").Server(Express);
const Socketio = require("socket.io")(Http, {
    cors: {
        origin: "http://localhost:8080",
        methods: ["GET", "POSt"]
    }
});

// db connection
const mongo = require("mongodb").MongoClient;
const url = "mongodb://localhost:27017/game";
const db_name = "game";
const collectionUsers = "users";
const collectionOnlinePlayers = "onlinePlayers";

// mongo.connect(url, (err, db) => {
//     if(err) throw err;
//     dbo = db.db(db_name);
//     db.close();

    // create tables

    // dbo.createCollection("users", (err, res) => {
    //     if(err) throw err;
    //     db.close();
    // });

    // dbo.createCollection(collectionOnlinePlayers, (err, res) => {
    //     if(err) throw err;
    //     db.close();
    // });

    // insert users to Tables;

    // dbo.collection(collectionOnlinePlayers).insertMany(players, (err, res) => {
    //     if(err) throw err;
    //     db.close();
    // });

    // dbo.collection(collectionUsers).insertMany(users, (err, res) => {
    //     if(err) throw err;
    //     db.close();
    // });

    // find 'admin' user information

    // dbo.collection(collectionUsers).findOne({"name": "admin"}, (err, res) => {
    //     if(err) throw err;
    //     console.log(res);
    //     db.close();
    // });

    // find all users informations and result with few columns

    // dbo.collection(collectionUsers).find({
    //     "name": "admin2"
    // }, {
    //     projection: {
    //         _id: 0,
    //         name: 1
    //     }
    // }).toArray((err, res)  => {
    //     if(err) throw err;
    //     console.log(res);
    //     console.log(res.length);
    //     db.close();
    // });
// });

function moveUp(dbo, playerName) {
    return;
}

mongo.connect(url, 
    { useUnifiedTopology: true},
    (err, db) => {
        if(err) throw err;

        const dbo = db.db(db_name);
        const roomName = "gaming";

        Socketio.on("connection", (socket) => {
            var player_name = "";

            socket.on("checkUser", (playerName) => {
                console.log(playerName + " trying to join server");
                dbo.collection(collectionUsers).findOne({
                    "name": playerName
                }, (err, res) => {
                    if(err) throw err;
                    if(res != null) {
                        socket.emit("checkUser", { result: true, reason: "User Exist, Enter Password for Log-in"});
                    } else {
                        socket.emit("checkUser", { result: false, reason: "User Doesn't Exist, Enter Password for Sign-in"});
                    }
                });
            });

            socket.on("loginorsign", (payload) => {
                const playerName = payload["playerName"];
                const playerPassword = payload["playerPassword"];
                const type = payload["type"];

                if(type == "signin") {
                    dbo.collection(collectionUsers).insertOne({
                        "name": playerName,
                        "password": playerPassword
                    }, (err, res) => {
                        if(err) throw err;
                        console.log(playerName + " user succesfully signed in");
                        player_name = playerName;
                    });

                    dbo.collection(collectionOnlinePlayers).insertOne({
                        "name": playerName,
                        "xPos": 50,
                        "yPos": 50,
                        "size": 5
                    }, (err, res) => {
                        if(err) throw err;
                        socket.join(roomName);
                        socket.emit("loginStatus", { result: true, reason: "Succesfully Signed-in"});
                    });
                } else if(type == "login") {
                    dbo.collection(collectionUsers).findOne({
                        "name": playerName,
                        "password": playerPassword
                    }, (err, res) => {
                        if(err) throw err;
                        if(res != null) {
                            console.log(playerName + " user successfully logged-in");
                            dbo.collection(collectionOnlinePlayers).insertOne({
                                "name": playerName,
                                "xPos": 50,
                                "yPos": 50,
                                "size": 5
                            }, (err, res) => {
                                if(err) throw err;
                                socket.join(roomName);
                                socket.emit("loginStatus", { result: true, reason: "Succesfully Logged-in"});
                                player_name = playerName;
                            });
                        } else {
                            console.log(playerName + " user creds are wrong");
                            socket.emit("loginStatus", { result: false, reason: "User Creds Are Wrong"});
                        }
                    });
                }
            });

            socket.on("signOut", () => {
                console.log(player_name);
                if(player_name && player_name != "") {
                    dbo.collection(collectionOnlinePlayers).deleteOne({ "name": player_name }, (err, res) => {
                        if(err) throw err;
                        console.log(player_name + " sign-outed, deleted from online players")
                    });
                }
                socket.leave(roomName);
                socket.emit("logout");
            });

            socket.on("giveMePlayers", (playerName) => {
                    dbo.collection(collectionOnlinePlayers).find({}, {
                        projection: {
                        }
                    }).toArray((err, res)  => {
                        if(err) throw err;
                        socket.emit("players", res);
                    });
                // dbo.collection(collectionOnlinePlayers).findOne({
                //     "name": playerName
                // }, (err, res) => {
                //     if(err) throw err;
                //     if(res != null) {
                //     }
                // });
            });

            socket.on("move", (info) => {
                const playerName = info["playerName"];
                const direction = info["direction"];

                // check if user is online
                dbo.collection(collectionOnlinePlayers).findOne({
                    "name": playerName
                }, (err, res) => {
                    if(err) throw err;
                    // if not null, then it is online
                    if(res != null) {
                        var setObject = {}
                        switch(direction) {
                            case "up": 
                                setObject = {
                                    "yPos": res["yPos"] - 1
                                }
                                break;
                            case "upleft":
                                setObject = {
                                    "yPos": res["yPos"] - 1,
                                    "xPos": res["xPos"] - 1
                                } 
                                break;
                            case "upright": 
                                setObject = {
                                    "yPos": res["yPos"] - 1,
                                    "xPos": res["xPos"] + 1
                                }
                                break;
                            case "left": 
                                setObject = {
                                    "xPos": res["xPos"] - 1
                                }
                                break;
                            case "down": 
                                setObject = {
                                    "yPos": res["yPos"] + 1
                                }
                                break;
                            case "downleft": 
                                setObject = {
                                    "yPos": res["yPos"] + 1,
                                    "xPos": res["xPos"] - 1
                                }
                                break;
                            case "downright":
                                setObject = {
                                    "yPos": res["yPos"] + 1,
                                    "xPos": res["xPos"] + 1
                                }
                                break;
                            case "right": 
                                setObject = {
                                    "xPos": res["xPos"] + 1
                                }
                                break;
                        }

                        dbo.collection(collectionOnlinePlayers).updateOne({
                            "name": playerName
                        }, {
                            $set: setObject
                        }, (err, res) => { if(err) throw err; });

                        dbo.collection(collectionOnlinePlayers).find({}, {
                            projection: {
                                
                            }
                        }).toArray((err, res) => {
                            if(err) throw err;
                            Socketio.to(roomName).emit("players", res);
                        });
                    }
                });
            });

            socket.on("disconnect", (socket) => {
                console.log(player_name);
                if(player_name && player_name != "") {
                    dbo.collection(collectionOnlinePlayers).deleteOne({ "name": player_name }, (err, res) => {
                        if(err) throw err;
                        console.log(player_name + " disconnected, deleted from online players");
                    });
                }
            });
        });
    });

Http.listen(3000, () => {
    console.log("Listening at :3000...");
});