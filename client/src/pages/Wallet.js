import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import Container from "@material-ui/core/Container";
import Grid from "@material-ui/core/Grid";
import IconButton from "@material-ui/core/IconButton";
import { makeStyles } from "@material-ui/core/styles";
import Navbar from "../components/Navbar";
import TransactionList from "../components/TransactionList";
import useInterval from "../hooks/useInterval";
import { getTransactions, getBalance } from "../api/chatApi";
import SendIcon from "@material-ui/icons/Send";
import MoveToInboxIcon from "@material-ui/icons/MoveToInbox";
import RedeemIcon from "@material-ui/icons/Redeem";
import Tooltip from "@material-ui/core/Tooltip";

const useStyles = makeStyles(theme => ({
  root: {
    flexGrow: 1,
    marginBottom: 20
  },
  icon: {
    padding: theme.spacing(2),
    textAlign: "center",
    color: theme.palette.primary.dark
  }
}));

const Wallet = () => {
  const classes = useStyles();
  const [publicKey, setPublicKey] = useState("");
  const [balance, setBalance] = useState("");
  const [transactions, setTransactions] = useState("");

  useInterval(async () => {
    let txs = await getTransactions(publicKey);
    let bal = await getBalance();
    setTransactions(txs && txs.reverse());
    setBalance(bal);
  }, 5000);

  useEffect(() => {
    setPublicKey(JSON.parse(localStorage.getItem("wallet")).publicKey);
    async function initialRequest() {
      if (publicKey) {
        const txs = await getTransactions(publicKey);
        const bal = await getBalance();
        setTransactions(txs && txs.reverse());
        setBalance(bal);
      }
    }
    initialRequest();
  }, [publicKey]);

  return (
    <Layout>
      <Navbar />
      <h3>Balance: {balance} </h3>
      <div className={classes.root}>
        <Grid container spacing={9}>
          <Grid item xs={4}>
            <Link to="/wallet/send">
              <Tooltip id="send-icon" title="Send tokens">
                <IconButton className={classes.icon}>
                  <SendIcon />
                </IconButton>
              </Tooltip>
            </Link>
          </Grid>
          <Grid item xs={4}>
            <Link to="/wallet/receive">
              <Tooltip id="receive-icon" title="Recieve tokens">
                <IconButton className={classes.icon}>
                  <MoveToInboxIcon />
                </IconButton>
              </Tooltip>
            </Link>
          </Grid>
          <Grid item xs={4}>
            <Link to="/wallet/claim">
              <Tooltip id="Reward-icon" title="Claim tokens">
                <IconButton className={classes.icon}>
                  <RedeemIcon />
                </IconButton>
              </Tooltip>
            </Link>
          </Grid>
        </Grid>
      </div>
      <h3> Recent Transactions </h3>
      <Container>
        <TransactionList transactions={transactions} myKey={publicKey} />
      </Container>
    </Layout>
  );
};

export default Wallet;

const Layout = styled.div`
  display: grid;
  justify-items: center;
  grid-row-gap: 10;
`;
