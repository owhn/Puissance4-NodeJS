//BACK END : Antoine
//Code du serveur, si tu modifies un truc, fais le TRES visible ou dis moi

//Ajout des librairies express, http et socket.io
const express = require("express");
const http = require("http");
const socket = require("socket.io");
const bdd = require("./bdd.js")
const session = require("express-session");

const PORT = process.env.PORT || 3000; //3000 si port non imposé mais si imposé, process.env.PORT s'occupe de tout
const app = express(); //Initialisation express
app.use(express.static("public"));

// gerer les sessions (coeur de la session)
const sessionMiddleware = session({
    secret: "secret-test",
    resave: false,
    saveUninitialized: true,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24, // 24 heures
        secure:false
    }
});

app.use(sessionMiddleware);




const server = http.createServer(app); //Création serveur http
const io = socket(server); //Initialisation de socket.io


const rooms = {
    joueurs: [],
    IDs: [],
    elo: [],
    votes: [],
    votesNul: [],
    turn: 0,
    board: creerTabVide()
}; //rooms[roomID] = {joueurs = [pseudoJ1, pseudoJ2] , ID = [localPlayerIDs]}R

let rankedQueue = [];// joueur : {socketID, elo,timestamp:Date.now()}
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
        id = "room" + Math.floor(10000 + Math.random() * 90000);
    } while (rooms[id]); // ça boucle tant que l'id existe déjà
    return id;
}

function genRoomIDpv() {
    let id;
    do {
        id = "room" + Math.floor(1000+Math.random() * 9000);
    } while (rooms[id]); // ça boucle tant que l'id existe déjà
    return id;
}

io.use((socket, next) => {
    sessionMiddleware(socket.request, {}, next);
});

