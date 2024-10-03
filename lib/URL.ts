import { ToStringable, URLParameterConstructable } from "./String"

export type URLParameters = {
  [key: string]: ToStringable | URLParameterConstructable | undefined
}

export type URLEndpoint = `/${string}`

export const urlString = ({baseURL, endpoint, params, query}: {baseURL?: URL, endpoint: URLEndpoint, params?: URLParameters, query?: URLParameters}) => {
  const path = parameterizeEndpoint(endpoint, params ?? {}).slice(1)
  const searchParams = queryToSearchParams(query ?? {})
  const queryString = searchParams.toString() ? `?${searchParams}` : '';
  return `${baseURL ?? '/'}${path}${queryString}`
}

export const queryFromSearchParams = (url: URL) => {
  return Array.from(url.searchParams.entries()).reduce<URLParameters>((acc, [key, value]) => {
    acc[key] = value;
    return acc;
  }, {});
}

export const queryToSearchParams = (query: URLParameters) => {
  return Object.entries(query).reduce<URLSearchParams>((params, [key, value]) => {
    if (!value) { return params }

    const urlParam = 
      typeof value === 'object' && 'toURLParameter' in value 
        ? value.toURLParameter() 
        : value.toString();

    params.set(key, urlParam);

    return params;
  }, new URLSearchParams());
};

export const parameterizeEndpoint = (endpoint: URLEndpoint, params: URLParameters) => {
  return endpoint.replace(/:(\w+)/g, (_, paramName) => {
    const urlParam = params[paramName]

    if (urlParam == null) {
      throw new Error(`Missing parameter value for ${paramName}`)
    }

    return typeof urlParam === 'object' && 'toURLParameter' in urlParam
      ? urlParam.toURLParameter()
      : urlParam.toString()

  }) as URLEndpoint
};
