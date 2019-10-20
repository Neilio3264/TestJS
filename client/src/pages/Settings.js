import React from "react";
import styled from "styled-components";
import { Link } from "react-router-dom";
import Button from "@material-ui/core/Button";
import Navbar from "../components/Navbar";
import Container from "@material-ui/core/Container";

const Settings = () => {
  return (
    <Layout>
      <Navbar />
      <Container
        style={{
          marginTop: 50,
          display: "grid",
          gridRowGap: 20
        }}
      >
        <Link to="/settings/toll">
          <Button variant="contained" color="primary" fullWidth={true}>
            Toll
          </Button>
        </Link>
        <Link to="/settings/friends">
          <Button variant="contained" color="primary" fullWidth={true}>
            Friends
          </Button>
        </Link>
        <Link to="/settings/import">
          <Button variant="contained" color="primary" fullWidth={true}>
            Import
          </Button>
        </Link>
        <Link to="/settings/export">
          <Button variant="contained" color="primary" fullWidth={true}>
            Export
          </Button>
        </Link>
        <Link to="/settings/network">
          <Button variant="contained" color="primary" fullWidth={true}>
            Network
          </Button>
        </Link>
      </Container>
    </Layout>
  );
};

export default Settings;

const Layout = styled.div`
  display: grid;
  justify-items: center;
  grid-row-gap: 10;
`;
