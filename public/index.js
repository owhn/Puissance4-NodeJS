//BACK END : Antoine
//Je vais mettre ici toutes les fonctions (pour les boutons) que tu lieras au html, on associera le styleClient.js à ce fichier*

const socket = io();
socket.on('connect', () => {
    console.log('Connecté au serveur Socket.io !');
});


function colChoix(col,pos){
    let tabColonnes=['A','B','C','D','E','F','G'];
    socket.emit("choix", tabColonnes[col]);
}