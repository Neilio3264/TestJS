import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import Navbar from "../components/Navbar";
import useInterval from "../hooks/useInterval";
import MessageList from "../components/MessageList";
import Button from "@material-ui/core/Button";
import { getRecentMessages, getHandle } from "../api/chatApi";

const Messages = () => {
  const [publicKey] = useState(
    JSON.parse(localStorage.getItem("wallet")).publicKey
  );
  const [messages, setMessages] = useState([]);
  const [handle, setHandle] = useState("");

  useEffect(() => {
    async function initialRequest() {
      const msgs = await getRecentMessages(publicKey);
      setMessages(msgs);
      const handle = await getHandle(publicKey);
      setHandle(handle);
    }
    initialRequest();
  }, [publicKey]);

  useInterval(async () => {
    const msgs = await getRecentMessages(publicKey);
    setMessages(msgs);
  }, 5000);

  return (
    <Layout>
      <Navbar />
      <Link to="messages/send">
        <Button
          variant="contained"
          color="primary"
          style={{ marginBottom: 10 }}
        >
          Send a Message
        </Button>
      </Link>
      <MessageList
        messages={messages}
        onlyReceived={true}
        handle={handle}
        link={true}
      />
    </Layout>
  );
};

export default Messages;

const Layout = styled.div`
  display: grid;
  justify-items: center;
  overflow: auto;
  width: 100vw;
  background: ghostwhite;
`;
