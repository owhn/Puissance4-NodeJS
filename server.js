//BACK END : Antoine
//Code du serveur, si tu modifies un truc, fais le TRES visible ou dis moi

//Ajout des librairies express, http et socket.io
const express = require("express");
const http = require("http");
const socket = require("socket.io");

const PORT = process.env.PORT || 3000; //3000 si port non imposé mais si imposé, process.env.PORT s'occupe de tout
const app = express(); //Initialisation express
app.use(express.static(__dirname + "/public"));
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

    

});





server.listen(PORT, "localhost",()=>{
    console.log("serv démarré : http://localhost:"+PORT);
});