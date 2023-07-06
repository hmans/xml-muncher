import { XMLMuncher } from "./XMLMuncher";

/* Make sure we can exit cleanly */
process.on("SIGINT", async function () {
  console.log("Aborting");
  process.exit();
});

function processJob(job: any) {
  console.log(job.title);
}

await new XMLMuncher()
  .on("path://feed/job", processJob)
  .munchFile("./test/files/medium.xml");

console.log("Done!");
