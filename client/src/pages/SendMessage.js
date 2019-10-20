import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import InputBase from "@material-ui/core/InputBase";
import IconButton from "@material-ui/core/IconButton";
import SendIcon from "@material-ui/icons/Send";
import BackNavbar from "../components/BackNavbar";
import TextField from "@material-ui/core/TextField";
import InputAdornment from "@material-ui/core/InputAdornment";
import Tooltip from "@material-ui/core/Tooltip";
import Typography from "@material-ui/core/Typography";
import { sendMessage, getToll } from "../api/chatApi";

const useStyles = makeStyles(theme => ({
  root: {
    padding: "2px 4px",
    display: "flex",
    alignItems: "center",
    width: "70%",
    margin: "auto",
    marginTop: 50
  },
  input: {
    marginLeft: theme.spacing(1),
    flex: 1
  },
  iconButton: {
    padding: 10,
    position: "relative",
    right: 5,
    bottom: 5
  },
  divider: {
    height: 28,
    margin: 4
  },
  textField: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    width: "71%",
    background: "white"
  }
}));

export default function SendMessage({ history }) {
  const classes = useStyles();
  const [to, setTo] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [tollAmount, setTollAmount] = useState("");

  useEffect(() => {
    setTo(to.replace(/[^0-9a-zA-Z]/g, ""));
    async function updateToll() {
      let updatedToll = await getToll(to);
      setTollAmount(updatedToll);
    }
    updateToll();
  }, [to]);

  function handleSendMessage() {
    if (tollAmount) {
      sendMessage(to, message);
      setMessage("");
      history.push(`../message/${to}`);
    } else {
      setError("No account exists with that username");
    }
  }

  return (
    <Layout>
      <BackNavbar history={history} />
      <Typography
        component="span"
        variant="h5"
        color="primary"
        style={{ margin: 25 }}
      >
        Message toll: {tollAmount}
      </Typography>
      <Typography
        component="span"
        variant="body1"
        color="error"
        style={{ minHeight: 25 }}
      >
        {error}
      </Typography>
      <Paper className={classes.root}>
        <InputBase
          className={classes.input}
          placeholder="To"
          inputProps={{ "aria-label": "to" }}
          value={to}
          onChange={e => setTo(e.target.value)}
        />
      </Paper>
      <TextField
        id="outlined-textarea"
        label="Message"
        placeholder="Enter message here"
        multiline
        className={classes.textField}
        margin="normal"
        variant="outlined"
        value={message}
        onChange={e => setMessage(e.target.value)}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <Tooltip id="send-message" title="Send">
                <IconButton
                  edge="end"
                  aria-label="send message"
                  color="primary"
                  onClick={handleSendMessage}
                >
                  <SendIcon />
                </IconButton>
              </Tooltip>
            </InputAdornment>
          )
        }}
      />
    </Layout>
  );
}

const Layout = styled.div`
  display: grid;
  justify-items: center;
  grid-row-gap: 10;
`;
