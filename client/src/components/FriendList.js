import React from "react";
import { Link } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";
import ListItemText from "@material-ui/core/ListItemText";
import ListItemAvatar from "@material-ui/core/ListItemAvatar";
import Tooltip from "@material-ui/core/Tooltip";
import Avatar from "@material-ui/core/Avatar";
import IconButton from "@material-ui/core/IconButton";
import BlockIcon from "@material-ui/icons/Block";
import LocalPrintshopIcon from "@material-ui/icons/LocalPrintshop";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { removeFriend } from "../api/chatApi";

const useStyles = makeStyles(theme => ({
  root: {
    width: "85%",
    backgroundColor: theme.palette.background.paper,
    marginTop: 30,
    height: "62vh",
    overflow: "scroll"
  }
}));

export default function FriendList({ friends, setFriends }) {
  const classes = useStyles();
  const [copyText, setCopyText] = React.useState("Copy address");

  function removeFriendFromLocal(username) {
    removeFriend(username);
    friends = friends.filter(friend => friend.username !== username);
    setFriends(friends);
    localStorage.setItem("friends", JSON.stringify(friends));
  }

  return (
    <List dense className={classes.root}>
      {friends &&
        friends.map(friend => {
          const labelId = `checkbox-list-secondary-label-${friend.username}`;
          return (
            <ListItem key={friend.address} button>
              <Link
                to={`../message/${friend.username}`}
                style={{ color: "black" }}
              >
                <ListItemAvatar>
                  <Avatar>{friend.username.slice(0, 1).toUpperCase()}</Avatar>
                </ListItemAvatar>
              </Link>

              <ListItemText
                id={labelId}
                primary={friend.username}
                secondary={friend.address.slice(0, 10) + "..."}
              />
              <ListItemSecondaryAction>
                <Tooltip id="copy-address" title={copyText}>
                  <CopyToClipboard text={friend.address}>
                    <IconButton
                      name="copy"
                      aria-label="Copy Address"
                      color="inherit"
                      rel="noopener"
                      onClick={() => {
                        setCopyText(`Copied to clipboard!`);
                        setTimeout(() => setCopyText("Copy address"), 1000);
                      }}
                    >
                      <LocalPrintshopIcon />
                    </IconButton>
                  </CopyToClipboard>
                </Tooltip>
                <Tooltip
                  id="remove-friend"
                  title={`Remove ${friend.username} from your friends list`}
                >
                  <IconButton
                    name="remove"
                    aria-label="Remove friend"
                    color="inherit"
                    rel="noopener"
                    onClick={() => removeFriendFromLocal(friend.username)}
                  >
                    <BlockIcon />
                  </IconButton>
                </Tooltip>
              </ListItemSecondaryAction>
            </ListItem>
          );
        })}
    </List>
  );
}
