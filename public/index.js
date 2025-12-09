//BACK END : Antoine
//Je vais mettre ici toutes les fonctions (pour les boutons) que tu lieras au html, on associera le styleClient.js à ce fichier*

let roomID;

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





let pseudo=document.getElementById("txtPseudo");//ajt .value qd créé
let mdp=document.getElementById("txtMdp");//ajt .value qd créé

function connexionCompte(pseudo,mdp){
    // console.log("connexionCompte");
    socket.emit("connexionCompte",{pseudo,mdp});
    
}

function creerCompte(pseudo,mdp){
    // console.log("creerCompte");
    socket.emit("creerCompte",{pseudo,mdp});
   
    connexionCompte(pseudo,mdp);
}

socket.on("erreurBDD",(msg)=>{
    console.log("msgErr");
});

function qPartie(){

}

function qClasse(){

}

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