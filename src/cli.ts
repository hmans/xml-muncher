import { XMLMuncher } from "./XMLMuncher";

/* Make sure we can exit cleanly */
process.on("SIGINT", async function () {
  console.log("⛔️ Aborting");
  process.exit();
});

function processJob(job: any) {
  console.log("🎉 JOB:", job.title);
  console.dir(job);
}

await new XMLMuncher()
  .on("path://jobs/job", processJob)
  .munchFile("./test/files/stepstone1.xml");

console.log("✅ Done!");
