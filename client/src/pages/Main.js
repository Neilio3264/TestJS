import React, { useState } from "react";
import Signup from "./Signup";
import Messages from "./Messages";

const Main = () => {
  const [publicKey, setPublicKey] = useState(
    localStorage.getItem("wallet") &&
      JSON.parse(localStorage.getItem("wallet")).publicKey
  );

  return (
    <>{publicKey ? <Messages /> : <Signup setPublicKey={setPublicKey} />}</>
  );
};

export default Main;
