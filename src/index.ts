export type DimmerNode =
  | undefined
  | null
  | string
  | number
  | boolean
  | Text
  | HTMLElement
  | SVGElement;

export type DimmerSVGAttributes = {
  [key: string]: string | number | boolean | undefined | null;
};

export type DimmerChild = DimmerNode | DimmerNode[];

export type DimmerClassValue =
  | string
  | number
  | undefined
  | null
  | boolean;

export type DimmerClassArray = DimmerClassValue[];

export type DimmerClassDictionary = Record<string, any>;

export type DimmerClassArgument = DimmerClassValue | DimmerClassArray | DimmerClassDictionary;

export type DimmerClassNameAttributes = {
  className?: DimmerClassArgument;
}

export type DimmerNodeAttributes<T extends HTMLElement | SVGElement> = Omit<Partial<T>, 'className'> & DimmerClassNameAttributes;

export const appendChildren = <T extends HTMLElement | SVGElement>(
  parent: T,
  children: DimmerChild,
): T => {
  if (children === undefined || children === null || children === false) {
    return parent;
  }

  if (Array.isArray(children)) {
    children.forEach((child) => appendChildren(parent, child));
  } else if (typeof children === 'string' || typeof children === 'number' || typeof children === 'boolean') {
    parent.appendChild(createText(children.toString()));
  } else {
    parent.appendChild(children);
  }

  return parent;
};

export const setAttributes = <T extends HTMLElement>(
  element: T,
  attributes: DimmerNodeAttributes<T>,
): T => {
  for (const key in attributes) {
    if (key === 'className') {
      element.className = resolveClassNames(attributes.className);
      continue;
    }

    const value = attributes[key as keyof DimmerNodeAttributes<T>];

    if (value === undefined || value === null) {
      element.removeAttribute(key);
    } else {
      element.setAttribute(key, value.toString());
    }
  }

  return element;
};

export const setSvgAttributes = <T extends SVGElement>(
  element: T,
  attributes: DimmerSVGAttributes,
): T => {

  for (const key in attributes) {
    const value = attributes[key as keyof DimmerSVGAttributes];

    if (value === undefined || value === null) {
      element.removeAttribute(key);
    } else {
      element.setAttribute(key, value.toString());
    }
  }

  return element;
};

export const createElement = <
  K extends keyof HTMLElementTagNameMap,
>(
  tagName: K,
  attributes?: DimmerNodeAttributes<HTMLElementTagNameMap[K]> | DimmerClassArray | string | null,
  children?: DimmerChild,
): HTMLElementTagNameMap[K] => {
  const element = document.createElement(tagName);

  if (attributes) {
    if (typeof attributes === 'object' && !Array.isArray(attributes)) {
      setAttributes(element, attributes);
    } else {
      element.className = resolveClassNames(attributes);
    }
  }

  if (children) {
    appendChildren(element, children);
  }

  return element;
};

export const createSvgElement = <
  K extends keyof SVGElementTagNameMap,
>(
  tagName: K,
  attributes?: DimmerSVGAttributes | null,
  children?: DimmerChild,
): SVGElementTagNameMap[K] => {
  const element = document.createElementNS('http://www.w3.org/2000/svg', tagName);

  if (attributes) {
    setSvgAttributes(element, attributes);
  }

  if (children) {
    appendChildren(element, children);
  }

  return element;
};

export const createText = (
  data: string
): Text => document.createTextNode(data);

export const listen = <
  T extends EventTarget,
  K extends keyof HTMLElementEventMap
>(
  element: T,
  type: K,
  listener: (event: HTMLElementEventMap[K]) => any,
  options?: boolean | AddEventListenerOptions,
): () => void => {
  element.addEventListener(type, listener, options);
  return () => element.removeEventListener(type, listener, options);
};

export const unlisten = <
  T extends HTMLElement,
  K extends keyof HTMLElementEventMap
>(
  element: T,
  type: K,
  listener: (event: HTMLElementEventMap[K]) => any,
  options?: boolean | AddEventListenerOptions,
): void => element.removeEventListener(type, listener, options);

