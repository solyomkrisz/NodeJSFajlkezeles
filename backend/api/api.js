const express = require('express');
const router = express.Router();
const database = require('../sql/database.js');
const fs = require('fs');

//!Multer
const multer = require('multer'); //?npm install multer
const path = require('path');

//?2. feladat:
const data = fs.readFileSync(path.join(__dirname, '../files/szamok.txt'), 'utf-8');
const numbers = data
    .split(',')
    .filter((i) => i)
    .map((i) => parseInt(i.trim()));

//?3. feladat:
let rawJSON = fs.readFileSync(path.join(__dirname, '../files/statisztika.json'), 'utf-8');
const { telepules: statistics } = JSON.parse(rawJSON);

//?4. feladat:
rawJSON = fs.readFileSync(path.join(__dirname, '../files/barlangok.json'), 'utf-8');
const caves = JSON.parse(rawJSON);

//?5. feladat:
rawJSON = fs.readFileSync(path.join(__dirname, '../files/elemek.json'), 'utf-8');
const { felfedez: elements } = JSON.parse(rawJSON);
const ismeretlen = elements.filter((i) => !Number(i.felfedezve));

//?6. feladat:
rawJSON = fs.readFileSync(path.join(__dirname, '../files/orszagok.json'), 'utf-8');
const { orszagok: countries } = JSON.parse(rawJSON);

const storage = multer.diskStorage({
    destination: (request, file, callback) => {
        callback(null, path.join(__dirname, '../uploads'));
    },
    filename: (request, file, callback) => {
        callback(null, Date.now() + '-' + file.originalname); //?egyedi név: dátum - file eredeti neve
    }
});

const upload = multer({ storage });

//!Endpoints:
//?GET /api/test
router.get('/test', (request, response) => {
    response.status(200).json({
        message: 'Ez a végpont működik.'
    });
});

//?GET /api/testsql
router.get('/testsql', async (request, response) => {
    try {
        const selectall = await database.selectall();
        response.status(200).json({
            message: 'Ez a végpont működik.',
            results: selectall
        });
    } catch (error) {
        response.status(500).json({
            message: 'Ez a végpont nem működik.'
        });
    }
});

//?1. feladat
router.get('/readfile', async (request, response) => {
    try {
        const data = await fs.promises.readFile(
            path.join(__dirname, '../files/adatok.txt'),
            'utf-8'
        );
        response.status(200).json({ text: data });
    } catch (error) {
        response.statusMessage = error;
        response.status(500).end();
    }
});

//?2. feladat
router.get('/beolvasas', async (request, response) => {
    try {
        response.status(200).json({ result: numbers });
    } catch (error) {
        response.statusMessage = error;
        response.status(500).end();
    }
});

router.get('/osszeg', async (request, response) => {
    try {
        let sum = 0;
        numbers.forEach((i) => (sum += i));
        response.status(200).json({ result: sum });
    } catch (error) {
        response.statusMessage = error;
        response.status(500).end();
    }
});

router.get('/szorzat', async (request, response) => {
    try {
        response.status(200).json({ result: numbers[0] * numbers[numbers.length - 1] });
    } catch (error) {
        response.statusMessage = error;
        response.status(500).end();
    }
});

router.get('/atlag', async (request, response) => {
    try {
        let sum = 0;
        numbers.forEach((i) => (sum += i));
        response.status(200).json({ result: sum / numbers.length });
    } catch (error) {
        response.statusMessage = error;
        response.status(500).end();
    }
});

router.get('/min', async (request, response) => {
    try {
        let min = numbers[0];
        numbers.forEach((i) => i < min && (min = i));
        response.status(200).json({ result: min });
    } catch (error) {
        response.statusMessage = error;
        response.status(500).end();
    }
});

router.get('/max', async (request, response) => {
    try {
        let max = numbers[0];
        numbers.forEach((i) => i > max && (max = i));
        response.status(200).json({ result: max });
    } catch (error) {
        response.statusMessage = error;
        response.status(500).end();
    }
});

router.get('/rendezett', async (request, response) => {
    try {
        let sorted = [...numbers];

        for (let i = 0; i < sorted.length - 1; i++) {
            let min_i = i;
            for (let j = i + 1; j < sorted.length; j++) {
                sorted[j] < sorted[min_i] && (min_i = j);
            }

            if (i === min_i) continue;

            sorted[i] = sorted[i] + sorted[min_i];
            sorted[min_i] = sorted[i] - sorted[min_i];
            sorted[i] = sorted[i] - sorted[min_i];
        }

        response.status(200).json({ result: sorted });
    } catch (error) {
        response.statusMessage = error;
        response.status(500).end();
    }
});

//?3. feladat:
router.get('/getallstat', (request, response) => {
    response.status(200).json({ result: statistics });
});

router.get('/getstat/:telepaz', (request, response) => {
    const telepaz = request.params.telepaz;

    let j = 0;
    while (j < statistics.length && statistics[j].telepaz != telepaz) j++;

    if (j < statistics.length) {
        return response.status(200).json({ result: statistics[j] });
    } else {
        return response.status(200).json({ errorMsg: 'Nem található ilyen település azonosító!' });
    }
});

