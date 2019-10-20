import React, { useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import InputBase from "@material-ui/core/InputBase";
import Divider from "@material-ui/core/Divider";
import IconButton from "@material-ui/core/IconButton";
import Typography from "@material-ui/core/Typography";
import AddIcon from "@material-ui/icons/Add";
import { addFriend, getAddress } from "../api/chatApi";

const useStyles = makeStyles(theme => ({
  root: {
    padding: "2px 4px",
    display: "flex",
    alignItems: "center",
    width: "70%",
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

export default function FriendInput({ friends, setFriends }) {
  const classes = useStyles();
  const [friend, setFriend] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setFriend(friend.replace(/[^0-9a-zA-Z]/g, ""));
  }, [friend]);

  function enterInput(e) {
    if (e.key === "Enter") {
      addFriendToLocal();
    }
  }

  async function addFriendToLocal() {
    let address = await getAddress(friend);
    if (address) {
      setError("");
      addFriend(friend);
      setFriends([...friends, { username: friend, address }]);
      localStorage.setItem(
        "friends",
        JSON.stringify([...friends, { username: friend, address }])
      );
    } else {
      setError("No address exists for that username");
    }
    setFriend("");
  }

  return (
    <>
      <Typography variant="inherit" color="error" style={{ minHeight: 25 }}>
        {error}
      </Typography>
      <Paper className={classes.root}>
        <InputBase
          className={classes.input}
          placeholder="Add a friend"
          inputProps={{ "aria-label": "friend" }}
          value={friend}
          onChange={e => setFriend(e.target.value)}
          onKeyPress={enterInput}
        />
        <Divider className={classes.divider} orientation="vertical" />
        <IconButton
          color="primary"
          className={classes.iconButton}
          aria-label="directions"
          onClick={() => addFriendToLocal()}
        >
          <AddIcon />
        </IconButton>
      </Paper>
    </>
  );
}
