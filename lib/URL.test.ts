import { UserHandle } from "../domain-models/User";
import { URLEndpoint, URLParameters, parameterizeEndpoint, queryFromSearchParams, queryToSearchParams, urlString } from "./URL";

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
    
    it('should handle missing path parameters', () => {
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

  describe('parameterizeEndpoint', () => {
    it('should replace path parameters', () => {
      const endpoint: URLEndpoint = '/post/:postId/comment/:commentId';
      const params: URLParameters = { postId: '10', commentId: '5' };
      const result = parameterizeEndpoint(endpoint, params);
      expect(result).toBe('/post/10/comment/5');
    });

    it('should replace multiple instances of the same parameter', () => {
      const endpoint: URLEndpoint = '/repeat/:id/:id';
      const params: URLParameters = { id: '123' };
      const result = parameterizeEndpoint(endpoint, params);
      expect(result).toBe('/repeat/123/123');
    });

    it('should prefer interpolating using toJSON method', () => {
      const endpoint: URLEndpoint = '/data/:handle';
      const params: URLParameters = { handle: UserHandle.parse("bigchungus").handle! };
      const result = parameterizeEndpoint(endpoint, params);
      expect(result).toBe('/data/bigchungus');
    });
  });

  describe('queryToSearchParams', () => {
    it('should return empty URLSearchParams for empty query object', () => {
      const query: URLParameters = {};
      const result = queryToSearchParams(query);
      expect(result.toString()).toBe('');
    });

    it('should handle multiple key-value pairs', () => {
      const query: URLParameters = { foo: 'bar', baz: 'qux' };
      const result = queryToSearchParams(query);
      expect(result.get('foo')).toBe('bar');
      expect(result.get('baz')).toBe('qux');
      expect(result.toString()).toContain('foo=bar');
      expect(result.toString()).toContain('baz=qux');
    });

    it('should skip undefined values', () => {
      const query: URLParameters = { foo: 'bar', baz: undefined };
      const result = queryToSearchParams(query);
      expect(result.toString()).toBe('foo=bar');
    });

    it('should prefer interpolating using toJSON method', () => {
      const query: URLParameters = { handle: UserHandle.parse("bigchungus").handle! };
      const result = queryToSearchParams(query);
      expect(result.toString()).toBe('handle=bigchungus');
    });
  });
});
