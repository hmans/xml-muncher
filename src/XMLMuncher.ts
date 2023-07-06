import expat from "node-expat";

export class XMLMuncher {
  public parser = new expat.Parser("UTF-8");

  constructor() {}

  async munch(xml: string) {
    this.parser.write(xml);
  }
}
