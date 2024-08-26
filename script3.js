/**
 *  CHANGELOG
 *
 *  22/08/2024 - https://app.clickup.com/t/86b0239dq
 *   - Se modifica la AC para filtrar por género, obtener los primeros 3 resultados,
 *     mostrar un menú con los nombres y mostrar detalles al seleccionar uno.
 */

/**
 *  Esta AC recibe un género y busca los primeros 3 resultados correspondientes en una API pública.
 *  Luego muestra un menú con los nombres obtenidos y al seleccionar uno, muestra nombre, país y dirección.
 *
 *        - Variables de entrada:
 *          - GENERO = Género recibido por parte del usuario.
 *          - SELECCION_NOMBRE = Nombre seleccionado por el usuario del menú.
 *
 *        - Variables de salida de ÉXITO:
 *             - GET_DETAILS_RESULT = DETAILS_OBTAINED
 *             - NOMBRE = Nombre seleccionado.
 *             - PAIS = País correspondiente al nombre seleccionado.
 *             - DIRECCION = Dirección correspondiente al nombre seleccionado.
 *
 *        - Variables de salida de ERROR:
 *             - GET_DETAILS_RESULT = ERROR_INESPERADO
 *             - GET_DETAILS_RESULT = FALTAN_DATOS
 *
 */

/*------------------------------------------------------------
        NOMBRES DE VARIABLES DE ENTRADA
------------------------------------------------------------*/
const GENERO_VAR_NAME = 'genero'; // Entrada de género por parte del usuario
const SELECCION_NOMBRE_VAR_NAME = 'seleccion_nombre'; // Nombre seleccionado por el usuario del menú
const sessionId = context.message.CUSTOMER_ID;
const userId = Number(context.userData.PLATFORM_CONTACT_ID);

/*------------------------------------------------------------
        NOMBRES DE VARIABLES DE SALIDA
------------------------------------------------------------*/
const GET_DETAILS_RESULT_VAR_NAME = 'GET_DETAILS_RESULT';
const NOMBRE_VAR_NAME = 'NOMBRE';
const PAIS_VAR_NAME = 'PAIS';
const DIRECCION_VAR_NAME = 'DIRECCION';

/*------------------------------------------------------------
        VALORES DE VARIABLES DE SALIDA DE ÉXITO
------------------------------------------------------------*/
const DETAILS_OBTAINED_VAR_VALUE = 'DETAILS_OBTAINED';

/*------------------------------------------------------------
        VALORES DE VARIABLES DE SALIDA DE ERROR
------------------------------------------------------------*/
const ERROR_INESPERADO_VAR_VALUE = 'ERROR_INESPERADO';
const FALTAN_DATOS_VAR_VALUE = 'FALTAN_DATOS';

/*------------------------------------------------------------
                        URL DE LA API
------------------------------------------------------------*/
const URL = 'https://627303496b04786a09002b27.mockapi.io/mock/sucursales';

/*------------------------------------------------------------
                        IMPORTS Y LOGGING
------------------------------------------------------------*/
const LOG = require('helper_logging_gcp');
const L = LOG.core({
    botName: 'demobleett',
    actionCode: 'get_user_details',
    debugEnabled: true,
});
const _ = require('lodash'); // Asegúrate de que lodash está disponible
const fetch = require('node-fetch'); // Asegúrate de que node-fetch está disponible

/*------------------------------------------------------------
                        MAIN
------------------------------------------------------------*/
const main = async () => {
    try {
        bmconsole.log(`Inicio del proceso`);
        const genero = verifyGeneroInput();
        const resultados = await getResultsByGenero(genero);
        await mostrarMenuDeNombres(resultados);
    } catch (error) {
        L.error(error);
        chequearTipoDeError(error);
    }
};

/*------------------------------------------------------------
                FUNCIONES DE SERVICIO
------------------------------------------------------------*/

/**
 * Función que realiza la consulta a la API filtrando por género y obtiene los primeros 3 resultados.
 * @param {string} genero
 * @returns {Array} Lista de los primeros 3 resultados.
 */
const getResultsByGenero = async (genero) => {
    try {
        const response = await fetch(`${URL}?genero=${genero}`);

        if (!response.ok) {
            const respText = await response.text();
            L.error(respText);
            throwInternalErrorWithCustomLog(ERROR_INESPERADO_VAR_VALUE, 'Error al hacer la solicitud a la API pública', respText);
        }

        const data = await response.json();
        const resultados = data.slice(0, 3); // Obtener los primeros 3 resultados

        if (_.isEmpty(resultados)) {
            throwInternalErrorWithCustomLog(ERROR_INESPERADO_VAR_VALUE, 'No se encontraron resultados para el género dado', { genero });
        }

        return resultados;
    } catch (error) {
        bmconsole.log(error);
        L.error('Error en función "getResultsByGenero"', {
            status: error.statusCode,
            message: error.message,
        });
        throw error;
    }
};

