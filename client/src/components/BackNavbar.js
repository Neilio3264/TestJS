import React from "react";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Tooltip from "@material-ui/core/Tooltip";
import IconButton from "@material-ui/core/IconButton";
import ArrowBackIcon from "@material-ui/icons/ArrowBack";

export default function BackNavbar({ history }) {
  return (
    <AppBar position="static" style={{ marginBottom: 10 }}>
      <Toolbar disableGutters>
        <Tooltip id="tooltip-icon1" title="Back">
          <IconButton
            name="back"
            aria-label="Go Back"
            color="inherit"
            rel="noopener"
            onClick={() => history.goBack()}
          >
            <ArrowBackIcon />
          </IconButton>
        </Tooltip>
      </Toolbar>
    </AppBar>
  );
}