//?4. feladat
router.get('/barlangok', (request, response) => {
    response.status(200).json({ success: true, result: caves });
});

router.get('/barlang/:azon', (request, response) => {
    const id = request.params.azon;

    let j = 0;
    while (j < caves.length && caves[j].azon != id) j++;

    if (j < caves.length) {
        response.status(200).json({ result: caves[j], success: true });
    } else {
        response.status(200).json({ success: false });
    }
});

router.get('/stat', (request, response) => {
    let leghossz = null;
    let legmely = null;
    let fokozottanVedettDb = 0;

    for (const cave of caves) {
        if (!leghossz || Number(leghossz.hossz) < Number(cave.hossz)) {
            leghossz = cave;
        }

        if (!legmely || Number(legmely.melyseg) < Number(cave.melyseg)) {
            legmely = cave;
        }

        if (cave.vedettseg === 'fokozottan védett') {
            fokozottanVedettDb++;
        }
    }

    response.json({
        success: true,
        result: {
            leghosszabb: `${leghossz.nev}`,
            legmelyebb: `${legmely.melyseg}`,
            barlangokSzama: `${caves.length}`,
            fokozottanVedett: `${fokozottanVedettDb}`
        }
    });
});

//?5. feladat:
router.get('/getallelem', (request, response) => {
    response.status(200).json({
        success: true,
        result: elements
    });
});

router.get('/ismeretlen', (request, response) => {
    response.status(200).json({ success: true, result: ismeretlen });
});

router.get('/getelem/:elemneve', (request, response) => {
    const elemneve = request.params.elemneve;
    let j = 0;
    while (j < elements.length && elements[j].elemneve != elemneve) j++;
    if (j < elements.length) {
        response.status(200).json({
            success: true,
            result: elements[j]
        });
    } else {
        response.status(200).json({ success: false });
    }
});

//?6. feladat:
// 1.
router.get('/miafovarosa/:orszag', (request, response) => {
    const orszag = request.params.orszag;
    let j = 0;
    while (j < countries.length && countries[j].orszag != orszag) j++;
    if (j < countries.length) {
        response.status(200).json({
            success: true,
            result: countries[j].fovaros
        });
    } else {
        response.status(200).json({ success: false });
    }
});

// 2.
router.get('/melyikorszagfovarosa/:fovaros', (request, response) => {
    const fovaros = request.params.fovaros;
    let j = 0;
    while (j < countries.length && countries[j].fovaros != fovaros) j++;
    if (j < countries.length) {
        response.status(200).json({
            success: true,
            result: countries[j].orszag
        });
    } else {
        response.status(200).json({ success: false });
    }
});

// 3.
router.get('/melyikorszagautojele/:jel', (request, response) => {
    const { jel } = request.params;
    let j = 0;
    while (j < countries.length && countries[j].autojel != jel) j++;
    if (j < countries.length) {
        response.status(200).json({ success: true, result: countries[j].orszag });
    } else {
        response.status(200).json({ success: false });
    }
});

// 4.
router.get('/melyikorszagpenzenekjele/:jel', (request, response) => {
    const { jel } = request.params;
    let j = 0;
    while (j < countries.length && countries[j].penzjel != jel) j++;
    if (j < countries.length) {
        response.status(200).json({ success: true, result: countries[j].orszag });
    } else {
        response.status(200).json({ success: false });
    }
});

// 5.
router.get('/hanyanlaknakmaltan', (request, response) => {
    let j = 0;
    while (j < countries.length && countries[j].orszag != 'MÁLTA') j++;
    if (j < countries.length) {
        response.status(200).json({ success: true, result: countries[j].nepesseg });
    } else {
        response.status(200).json({ success: false });
    }
});

// 6.
router.get('/mennyijapannepsurusege', (request, response) => {
    let j = 0;
    while (j < countries.length && countries[j].orszag != 'JAPÁN') j++;
    if (j < countries.length) {
        response
            .status(200)
            .json({ success: true, result: (countries[j].nepesseg / countries[j].terulet) * 1000 });
    } else {
        response.status(200).json({ success: false });
    }
});

// 7.
router.get('/hanylakosanvanafoldnek', (request, response) => {
    let c = 0;
    for (const country of countries) {
        c += Number(country.nepesseg);
    }
    response.status(200).json({ success: true, result: c });
});

// 8.
router.get('/orszagokteruleteosszesen', (request, response) => {
    let c = 0;
    for (const country of countries) {
        c += Number(country.terulet);
    }
    response.status(200).json({ success: true, result: c });
});

// 9.
router.get('/orszagokatlagosnepessege', (request, response) => {
    let osszesNepesseg = 0;
    for (const country of countries) {
        osszesNepesseg += Number(country.nepesseg);
    }
    response.status(200).json({ success: true, result: osszesNepesseg / countries.length });
});

// 10.
router.get('/orszagokatlagosterulete', (request, response) => {
    let osszesTerulet = 0;
    for (const country of countries) {
        osszesTerulet += Number(country.terulet);
    }
    response.status(200).json({ success: true, result: osszesTerulet / countries.length });
});

module.exports = router;
