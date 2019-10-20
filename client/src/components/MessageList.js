import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Link } from "react-router-dom";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import Divider from "@material-ui/core/Divider";
import ListItemText from "@material-ui/core/ListItemText";
import ListItemAvatar from "@material-ui/core/ListItemAvatar";
import Avatar from "@material-ui/core/Avatar";
import Typography from "@material-ui/core/Typography";
import moment from "moment";

const useStyles = makeStyles(theme => ({
  root: {
    width: "100%",
    maxWidth: "800px",
    backgroundColor: theme.palette.background.paper,
    margin: "auto",
    height: "80vh",
    overflow: "scroll"
  },
  inline: {
    display: "inline",
    wordBreak: "break-all"
  },
  padLeft: {
    paddingLeft: 20,
    float: "right"
  }
}));

const MessageList = ({ messages, link, onlyReceived, handle }) => {
  const classes = useStyles();
  messages.sort((a, b) => a.timestamp - b.timestamp).reverse();

  if (onlyReceived) {
    let thumbnails = [];
    messages = messages.filter(function(message) {
      if (!thumbnails.includes(message.handle) && message.handle !== handle) {
        thumbnails.push(message.handle);
        return true;
      }
      return false;
    });
  }

  return (
    <List className={classes.root}>
      {messages
        ? messages.map((message, i) =>
            link ? (
              <Link
                key={i}
                to={link ? `message/${message.handle}` : null}
                style={{ color: "black" }}
              >
                <ListItem alignItems="flex-start">
                  <ListItemAvatar>
                    <Avatar alt="Remy Sharp">
                      {message.handle.slice(0, 1).toUpperCase()}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <>
                        {message.handle}
                        <Typography
                          component="span"
                          color="textSecondary"
                          variant="body2"
                          className={classes.padLeft}
                        >
                          {moment(message.timestamp).fromNow(moment()) + " ago"}
                        </Typography>
                      </>
                    }
                    secondary={
                      <>
                        <Typography
                          component="span"
                          variant="body2"
                          className={classes.inline}
                          color="textPrimary"
                        >
                          {message.body}
                        </Typography>
                      </>
                    }
                  />
                </ListItem>
                {i < messages.length - 1 ? <Divider variant="middle" /> : <></>}
              </Link>
            ) : (
              <div key={i}>
                <ListItem alignItems="flex-start" key={i}>
                  <ListItemAvatar>
                    <Avatar alt="Remy Sharp">
                      {message.handle.slice(0, 1).toUpperCase()}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <>
                        {message.handle}
                        <Typography
                          component="span"
                          color="textSecondary"
                          variant="body2"
                          className={classes.padLeft}
                        >
                          {moment(message.timestamp).fromNow(moment()) + " ago"}
                        </Typography>
                      </>
                    }
                    secondary={
                      <>
                        <Typography
                          component="span"
                          variant="body2"
                          className={classes.inline}
                          color="textPrimary"
                        >
                          {message.body}
                        </Typography>
                      </>
                    }
                  />
                </ListItem>
                {i < messages.length - 1 ? <Divider variant="middle" /> : <></>}
              </div>
            )
          )
        : null}
    </List>
  );
};

export default MessageList;
