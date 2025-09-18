<img width="1010" height="408" alt="logo" src="https://github.com/user-attachments/assets/b5d88c2d-148a-4fff-bd9b-929f3307feb2" />

[![Version](https://img.shields.io/npm/v/@immerspiele/dimmer.svg)](https://www.npmjs.com/package/@immerspiele/dimmer)
[![CI](https://github.com/immerspiele/dimmer/actions/workflows/ci.yml/badge.svg)](https://github.com/immerspiele/dimmer/actions/workflows/ci.yml)
[![gzip size](http://img.badgesize.io/https://unpkg.com/@immerspiele/dimmer@latest/dist/index.mjs?compression=gzip)](https://unpkg.com/@immerspiele/dimmer@latest/dist/index.mjs)

**Dimmer** is a small, lightweight library for creating DOM elements in pure JavaScript. It’s designed to be fast, convenient, and dependency-free, making it easy to build and manipulate HTML without bulky frameworks.

## Installation

```bash
# Using npm
npm install @immerspiele/dimmer

# Using yarn
yarn add @immerspiele/dimmer
```

## Quick Start

```typescript
import { div, h2, p, appendChildren } from '@immerspiele/dimmer';

const $container = div('container', [
  h2('title', 'Welcome to Dimmer'),
  p(null, 'This is a simple example of using Dimmer to create DOM elements.'),
]);

appendChildren(document.body, $container);
```
