import type { RequestHandler } from '@sveltejs/kit';
import FormData from 'form-data';
import axios from 'axios';
import { Readable } from 'stream';

export const POST: RequestHandler = async ({ request }) => {
  try {
    // Get the image from the request
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return new Response(JSON.stringify({ error: 'No file uploaded' }), { status: 400 });
    }

    // Convert the File to a Buffer
    const arrayBuffer = await file.arrayBuffer();
		const buffer = Buffer.from(arrayBuffer);
		const stream = Readable.from(buffer);

    // Create a new FormData instance
    const form = new FormData();
    form.append('file', stream, { filename: file.name, contentType: file.type });
    // Send the image to the FastAPI endpoint using axios
    const response = await axios.post('http://ec2-3-88-114-124.compute-1.amazonaws.com:8080/classify-mango', form, {
      headers: {
        ...form.getHeaders(),
      },
    });

    if (response.status === 200) {
      const data = response.data;
      return new Response(JSON.stringify(data), { status: 200 });
    } else {
      return new Response(JSON.stringify({ error: 'Failed to classify image', details: response.statusText }), { status: 500 });
    }
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: 'An error occurred', details: error.message }), { status: 500 });
  }
};
