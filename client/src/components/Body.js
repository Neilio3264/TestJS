import React, { useState, useEffect } from "react";
import styled from "styled-components";
import MessageInput from "./MessageInput";
import FriendInput from "./FriendInput";
import axios from "axios";
import uuid from "uuid/v4";
import moment from "moment";
import useInterval from "../hooks/useInterval";

export default function Body({ wallet }) {
  const [messages, setMessages] = useState([]);
  const [to, setTo] = useState("");
  const [friends, setFriends] = useState({});

  return (
    <Layout>
      <UsersColumn>
        <UsersHeading>Friends</UsersHeading>
        {/* <UsersList>
          {friends &&
            Object.entries(friends).map(friend => (
              <User key={uuid()} onClick={() => setTo(friend[0])}>
                {friend[1]}
              </User>
            ))}
        </UsersList> */}
        <FriendInput
          wallet={wallet}
          friends={friends}
          setFriends={setFriends}
        />
      </UsersColumn>
      <MessagesColumn>
        <MessagesHeading>
          {to ? "Chatting with " + friends[to] : ""}
        </MessagesHeading>
        <MessagesList>
          {messages &&
            messages.reverse().map(message => (
              <Message key={uuid()}>
                <Timestamp>
                  {moment(message.timestamp).fromNow(moment())} ago
                </Timestamp>
                <Text>{message.text}</Text>
              </Message>
            ))}
        </MessagesList>
        <MessageInput wallet={wallet} to={to} setMessages={setMessages} />
      </MessagesColumn>
    </Layout>
  );
}

const Layout = styled.div`
  height: calc(100vh - 85px);
  display: grid;
  grid-template-columns: 1fr 2fr;
`;

const UsersColumn = styled.div`
  grid-column: 1;
  background: #1f1f1f;
  border: 1px solid red;
  display: grid;
  grid-template-rows: 1fr 5fr;
`;

const UsersHeading = styled.h1`
  font-size: 40px;
  color: #cf070b;
  justify-self: center;
`;

const UsersList = styled.ul`
  list-style: none;
  height: 67vh;
  overflow: scroll;
  margin-right: 10px;
`;

const User = styled.li`
  color: white;
  font-size: 20px;
  border: 1px solid black;
  border-radius: 5px;
  background: #3f3f3f;
  margin-bottom: 10px;
  padding: 10px 10px 10px 10px;
  text-align: center;
  margin-right: 25px;
  &:hover {
    opacity: 0.8;
    cursor: pointer;
  }
`;

const MessagesHeading = styled.h1`
  font-size: 30px;
  color: white;
  justify-self: center;
`;

const MessagesColumn = styled.div`
  grid-column: 2;
  background: #131313;
  border: 1px solid red;
  display: grid;
  grid-template-rows: 10% 70% 20%;
`;

const MessagesList = styled.ul`
  list-style: none;
  height: 69vh;
  overflow: scroll;
  margin-right: 10px;
  transform: rotate(180deg);
`;

const Message = styled.li`
  color: black;
  font-size: 20px;
  border: 1px solid #8b0406;
  border-radius: 5px;
  background: #d8d8d8;
  margin-bottom: 10px;
  padding: 0 10px 0 10px;
  margin-right: 25px;
  display: grid;
  grid-template-rows: 20px auto;
  grid-template-columns: 1fr 1fr;
  transform: rotate(-180deg);
`;

const Text = styled.p`
  color: black;
  justify-self: right;
  grid-row: 1 / 3;
  grid-column: 1 / 3;
`;

const Timestamp = styled.p`
  color: black;
  grid-row: 1;
  grid-column: 1;
  font-size: 10px;
  margin-bottom: 5px;
`;
