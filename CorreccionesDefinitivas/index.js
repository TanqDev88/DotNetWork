const axios = require('axios'); 
const jwt = require('jsonwebtoken'); 
require('dotenv').config(); 
const KEY_SECRET = process.env.KEY_SECRET; 

/**
 * @param {string} token 
 * @returns {object|null} 
 */
const validateToken = (token) => {
    try {
        return jwt.verify(token, KEY_SECRET); 
    } catch (error) {
        console.error('Ocurrio un error al validar el token:', error); 
        return null; 
    }
};

/**
 * @returns {object} 
 * @throws {Error} 
 */
const fetchExternalApiData = async () => {
    try {
        const response = await axios.get('https://627303496b04786a09002b27.mockapi.io/mock/sucursales');
        return response.data;
    } catch (error) {
        console.error('Error llamando a la API externa:', error); 
        throw new Error('Error al obtener datos de la API externa'); 
    }
};

/**
 * @param {object} req 
 * @param {object} res 
 */

exports.app = async (req, res) => {
    try {
        const token = req.headers['x-token']; 

        if (!token) {
            return res.status(403).send('No se envio el token'); 
        }

        const decodedToken = validateToken(token); 
        if (!decodedToken) {
            return res.status(403).send('Token inválido'); 
        }

        const apiData = await fetchExternalApiData(); 
        res.status(200).json(apiData); 
    } catch (error) {
        console.error('Error en el manejo de la solicitud:', error); 
        res.status(500).send('Error interno del servidor'); 
    }
};

const jwt = require('jsonwebtoken');

const secretKey = 'secretKey';

const payload = {}

const token = jwt.sign(payload, secretKey);

console.log('Generated Token:', token);