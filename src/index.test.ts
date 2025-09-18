/**
 * @vitest-environment jsdom
 */
import { test, expect, describe, vi } from 'vitest';
import {
  createElement,
  resolveClassNames,
  appendChildren,
  setAttributes,
  setSvgAttributes,
  createSvgElement,
  listen,
  unlisten,
  insertBefore,
  createEventFactory,
  template,
  createText,
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

describe('setAttributes', () => {
  test('should set attributes on an element', () => {
    const element = createElement('div');
    setAttributes(element, { id: 'test', title: 'Test Title' });
    expect(element.id).toBe('test');
    expect(element.title).toBe('Test Title');
  });

  test('should remove attributes when value is undefined', () => {
    const element = createElement('div', { id: 'test', title: 'Test Title' });
    setAttributes(element, { id: undefined, title: undefined });
    expect(element.hasAttribute('id')).toBe(false);
    expect(element.hasAttribute('title')).toBe(false);
  });

  test('should set className using resolveClassNames', () => {
    const element = createElement('div');
    setAttributes(element, { className: ['class1', 'class2'] });
    expect(element.className).toBe('class1 class2');
  });
});

describe('createSvgElement', () => {
  test('should create an SVG element', () => {
    const element = createSvgElement('svg');
    expect(element.tagName).toBe('svg');
    expect(element.namespaceURI).toBe('http://www.w3.org/2000/svg');
  });

  test('should create an SVG element with attributes', () => {
    const element = createSvgElement('svg', { width: '100', height: '100' });
    expect(element.getAttribute('width')).toBe('100');
    expect(element.getAttribute('height')).toBe('100');
  });

  test('should create an SVG element with children', () => {
    const child = createSvgElement('circle', { cx: '50', cy: '50', r: '40' });
    const element = createSvgElement('svg', null, child);
    expect(element.children).toHaveLength(1);
    expect(element.children[0]).toBe(child);
  });
});

describe('setSvgAttributes', () => {
  test('should set attributes on an SVG element', () => {
    const element = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    setSvgAttributes(element, { id: 'test', title: 'Test Title' });
    expect(element.getAttribute('id')).toBe('test');
    expect(element.getAttribute('title')).toBe('Test Title');
  });

  test('should remove attributes when value is undefined', () => {
    const element = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    setSvgAttributes(element, { id: 'test', title: 'Test Title' });
    setSvgAttributes(element, { id: undefined, title: undefined });
    expect(element.hasAttribute('id')).toBe(false);
    expect(element.hasAttribute('title')).toBe(false);
  });
});

describe('listen', () => {
  test('should add an event listener to an element and return a function to remove it', () => {
    const element = createElement('div');
    const mockHandler = vi.fn();
    const removeListener = listen(element, 'click', mockHandler);
    element.click();
    expect(mockHandler).toHaveBeenCalledTimes(1);
    removeListener();
    element.click();
    expect(mockHandler).toHaveBeenCalledTimes(1);
  });
});

describe('unlisten', () => {
  test('should remove an event listener from an element', () => {
    const element = createElement('div');
    const mockHandler = vi.fn();
    element.addEventListener('click', mockHandler);
    element.click();
    expect(mockHandler).toHaveBeenCalledTimes(1);
    unlisten(element, 'click', mockHandler);
    element.click();
    expect(mockHandler).toHaveBeenCalledTimes(1);
  });
});

describe('insertBefore', () => {
  test('should insert a new element before a reference element', () => {
    const refChild = createElement('span');
    const newChild = createElement('a');
    const parent = createElement('div', null, [
      refChild,
    ]);

    insertBefore(newChild, refChild);
    expect(parent.children).toHaveLength(2);
    expect(parent.children[0]).toBe(newChild);
    expect(parent.children[1]).toBe(refChild);
  });
});

describe('createText', () => {
  test('should create a text node', () => {
    const text = 'Hello, World!';
    const textNode = createText(text);
    expect(textNode.nodeType).toBe(Node.TEXT_NODE);
    expect(textNode.textContent).toBe(text);
  });
});

describe('createFactory', () => {
  test('should create a factory function for a specific tag', () => {
    const createDiv = (props?: any, children?: any) => createElement('div', props, children);
    const element = createDiv({ id: 'test' }, 'Hello');
    expect(element.tagName).toBe('DIV');
    expect(element.id).toBe('test');
    expect(element.textContent).toBe('Hello');
  });
});

describe('createEventFactory', () => {
  test('should create a factory function for a specific event type', () => {
    const factory = createEventFactory('click');
    const element = createElement('div');
    const mockHandler = vi.fn();
    const removeListener = factory(element, mockHandler);
    element.click();
    expect(mockHandler).toHaveBeenCalledTimes(1);
    removeListener();
    element.click();
    expect(mockHandler).toHaveBeenCalledTimes(1);
  });
});

describe('template', () => {
  test('should create a template function', () => {
    const tpl = template('Hello {0},\nwelcome to [Dimmer]!');
    const nodes = tpl(['John']);

    expect(nodes).toHaveLength(7);
    expect(nodes[0]).toBe('Hello ');
    expect(nodes[1]).toBe('John');
    expect(nodes[2]).toBe(',');
    expect((nodes[3] as HTMLElement).tagName).toBe('BR');
    expect(nodes[4]).toBe('welcome to ');
    expect((nodes[5] as HTMLElement).tagName).toBe('STRONG');
    expect((nodes[5] as HTMLElement).textContent).toBe('Dimmer');
    expect(nodes[6]).toBe('!');
  });
});
