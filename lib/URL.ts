import { ToStringable } from "./String"

export type URLParameters = {
  [key: string]: ToStringable | undefined
}

export type URLEndpoint = `/${string}`

export const urlString = ({baseURL, endpoint, params, query}: {baseURL?: URL, endpoint: URLEndpoint, params?: URLParameters, query?: URLParameters}) => {
  const path = parameterizeEndpoint(endpoint, params ?? {}).slice(1)
  const searchParams = queryToSearchParams(query ?? {})
  const queryString = searchParams.toString() ? `?${searchParams}` : '';
  return `${baseURL ?? '/'}${path}${queryString}`
}

export const queryFromSearchParams = (url: URL) => {
  return Array.from(url.searchParams.entries()).reduce((acc, [key, value]) => {
    acc[key] = value;
    return acc;
  }, {} as URLParameters);
}

const queryToSearchParams = (query: URLParameters) => {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(query)) {
    if (!value) continue
    params.set(key, value.toString())
  }
  return params
}

const parameterizeEndpoint = (endpoint: URLEndpoint, params: URLParameters) => {
  const paramKeys: string[] = (endpoint.match(/:\w+/g) || []).map(key => key.substring(1));

  let parameterizedEndpoint = endpoint;
  paramKeys.forEach(paramName => {
    if (!params[paramName]) {
      throw new Error(`Missing parameter value for ${paramName}`);
    } else {
      parameterizedEndpoint = parameterizedEndpoint.replace(`:${paramName}`, params[paramName] as string) as URLEndpoint;
    }
  });

  return parameterizedEndpoint
}
