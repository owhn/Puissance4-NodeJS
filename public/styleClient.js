// FRONT END : Mathys
// Ici tu fais ton javascript pour contrôler le changement de skin, thème etc...




var compte = document.getElementById("btnTheme")
var blockdeco = document.getElementById("blockDeconnect")
var blockpartie = document.getElementById("partieG")
var blockmodif = document.getElementById("modifCompte")

function chPseudo(){
    const bgColor = getComputedStyle(compte).backgroundColor;

    if (bgColor === "rgb(86, 182, 255)") { 
        compte.style.backgroundColor = "#ffc31e";
    } else if (bgColor === "rgb(255, 195, 30)") {
        compte.style.backgroundColor = "#56b6ff";
        blockdeco.hidden = true;
        blockpartie.hidden =true;
        blockmodif.hidden = false;
    }
}

function retour(){
    blockdeco.hidden = false;
    blockpartie.hidden =false;
    blockmodif.hidden = true;
}

function chTheme(){
    var theme = document.getElementById("theme")
    if(theme.value)
}


