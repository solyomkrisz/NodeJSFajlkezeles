const express = require('express');
const router = express.Router();
const database = require('../sql/database.js');
const fs = require('fs');

//!Multer
const multer = require('multer'); //?npm install multer
const path = require('path');

const data = fs.readFileSync(path.join(__dirname, '../files/szamok.txt'), 'utf-8');
const numbers = data
    .split(',')
    .filter((i) => i)
    .map((i) => parseInt(i.trim()));

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

module.exports = router;
