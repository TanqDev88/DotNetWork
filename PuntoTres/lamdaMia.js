const { Toolbelt } = require('lp-faas-toolbelt');
const _ = require('lodash');

const API_URL = 'https://627303496b04786a09002b27.mockapi.io/mock/sucursales';
const LOG = Toolbelt.Logger();

async function lambda(input, callback) {
    LOG.info('Inicia la función para obtener la dirección del usuario');

    try {
        const userName = getValidatedUserName(input);

        if (!userName) {
            return handleMissingData(callback);
        }

        const response = await getAddressFromAPI(userName);

        if (response && response.direccion) {
            return handleSuccess(response.direccion, callback);
        } else {
            return handleNotFound(callback);
        }
    } catch (error) {
        LOG.error('Error inesperado en la función', error);
        return handleUnexpectedError(error, callback);
    }
}

function getValidatedUserName(input) {
    const userName = input.payload.USER;

    if (_.isEmpty(userName)) {
        LOG.error('No se encontró el nombre del usuario en los datos de entrada');
        return null;
    }

    return userName;
}

async function getAddressFromAPI(userName) {
    try {
        const httpClient = Toolbelt.HTTPClient();
        const response = await httpClient(API_URL, {
            method: 'GET',
            json: true,
            simple: false,
            resolveWithFullResponse: true
        });

        if (response.statusCode !== 200) {
            LOG.error(`Error en la solicitud a la API: Código de estado ${response.statusCode}`);
            throw new Error('ERROR_INESPERADO');
        }

        const data = response.body;
        return data.find(item => item.nombre.toLowerCase() === userName.toLowerCase());
    } catch (error) {
        LOG.error('Error en la función getAddressFromAPI', error);
        throw new Error('ERROR_INESPERADO');
    }
}

function handleSuccess(address, callback) {
    LOG.info('Dirección encontrada:', address);
    callback(null, {
        statusCode: 200,
        message: 'DIRECCION_OBTENIDA',
        data: address
    });
}


function handleMissingData(callback) {
    LOG.error('Faltan datos: nombre de usuario no proporcionado');
    callback(null, {
        statusCode: 400,
        message: 'FALTAN_DATOS',
        data: null
    });
}

function handleNotFound(callback) {
    LOG.info('No se encontró la dirección del usuario ingresado');
    callback(null, {
        statusCode: 404,
        message: 'DIRECCION_NO_ENCONTRADA',
        data: null
    });
}

function handleUnexpectedError(error, callback) {
    LOG.error('Error inesperado:', error.message);
    callback(null, {
        statusCode: 500,
        message: 'ERROR_INESPERADO',
        data: error.message
    });
}

module.exports = { lambda };