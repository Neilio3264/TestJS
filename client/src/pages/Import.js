import React, { useState, useEffect } from "react";
import clsx from "clsx";
import BackNavbar from "../components/BackNavbar";
import styled from "styled-components";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import Tooltip from "@material-ui/core/Tooltip";
import { makeStyles } from "@material-ui/core/styles";
import { importWallet } from "../api/chatApi";
import IconButton from "@material-ui/core/IconButton";
import InputAdornment from "@material-ui/core/InputAdornment";
import TextField from "@material-ui/core/TextField";
import Visibility from "@material-ui/icons/Visibility";
import VisibilityOff from "@material-ui/icons/VisibilityOff";

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
  },
  margin: {
    margin: theme.spacing(1)
  },
  textField: {
    flexBasis: 200,
    width: "70%"
  }
}));

export default function Import({ history }) {
  const classes = useStyles();
  const [tooltip, setTooltip] = useState("Import secret key");
  const [secretKey, setSecretKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (secretKey && secretKey.length !== 128) {
      setError("Invalid secret key length");
    } else {
      setError("");
    }
  }, [secretKey]);

  const handleClickShowPassword = () => {
    setShowKey(!showKey);
  };

  const handleMouseDownPassword = event => {
    event.preventDefault();
  };

  return (
    <Layout>
      <BackNavbar history={history} />
      <Typography variant="h4" color="primary">
        Import
      </Typography>
      <Typography variant="body1" color="error" style={{ minHeight: 25 }}>
        {error}
      </Typography>
      <TextField
        id="outlined-adornment-password"
        className={clsx(classes.margin, classes.textField)}
        variant="outlined"
        type={showKey ? "text" : "password"}
        label="Secret key"
        value={secretKey}
        onChange={e => setSecretKey(e.target.value)}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                edge="end"
                aria-label="toggle password visibility"
                onClick={handleClickShowPassword}
                onMouseDown={handleMouseDownPassword}
              >
                {showKey ? <Visibility /> : <VisibilityOff />}
              </IconButton>
            </InputAdornment>
          )
        }}
      />
      <Tooltip id="import-account" title={tooltip}>
        <Button
          variant="contained"
          color="primary"
          style={{ marginBottom: 40 }}
          onClick={() => {
            importWallet(secretKey);
            setTooltip("Imported account!");
            setTimeout(() => history.push("../wallet"), 1000);
          }}
        >
          Import
        </Button>
      </Tooltip>
    </Layout>
  );
}

const Layout = styled.div`
  display: grid;
  justify-items: center;
  grid-row-gap: 40px;
  overflow: auto;
`;
