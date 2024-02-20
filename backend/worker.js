// In a separate file (e.g., emailWorker.js)
const BullMQ = require('bullmq');

const newEmailsQueue = new BullMQ('newEmails', { 
  // Same Redis connection as the main app
  connection: { 
    host: 'your_redis_host',
    port: 'your_redis_port'
  } 
});

newEmailsQueue.on('completed', (job, returnvalue) => {
  console.log(`Job ${job.id} completed successfully`);
});

newEmailsQueue.on('failed', (job, err) => {
  console.error(`Job ${job.id} failed with error: ${err.message}`);
});

newEmailsQueue.process('processEmail', async (job) => {
  const email = job.data;

  // Your email processing logic (e.g., extract data, send other notifications, etc.)
  console.log(`Processing email: ${email.id}`);
  // ... your logic here ...

  return 'Email processed'; // Example return value 
}); 
