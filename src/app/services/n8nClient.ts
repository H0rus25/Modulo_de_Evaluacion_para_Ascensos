/**
 * n8nClient.ts
 * Capa de servicio genérica para comunicarse con los webhooks de n8n.
 * Usar getData para peticiones GET y postData para peticiones POST.
 */

/**
 * Realiza una petición GET a la URL indicada y devuelve la respuesta como JSON.
 * @param url - URL del webhook de n8n (GET)
 * @returns Respuesta parseada como JSON tipada con T
 * @throws Error si la respuesta HTTP no es ok o si hay un error de red
 */
export async function getData<T>(url: string): Promise<T | null> {
  try {
    const headers: Record<string, string> = {
      'Accept': 'application/json',
    };
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      throw new Error(
        `Error al obtener datos: ${response.status} ${response.statusText}`
      );
    }

    const contentType = response.headers.get('Content-Type') ?? '';
    if (contentType.includes('application/json')) {
      return response.json() as Promise<T>;
    }
    return null;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`getData falló para ${url}: ${error.message}`);
    }
    throw new Error(`getData falló para ${url}: error desconocido`);
  }
}

/**
 * Realiza una petición POST a la URL indicada con el payload serializado como JSON.
 * @param url - URL del webhook de n8n (POST)
 * @param payload - Datos a enviar en el cuerpo de la solicitud
 * @returns Respuesta parseada como JSON tipada con T
 * @throws Error si la respuesta HTTP no es ok o si hay un error de red
 */
export async function postData<T>(url: string, payload: unknown): Promise<T | null> {
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(
        `Error al enviar datos: ${response.status} ${response.statusText}`
      );
    }

    const contentType = response.headers.get('Content-Type') ?? '';
    if (contentType.includes('application/json')) {
      return response.json() as Promise<T>;
    }
    return null;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`postData falló para ${url}: ${error.message}`);
    }
    throw new Error(`postData falló para ${url}: error desconocido`);
  }
}

/**
 * Realiza una petición POST a la URL indicada enviando datos binarios o mixtos a través de FormData.
 * NOTA: No se debe establecer el Content-Type explícitamente cuando se usa FormData,
 * ya que el navegador genera automáticamente el boundary necesario (multipart/form-data).
 * @param url - URL del webhook de n8n (POST)
 * @param formData - Instancia de FormData que contiene los archivos y otros campos
 * @returns Respuesta parseada como JSON tipada con T
 * @throws Error si la respuesta HTTP no es ok o si hay un error de red
 */
export async function postFormData<T>(url: string, formData: FormData): Promise<T | null> {
  try {
    const headers: Record<string, string> = {
        'Accept': 'application/json',
    };
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      throw new Error(
        `Error al enviar FormData: ${response.status} ${response.statusText}`
      );
    }

    const contentType = response.headers.get('Content-Type') ?? '';
    if (contentType.includes('application/json')) {
      return response.json() as Promise<T>;
    }
    return null;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`postFormData falló para ${url}: ${error.message}`);
    }
    throw new Error(`postFormData falló para ${url}: error desconocido`);
  }
}
