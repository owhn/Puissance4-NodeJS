
//BACK END : Antoine
//Je vais mettre ici toutes les fonctions (pour les boutons) que tu lieras au html, on associera le styleClient.js à ce fichier*


let roomID,turn;
let pseudo,mdp;

const joueur = {
    PlayerID: "",
    pseudo: "",
    elo: 0
};

//appel de la route pour initialiser la session
fetch("/init-session");

const socket = io();



socket.on("guest", () => {
    joueur.pseudo = "Invite " + socket.id.substring(7, 12);
    joueur.elo = 0;
    console.log("mode invité :", joueur.pseudo);
});


//BDD :

socket.on("refresh", (elo)=>{
    joueur.elo=elo;
    document.getElementById("txtElo").textContent=joueur.elo+"🏆";
});

function deconnecter(){
    socket.emit("nologin",(joueur.pseudo));
    joueur.elo=0;
    document.getElementById("blockDeconnect").hidden = true
    document.getElementById("blockConnect").hidden = false;
}

socket.on("nologin_ok",(data)=>{
    joueur.pseudo=data.pseudo;
    joueur.elo=data.elo;
    console.log(data.pseudo)
    console.log(data.elo)

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
    document.getElementById("txtElo").textContent=joueur.elo+"🏆";
    if(joueur.pseudo.substring(0,6)==="Invite") return;
    document.getElementById("blockDeconnect").hidden = false;
    document.getElementById("blockConnect").hidden = true;
    document.getElementById("modifCompte").hidden = true;
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
    joueur.pseudo=data.pseudo;
    connexionCompte();
});

socket.on("chCompte_ok",(data)=>{
    socket.emit("connexionCompte",{pseudo: data.pseudo,mdp: data.mdp});
});

socket.on("erreurBDD",(msg)=>{
    console.log(msg);
});


//Matchmaking :

function qPartie(){
    socket.emit("queue",(joueur.pseudo));
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
});

let jj1,jj2;

socket.on("txtpseudo",(data,turn)=>{
    jj1 = data[0];
    jj2 = data[1];
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
    selectTheme();

})

function majPseudo(){

}

let th;

function selectTheme() {
    const theme = document.getElementById("theme").value;
    
    document.body.classList.remove("theme-spider", "theme-bk");
    document.body.classList.add("theme-" + theme);
    document.body.classList.add(joueur.pseudo === jj1 ? "jj1" : "jj2");

    let cases = document.querySelectorAll("#plateau div");
    for (let c of cases) {

        if (theme === "spider") {
    
            if (c.classList.contains("kaaris") ) {
                c.classList.remove("kaaris");
                c.classList.add("rouge");
            }
    
            if (c.classList.contains("booba")) {
                c.classList.remove("booba", );
                c.classList.add("jaune");
            }
        }
    
        if (theme === "bk") {
    
            if (c.classList.contains("rouge")) {
                c.classList.remove("rouge");
                c.classList.add("kaaris");
            }
    
            if (c.classList.contains("jaune") ) {
                c.classList.remove("jaune");
                c.classList.add("booba");
            }
        }
    

    }
    
    console.log("test jj1 :"+jj1)
    console.log("test joueur.pseudo : "+ joueur.pseudo)
    th = theme
}

socket.on("top5",(data)=>{
    document.getElementById("t1").textContent = "1 - "+data[0].pseudo+" : "+data[0].elo;
    document.getElementById("t2").textContent = "2 - "+data[1].pseudo+" : "+data[1].elo;
    document.getElementById("t3").textContent = "3 - "+data[2].pseudo+" : "+data[2].elo;
    document.getElementById("t4").textContent = "4 - "+data[3].pseudo+" : "+data[3].elo;
    document.getElementById("t5").textContent = "5 - "+data[4].pseudo+" : "+data[4].elo;
})



function chCompte(){
    let apseudo = document.getElementById("txtPseudoM").value;
    let amdp = document.getElementById("txtMdpM").value;
    let npseudo = document.getElementById("newPseudo").value;
    let nmdp = document.getElementById("newMdp").value;


    socket.emit("modiff",{apseudo:apseudo,amdp:amdp,npseudo:npseudo,nmdp:nmdp})

    document.getElementById("partieG").hidden = false;

}

function qClasse(){
    if(joueur.elo>0) socket.emit("rankedQueue",(joueur.pseudo));
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
    document.getElementById("quitPartie").hidden = true;
    document.getElementById("dansPartie").style.height = "90px";
});

let abandonner=0;
function abandon(){
    abandonner+=1;
    document.getElementById("Abandon").style.backgroundColor="green";
    document.getElementById("ab").textContent = "Sur ? "
    if(abandonner>=2){
        abandonner=0;
        socket.emit("abandon",{pseudo: joueur.pseudo,roomID});
        document.getElementById("Abandon").style.backgroundColor="#ec3c30";
        document.getElementById("ab").textContent = "Abandonner";
    }
}



