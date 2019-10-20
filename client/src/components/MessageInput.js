import React, { useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import InputBase from "@material-ui/core/InputBase";
import Divider from "@material-ui/core/Divider";
import IconButton from "@material-ui/core/IconButton";
import SendIcon from "@material-ui/icons/Send";
import { sendMessage } from "../api/chatApi";

const useStyles = makeStyles(theme => ({
  root: {
    padding: "2px 4px",
    display: "flex",
    alignItems: "center",
    width: "90%",
    margin: "auto",
    marginTop: 10
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

export default function Input({ to }) {
  const classes = useStyles();
  const [message, setMessage] = useState("");

  function enterInput(e) {
    if (e.key === "Enter") {
      setMessage("");
      sendMessage(to, message);
    }
  }

  return (
    <Paper className={classes.root}>
      <InputBase
        className={classes.input}
        placeholder="Message"
        inputProps={{ "aria-label": "message" }}
        value={message}
        onChange={e => setMessage(e.target.value)}
        onKeyPress={enterInput}
      />
      <Divider className={classes.divider} orientation="vertical" />
      <IconButton
        color="primary"
        className={classes.iconButton}
        aria-label="directions"
        onClick={() => {
          setMessage("");
          sendMessage(to, message);
        }}
      >
        <SendIcon />
      </IconButton>
    </Paper>
  );
}
