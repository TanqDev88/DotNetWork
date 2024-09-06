// La FaaS es la función que se ejecuta en el backend de LivePerson y que interactúa con una API externa /mock/sucursales para obtener datos. Veamos cada parte en detalle

const { Toolbelt } = require("lp-faas-toolbelt"); //Esta son utilidades de LiverPerson para hacer solicitudes HTTP
const httpClient = Toolbelt.HTTPClient();
const _ = require('lodash');

async function lambda(input, callback) { //iNPUT recive los datos de entrada enviados desde LP CALLBACK:Que va a devolver los errores
  try {
    // 1. Validación del input
    if (!input || !input.payload || _.isEmpty(input.payload.nameBranch)) { //Verifica q input input.payload E y no este vacio
        console.error('Error: nameBranch está vacío o la entrada no es válida');
        return callback(new Error('Input inválido: nameBranch vacío o falta payload'), null);
    }

    const nameBranch = input.payload.nameBranch;
    const MOCK_API_URL = "https://627303496b04786a09002b27.mockapi.io/mock/sucursales";

    // 2. Hacer solicitud a la API externa
    const response = await httpClient(MOCK_API_URL, {
        method: 'GET',
        json: true,
    });

    // 3. Validar la respuesta de la API
    if (_.isEmpty(response)) {
        console.error('Error: no se obtuvo respuesta de la API o la respuesta está vacía');
        return callback(new Error('No se obtuvo respuesta de la API'), null);
    }

    console.info('Buscando sucursal con nombre:', nameBranch);
    // 4. Buscar la sucursal por nombre
    const sucursal = response.find(sucursal => sucursal.nombre === nameBranch);

    // 5. Manejo de resultado: Sucursal encontrada o no encontrada
    if (sucursal) {
        console.info('Sucursal encontrada:', sucursal);
        return callback(null, sucursal.direccion);
    } else {
        console.warn('No se encontró la sucursal con nombre:', nameBranch);
        return callback(new Error('No se encontró la sucursal con el nombre proporcionado'), null);
    }

  } catch (error) {
    // 6. Manejo de errores generales
    console.error('Error al procesar la solicitud:', error.message || error);
    return callback(new Error('Error en el procesamiento de la FaaS'), null);
  }
}

//configuración de la integración
//conectar tu FaaS con el flujo de conversación del bot.
{"nameBranch":"{$botContext.nameBranch}"}
//Define los datos que se envían a la FaaS desde el flujo de conversación del bot (nameBranch) recogido de la comversacion del chat

//Transform Result Script:
var response = JSON.parse(getBotVar("api_GetBranchDirectionByName_faas").jsonData).api_GetBranchDirectionByName_faas;
set_branchDirectionByName_faas(response);

Procesa la respuesta que la FaaS devuelve y almacena el resultado en una variable que el bot puede usar en el flujo de conversación.

Aquí, getBotVar("api_GetBranchDirectionByName_faas").jsonData obtiene el resultado devuelto por la FaaS, que luego es parseado de JSON a un objeto JavaScript

Finalmente, set_branchDirectionByName_faas(response) guarda la dirección obtenida en la variable branchDirectionByName_faas para que pueda ser utilizada en la conversación.