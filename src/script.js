/**
 *  CHANGELOG
 * 
 *  22/08/2024 - https://app.clickup.com/t/86b0239dq
 *   - Se crea la AC para el ejercicio "Flujo dinámico con Acción de código".
 */

/**
 *  Esta AC recibe un nombre de usuario y busca la dirección correspondiente en una API pública.
 *
 *        - Variables de entrada:
 *          - NOMBRE = Nombre recibido por parte del usuario.
 *
 *          - Variables de salida de EXITO:
 *               1. Se obtiene exitosamente la dirección:
 *                  - GET_ADDRESS_RESULT = ADDRESS_OBTAINED
 *                  - DIRECCION = La dirección obtenida del servicio.
 *
 *
 *          - Variables de salida de ERROR:
 *             1. Se produjo un error inesperado en el código:
 *                - GET_ADDRESS_RESULT = ERROR_INESPERADO
 *
 *             2. Faltan datos de entrada:
 *                - GET_ADDRESS_RESULT = FALTAN_DATOS
 *
 */

/* 
 * Definición de Variables de Entrada y Salida:
 * - `NOMBRE_VAR_NAME`: Variable de entrada que contiene el nombre del usuario.
 * - `GET_ADDRESS_RESULT_VAR_NAME` y `DIRECCION_VAR_NAME`: Variables de salida que almacenan el resultado de la consulta y la dirección obtenida.
 */
const NOMBRE_VAR_NAME = "nombre"; 
const sessionId = context.message.CUSTOMER_ID;
const userId = Number(context.userData.PLATFORM_CONTACT_ID);

/* 
 * Nombres de Variables de Salida:
 * - `GET_ADDRESS_RESULT_VAR_NAME` y `DIRECCION_VAR_NAME`: Variables de salida que almacenan el resultado de la consulta y la dirección obtenida.
 */
const GET_ADDRESS_RESULT_VAR_NAME = "GET_ADDRESS_RESULT";
const DIRECCION_VAR_NAME = "DIRECCION";

/* 
 * Valores de las Variables de Salida:
 * - `ADDRESS_OBTAINED_VAR_VALUE`: Indica que la dirección fue obtenida exitosamente.
 */
const ADDRESS_OBTAINED_VAR_VALUE = "ADDRESS_OBTAINED";

/* 
 * Valores de las Variables de Salida de Error:
 * - `ERROR_INESPERADO_VAR_VALUE` y `FALTAN_DATOS_VAR_VALUE`: Valores de error que se utilizan si ocurre un problema inesperado o si faltan datos de entrada.
 */
const ERROR_INESPERADO_VAR_VALUE = "ERROR_INESPERADO";
const FALTAN_DATOS_VAR_VALUE = "FALTAN_DATOS";

/* 
 * Servicio:
 * - `URL`: La URL de la API pública utilizada para obtener la dirección.
 */
const URL = "https://627303496b04786a09002b27.mockapi.io/mock/sucursales";

/* 
 * Función Principal (`main`):
 * - Verifica que se haya proporcionado un nombre (`verifyEntryData`).
 * - Realiza la solicitud a la API para obtener la dirección correspondiente al nombre (`getAddress`).
 * - Si la dirección se obtiene exitosamente, se guarda en `DIRECCION_VAR_NAME` y se finaliza con éxito.
 * - Si ocurre un error, se maneja y se loguea apropiadamente.
 */
const LOG = require("helper_logging_gcp");
const L = LOG.core({
  botName: "demobleett",
  actionCode: "get_user_address",
  debugEnabled: true,
});

const main = async () => {
  try {
    bmconsole.log(`Init`);
    const nombre = verifyEntryData();
    const response = await getAddress(nombre);
    const { direccion } = response;
    
    if (_.isEmpty(direccion)) throwInternalErrorWithCustomLog(ERROR_INESPERADO_VAR_VALUE, "No se obtuvo la dirección del servicio", direccion);

    result.text(`La dirección correspondiente a ese nombre es: ${direccion}`);

    user.set(DIRECCION_VAR_NAME, direccion);

    finalizarConExito(ADDRESS_OBTAINED_VAR_VALUE, "Se obtuvo la dirección del usuario");
  } catch (error) {
    L.error(error);
    chequearTipoDeError(error);
  }
};

/* 
 * Función `getAddress`:
 * - Realiza la llamada a la API usando `fetch`.
 * - Filtra la respuesta para encontrar el ítem correspondiente al nombre dado.
 * - Si no encuentra un resultado o si la solicitud falla, arroja un error.
 */
const getAddress = async (nombre) => {
  try {
    const response = await fetch(`${URL}?nombre=${nombre}`);
    
    if (!response.ok) {
      const respText = await response.text();
      L.error(respText);
      throwInternalErrorWithCustomLog(ERROR_INESPERADO_VAR_VALUE, 'Error al hacer la solicitud a la API pública:', respText);
    }

    const data = await response.json();
    const filteredItem = data.find(item => item.nombre.toLowerCase() === nombre.toLowerCase());

    if (!filteredItem) throwInternalErrorWithCustomLog(ERROR_INESPERADO_VAR_VALUE, "No se encontró un resultado para el nombre dado", { nombre });

    return { direccion: filteredItem.direccion };
  } catch (error) {
    bmconsole.log(error);
    L.error('Error en función "getAddress"', {
      status: error.statusCode,
      message: error.message,
    });

    throw error;
  }
};

/* 
 * Utilidades:
 * - `verifyEntryData`: Verifica que el nombre no esté vacío.
 * - `throwInternalErrorWithCustomLog`: Función auxiliar para lanzar errores personalizados con logs.
 * - `chequearTipoDeError`: Determina el tipo de error y finaliza el proceso con el mensaje de error correspondiente.
 * - `finalizarConError` y `finalizarConExito`: Establecen las variables de salida y loguean el resultado final.
 */
const verifyEntryData = () => {
  const nombre = user.get(NOMBRE_VAR_NAME);

  if (_.isEmpty(nombre)) {
    throwInternalErrorWithCustomLog(FALTAN_DATOS_VAR_VALUE, "Falta el nombre", { nombre });
  }
  return nombre;
};

const throwInternalErrorWithCustomLog = (errorMsg, logValue, extraPayload) => {
  L.error(logValue, extraPayload);
  throw new Error(errorMsg);
};

const chequearTipoDeError = (error) => {
  let botValue = ERROR_INESPERADO_VAR_VALUE;
  let logValue = "Error inesperado.";

  if (error.message === FALTAN_DATOS_VAR_VALUE) {
    botValue = FALTAN_DATOS_VAR_VALUE;
    logValue = "Faltan datos de entrada.";
  }
  finalizarConError(botValue, `${botValue} | ${logValue}`, error);
};

const finalizarConError = (botValue) => {
  user.set(GET_ADDRESS_RESULT_VAR_NAME, botValue);
};

const finalizarConExito = (botValue, logValue) => {
  L.info(`${botValue} | ${logValue}`);
  user.set(GET_ADDRESS_RESULT_VAR_NAME, botValue);
};

/* 
 * Ejecución:
 * - Se ejecuta la función `main`, y si ocurre un error inesperado, se maneja en la sección `catch` y se finaliza con un mensaje de error.
 */
main()
  .catch((error) =>
    finalizarConError(
      ERROR_INESPERADO_VAR_VALUE,
      error.message || ERROR_INESPERADO_VAR_VALUE,
      error
    )
  )
  .finally(result.done);
