import { fetchRandomText, spanText } from "./utils";
let root = null;

import jss from "jss";
import preset from "jss-preset-default";

import { appMeta } from "./meta";
import { Game } from "./Game";
import { Metrics } from "./Metrics";

jss.setup(preset());

const style = {};

function mountApp(el) {
  el.innerHTML = "";

  const title = document.createElement("h1");
  title.innerHTML = appMeta.name;

  const Game = new Game();
  const Metrics = new Metrics();

  Game.register(Metrics);

  el.appendChild(title);
}

export default function App(el) {
  mountApp(el);
  console.log("Mounted");
}
