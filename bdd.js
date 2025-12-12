//BACK END : Antoine
//Connexions à la BDD etc...

const mysql = require("mysql2/promise");

let bdd;

async function connexion() {
    if (bdd) return;
    bdd = await mysql.createConnection({
        host: "10.187.52.4",
        //host: "localhost",
        user: "brissauda",
        password: "brissauda",
        database: "brissauda_b"
    });
    console.log("BDD connectée");
}

async function createUser(pseudo, mdp) {
    const user = await getUser(pseudo);
    if (user) throw { code: "ERR_joueurExistant" };
    
    const [res] = await bdd.execute("INSERT INTO p4_joueurs (pseudo, password) VALUES (?, ?)", 
    [pseudo, mdp]);
    await bdd.execute("INSERT INTO p4_elo (id_joueur) VALUES (?)", [res.insertId]);
}

async function getUser(pseudo) {
    const [rows] = await bdd.execute("SELECT * FROM p4_joueurs WHERE pseudo = ?", 
    [pseudo]);
    return rows[0];
}

async function loginUser(pseudo, mdp) {
    const user = await getUser(pseudo);
    if (!user) throw { ok: false, msg: "Pseudo inconnu" };
    if (user.password !== mdp) throw { ok: false, msg: "Mot de passe incorrect" };
    return { ok: true, user :user };
}

async function getElo(pseudo){
    const [rows]=await bdd.execute("SELECT elo FROM p4_elo JOIN p4_joueurs ON p4_joueurs.id=p4_elo.id_joueur WHERE p4_joueurs.pseudo=?",
    [pseudo]);
    if (!rows[0]) throw {code : "ERR echec getElo"};
    return rows[0].elo;
}

async function updateElo(pseudo, newElo){
    const [rows]=await bdd.execute("UPDATE p4_elo SET elo=? WHERE pseudo=?",
    [newElo,pseudo]);
    return rows[0].elo;
}

module.exports = {
    connexion,
    createUser,
    loginUser,
    getElo,
    updateElo
};
