import express from 'express';
import pkg from 'body-parser';
import multer from 'multer';
import pg from 'pg';
import { nanoid } from 'nanoid'
import config from './config.js'

const { Pool } = pg;

const app = express();

const port = process.env.PORT || 8000;

const storage = multer.diskStorage({
    destination: function (request, file, callback) {
        callback(null, './uploads/');
    },
    filename: function (request, file, callback) {
        const filename = nanoid();
        const extension = file.mimetype.split('/')[1];
        callback(null, filename + '.' + extension);
    }
});

const upload = multer({ storage: storage });

const { urlencoded, json } = pkg;

const pool = new Pool(config);

app.use(urlencoded({ extended: false }));
app.use(json());

app.use((request, response, next) => {
    response.header('Access-Control-Allow-Origin', 'http://localhost:3000');
    response.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');
    response.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});
app.use(express.static('public'));

app.use('/uploads', express.static('uploads'));


app.get('/', (request, response) => {
    pool.query('SELECT * FROM incidents', (error, results) => {
        if (error) {
            console.error(error);
            response.status(500).json({ error: 'Failed to get incidents' });
        } else {
            response.json(results.rows);
        }
    });
});

app.put('/:id', (request, response) => {
    const id = request.params.id;
    const title = request.body.title;

    pool.query(
        'UPDATE incidents SET title = $1 WHERE id = $2',
        [title, id], (error) => {
            if (error) {
                console.error(error);
                response.status(500).json({ error: 'Failed to edit incident' });
            } else {
                response.status(200).send('Incident updated successfully');
            }
        });
});

app.post('/', upload.single('photo'), (request, response) => {
    const { lat, lon, title } = request.body;

    if (!request.file) {
        response.status(400).json({ error: 'No file uploaded' });
        return;
    }

    const imageTitle = request.file.originalname;
    const imagePath = `http://localhost:8000/${request.file.path}`;
    pool.query(
        'INSERT INTO incidents (id, "imageTitle", "imagePath", title, lat, lon) VALUES ($1, $2, $3, $4, $5, $6)',
        [nanoid(), imageTitle, imagePath, title, lat, lon],
        (error, results) => {
            if (error) {
                console.error(error);
                response.status(500).json({ error: 'Failed to save incident' });
            } else {
                response.json({ message: 'Incident saved successfully' });
            }
        }
    );
});

app.delete('/:id', (request, response) => {
    const id = request.params.id;

    pool.query('DELETE FROM incidents WHERE id = $1', [id], (error) => {
        if (error) {
            console.error(error);
            response.status(500).json({ error: 'Failed to delete incident' });
        } else {
            response.status(200).send('Incident deleted successfully');
        }
    });
});

app.listen(port);
