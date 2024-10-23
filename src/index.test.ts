/**
 * @vitest-environment jsdom
 */
import { test, expect, describe } from 'vitest';
import {
  createElement,
  resolveClassNames,
  appendChildren,
} from '.';

describe('resolveClassNames', () => {
  describe('with a string', () => {
    test('should return the string', () => {
      const result = resolveClassNames('test1 test2');
      expect(result).toBe('test1 test2');
    });
  });

  describe('with an array', () => {
    test('should return the string', () => {
      const result = resolveClassNames(['test1', 'test2']);
      expect(result).toBe('test1 test2');
    });

    test('should ignore null values', () => {
      const result = resolveClassNames(['test1', null, 'test2']);
      expect(result).toBe('test1 test2');
    });

    test('should ignore undefined values', () => {
      const result = resolveClassNames(['test1', undefined, 'test2']);
      expect(result).toBe('test1 test2');
    });

    test('should ignore empty strings', () => {
      const result = resolveClassNames(['test1', '', 'test2']);
      expect(result).toBe('test1 test2');
    });

    test('should ignore boolean values', () => {
      const result = resolveClassNames(['test1', true, false, 'test2']);
      expect(result).toBe('test1 test2');
    });

    test('should ignore numbers', () => {
      const result = resolveClassNames(['test1', 1, 2, 'test2']);
      expect(result).toBe('test1 test2');
    });

    test('handles nested arrays', () => {
      const result = resolveClassNames(['test1', ['test2', 'test3'], 'test4']);
      expect(result).toBe('test1 test2 test3 test4');
    });

    test('uses object keys as class names', () => {
      const result = resolveClassNames([{
        test1: true,
        test2: false,
        test3: 1,
        test4: 0,
        test5: '',
        test6: null,
        test7: undefined,
        test8: 'test8',
        test9: [],
      }]);
      expect(result).toBe('test1 test3 test8 test9');
    });
  });
});

describe('appendChildren', () => {
  test('should append a single child', () => {
    const parent = document.createElement('div');
    const child = document.createElement('span');
    appendChildren(parent, child);
    expect(parent.children).toHaveLength(1);
    expect(parent.children[0]).toBe(child);
  });

  test('should append multiple children', () => {
    const parent = document.createElement('div');
    const children = [document.createElement('span'), document.createElement('span')];
    appendChildren(parent, children);
    expect(parent.children).toHaveLength(2);
    expect(parent.children[0]).toBe(children[0]);
    expect(parent.children[1]).toBe(children[1]);
  });

  test('converts primitive children to text nodes', () => {
    const parent = document.createElement('div');
    appendChildren(parent, ['test', 1, true]);
    expect(parent.textContent).toBe('test1true');
  });

  test('ignores null, undefined, and false children', () => {
    const parent = document.createElement('div');
    appendChildren(parent, ['test', null, undefined, false]);
    expect(parent.textContent).toBe('test');
  });
});

describe('createElement', () => {
  test('should create a div element', () => {
    const element = createElement('div');
    expect(element.tagName).toBe('DIV');
  });

  describe('with shorthand class name syntax', () => {
    test('should create a div element with class name', () => {
      const element = createElement('div', 'test1 test2');
      expect(element.className).toBe('test1 test2');
    });
  });

  describe('with attributes', () => {
    test('should create a div element with attributes', () => {
      const element = createElement('div', { id: 'test' });
      expect(element.id).toBe('test');
    });
  });

  describe('with children', () => {
    test('should create a div element with a single child', () => {
      const element = createElement('div', null, 'test');
      expect(element.textContent).toBe('test');
    });

    test('should create a div element with multiple children', () => {
      const element = createElement('div', null, ['test1', 'test2']);
      expect(element.textContent).toBe('test1test2');
    });
  });
});
