const { exec } = require('child_process');

// Kill any existing server processes
exec('pkill -f "tsx server/index.ts" || true', (error) => {
  // Start the server on port 3000
  const server = exec('node_modules/.bin/tsx server/index.ts');
  
  server.stdout.on('data', (data) => {
    console.log(data);
  });
  
  server.stderr.on('data', (data) => {
    console.error(data);
  });
  
  console.log('Started server on port 3000');
});