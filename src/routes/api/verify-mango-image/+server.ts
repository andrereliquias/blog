import type { RequestHandler } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ request }) => {
  try {
    // Get the image from the request
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return new Response(
        JSON.stringify({ error: 'No file uploaded' }),
        { status: 400 }
      );
    }

    // Create a new FormData instance
    const form = new FormData();
    form.append('file', file, file.name);

    // Send the image to the FastAPI endpoint using fetch
    const response = await fetch('http://ec2-3-88-114-124.compute-1.amazonaws.com:8080/classify-mango', {
      method: 'POST',
      body: form,
      // No need to set headers; fetch handles them automatically
    });

    if (response.ok) {
      const data = await response.json();
      return new Response(JSON.stringify(data), { status: 200 });
    } else {
      const errorText = await response.text();
      return new Response(
        JSON.stringify({ error: 'Failed to classify image', details: errorText }),
        { status: 500 }
      );
    }
  } catch (error) {
    console.error(error);
    return new Response(
      JSON.stringify({ error: 'An error occurred', details: error.message }),
      { status: 500 }
    );
  }
};
