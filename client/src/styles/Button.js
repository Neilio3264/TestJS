import React from "react";
import {
  createMuiTheme,
  withStyles,
  makeStyles
} from "@material-ui/core/styles";
import { ThemeProvider } from "@material-ui/styles";
import Button from "@material-ui/core/Button";
import { blue, purple } from "@material-ui/core/colors";

const ColorButton = withStyles(theme => ({
  root: {
    color: theme.palette.getContrastText(purple[500]),
    backgroundColor: purple[500],
    "&:hover": {
      backgroundColor: purple[700]
    }
  }
}))(Button);

const useStyles = makeStyles(theme => ({
  margin: {
    margin: theme.spacing(1)
  }
}));

export function PurpleButton() {
  const classes = useStyles();
  return (
    <ColorButton variant="contained" color="primary" className={classes.margin}>
      Custom CSS
    </ColorButton>
  );
}

export function BlueButton() {
  const classes = useStyles();
  return (
    <ColorButton variant="contained" color="primary" className={classes.margin}>
      Custom CSS
    </ColorButton>
  );
}
