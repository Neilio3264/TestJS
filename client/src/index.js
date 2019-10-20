import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";

import * as serviceWorker from "./serviceWorker";

(async () => {
  // await crypto.initialize(
  //   "64f152869ca2d473e4ba64ab53f49ccdb2edae22da192c126850970e788af347"
  // );
  ReactDOM.render(<App />, document.getElementById("root"));
})();

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA

serviceWorker.unregister();
