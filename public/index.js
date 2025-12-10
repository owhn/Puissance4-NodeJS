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





function test(){
    creerCompte();

}
let pseudo,mdp;
function test2(){
    console.log(joueur.pseudo + " " + joueur.elo);
    console.log(joueur.localPlayerID);
}

function connexionCompte(){
    // console.log("connexionCompte");
    // let pseudo=document.getElementById("txtPseudo");//ajt .value qd créé
    // let mdp=document.getElementById("txtMdp");//ajt .value qd créé
    // pseudo="zozo";
    // mdp="cawe";
    socket.emit("connexionCompte",{pseudo,mdp});
}

socket.on("login_ok", (data)=>{
    joueur.pseudo=data.pseudo;
    joueur.elo=data.elo;
    console.log("login ok : "+data.pseudo+ " " + data.elo);
    document.getElementById("x").textContent=joueur.pseudo;

});

function creerCompte(){
    // console.log("creerCompte");
    // let pseudo=document.getElementById("txtPseudo");//ajt .value qd créé
    // let mdp=document.getElementById("txtMdp");//ajt .value qd créé
    pseudo="12";
    mdp="123";
    socket.emit("creerCompte",{pseudo,mdp});    
}

socket.on("register_ok", (data)=>{
    console.log("création de compte OK ! : " +data.pseudo + " " + data.mdp);
    connexionCompte(data.pseudo,data.mdp);
});

socket.on("erreurBDD",(msg)=>{
    console.log(msg);
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