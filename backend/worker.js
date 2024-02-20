  const { Worker } = require("bullmq");
const sendEmail = () =>
new Promise((res, rej) => setTimeout(() => res(), 1 * 500));

const worker = new Worker("email-queue", 
async (job) => {
console.log(`Message received: ${job.id}`);
console.log("Processing message");
console.log(`Sending email to ${job.data.email}`);
await sendEmail();
console.log("Email Sent");
},{
connection: {
host: "localhost",
port: 6379,
},
}
);
