const { Toolbelt } = require("lp-faas-toolbelt");
const httpClient = Toolbelt.HTTPClient();
const _ = require('lodash');

async function lambda(input, callback) {

    const nameBranch = input.payload.nameBranch;
    const MOCK_API_URL = "https://627303496b04786a09002b27.mockapi.io/mock/sucursales";

    try {
        const response = await httpClient(MOCK_API_URL, {
            method: 'GET',
            json: true,
        });

        if (_.isEmpty(nameBranch)) {
            console.error('Error: nameBranch está vacío');
            return callback(new Error('No se encontró Sucursal, nameBranch vacío'), null);
        }

        if (!_.isEmpty(response)) {
            console.info('Buscando sucursal con nombre:', nameBranch);
            const sucursal = response.filter(function(sucursal) {
                return sucursal.nombre === nameBranch;
            });
            
            if (!_.isEmpty(sucursal)) {
                console.info('Sucursal encontrada:', sucursal[0]);
                return callback(null, sucursal[0].direccion);
            } else {
                console.info('No se encontró la sucursal con nombre:', nameBranch);
                return callback(new Error('No se encontró la sucursal, nameBranch no se encuentra en MOCKAPI'), null);
            }
        } else {
            console.error('Error: no se obtuvo respuesta de la API');
            return callback(new Error('No se obtuvo respuesta'), null);
        }
    } catch (error) {
        console.error('Error al conectar', error);
        return callback(error, null);
    }
}