io.on("connection", (socket) => {
    const session = socket.request.session;

    // session.joueur = {
    //     pseudo,
    //     elo
    // }

    if (session.joueur) {
        socket.emit("login_ok", session.joueur);
    }
    else{
        session.joueur = {
            pseudo: "Invite "+socket.id.substring(15),
            elo: 0
        }
        console.log("nouvelle connexion : ", session.joueur.pseudo);
        
        socket.emit("setJoueur",{
            pseudo: session.pseudo,
            elo: session.elo
        });
    }

    

    if (!session.views) {
        session.views = 1;
    } else {
        session.views++;
    }

    socket.emit("views", session.views);
    
    session.save();

    


    socket.on("disconnect", () => {
        queue = queue.filter(id => id !== socket.id); //enlever le joueur des queues
        rankedQueue = rankedQueue.filter(rQ => rQ.socketID !== socket.id);
        let roomID=socket.roomID;
        if(rooms[roomID]) {
            io.to(roomID).emit("delRoom");
            delete rooms[roomID];
            console.log("room " + roomID + " supprimée");
        }
    });

    socket.on("nologin",()=>{
        delete session.joueur;
        session.joueur = {
            pseudo: "Invite "+socket.id.substring(15),
            elo: 0
        }
        socket.emit("nologin_ok",{
            pseudo: session.joueur.pseudo,
            elo: session.joueur.elo
        });
        queue = queue.filter(pseudo => pseudo !== socket.id);
        rankedQueue = rankedQueue.filter(rQ => rQ.socket.id !== socket.id);
    });


    socket.on("connexionCompte", async (data)=>{
        console.log("connexionCompte p/m : " +data.pseudo + " " + data.mdp);
        try {
            const result = await bdd.loginUser(data.pseudo,data.mdp);
            if(!result.ok){
                socket.emit("erreurBDD", "login pas ok");
            }
            else if (result.ok){
                const elo = await bdd.getElo(data.pseudo);

                session.joueur={
                    pseudo: data.pseudo,
                    elo: elo
                }
                session.save();

                socket.emit("login_ok", (session.joueur));
                console.log("login_ok : ", session.joueur.pseudo);
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
            socket.emit("erreurBDD", e);
        }
    });

    socket.on("queue",()=>{
        if(rankedQueue.includes(socket.id)){
            rankedQueue = rankedQueue.filter(rQ => rQ.socketID !== socket.id);
        }

        if(queue.includes(socket.id)) return;        

        queue.push(socket.id);
        console.log("longueur de la queue : " + queue.length);

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
        rooms[data.roomID].IDs.push(socket.id);
        let tour=Math.floor(Math.random() * 2) + 1;
        rooms[data.roomID].turn = tour;
        
        //console.log("Room", data.roomID, rooms[data.roomID]);
        io.to(data.roomID).emit("txtpseudo",(rooms[data.roomID].joueurs),(rooms[data.roomID].turn))

        socket.roomID=data.roomID;
    });

    socket.on("rankedQueue",(data)=>{
        if(rankedQueue.includes(data.localPlayerID)){
            rankedQueue = rankedQueue.filter(id => id !== data.localPlayerID);
        }

        if(rankedQueue.includes(data.localPlayerID)) return;
                
        rankedQueue.push({
            socketID: data.localPlayerID,
            elo: data.elo,
            timeJoined: Date.now()
        });
        console.log("longueur de la rankedQueue : "+rankedQueue.length+"cm");
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
        rooms[data.roomID].IDs.push(socket.id);
        rooms[data.roomID].elo.push(data.elo);
        let tour=Math.floor(Math.random() * 2) + 1;
        rooms[data.roomID].turn = tour;     
        socket.roomID=data.roomID;
        //console.log("Room", data.roomID, rooms[data.roomID]);
    });

    socket.on("quitterPartie",(roomID)=>{
        let room = rooms[roomID];
        if(socket.id===room.IDs[0]){
            socket.emit("quitRoom");
            socket.to(room.IDs[1]).emit("delRoom");
        }
        else {
            socket.to(room.IDs[0]).emit("quitRoom");
            socket.emit("delRoom");
        }
        
        delete rooms[roomID];
    });

    socket.on("creerRoom",(data)=>{
        let roomID = genRoomIDpv();//generer un code à 4 chiffres
        socket.join(roomID);

        rooms[roomID] = {
            joueurs: [],
            IDs: [],
            elo: [],
            votes: [],
            turn: 0,
            board: creerTabVide()
        }
        rooms[roomID].joueurs.push(data.pseudo);
        rooms[roomID].IDs.push(socket.id);
        let tour=Math.floor(Math.random() * 2) + 1;
        rooms[roomID].turn = tour;
        
        socket.roomID=roomID;
        socket.emit("roomPV_ok",(roomID));

        console.log("room privée créée : "+ roomID);
    }); 

    socket.on("trouverRoom",(data)=>{
        if(!rooms[data.roomID]) return;
        socket.join(data.roomID);
        rooms[data.roomID].joueurs.push(data.pseudo);
        rooms[data.roomID].IDs.push(data.localPlayerID);
        socket.emit("roomPV_ok",(data.roomID));
        console.log("room privée rejointe : "+ data.roomID + " ID : " + data.localPlayerID);
        socket.roomID=data.roomID;
        
        console.log(rooms[data.roomID]);
    });

    socket.on("choix",(data)=>{
        let room=rooms[data.roomID];
        let col=data.col;
        let charCol = ['A','B','C','D','E','F','G'];
        
        if(!room) return;

        //récuperer l'index du joueur : 1 = j1 ou 2 = j2 et vérifier si il est dans la room
        let playerIndex= room.IDs.indexOf(socket.id);
        if(playerIndex === -1) return;
        let playerNumber= playerIndex+1;

        //si c'est pas son tour return
        if(room.turn !== playerNumber) return;

        let tab=room.board;
        if(tab[0][col]!==0){
            socket.emit("colPleine", charCol[col]);
            return;
        }

        for(let i = 5; i >=0;i--){
            if(tab[i][col]===0){
                tab[i][col]=playerNumber;
                io.to(data.roomID).emit("placement", {
                    ligne: i+1,
                    col: charCol[col],
                    player: playerNumber
                });
                break;
            }
        }

        // vérifier la victoire
        if(checkWin(tab,playerNumber)){
            io.to(data.roomID).emit("victoire",{
                gagnant: playerNumber,
                pseudo: room.joueurs[playerNumber-1]
            });
            room.turn=1;
            return;
        }

        //vérifier si match nul
        const siNul = tab.every(row => row.every(cell => cell !==0));
        if (siNul){
            io.to(data.roomID).emit("nul");
            room.board = creerTabVide();
            room.turn=1;
            return;
        }

        // passer le tour au joueur suivant
        if(room.turn===1) room.turn=2;
        else room.turn=1;
        io.to(data.roomID).emit("tourSuivant", (room.turn));
    });

    socket.on("abandon",(data)=>{
        console.log(data.pseudo + " a abandonné");
        room=rooms[data.roomID];
        let index=room.joueurs.indexOf(data.pseudo);
        
        if (index === -1) {
            console.log("joueur introuvable dans la room");
            return;
        }
        
        if (room.joueurs.length < 2) {
            console.log("pas d'adversaire");
            return;
        }

        let adversaire=room.IDs[index===0 ? 1 : 0];
        socket.to(adversaire).emit("abandonAdverse",(data.pseudo));
    });

    socket.on("reset",(roomID)=>{
        let room=rooms[roomID];
        if(!room) return;
        room.votes.push(socket.id);

        io.to(roomID).emit("aVote");

        if(room.votes[room.votes.length-1]!==room.votes[0]){
            io.to(roomID).emit("resetClient");
            room.votes=[];
            room.board=creerTabVide();
            room.turn=Math.floor(Math.random() * 2) + 1;
            io.to(roomID).emit("tourSuivant", (room.turn));

        }
    });
});

function checkWin(tab, joueur) {
    const ROWS = 6;
    const COLS = 7;

    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {

            if (tab[r][c] !== joueur) continue;

            // Horizontal →
            if (c + 3 < COLS &&
                tab[r][c + 1] === joueur &&
                tab[r][c + 2] === joueur &&
                tab[r][c + 3] === joueur) {
                return true;
            }

            // Vertical ↓
            if (r + 3 < ROWS &&
                tab[r + 1][c] === joueur &&
                tab[r + 2][c] === joueur &&
                tab[r + 3][c] === joueur) {
                return true;
            }

            // Diagonale ↘
            if (r + 3 < ROWS && c + 3 < COLS &&
                tab[r + 1][c + 1] === joueur &&
                tab[r + 2][c + 2] === joueur &&
                tab[r + 3][c + 3] === joueur) {
                return true;
            }

            // Diagonale ↗
            if (r - 3 >= 0 && c + 3 < COLS &&
                tab[r - 1][c + 1] === joueur &&
                tab[r - 2][c + 2] === joueur &&
                tab[r - 3][c + 3] === joueur) {
                return true;
            }
        }
    }
    return false;
}

