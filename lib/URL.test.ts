import { URLEndpoint, URLParameters, queryFromSearchParams, urlString } from "./URL";

describe('URL Utils', () => {
  describe('queryFromSearchParams', () => {
    it('should handle URLs with no query parameters', () => {
      const url = new URL('http://example.com');
      const result = queryFromSearchParams(url);
      expect(result).toEqual({});
    });

    it('should handle URLs with multiple values for the same parameter', () => {
      const url = new URL('http://example.com?item=apple&item=banana');
      const result = queryFromSearchParams(url);
      expect(result).toEqual({ item: 'banana' });
    });    
    
    it('should handle URLs with query parameters', () => {
      const url = new URL('http://example.com?name=John&age=30');
      const result = queryFromSearchParams(url);
      expect(result).toEqual({ name: 'John', age: '30' });
    });

    it('should handle URLs with empty query parameters', () => {
      const url = new URL('http://example.com?key1&key2');
      const result = queryFromSearchParams(url);
      expect(result).toEqual({ key1: '', key2: '' });
    });
  });
  
  describe('urlString', () => {
    it('should construct a URL with a simple endpoint and no baseURL', () => {
      const endpoint: URLEndpoint = '/endpoint';
      const result = urlString({endpoint});
      expect(result).toBe('/endpoint');
    });
    
    it('should construct a URL with both query and path parameters and no baseURL', () => {
      const endpoint: URLEndpoint = '/endpoint/:id/:action';
      const params: URLParameters = { id: '123', action: 'edit' };
      const query: URLParameters = { foo: 'bar', baz: 'qux' };
      const result = urlString({endpoint, params, query});
      expect(result).toBe('/endpoint/123/edit?foo=bar&baz=qux');
    });

    it('should construct a URL with a simple endpoint and no query or params', () => {
      const baseURL = new URL('https://api.example.com');
      const endpoint: URLEndpoint = '/endpoint';
      const result = urlString({baseURL, endpoint});
      expect(result).toBe('https://api.example.com/endpoint');
    });

    it('should construct a URL with path parameters', () => {
      const baseURL = new URL('https://api.example.com');
      const endpoint: URLEndpoint = '/endpoint/:id/:action';
      const params: URLParameters = { id: '123', action: 'edit', invalid: undefined };
      const result = urlString({baseURL, endpoint, params});
      expect(result).toBe('https://api.example.com/endpoint/123/edit');
    });  
    
    it('should handle missing path parameters gracefully', () => {
      const baseURL = new URL('https://api.example.com');
      const endpoint: URLEndpoint = '/endpoint/:id';
      const params: URLParameters = { id: undefined };
      expect(() => urlString({baseURL, endpoint, params})).toThrow('Missing parameter value for id');
    });

    it('should construct a URL with query parameters', () => {
      const baseURL = new URL('https://api.example.com');
      const endpoint: URLEndpoint = '/endpoint';
      const query: URLParameters = { foo: 'bar', baz: 'qux', invalid: undefined };
      const result = urlString({baseURL, endpoint, query});
      expect(result).toBe('https://api.example.com/endpoint?foo=bar&baz=qux');
    });

    it('should construct a URL with both query and path parameters', () => {
      const baseURL = new URL('https://api.example.com');
      const endpoint: URLEndpoint = '/endpoint/:id/:action';
      const params: URLParameters = { id: '123', action: 'edit' };
      const query: URLParameters = { foo: 'bar', baz: 'qux' };
      const result = urlString({baseURL, endpoint, params, query});
      expect(result).toBe('https://api.example.com/endpoint/123/edit?foo=bar&baz=qux');
    });
  });
});