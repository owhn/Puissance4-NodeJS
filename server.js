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
    elo: [],
    votes: [],
    turn: 0,
    board: creerTabVide()
}; //rooms[roomID] = {joueurs = [pseudoJ1, pseudoJ2] , ID = [localPlayerIDs]}

const privateRooms = {
    joueurs: [],
    IDs: [],
    votes: [],
    turn: 0,
    board: creerTabVide()
}; 

let rankedQueue = [];// joueur : {socketID, elo}
let queue = [];// socketID

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

function genRoomID() {
    let id;
    do {
        id = "room" + Math.floor(Math.random() * 1000000);
    } while (rooms[id]); // ça boucle tant que l'id existe déjà
    return id;
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

    socket.on("queue",(localPlayerID)=>{
        if(rankedQueue.includes(localPlayerID)){
            rankedQueue = rankedQueue.filter(id => id !== localPlayerID);
        }

        if(queue.includes(localPlayerID)) return;        

        queue.push(localPlayerID);
        console.log("longueur de la queue : "+queue.length+"cm");

        if (queue.length >= 2){
            let roomID = genRoomID();
            io.to(queue.shift()).emit("sendRoom", roomID);
            io.to(queue.shift()).emit("sendRoom", roomID);
        }
    });

    socket.on("joinRoom", (data)=>{
        socket.join(data.roomID);

        if(!rooms[data.roomID]){
            rooms[data.roomID] = {
                joueurs: [],
                IDs: [],
                elo: [],
                votes: [],
                turn: 0,
                board: creerTabVide()
            };
        }
        rooms[data.roomID].joueurs.push(data.pseudo);
        rooms[data.roomID].IDs.push(data.localPlayerID);
        
        //console.log("Room", data.roomID, rooms[data.roomID]);
    });

    socket.on("rankedQueue",(localPlayerID)=>{
        if(queue.includes(localPlayerID)){
            queue = queue.filter(id => id !== localPlayerID);
        }

        if(rankedQueue.includes(localPlayerID)) return;
                
        rankedQueue.push(localPlayerID);
        console.log("longueur de la queue : "+rankedQueue.length+"cm");

        if (rankedQueue.length >= 2){
            let roomID = genRoomID();
            io.to(rankedQueue.shift()).emit("sendRoomRanked", roomID);
            io.to(rankedQueue.shift()).emit("sendRoomRanked", roomID);
        }
    });

    socket.on("joinRoomRanked", (data)=>{
        socket.join(data.roomID);

        if(!rooms[data.roomID]){
            rooms[data.roomID] = {
                joueurs: [],
                IDs: [],
                elo: [],
                votes: [],
                turn: 0,
                board: creerTabVide()
            };
        }
        rooms[data.roomID].joueurs.push(data.pseudo);
        rooms[data.roomID].IDs.push(data.localPlayerID);
        rooms[data.roomID].elo.push(data.elo);
        
        //console.log("Room", data.roomID, rooms[data.roomID]);
    });

    

});



async function Demarrage(){
    await bdd.connexion();
    server.listen(PORT, "localhost",()=>{
        console.log("serv démarré : http://localhost:"+PORT);
    });
};

Demarrage();