const { Toolbelt } = require("lp-faas-toolbelt");
const httpClient = Toolbelt.HTTPClient();
const _ = require('lodash');

async function lambda(input, callback) {
    const branchName = input.payload.nameBranch;
    const API_URL = "https://627303496b04786a09002b27.mockapi.io/mock/sucursales";

    if (_.isEmpty(branchName)) {
        console.error('Error: branchName está vacío');
        return callback(new Error('No se encontró la sucursal, branchName vacío'), null);
    }

    try {
        const response = await httpClient(API_URL, {
            method: 'GET',
            json: true,
        });

        if (_.isEmpty(response)) {
            console.error('Error: no se obtuvo respuesta de la API');
            return callback(new Error('No se obtuvo respuesta de la API'), null);
        }

        console.info('Buscando sucursal con nombre:', branchName);
        const branchData = _.find(response, { nombre: branchName });

        if (branchData) {
            console.info('Sucursal encontrada:', branchData);
            return callback(null, branchData.direccion);
        } else {
            console.info('No se encontró la sucursal con nombre:', branchName);
            return callback(new Error('No se encontró la sucursal, branchName no se encuentra en MOCKAPI'), null);
        }
    } catch (error) {
        console.error('Error al conectar con la API:', error);
        return callback(new Error('Error al conectar con la API'), null);
    }
}
