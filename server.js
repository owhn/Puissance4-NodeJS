//BACK END : Antoine
//Code du serveur, si tu modifies un truc, fais le TRES visible ou dis moi

//Ajout des librairies express, http et socket.io
const express = require("express");
const http = require("http");
const socket = require("socket.io");
const bdd = require("./bdd.js")

const PORT = process.env.PORT || 3000; //3000 si port non imposé mais si imposé, process.env.PORT s'occupe de tout
const app = express(); //Initialisation express
app.use(express.static("public"));

const server = http.createServer(app); //Création serveur http
const io = socket(server); //Initialisation de socket.io

const rooms = {
    joueurs: [],
    IDs: [],
    votes: [],
    turn: 0,
    board: creerTabVide()
}; //rooms[roomID] = {joueurs = [socketID(j1), socketID(j2)] , ID = [IDs dans bdd]}

const privateRooms = {
    joueurs: [],
    IDs: [],
    votes: [],
    turn: 0,
    board: creerTabVide()
}; 

const rankedQueue = [];// joueur : {socketID, elo}
const queue = [];// socketID

function creerTabVide(){
    return [
        [0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0]
        ];
}




io.on("connection", (socket) => {
    console.log("client connecté " + socket.id);

    socket.on("newClient",(data)=>{
        socket.emit("setLocalPlayerID",(socket.id));    
    });

    socket.on("connexionCompte", async (data)=>{
        console.log("connexionCompte p/m : " +data.pseudo + " " + data.mdp);
        try {
            const result = await bdd.loginUser(data.pseudo,data.mdp);
            console.log("after bdd.loginUser");
            if(!result.ok){
                socket.emit("erreurBDD", "login pas ok");
            }
            else if (result.ok){
                const elo = await bdd.getElo(data.pseudo);
                socket.emit("login_ok", {pseudo : data.pseudo, elo});
                console.log("login_ok");
            }
        }catch(e){
            socket.emit("erreurBDD", e);
        }
    });
    
    socket.on("creerCompte", async (data)=>{
        console.log("creerCompte pseudo : " + data.pseudo + " mdp : " + data.mdp);
        try {
            await bdd.createUser(data.pseudo, data.mdp);
            socket.emit("register_ok", {pseudo : data.pseudo, mdp : data.mdp});
            console.log("register_ok");
        } catch (e) {
            console.log("catch creerCompte");
            socket.emit("erreurBDD", e);
        }
    });

    socket.on("queue",(data)=>{



    });




    

});



async function Demarrage(){
    await bdd.connexion();
    server.listen(PORT, "localhost",()=>{
        console.log("serv démarré : http://localhost:"+PORT);
    });
};

Demarrage();