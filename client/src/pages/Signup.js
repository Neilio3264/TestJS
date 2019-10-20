import React from "react";
import styled from "styled-components";
import { Link } from "react-router-dom";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import Paper from "@material-ui/core/Paper";

export default function Signup() {
  return (
    <>
      <Layout>
        <Paper elevation={5} style={{ padding: 50, width: "75%" }}>
          <Typography
            variant="h4"
            align="center"
            style={{ margin: 10 }}
            color="textSecondary"
          >
            Welcome to
          </Typography>
          <Typography
            variant="h4"
            align="center"
            style={{ margin: 10 }}
            color="primary"
          >
            Shardus Chat
          </Typography>
          <Link to="/register">
            <Button
              variant="contained"
              color="primary"
              fullWidth={true}
              style={{ margin: 10, marginTop: 30 }}
            >
              Create Account
            </Button>
          </Link>
          <Link to="/settings/import">
            <Button
              variant="contained"
              color="default"
              fullWidth={true}
              style={{ margin: 10 }}
            >
              Import
            </Button>
          </Link>
        </Paper>
      </Layout>
    </>
  );
}

const Layout = styled.div`
  display: grid;
  justify-items: center;
  align-items: center;
  height: 85vh;
`;
