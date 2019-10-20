import React, { useState } from "react";
import BackNavbar from "../components/BackNavbar";
import styled from "styled-components";
import Button from "@material-ui/core/Button";
import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import InputBase from "@material-ui/core/InputBase";
import { setIP, setPort } from "../api/chatApi";

const useStyles = makeStyles(theme => ({
  root: {
    padding: "2px 4px",
    display: "flex",
    alignItems: "center",
    width: "70%",
    margin: "auto",
    marginTop: 20
  },
  input: {
    marginLeft: theme.spacing(1),
    flex: 1
  },
  button: {
    marginTop: 10,
    marginBottom: 30
  },
  divider: {
    height: 28,
    margin: 4
  }
}));

export default function NetworkModal({ history }) {
  const classes = useStyles();
  const [ipAddress, setIPAddress] = useState("");
  const [portNum, setPortNum] = useState("");

  return (
    <Layout>
      <BackNavbar history={history} />
      <h1> Network </h1>
      <Paper className={classes.root}>
        <InputBase
          className={classes.input}
          type="text"
          placeholder="IP"
          value={ipAddress}
          onChange={e => setIPAddress(e.target.value)}
        />
      </Paper>
      <Paper className={classes.root}>
        <InputBase
          className={classes.input}
          type="text"
          placeholder="PORT"
          value={portNum}
          onChange={e => setPortNum(e.target.value)}
        />
      </Paper>
      <Button
        type="submit"
        variant="contained"
        color="primary"
        className={classes.button}
        onClick={() => {
          setIP(ipAddress);
          setPort(portNum);
        }}
      >
        Set
      </Button>
    </Layout>
  );
}

const Layout = styled.div`
  display: grid;
  justify-items: center;
  grid-row-gap: 10;
  overflow: auto;
`;
