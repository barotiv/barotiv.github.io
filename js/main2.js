// Keys of users. - a táblázat helyes sorrendű kitöltése miatt adom hozzá
let keys = ["id", "name", "email"];

// Get data from server.
function getServerData(url) {
    let fetchOptions = {
        method: "GET",
        mode: "cors",
        cache: "no-cache"
    };

    return fetch(url, fetchOptions).then(
        response => response.json(),
        err => console.error(err)
    );
}

function startGetUsers() {
    getServerData("http://localhost:3000/users").then(
        data => fillDataTable(data, "userTable")
    );
}
document.querySelector("#getDataBtn").addEventListener("click", startGetUsers);

// Fill table with server data.
function fillDataTable(data, tableID) {
    let table = document.querySelector(`#${tableID}`);
    if (!table) {
        console.error(`Table "${tableID} is not found.`);
        return;
    }

// Add new user row to the table. (91. sortól hozzuk létre) - VÁLTOZOTT MAIN-hez képest
let tBody = table.querySelector("tbody"); 
tBody.innerHTML = ''; // Táblázat kiűrítése, hogy ne duplikálódjanak a sorok
let newRow = newUserRow(); 
tBody.appendChild(newRow); // Table változtatása tBody-ra + sorrend változás
    
    for (let row of data) { // a ciklus a sorokon megy végig, 
                            // sorról sorra kiolvassa az adatokat a data tömbből,
                            // az adazok belekerülnek a row változóba
        let tr = createAnyElement("tr"); // létrehozok egy új tr elemet, 
                                         // ebbe kerülnek majd be a cellák (ez egy táblázatsor)
        for (let k of keys/* in row */) { // kulcs és cikluscsere
                                          // belső for ciklus, végimegyek a kulcsokon  
                                          // kulcsok előre elő vannak készítve
                                          // meg van adva, hogy milyen kulcsokkal tesszük be az adatokat a cellákba 
            let td = createAnyElement("td"); // létrehozok egy új cellát 
                let input = createAnyElement("input", { // létrehozok egy új input elemet
                    class: "form-control",              // megadom az attribútumait
                    value: row[k], // row = objektum, k = kulcs (pl.: name)
                    name: k
                });
            if (k == "id") {  // az ID esetében maradunk a fix értéknél, hogy ne lehessen átírni
                              // ha a k az id  
                input.setAttribute("readonly", true); // akkor beállítom az inputot readonly-ra 
            // Kétszeres leírás helyett kiszervezzük az input meghatározást    
                /* td.innerHTML = row[k];  */// Update-nél kell az ID ezért változtatunk
             /*    let input = createAnyElement("input", {
                    class: "form-control",
                    value: row[k],
                    readonly: true
                }); */
            /* }  else {        // td.innerHTML = row[k]; nem módosíthatók az értékek, cseréljük input-ra
                let input = createAnyElement("input", {
                    class: "form-control",
                    value: row[k]
                });  */
            }
            td.appendChild(input); // Input mezők lesznek a cellában, nem értékek
                                   // Az inputot hozzáadom a konkrét cellához 
            tr.appendChild(td);    // A cellát hozzáadom a táblázat sorhoz
        }

    let btnGroup = createBtnGroup(); // létrehozok egy gombcsoportot, eltárolom a btnGroup változóba
        tr.appendChild(btnGroup);    // az adott sorhoz hozzáadom a gombcsoportot 
        tBody.appendChild(tr);       // a tábla body-jához hozzáadom a teljes sort
    }
}

function createAnyElement(name, attributes) {
    let element = document.createElement(name);
    for (let k in attributes) {
        element.setAttribute(k, attributes[k]);
    }
    return element;
}

