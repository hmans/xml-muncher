import { XMLMuncher } from "./XMLMuncher";

console.log("yo");

process.on("SIGINT", async function () {
  console.log("Aborting");
  process.exit();
});

const muncher = new XMLMuncher();

muncher.on("path://feed/job", (job) => {
  console.log("Hooray, a job!");
  console.dir(job, { depth: null });
});

muncher.munchFile("./test/files/medium.xml");