function matchmakingRanked(){
    if (rankedQueue.length < 2) return;

    rankedQueue.sort((a, b) => a.elo - b.elo);

    for (let i = 0; i < rankedQueue.length - 1; i++) {
        let j1=rankedQueue[i];
        let j2=rankedQueue[i+1];

        //temps d'attente en sec
        tempsAttendu1=(Date.now() - j1.timeJoined) / 1000;
        tempsAttendu2=(Date.now() - j2.timeJoined) / 1000;

        //range de matchmaking de base : 50
        let range1=50+(tempsAttendu1/2);
        let range2=50+(tempsAttendu2/2);
        
        if ((j2.elo-j1.elo) <= range1 && (j2.elo-j1.elo) <= range2){
            let roomID = genRoomID();

            io.to(j1.socketID).emit("sendRoomRanked", roomID);
            io.to(j2.socketID).emit("sendRoomRanked", roomID);

            rankedQueue.splice(i,2);
            
            i--;
        }
    }
}

async function classement(){
    const result = await bdd.top();
    io.emit("top5", result);
}

setInterval(matchmakingRanked, 1000);
setInterval(classement,1000)

async function Demarrage(){
    await bdd.connexion();
    server.listen(PORT, "localhost",()=>{
        console.log("serv démarré : http://localhost:"+PORT);
    });
};

Demarrage();