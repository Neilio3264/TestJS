import React, { useState, useEffect } from "react";
import BackNavbar from "../components/BackNavbar";
import styled from "styled-components";
import Button from "@material-ui/core/Button";
import Paper from "@material-ui/core/Paper";
import InputBase from "@material-ui/core/InputBase";
import Typography from "@material-ui/core/Typography";
import { getAccountToll, setToll } from "../api/chatApi";
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

export default function Toll({ history }) {
  const classes = useStyles();
  const [tollValue, setTollValue] = useState("");
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setAmount(amount.replace(/[^\d]/g, ""));
  }, [amount]);

  useEffect(() => {
    async function initialReq() {
      let toll = await getAccountToll();
      setTollValue(toll);
    }
    initialReq();
  }, []);

  function verifyToll() {
    if (amount > 1000000) {
      setError("Max toll is 1,000,000 tokens");
      return;
    }
    setTollValue(parseInt(amount));
    setToll(parseInt(amount));
  }

  return (
    <Layout>
      <BackNavbar history={history} />
      <Typography variant="h4" color="primary" style={{ marginBottom: 20 }}>
        Account toll: {tollValue}
      </Typography>
      <Typography
        variant="body1"
        component="span"
        color="error"
        style={{ minHeight: 25 }}
      >
        {error}
      </Typography>
      <Paper className={classes.root}>
        <InputBase
          className={classes.input}
          placeholder="Set account toll"
          inputProps={{ "aria-label": "account toll amount" }}
          type="text"
          value={amount}
          onChange={e => setAmount(e.target.value)}
        />
      </Paper>
      <Button
        type="submit"
        color="primary"
        variant="contained"
        onClick={() => verifyToll()}
      >
        Submit
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
