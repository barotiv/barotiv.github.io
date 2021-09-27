// Get data from server.

/* A getServerData függvény vár egy url-t, ahonnan az adatokat lekéri
    Lekérés: az url-re küldünk egy fetch kérést, előtte fetch kérés
    felparaméterezése: fetchOptions változó létrehozása (objektum) */

function getServerData(url) {
    let fetchOptions = {
        method: "GET",
        mode: "cors",
        cache: "no-cache"
    };
    /* Fetch kérés elindítása a server felé, a kapott url-re küldi a kérést,
        a fetchOptions változóban van megadva, hogy mi történjen.
        Ha megjött a válasz a kérésre AKKOR futtatok valamit (2 függvény),
        a response megkapja a választ a visszatérési értéke response.json, 
        hiba esetén logolás
        Then egy json parse-olt adathalmazzal tér vissza, erre meghívok egy
        másik then-t - KISZERVEZVE - (megkapja a visszatérési értéket - objektum vagy tömb) */

    return fetch(url, fetchOptions).then(
        response => response.json(),
        err => console.error(err)
    );
}

function startGetUsers() {
    // Adatok lekérésének indítása
    getServerData("http://localhost:3000/users").then(
        data => fillDataTable(data, "userTable") /* fillDataTable függvény meghívása
        ki fogja egészíteni ezt a userTable-t a #-tel, és úgy fogja kiválasztani a táblázatot */
    );
}
/*Eseménykezelő hozzáadása: gomb kiválasztása (selector) - eseménykezelő hozzáadása
kattintásra (click) lefut a startGetUsers függvény */
document.querySelector("#getDataBtn").addEventListener("click", startGetUsers);

// Fill table with server data.
/* Megkapja az adatokat és megadjuk, hogy melyik táblázatot kell kitöltenie (ID)
    Első körben táblázat kiválasztása tableID alapján
    `#${tableID}`: selector tringbe a kapott tableID behelyettesítése - #-t én tettem hozzá,
    hogy jelezzem, hogy ID-ről van szó
*/
function fillDataTable(data, tableID) {
    let table = document.querySelector(`#${tableID}`);
    // Hibakezelés
    if (!table) {
        console.error(`Table "${tableID} is not found.`);
        return;
    }
    // Táblázat kitöltése
    let tBody = table.querySelector("tbody");
    // Adatsorok egyesével való kiolvasása a data tömbből
    for (let row of data) {
        // Sorok gyártása
        let tr = createAnyElement("tr");
        // Belső ciklus, bejárja az egyes objektumokat (row), kulcsértékpáronként
        for (let k in row) {
            // Táblázatcellák létrehozása
            let td = createAnyElement("td");
            td.innerHTML = row[k];
            // Cella hozzáadása
            tr.appendChild(td);
        }
        // Gombcsoport hozzáadom a sorokhoz
        let btnGroup = createBtnGroup();
        tr.appendChild(btnGroup);
        // Sor hozzáadása a táblázat tbody-jához
        tBody.appendChild(tr);
    }
}
/* Segédfüggvény elemek készítéséhez (elemek nevei, attributumai)
    A createElementtel létrehozok a megfelelő néven egy elemet, utána 
    az attributumokon végigmegyek egy for in ciklussal, az attributum neve a kulcs,
    az értéke pedig attributes[k], majd az elemet vissza is adom (return) */
function createAnyElement(name, attributes) {
    let element = document.createElement(name);
    for (let k in attributes) {
        element.setAttribute(k, attributes[k]);
    }
    return element;
}
// Segédfüggvény gombcsoport létrehozására 
function createBtnGroup() {
    // Befogadó div elkészítése
    let group = createAnyElement("div", { class: "btn btn-group" });
    // Gomb létrehozása, a kattintás eseményének definiálása (delRow függvény előállítása később)
    // a this-szel tudom átadni a gombot a delRow függvénynek
    let infoBtn = createAnyElement("button", { class: "btn btn-info", onclick: "getInfo(this)" });
    infoBtn.innerHTML = '<i class="fa fa-refresh" aria-hidden="true"></i>'
    let delBtn = createAnyElement("button", { class: "btn btn-danger", onclick: "delRow(this)" });
    delBtn.innerHTML = '<i class="fa fa-trash" aria-hidden="true"></i>'

    // Gombcsoport visszaadása
    group.appendChild(infoBtn);
    group.appendChild(delBtn);

    // Cella létrehozása a gombcsoportnak
    let td = createAnyElement("td");
    td.appendChild(group);
    return td;
}
// Gomb megtalálása: btn < btngroup < td < tr ennek első td-jében van az ID, ami kell a törléshez
function delRow(btn) {
   let tr = btn.parentElement.parentElement.parentElement;
   let id = tr.querySelector("td:first-child").innerHTML;
// Itt már megvan az egyedi azonosítója a törölni kívánt sornak
   let fetchOptions = {
        method: "DELETE",
        mode: "cors",
        cache: "no-cache"
   };
// A fetch az adott url-re küld egy kérést
// az url-t átalakítom template stringre, hogy bele tudjam szúrni az ID-t
// a fetchOptions-ban definiáltam, hogy törölni akarok
// majd (then) kapok a szervertől valamilyen adatot, majd (then) az adatot továbbadom
// de frissítenem is kell a táblázatot, ezért:
// a gombra kattintás függvényt kiszervezem egy külön startGetUsers függvénybe (eddig definiálatlan volt)
   fetch(`http://localhost:3000/users/${id}`, fetchOptions).then(
       resp => resp.json,
       err => console.error(err)
   ).then(
       data => {
            startGetUsers();
       }
   );
}