/**
 * Función que muestra un menú con los nombres de los resultados obtenidos y espera la selección del usuario.
 * @param {Array} resultados
 */
const mostrarMenuDeNombres = async (resultados) => {
    try {
        const opciones = resultados.map((item) => item.nombre);

        // Mostrar el menú al usuario
        result.set({
            type: 'quick_replies',
            options: opciones,
            text: 'Por favor, selecciona un nombre de la lista:',
        });

        // Esperar a que el usuario seleccione una opción
        const seleccionNombre = await esperarSeleccionDelUsuario();

        const detalleSeleccionado = resultados.find((item) => item.nombre === seleccionNombre);

        if (!detalleSeleccionado) {
            throwInternalErrorWithCustomLog(ERROR_INESPERADO_VAR_VALUE, 'La selección del usuario no coincide con los resultados obtenidos', {
                seleccionNombre,
            });
        }

        mostrarDetallesSeleccionados(detalleSeleccionado);
    } catch (error) {
        L.error('Error en función "mostrarMenuDeNombres"', {
            status: error.statusCode,
            message: error.message,
        });
        throw error;
    }
};

/**
 * Función que espera la selección del usuario del menú presentado.
 * @returns {Promise<string>} Nombre seleccionado por el usuario.
 */
const esperarSeleccionDelUsuario = () => {
    return new Promise((resolve, reject) => {
        // Escuchar la respuesta del usuario
        context.on('message', (message) => {
            const seleccion = message.text;
            if (_.isEmpty(seleccion)) {
                reject(new Error(FALTAN_DATOS_VAR_VALUE));
            } else {
                user.set(SELECCION_NOMBRE_VAR_NAME, seleccion);
                resolve(seleccion);
            }
        });
    });
};

/**
 * Función que muestra los detalles del elemento seleccionado y finaliza con éxito.
 * @param {Object} detalle
 */
const mostrarDetallesSeleccionados = (detalle) => {
    const { nombre, pais, direccion } = detalle;

    result.text(`Detalles del seleccionado:\n\n` + `*Nombre:* ${nombre}\n` + `*País:* ${pais}\n` + `*Dirección:* ${direccion}`);

    user.set(NOMBRE_VAR_NAME, nombre);
    user.set(PAIS_VAR_NAME, pais);
    user.set(DIRECCION_VAR_NAME, direccion);

    finalizarConExito(DETAILS_OBTAINED_VAR_VALUE, 'Se obtuvieron los detalles correctamente');
};

/*------------------------------------------------------------
                    FUNCIONES DE UTILIDAD
------------------------------------------------------------*/

/**
 * Verifica que el género ingresado por el usuario sea válido.
 * @returns {string} Género validado.
 */
const verifyGeneroInput = () => {
    const genero = user.get(GENERO_VAR_NAME);

    if (_.isEmpty(genero)) {
        throwInternalErrorWithCustomLog(FALTAN_DATOS_VAR_VALUE, 'Falta el género', { genero });
    }
    return genero.toLowerCase();
};

/**
 * Lanza un error interno con un log personalizado.
 * @param {string} errorMsg
 * @param {string} logValue
 * @param {Object} extraPayload
 */
const throwInternalErrorWithCustomLog = (errorMsg, logValue, extraPayload) => {
    L.error(logValue, extraPayload);
    throw new Error(errorMsg);
};

/**
 * Verifica el tipo de error y finaliza el proceso con el mensaje adecuado.
 * @param {Error} error
 */
const chequearTipoDeError = (error) => {
    let botValue = ERROR_INESPERADO_VAR_VALUE;
    let logValue = 'Error inesperado.';

    if (error.message === FALTAN_DATOS_VAR_VALUE) {
        botValue = FALTAN_DATOS_VAR_VALUE;
        logValue = 'Faltan datos de entrada.';
    }

    finalizarConError(botValue, `${botValue} | ${logValue}`, error);
};

/**
 * Finaliza el proceso con un error.
 * @param {string} botValue
 */
const finalizarConError = (botValue) => {
    user.set(GET_DETAILS_RESULT_VAR_NAME, botValue);
    result.done();
};

/**
 * Finaliza el proceso con éxito.
 * @param {string} botValue
 * @param {string} logValue
 */
const finalizarConExito = (botValue, logValue) => {
    L.info(`${botValue} | ${logValue}`);
    user.set(GET_DETAILS_RESULT_VAR_NAME, botValue);
    result.done();
};

/*------------------------------------------------------------
                        EJECUCIÓN
------------------------------------------------------------*/
main().catch((error) => finalizarConError(ERROR_INESPERADO_VAR_VALUE, error.message || ERROR_INESPERADO_VAR_VALUE, error));
