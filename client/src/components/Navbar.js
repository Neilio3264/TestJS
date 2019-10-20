import React from "react";
import { Link } from "react-router-dom";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Container from "@material-ui/core/Container";
import Tooltip from "@material-ui/core/Tooltip";
import IconButton from "@material-ui/core/IconButton";
import ChatIcon from "@material-ui/icons/Chat";
import AccountBalanceWalletIcon from "@material-ui/icons/AccountBalanceWallet";
import SettingsIcon from "@material-ui/icons/Settings";

const Navbar = ({ route }) => (
  <AppBar position="static" style={{ marginBottom: 10 }}>
    <Toolbar disableGutters>
      <Container style={{ display: "flex", justifyContent: "space-around" }}>
        <Tooltip id="tooltip-icon1" title="Messages">
          <Link to="/messages">
            <IconButton
              name="chat"
              aria-label="Open Chat"
              color="inherit"
              rel="noopener"
            >
              <ChatIcon />
            </IconButton>
          </Link>
        </Tooltip>
        <Tooltip id="tooltip-icon2" title="Wallet">
          <Link to="/wallet">
            <IconButton
              name="account"
              aria-label="Open Wallet"
              color="inherit"
              rel="noopener"
            >
              <AccountBalanceWalletIcon />
            </IconButton>
          </Link>
        </Tooltip>
        <Tooltip id="tooltip-icon3" title="Settings">
          <Link to="/settings">
            <IconButton
              name="settings"
              aria-label="Open Settings"
              color="inherit"
              rel="noopener"
            >
              <SettingsIcon />
            </IconButton>
          </Link>
        </Tooltip>
      </Container>
    </Toolbar>
  </AppBar>
);

export default Navbar;
