# Jini SDK

Embeddable SDK for Jini AI.

## Browser usage

```html
<script src="https://cdn.jini.ai/sdk.js"></script>
<script>
  Jini.init({ serverUrl: 'http://127.0.0.1:8000', websocketPath: 'ws' });
  Jini.chat('Hello Jini!').then((response) => {
    console.log(response);
  });
</script>
```

## npm usage

```js
import { Jini } from 'jini-sdk';

Jini.init({ serverUrl: 'http://127.0.0.1:8000' });
Jini.chat('Hello Jini!').then(console.log);
```
