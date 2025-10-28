/**
*    File        : frontend/js/api/apiFactory.js
*    Project     : CRUD PHP
*    Author      : Tecnologías Informáticas B - Facultad de Ingeniería - UNMdP
*    License     : http://www.gnu.org/licenses/gpl.txt  GNU GPL 3.0
*    Date        : Mayo 2025
*    Status      : Prototype
*    Iteration   : 2.0 ( prototype )
*/

export function createAPI(moduleName, config = {}) 
{
    const API_URL = config.urlOverride ?? `../../backend/server.php?module=${moduleName}`;

    //3.1 
    async function sendJSON(method, data) 
    {
        const res = await fetch(API_URL,
        {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        const body = await res.json().catch(() => ({})); //RECIBO LA RESPUESTA HTTP COMO JSON, SI NO HAY JSON SE RECIBE {} PARA NO CORTAR EJECUCION

        if (!res.ok) { //SI HUBO UN ERROR
            const message = body.error || body.message || `Error en ${method}`; //GUARDO ERROR DEPENDE COMO HAYA GUARDADO LA RESPUESTA EL JSON, .error O .message
            throw new Error(message); //LE DEVUELVO EL ERROR AL CONTEXTO QUE ME INVOCO
        }

        return body;
    }

    return {
        async fetchAll()
        {
            const res = await fetch(API_URL);
            if (!res.ok) throw new Error("No se pudieron obtener los datos");
            return await res.json();
        },
        //2.0
        async fetchPaginated(page = 1, limit = 10)
        {
            const url = `${API_URL}&page=${page}&limit=${limit}`;
            const res = await fetch(url);
            if (!res.ok)
                throw new Error("Error al obtener datos paginados");
            return await res.json();
        },
        async create(data)
        {
            return await sendJSON('POST', data);
        },
        async update(data)
        {
            return await sendJSON('PUT', data);
        },
        async remove(id)
        {
            return await sendJSON('DELETE', { id });
        }
    };
}