socket.on("abandonAdverse",(data)=>{
    console.log(data.perdant + " a abandonné");
    document.getElementById("blockVictoire").hidden=false;
    if(joueur.pseudo===data.gagnant){
        document.getElementById("victoire").textContent = data.perdant + " a abandonné";
    }
    else {
        document.getElementById("victoire").textContent = "vous avez abandonné";
    }
    document.getElementById("quitPartie").hidden=false;
    document.getElementById("dansPartie").style.height = "140px";
});

function reset(){
    socket.emit("reset",(roomID));
}

socket.on("resetClient",()=>{
    document.querySelectorAll(".zone-jeton").forEach(div => {
        div.classList.remove("rouge", "jaune", "booba", "kaaris");//ajouter si autres classes
    });
    document.getElementById("reset").style.backgroundColor="#56b6ff";

});

function resetClient(){
    document.querySelectorAll(".zone-jeton").forEach(div => {
        div.classList.remove("rouge", "jaune", "booba", "kaaris");//ajouter si autres classes
    });
    document.getElementById("reset").style.backgroundColor="#56b6ff";
}

socket.on("creset",data=>{
    compte.style.backgroundColor = "#21fc33";

})

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
        roomID: code
    });
}

socket.on("roomPV_ok",(data)=>{
    console.log("room : " + data);
    roomID=data;
    document.getElementById("partieG").hidden = true;
    document.getElementById("dansPartie").hidden = false;
    document.getElementById("code").textContent = roomID.substring(4)
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
});

function quitterPartie(){
    socket.emit("quitterPartie",(roomID));
    resetClient();
}

socket.on("quitRoom",(data)=>{
    console.log("partie quittée");

    if (data && typeof data.elo === "number") {
        joueur.elo = data.elo;
        document.getElementById("txtElo").textContent = joueur.elo+"🏆";
    }
    
    document.getElementById("blockVictoire").hidden = true;
    document.getElementById("partieG").hidden = 0;
    document.getElementById("dansPartie").hidden = 1;
    document.getElementById("dansPartieD").hidden = 1;
    if(joueur.elo===0) document.getElementById("blockConnect").hidden = 0;
    else document.getElementById("blockDeconnect").hidden = 0;
    document.getElementById("PARTIE").hidden = 1;
    document.body.classList.remove("theme-spider", "theme-bk", "theme-gf");
    document.getElementById("code").textContent = roomID.substring(4);
    joueur.elo=data.elo;
    document.getElementById("txtElo").textContent=joueur.elo+"🏆";
    resetClient();
});


socket.on("delRoom",(data)=>{
    console.log("room supprimée");

    if (data && typeof data.elo === "number") {
        joueur.elo = data.elo;
        document.getElementById("txtElo").textContent = joueur.elo+"🏆";
    }

    document.getElementById("blockVictoire").hidden = true;
    document.getElementById("partieG").hidden = 0;
    document.getElementById("dansPartie").hidden = 1;
    document.getElementById("dansPartieD").hidden = 1;
    if(joueur.elo===0) document.getElementById("blockConnect").hidden = 0;
    else document.getElementById("blockDeconnect").hidden = 0;
    document.getElementById("PARTIE").hidden = 1;
    document.body.classList.remove("theme-spider", "theme-bk", "theme-gf");
    document.getElementById("code").textContent = roomID.substring(4);
    joueur.elo=data.elo;
    document.getElementById("txtElo").textContent=joueur.elo+"🏆";
    resetClient();
});

//fonctions du jeu en soi
function colChoix(col){
    socket.emit("choix", {
        col,
        roomID,
        localPlayerID: joueur.localPlayerID
    });
}

socket.on("views",(views)=>{
    console.log("views", views);
})

socket.on("placement",(data)=>{
    let idPos="";
    idPos=data.col+data.ligne;
    let div=document.getElementById(idPos);
    if(data.player===1){
        if(th === "spider") div.classList.add("rouge");
        if(th === "bk") div.classList.add("kaaris");
    }
    else{
        if(th === "spider") div.classList.add("jaune");
        if(th === "bk") div.classList.add("booba");
    } 
});

socket.on("colPleine",(colonnePleine)=>{
    console.log("colonne pleine : " + colonnePleine);
    //afficher l'info
});

socket.on("victoire",(data)=>{
    console.log("gagnant : " + data.pseudo);
    document.getElementById("blockVictoire").hidden = false;
    document.getElementById("victoire").textContent = "Le gagnant est : " + data.pseudo
    document.getElementById("quitPartie").hidden = false;
    document.getElementById("dansPartie").style.height = "150px";
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

