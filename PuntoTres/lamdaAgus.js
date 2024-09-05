const { Toolbelt } = require("lp-faas-toolbelt");
const _ = require('lodash');

async function lambda(input, callback) {
    const nameBranch = input.payload.nameBranch;
    const API_URL = "https://627303496b04786a09002b27.mockapi.io/mock/sucursales";

    if (!nameBranch) {
        console.error('Error: nameBranch está vacío');
        return callback({ statusCode: 400, message: 'No se encontró selección, nameBranch vacío' }, null);
    }

    const httpClient = Toolbelt.HTTPClient();

    httpClient(API_URL, {
        method: 'GET',
        json: true,
        simple: false,
        resolveWithFullResponse: true
    })
    .then(response => {
        const { statusCode, body } = response;
        const data = body;

        if (statusCode === 200) {
            console.info('Buscando sucursal con nombre:', nameBranch);
            
            if (_.isArray(data) && !_.isEmpty(data)) {
                const filteredData = _.filter(data, item => item.nombre === nameBranch);

                if (!_.isEmpty(filteredData)) {
                    console.info('Sucursal encontrada:', filteredData[0]);
                    return callback(null, { statusCode: 200, response: filteredData[0].direccion });
                } else {
                    console.info('No se encontró la sucursal con nombre:', nameBranch);
                    return callback({ statusCode: 404, message: 'No se encontró la sucursal' }, null);
                }
            } else {
                console.error('No se obtuvo respuesta de la API');
                return callback({ statusCode: 500, message: 'No se obtuvo respuesta' }, null);
            }
        } else {
            return callback(new Error(`Código de estado inesperado: ${statusCode}`), null);
        }
    })
    .catch(err => {
        console.error('Error al conectar', err.message);
        return callback({ statusCode: 500, Error: err.message }, null);
    });
}


// en intgrations ingresa:
// getDirectionFaas

Function Payload:

{
	"nameBranch": "{$botContext.nameBranch}"
}

Trasform Result Script:

var response = JSON.parse(getBotVar("api_getDirectionFaas").jsonData).api_getDirectionFaas;
set_branchInfo(response);