const fs = require('fs');
const axios = require('axios');
const FormData = require('form-data');

async function upload() {
  try {
    const form = new FormData();
    form.append('userId', 'test-user-1');
    form.append('file', fs.createReadStream('test-upload.txt'));

    const res = await axios.post('http://localhost:5001/api/v1/files/upload', form, {
      headers: form.getHeaders()
    });

    console.log('Upload response:', res.data);
  } catch (error) {
    if (error.response) {
      console.error('Upload failed:', error.response.status, error.response.data);
    } else {
      console.error('Upload error:', error.message);
    }
  }
}

upload();