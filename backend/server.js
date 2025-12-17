//!Module-ok importálása
const express = require('express'); //?npm install express
const session = require('express-session'); //?npm install express-session
const path = require('path');
const fs = require('fs');

//?2. feladat
fs.writeFileSync(path.join(__dirname, './files/szamok.txt'), '');
for (let i = 0; i < 20; i++) {
    fs.appendFileSync(
        path.join(__dirname, './files/szamok.txt'),
        `${Math.floor(Math.random() * (50 - 1) + 1)},`,
        'utf-8'
    );
}

//!Beállítások
const app = express();
const router = express.Router();

const ip = '127.0.0.1';
const port = 3000;

app.use(express.json()); //?Middleware JSON
app.set('trust proxy', 1); //?Middleware Proxy

//!Session beállítása:
app.use(
    session({
        secret: 'titkos_kulcs', //?Ezt generálni kell a későbbiekben
        resave: false,
        saveUninitialized: true
    })
);

//!Routing
//?Főoldal:
router.get('/', (request, response) => {
    response.sendFile(path.join(__dirname, '../frontend/html/index.html'));
});

//?1. feladat:
router.get('/elsoFeladat', (request, response) => {
    response.sendFile(path.join(__dirname, '../frontend/html/feladat1.html'));
});

//?2. feladat:
router.get('/masodikFeladat', (request, response) => {
    response.sendFile(path.join(__dirname, '../frontend/html/feladat2.html'));
});

//?3. feladat:
router.get('/harmadikFeladat', (request, response) => {
    response.sendFile(path.join(__dirname, '../frontend/html/feladat3.html'));
});

//?4. feladat:
router.get('/negyedikFeladat', (request, response) => {
    response.sendFile(path.join(__dirname, '../frontend/html/feladat4.html'));
});

//?5. feladat:
router.get('/otodikFeladat', (request, response) => {
    response.sendFile(path.join(__dirname, '../frontend/html/feladat5.html'));
});

//!API endpoints
app.use('/', router);
const endpoints = require('./api/api.js');
app.use('/api', endpoints);

//!Szerver futtatása
app.use(express.static(path.join(__dirname, '../frontend'))); //?frontend mappa tartalmának betöltése az oldal működéséhez
app.listen(port, ip, () => {
    console.log(`Szerver elérhetősége: http://${ip}:${port}`);
});

//?Szerver futtatása terminalból: npm run dev
//?Szerver leállítása (MacBook és Windows): Control + C
//?Terminal ablak tartalmának törlése (MacBook): Command + K