function createBtnGroup() {
    let group = createAnyElement("div", { class: "btn btn-group" });
    let infoBtn = createAnyElement("button", { class: "btn btn-info", onclick: "setRow(this)" });
    infoBtn.innerHTML = '<i class="fa fa-refresh" aria-hidden="true"></i>'
    let delBtn = createAnyElement("button", { class: "btn btn-danger", onclick: "delRow(this)" });
    delBtn.innerHTML = '<i class="fa fa-trash" aria-hidden="true"></i>'

    group.appendChild(infoBtn);
    group.appendChild(delBtn);

    let td = createAnyElement("td");
    td.appendChild(group);
    return td;
}
// DELETE users.
function delRow(btn) { 
    let tr = btn.parentElement.parentElement.parentElement;
    let id = tr.querySelector("td:first-child").innerHTML;

    let fetchOptions = {
        method: "DELETE",
        mode: "cors",
        cache: "no-cache" 
    };

    fetch(`http://localhost:3000/users/${id}`, fetchOptions).then(
        resp => resp.json,
        err => console.error(err)
    ).then(
        data => {
            startGetUsers();
        }
    );
}
// CREATE new users.
function newUserRow(row) {
    let tr = createAnyElement("tr");
    for (let k /* in */of keys/* {id: '', name: '', email: ''} */) { // kulcs és ciklus csere
        let td = createAnyElement("td");
        let input = createAnyElement("input", {
            class: "form-control",
            name: k
        } );
        td.appendChild(input);
        tr.appendChild(td);
    }
// Új gomb létrehozása és hozzáadása
    let newBtn = createAnyElement("button", {
        class: "btn btn-success",
        onclick: "createUser(this)"
    });
    newBtn.innerHTML = '<i class="fa fa-plus-circle" aria-hidden="true"></i>';
    let td = createAnyElement("td");
    td.appendChild(newBtn);
    tr.appendChild(td);

    return tr;
}
// Össze kell porszívózni az adatokat az inputokból
function createUser(btn) {
    let tr = btn.parentElement.parentElement;
    let data = getRowData(tr);
// Kiütöm az ID módosíthatóságát    
    delete data.id;
// Adatok elküldése a szervernek
    let fetchOptions = {
        method: "POST",
        mode: "cors",
        cache: "no-cache",
        headers: {
            'Content-Type': 'application/json' // Ez jelzi, hogy a fogadó félnek Parse-olni kell az adatokat
        },
        body: JSON.stringify(data)
    };

    fetch(`http://localhost:3000/users`, fetchOptions).then(    // Kapott válasz feldolgozása
        resp => resp.json(),  // a választ json-nel parse-oljuk
        err => console.error(err)
    ).then( // Visszatérő json-re is meghívom a then-t
            // data => console.log(data) // Kapott adatot vagy logolom, 
            data => startGetUsers()     // vagy meghívom a táblázatfrissítő startGetUser-t           
    );

// console.log(data);
}

function getRowData(tr) {
    let inputs = tr.querySelectorAll("input.form-control");
    let data ={};
    for(let i=0; i<inputs.length; i++) {
        data[inputs[i].name] = inputs[i].value;
    } 
    return data;  
}
// Set data.
function setRow(btn) {
    let tr = btn.parentElement.parentElement.parentElement;
    let data = getRowData(tr)
    let fetchOptions = {
        method: "PUT",
        mode: "cors",
        cache: "no-cache",
        headers: {
            'Content-Type': 'application/json'
         }, // Ez jelzi, hogy a fogadó félnek Parse-olni kell az adatokat
        body: JSON.stringify(data)
    };

    fetch(`http://localhost:3000/users/${data.id}`, fetchOptions).then( // Kapott válasz feldolgozása
        resp => resp.json(),  // a választ json-nel parse-oljuk
        err => console.error(err)
    ).then( // Visszatérő json-re is meghívom a then-t
            // data => console.log(data) // Kapott adatot vagy logolom, 
            data => startGetUsers()     // vagy meghívom a táblázatfrissítő startGetUser-t           
    );
}
        /* console.log(data);
} */

