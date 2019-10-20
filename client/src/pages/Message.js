import React, { useState, useEffect } from "react";
import useInterval from "../hooks/useInterval";
import BackNavbar from "../components/BackNavbar";
import MessageList from "../components/MessageList";
import MessageInput from "../components/MessageInput";
import { getChatHistory, getHandle } from "../api/chatApi";

const Message = ({ match, history }) => {
  const [messages, setMessages] = useState([]);
  const [handle, setHandle] = useState("");

  useEffect(() => {
    async function initialRequest() {
      let msgs = await getChatHistory(match.params.user);
      const handle = await getHandle();
      setMessages(msgs.reverse());
      setHandle(handle);
    }
    setTimeout(() => initialRequest(), 100);
  }, [match.params.user]);

  useInterval(async () => {
    const msgs = await getChatHistory(match.params.user);
    setMessages(msgs);
  }, 5000);

  return (
    <>
      <BackNavbar history={history} />
      <MessageList messages={messages} handle={handle} />
      <MessageInput to={match.params.user} />
    </>
  );
};

export default Message;
