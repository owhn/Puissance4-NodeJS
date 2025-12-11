//BACK END : Antoine
//Je vais mettre ici toutes les fonctions (pour les boutons) que tu lieras au html, on associera le styleClient.js à ce fichier*

let roomID;
let pseudo,mdp;

const joueur = {
    localPlayerID: "",
    pseudo: "",
    elo: 500
};



const socket = io();
socket.on('connect', (data) => {
    socket.emit("newClient",(data));
});

socket.on("setLocalPlayerID",(data)=>{
    joueur.localPlayerID=data;
    console.log("localPlayerID : " + joueur.localPlayerID);
    joueur.pseudo="Guest("+joueur.localPlayerID.substring(15)+")";
    console.log(joueur.pseudo);
})



//BDD :

function connexionCompte(){
    // console.log("connexionCompte");
    pseudo=document.getElementById("txtPseudo").value;//ajt .value qd créé
    mdp=document.getElementById("txtMdp").value;//ajt .value qd créé
    // pseudo="zozo";
    // mdp="cawe";
    socket.emit("connexionCompte",{pseudo,mdp});
}

socket.on("login_ok", (data)=>{
    joueur.pseudo=data.pseudo;
    joueur.elo=data.elo;
    console.log("login ok : "+data.pseudo+ " " + data.elo);
    document.getElementById("pseudo").textContent=joueur.pseudo;

});

function creerCompte(){
    // console.log("creerCompte");
     pseudo=document.getElementById("txtPseudo").value;//ajt .value qd créé
     mdp=document.getElementById("txtMdp").value;//ajt .value qd créé
    // pseudo="12";
    // mdp="123";
    socket.emit("creerCompte",{pseudo,mdp});    
}

socket.on("register_ok", (data)=>{
    console.log("création de compte OK ! : " +data.pseudo + " " + data.mdp);
    connexionCompte(data.pseudo,data.mdp);
});

socket.on("erreurBDD",(msg)=>{
    console.log(msg);
});


//Matchmaking :

function qPartie(){
    socket.emit("queue",(joueur.localPlayerID));
}

socket.on("sendRoom", (data) => {
    roomID=data;
    console.log("sendRoom : "+roomID);
    socket.emit("joinRoom", {
        roomID,
        pseudo : joueur.pseudo,
        localPlayerID : joueur.localPlayerID
    });
});

function qClasse(){
    socket.emit("rankedQueue",(joueur.localPlayerID));

}

socket.on("sendRoomRanked", (data) => {
    roomID=data;
    console.log("sendRoom : "+roomID);
    socket.emit("joinRoomRanked", {
        roomID,
        pseudo : joueur.pseudo,
        localPlayerID : joueur.localPlayerID,
        elo : joueur.elo
    });
});

function abandon(){

}

function reset(){

}

let code=document.getElementById("txtCode"); //ajt .value qd créé
function joinRoom(code){

}



function colChoix(col,pos){
    socket.emit("choix", tabColonnes[col]);
}