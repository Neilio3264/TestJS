import React, { useState, useEffect } from "react";
import BackNavbar from "../components/BackNavbar";
import styled from "styled-components";
import Button from "@material-ui/core/Button";
import Paper from "@material-ui/core/Paper";
import InputBase from "@material-ui/core/InputBase";
import Typography from "@material-ui/core/Typography";
import { BallBeat } from "react-pure-loaders";
import { transferTokens, getAddress } from "../api/chatApi";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles(theme => ({
  root: {
    padding: "2px 4px",
    display: "flex",
    alignItems: "center",
    width: "50%",
    margin: "auto"
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

export default function SendTokens({ history }) {
  const classes = useStyles();
  const [to, setTo] = useState("");
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setTo(to.replace(/[^0-9a-zA-Z]/g, ""));
    setAmount(amount.replace(/[^\d]/g, ""));
  }, [to, amount]);

  return (
    <Layout>
      <BackNavbar history={history} />
      <Typography variant="h4" color="primary" style={{ marginBottom: 50 }}>
        Send Tokens
      </Typography>
      <Typography component="span" variant="body1" color="error">
        {error}
      </Typography>
      <BallBeat loading={loading} color={"#111111"} />
      <Paper className={classes.root}>
        <InputBase
          className={classes.input}
          placeholder="To"
          inputProps={{ "aria-label": "secret key" }}
          type="text"
          value={to}
          onChange={e => setTo(e.target.value)}
        />
      </Paper>
      <Paper className={classes.root}>
        <InputBase
          className={classes.input}
          placeholder="Amount"
          inputProps={{ "aria-label": "amount" }}
          type="text"
          value={amount}
          onChange={e => setAmount(e.target.value)}
        />
      </Paper>
      <Button
        type="submit"
        color="primary"
        variant="contained"
        onClick={async () => {
          if (await getAddress(to)) {
            setError("");
            transferTokens(to, parseInt(amount));
            setLoading(true);
            setTimeout(() => {
              setLoading(false);
              history.push("../wallet");
            }, 6000);
          } else {
            setError("No account exists with that username");
          }
        }}
      >
        Send
      </Button>
    </Layout>
  );
}

const Layout = styled.div`
  display: grid;
  grid-auto-rows: auto;
  justify-items: center;
  grid-row-gap: 20px;
`;
