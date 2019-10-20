import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import Paper from "@material-ui/core/Paper";
import BackNavbar from "../components/BackNavbar";
import Button from "@material-ui/core/Button";
import { BallBeat } from "react-pure-loaders";
import { registerHandle, createWallet, getAddress } from "../api/chatApi";
import InputBase from "@material-ui/core/InputBase";

const useStyles = makeStyles(theme => ({
  root: {
    padding: "5px",
    alignItems: "center",
    width: 300,
    marginTop: 10,
    marginBottom: 20
  },
  input: {
    marginLeft: theme.spacing(1),
    flex: 1
  },
  iconButton: {
    padding: 10
  },
  divider: {
    height: 28,
    margin: 4
  }
}));

export default function Register({ history }) {
  const classes = useStyles();
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  async function submitRegister() {
    setError("");
    const taken = await getAddress(username);
    if (username.length > 16) {
      setError("Username must be less than 17 characters");
      return;
    }
    if (!taken) {
      const wallet = createWallet();
      console.log(wallet);
      registerHandle(username);
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        setSuccess("Succesfully created account!");
        setTimeout(() => history.push("../wallet"), 1000);
      }, 9000);
    } else {
      setError("This username is already taken, try another one!");
    }
  }

  useEffect(() => {
    setUsername(username.replace(/[^0-9a-zA-Z]/g, "").toLowerCase());
    if (username.length >= 17) {
      setError("Username must be less than 17 characters");
    } else {
      setError("");
    }
  }, [username]);

  return (
    <>
      <BackNavbar history={history} />
      <Layout>
        <h1>Select a username</h1>
        <Error>
          {error ? (
            <Typography variant="span" color="error">
              {error}
            </Typography>
          ) : success ? (
            <Typography variant="span" style={{ color: "green" }}>
              {success}
            </Typography>
          ) : (
            ""
          )}
        </Error>
        <BallBeat loading={loading} color={"#111111"} />
        <Paper className={classes.root}>
          <InputBase
            className={classes.input}
            type="text"
            placeholder="username"
            value={username}
            onChange={e => setUsername(e.target.value)}
          />
        </Paper>
        <Button
          variant="contained"
          type="submit"
          color="primary"
          onClick={submitRegister}
        >
          Submit
        </Button>
      </Layout>
    </>
  );
}

const Layout = styled.div`
  display: grid;
  justify-items: center;
  grid-row-gap: 10;
`;

const Error = styled.p`
  min-height: 30px;
`;
