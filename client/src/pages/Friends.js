import React, { useState } from "react";
import BackNavbar from "../components/BackNavbar";
import styled from "styled-components";
import FriendInput from "../components/FriendInput";
import FriendList from "../components/FriendList";
import Typography from "@material-ui/core/Typography";

export default function Friends({ history }) {
  const [friends, setFriends] = useState(
    JSON.parse(localStorage.getItem("friends")) || []
  );

  return (
    <Layout>
      <BackNavbar history={history} />
      <Typography color="primary" variant="h4" style={{ marginBottom: 10 }}>
        Friends
      </Typography>
      <FriendInput friends={friends} setFriends={setFriends} />
      <FriendList friends={friends} setFriends={setFriends} />
    </Layout>
  );
}

const Layout = styled.div`
  display: grid;
  justify-items: center;
  grid-row-gap: 10;
  overflow: scroll;
`;
