// FRONT END : Mathys
// Ici tu fais ton javascript pour contrôler le changement de skin, thème etc...


var block = document.getElementById("blockTheme")


function chTheme(){
    if (block.hidden === true) block.hidden = false;
    else if (block.hidden === false) block.hidden = true;
}