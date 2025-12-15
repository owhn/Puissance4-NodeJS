//BACK END : Antoine
//Je vais mettre ici toutes les fonctions (pour les boutons) que tu lieras au html, on associera le styleClient.js à ce fichier*

let roomID,turn;
let pseudo,mdp;

const joueur = {
    localPlayerID: "",
    pseudo: "",
    elo: 0
};


const socket = io();
socket.on('connect', (data) => {
    socket.emit("newClient",(data));
});

socket.on("setLocalPlayerID",(data)=>{
    joueur.localPlayerID=data;
    console.log("localPlayerID : " + joueur.localPlayerID);
    joueur.pseudo="Invité("+joueur.localPlayerID.substring(15)+")";
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
    connexionCompte();
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
    console.log("sendRoom : " + roomID);
    socket.emit("joinRoom", {
        roomID,
        pseudo : joueur.pseudo,
        localPlayerID : joueur.localPlayerID
    });
});

function qClasse(){
    if(joueur.elo>0) socket.emit("rankedQueue",{localPlayerID: joueur.localPlayerID, elo: joueur.elo});
    else {
        document.getElementById("btnRanked").textContent="Se connecter pour jouer en ranked";
    }
}

socket.on("sendRoomRanked", (data) => {
    roomID=data;
    console.log("sendRoomRanked : " + roomID);
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

 //ajt .value qd créé
function joinRoom(){
    let code=document.getElementById("txtCode").value;
}


//fonctions du jeu en soi
function colChoix(col){
    socket.emit("choix", {
        col,
        roomID,
        localPlayerID: joueur.localPlayerID
    });
}

socket.on("placement",(data)=>{
    let idPos="";
    idPos=data.col+data.ligne;
    let div=document.getElementById(idPos);
    styleClient.skinJoueur(div);    
});

socket.on("colPleine",(colonnePleine)=>{
    console.log("colonne pleine : " + colonnePleine);
    //afficher l'info
});

socket.on("victoire",(data)=>{
    console.log("gagnant : " + data.pseudo + " numJoueur :" + data.gagnant);
    //clear le client ? ou proposer un rematch ? 

});

socket.on("nul",()=>{
    console.log("Match nul");
    //clear le client
});

socket.on("tourSuivant",(tour)=>{
    turn=tour;
    console.log("tour du joueur : " + turn);
});