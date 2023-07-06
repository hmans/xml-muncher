import { XMLMuncher } from "./XMLMuncher";

/* Make sure we can exit cleanly */
process.on("SIGINT", async function () {
  console.log("⛔️ Aborting");
  process.exit();
});

let jobs = 0;

const muncher = new XMLMuncher();

muncher.on("path://jobs/job", (job: any) => {
  jobs++;
  console.log(`🎉 JOB ${jobs}:`, job.title);
  // console.dir(job);

  if (jobs >= 100) {
    muncher.stop();
  }
});

await muncher.munchFile("./test/files/stepstone1.xml");

console.log("✅ Done!");
