const { Toolbelt } = require("lp-faas-toolbelt");
const httpClient = Toolbelt.HTTPClient();
const _ = require('lodash');

async function lambda(input, callback) {

    try {
        if (!input || !input.payload || _.isEmpty(input.payload.nameBranch)) {
            console.error('Error: nameBranch está vacío o la entrada no es válida');
            return callback(new Error('Input inválido: nameBranch vacío o falta payload'), null);
        }

        const nameBranch = input.payload.nameBranch;
        const MOCK_API_URL = "https://627303496b04786a09002b27.mockapi.io/mock/sucursales";

        const response = await httpClient(MOCK_API_URL, {
            method: 'GET',
            json: true,
        });

        if (_.isEmpty(response)) {
            console.error('Error: no se obtuvo respuesta de la API o la respuesta está vacía');
            return callback(new Error('No se obtuvo respuesta de la API'), null);
        }

        console.info('Buscando sucursal con nombre:', nameBranch);
        const sucursal = response.find(sucursal => sucursal.nombre === nameBranch);

        if (sucursal) {
            console.info('Sucursal encontrada:', sucursal);
            return callback(null, sucursal.direccion);
        } else {
            console.warn('No se encontró la sucursal con nombre:', nameBranch);
            return callback(new Error('No se encontró la sucursal con el nombre proporcionado'), null);
        }

    } catch (error) {
        console.error('Error al procesar la solicitud:', error.message || error);
        return callback(new Error('Error en el procesamiento de la FaaS'), null);
    }
}