export const insertBefore = (
  newNode: HTMLElement,
  referenceNode: HTMLElement,
) => {
  referenceNode.parentNode?.insertBefore(newNode, referenceNode);
};

export const resolveClassNames = (
  classNames: DimmerClassArgument,
): string => {
  if (!classNames) {
    return '';
  }

  if (Array.isArray(classNames)) {
    return classNames
      .map(resolveClassNames)
      .filter((className) => className)
      .join(' ');
  }

  const type = typeof classNames;

  if (type === 'boolean' || type === 'number') {
    return '';
  }

  if (type === 'object') {
    return Object.keys(classNames)
      .filter((key) => (classNames as DimmerClassDictionary)[key])
      .join(' ');
  }

  return classNames.toString();
};

type TemplateFunction = <T extends any[]>(
  data: T,
  strong: (
    attributes: DimmerNodeAttributes<HTMLElementTagNameMap['strong']>,
    children: DimmerNode[],
  ) => HTMLElement,
  br: () => HTMLElement,
) => DimmerNode[];

type Template = (data: any) => DimmerNode[];

export const template = (
  string: string,
): Template => {
  const parts = string.split(/(\{.*?\}|\[|\]|\n)/g)
    .filter((part) => part.length > 0)
    .map((part) => {
      const prefix = part[0];
      const suffix = part[part.length - 1];
      let value = part;

      if (value === '\n') {
        return 'br()';
      }

      if (value === '[') {
        return 'strong(null, [';
      }

      if (value === ']') {
        return '])';
      }

      if (prefix === '{' && suffix === '}') {
        value = `data[${part.slice(1, -1)}]`;
      } else {
        value = `'${part}'`;
      }

      return value;
    });

  const fn = new Function('data', 'strong', 'br', `return [${parts.join(', ')}]`) as TemplateFunction;
  return (data) => fn(data, strong, br);
};

export const createFactory = <
  TagName extends keyof HTMLElementTagNameMap,
  Attributes extends DimmerNodeAttributes<HTMLElementTagNameMap[TagName]> | DimmerClassArray | string | null,
>(
  tagName: TagName,
) => (attributes?: Attributes | null, children?: DimmerChild) => createElement(tagName, attributes, children);

export const createEventFactory = <T extends keyof HTMLElementEventMap>(
  type: T,
) => <P extends EventTarget>(
  element: P,
  listener: (event: HTMLElementEventMap[T]) => any,
  options?: boolean | AddEventListenerOptions
) => listen(element, type, listener, options);

// Event factories
export const onClick = createEventFactory('click');
export const onTransitionEnd = createEventFactory('transitionend');
export const onAnimationEnd = createEventFactory('animationend');

// DOM factories
export const div = createFactory('div');
export const span = createFactory('span');
export const header = createFactory('header');
export const footer = createFactory('footer');
export const main = createFactory('main');
export const section = createFactory('section');
export const article = createFactory('article');
export const nav = createFactory('nav');
export const aside = createFactory('aside');
export const blockquote = createFactory('blockquote');
export const cite = createFactory('cite');
export const code = createFactory('code');
export const pre = createFactory('pre');
export const em = createFactory('em');
export const strong = createFactory('strong');
export const small = createFactory('small');
export const p = createFactory('p');
export const h1 = createFactory('h1');
export const h2 = createFactory('h2');
export const h3 = createFactory('h3');
export const h4 = createFactory('h4');
export const h5 = createFactory('h5');
export const h6 = createFactory('h6');
export const a = createFactory('a');
export const img = createFactory('img');
export const button = createFactory('button');
export const input = createFactory('input');
export const textarea = createFactory('textarea');
export const select = createFactory('select');
export const option = createFactory('option');
export const form = createFactory('form');
export const label = createFactory('label');
export const ul = createFactory('ul');
export const ol = createFactory('ol');
export const li = createFactory('li');
export const table = createFactory('table');
export const thead = createFactory('thead');
export const tbody = createFactory('tbody');
export const tfoot = createFactory('tfoot');
export const tr = createFactory('tr');
export const th = createFactory('th');
export const td = createFactory('td');
export const br = () => createElement('br');
