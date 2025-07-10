---
library_name: transformers.js
base_model: google/gemma-3-1b-it
---

https://huggingface.co/google/gemma-3-1b-it with ONNX weights to be compatible with Transformers.js.


### Transformers.js

If you haven't already, you can install the [Transformers.js](https://huggingface.co/docs/transformers.js) JavaScript library from [NPM](https://www.npmjs.com/package/@huggingface/transformers) using:
```bash
npm i @huggingface/transformers
```

You can then use the model like this:
```js
import { pipeline } from "@huggingface/transformers";

// Create a text generation pipeline
const generator = await pipeline(
  "text-generation",
  "onnx-community/gemma-3-1b-it-ONNX-GQA",
  { dtype: "q4" },
);

// Define the list of messages
const messages = [
  { role: "system", content: "You are a helpful assistant." },
  { role: "user", content: "Write me a poem about Machine Learning." },
];

// Generate a response
const output = await generator(messages, { max_new_tokens: 512, do_sample: false });
console.log(output[0].generated_text.at(-1).content);
```

Note: Having a separate repo for ONNX weights is intended to be a temporary solution until WebML gains more traction. If you would like to make your models web-ready, we recommend converting to ONNX using [🤗 Optimum](https://huggingface.co/docs/optimum/index) and structuring your repo like this one (with ONNX weights located in a subfolder named `onnx`).