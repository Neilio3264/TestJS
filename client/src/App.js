import React from "react";
import { BrowserRouter, Route, Switch, Redirect } from "react-router-dom";
import Main from "./pages/Main";
import Signup from "./pages/Signup";
import Messages from "./pages/Messages";
import SendMessage from "./pages/SendMessage";
import Message from "./pages/Message";
import Wallet from "./pages/Wallet";
import Settings from "./pages/Settings";
import Register from "./pages/Register";
import Toll from "./pages/Toll";
import Friends from "./pages/Friends";
import Export from "./pages/Export";
import Import from "./pages/Import";
import Network from "./pages/Network";
import SendTokens from "./pages/SendTokens";
import ReceiveTokens from "./pages/ReceiveTokens";
import ClaimTokens from "./pages/ClaimTokens";

const App = () => (
  <BrowserRouter>
    <>
      <Switch>
        <Route exact path="/" component={Main} />
        <Route exact path="/register" component={Register} />
        <Route exact path="/signup" component={Signup} />
        <PrivateRoute exact path="/messages" component={Messages} />
        <PrivateRoute exact path="/messages/send" component={SendMessage} />
        <PrivateRoute exact path="/message/:user" component={Message} />
        <PrivateRoute exact path="/wallet" component={Wallet} />
        <PrivateRoute exact path="/wallet/send" component={SendTokens} />
        <PrivateRoute exact path="/wallet/receive" component={ReceiveTokens} />
        <PrivateRoute exact path="/wallet/claim" component={ClaimTokens} />
        <PrivateRoute exact path="/settings" component={Settings} />
        <PrivateRoute exact path="/settings/toll" component={Toll} />
        <PrivateRoute exact path="/settings/friends" component={Friends} />
        <PrivateRoute exact path="/settings/export" component={Export} />
        <PrivateRoute exact path="/settings/network" component={Network} />
        <Route exact path="/settings/import" component={Import} />
      </Switch>
    </>
  </BrowserRouter>
);

function PrivateRoute({ component: Component, ...rest }) {
  return (
    <Route
      {...rest}
      render={props =>
        localStorage.getItem("wallet") ? (
          <Component {...props} />
        ) : (
          <Redirect
            to={{
              pathname: "/",
              state: { from: props.location }
            }}
          />
        )
      }
    />
  );
}

export default App;
