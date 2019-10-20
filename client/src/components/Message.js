import React from "react";
import styled from "styled-components";
import moment from "moment";
import { Link } from "react-router-dom";

const Message = ({ message, link, sender }) => {
  return link ? (
    <Link to={`message/${message.handle}`}>
      <Layout className={sender ? "sent-message" : "received-message"}>
        <Timestamp>{moment(message.timestamp).fromNow(moment())} ago</Timestamp>
        <Handle> {message.handle} </Handle>
        <Body> {message.body} </Body>
      </Layout>
    </Link>
  ) : (
    <Layout className={sender ? "sent-message" : "received-message"}>
      <Timestamp>{moment(message.timestamp).fromNow(moment())} ago</Timestamp>
      <Handle> {message.handle} </Handle>
      <Body> {message.body} </Body>
    </Layout>
  );
};

export default Message;

const Layout = styled.div`
  font-size: 20px;
  border-radius: 5px;
  width: 75%;
  color: white;
  margin: 15px;
  padding-right: 10px;
  padding-left: 10px;
  display: grid;
  box-shadow: 0 4px 5px rgba(0, 0, 0, 0.9);
  grid-template-rows: 20px auto;
  grid-template-columns: auto auto;
  text-decoration: none;
  &.sent-message {
    background: #2e2e2e;
    float: right;
  }
  &.received-message {
    background: #ebebeb;
    color: black;
    float: left;
  }
`;

const Handle = styled.p`
  grid-area: handle;
  justify-self: left;
  font-size: 10px;
`;

const Body = styled.p`
  justify-self: right;
  grid-row: 2;
  grid-column: 1 / 3;
`;

const Timestamp = styled.p`
  grid-row: 1;
  font-size: 10px;
`;
