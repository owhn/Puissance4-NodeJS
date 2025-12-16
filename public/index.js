
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
    joueur.pseudo="Invite "+joueur.localPlayerID.substring(15);
    console.log(joueur.pseudo);
})



//BDD :

function deconnecter(){
    socket.emit("nologin",(joueur.pseudo));
    joueur.pseudo="Invite " + joueur.localPlayerID.substring(15);
    joueur.elo = 0;
    document.getElementById("blockDeconnect").hidden = true
    document.getElementById("blockConnect").hidden = false;
}

socket.on("nologin_ok",()=>{

});

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
    document.getElementById("blockDeconnect").hidden = false;
    document.getElementById("blockConnect").hidden = true;

});

socket.on("dejaConnecte", (data)=>{
    console.log("compte déjà connecté");
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
    document.getElementById("partieG").hidden = true;
    document.getElementById("dansPartie").hidden = false;
    document.getElementById("dansPartieD").hidden = false;
    document.getElementById("blockConnect").hidden = true;
    document.getElementById("blockDeconnect").hidden = true;
    document.getElementById("PARTIE").hidden = false;
    document.getElementById("pseudoP").textContent = joueur.pseudo
    document.getElementById("code").textContent = roomID.substring(4)
    //document.getElementById("InfoJ1").textContent = joueur.pseudo;
});

socket.on("txtpseudo",(data,turn)=>{
    document.getElementById("infoJ1").textContent = data[0]
    document.getElementById("infoJ2").textContent = data[1]
    if (turn === 1) {
        document.getElementById("J1T").hidden = false;
        document.getElementById("J2T").hidden = true;
    }
    else if(turn === 2){
        document.getElementById("J2T").hidden = false;
        document.getElementById("J1T").hidden = true;
    }

})

socket.on("top5",(data)=>{
    document.getElementById("t1").textContent = "1 - "+data[0].pseudo+" : "+data[0].elo;
    document.getElementById("t2").textContent = "2 - "+data[1].pseudo+" : "+data[1].elo;
    document.getElementById("t3").textContent = "3 - "+data[2].pseudo+" : "+data[2].elo;
    document.getElementById("t4").textContent = "4 - "+data[3].pseudo+" : "+data[3].elo;
    document.getElementById("t5").textContent = "5 - "+data[4].pseudo+" : "+data[4].elo;

})

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
    document.getElementById("partieG").hidden = true;
    document.getElementById("dansPartie").hidden = false;
    document.getElementById("dansPartieD").hidden = false;
    document.getElementById("blockConnect").hidden = true;
    document.getElementById("blockDeconnect").hidden = true;
    document.getElementById("PARTIE").hidden = false;
    document.getElementById("pseudoP").textContent = joueur.pseudo
    document.getElementById("code").textContent = roomID.substring(4)
});

let abandonner=0;
function abandon(){
    abandonner+=1;
    document.getElementById("Abandon").style.backgroundColor="green";
    if(abandonner>=2){
        abandonner=0;
        socket.emit("abandon",{pseudo: joueur.pseudo,roomID});
        document.getElementById("Abandon").style.backgroundColor="#ec3c30";
    }
}   

socket.on("abandonAdverse",(data)=>{
    console.log(data + " a abandonné");
});

function reset(){
    socket.emit("reset",(roomID));
    
}

socket.on("resetClient",()=>{
    document.querySelectorAll(".zone-jeton").forEach(div => {
        div.classList.remove("rouge", "jaune", "booba", "kaaris", "gf", "pgf");//ajouter si autres classes
    });
    document.getElementById("reset").style.backgroundColor="#56b6ff";

});

socket.on("aVote",()=>{
    document.getElementById("reset").style.backgroundColor="#e0ba38";
    console.log("quelqu'un a voté pour reset");
});

function creerRoom(){
    socket.emit("creerRoom",{
        pseudo: joueur.pseudo,
        localPlayerID: joueur.localPlayerID                    
    });
}

function trouverRoom(){
    let code="room"+document.getElementById("txtCode").value;
    socket.emit("trouverRoom",{
        pseudo: joueur.pseudo,
        localPlayerID: joueur.localPlayerID,
        roomID: code
    });
}

socket.on("roomPV_ok",(data)=>{
    console.log("room : " + data);
    roomID=data;
});

function quitterPartie(){
    socket.emit("quitterPartie",(roomID));
}

socket.on("quitRoom",()=>{
    console.log("partie quittée");
    document.getElementById("partieG").hidden = 0;
    document.getElementById("dansPartie").hidden = 1;
    document.getElementById("dansPartieD").hidden = 1;
    if(joueur.elo===0) document.getElementById("blockConnect").hidden = 0;
    else document.getElementById("blockDeconnect").hidden = 0;
    document.getElementById("PARTIE").hidden = 1;
    document.getElementById("code").textContent = roomID.substring(4);
});


socket.on("delRoom",()=>{
    console.log("room supprimée");
    document.getElementById("partieG").hidden = 0;
    document.getElementById("dansPartie").hidden = 1;
    document.getElementById("dansPartieD").hidden = 1;
    if(joueur.elo===0) document.getElementById("blockConnect").hidden = 0;
    else document.getElementById("blockDeconnect").hidden = 0;
    document.getElementById("PARTIE").hidden = 1;
    document.getElementById("code").textContent = roomID.substring(4);
});

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
    if(data.player===1) div.classList.add("rouge");
    else div.classList.add("jaune");
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
    reset();
});

socket.on("tourSuivant",(tour)=>{
    turn=tour;
    console.log("tour du joueur : " + turn);
    if (turn === 1) {
        document.getElementById("J1T").hidden = false;
        document.getElementById("J2T").hidden = true;
    }
    else if(turn === 2){
        document.getElementById("J2T").hidden = false;
        document.getElementById("J1T").hidden = true;
    }
});

