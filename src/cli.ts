import { XMLMuncher } from "./XMLMuncher";

console.log("yo");

const muncher = new XMLMuncher();

process.on("SIGINT", async function () {
  console.log("Aborting");
  process.exit();
});

muncher.munchFile("./test/files/large.xml");
