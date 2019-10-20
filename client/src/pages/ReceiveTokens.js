import React, { useState } from "react";
import BackNavbar from "../components/BackNavbar";
import styled from "styled-components";
import QRCode from "qrcode.react";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import { CopyToClipboard } from "react-copy-to-clipboard";
import Tooltip from "@material-ui/core/Tooltip";

export default function ReceiveTokens({ history }) {
  const [publicKey] = useState(
    JSON.parse(localStorage.getItem("wallet")).publicKey
  );
  const [tooltip, setTooltip] = useState("Copy to clipboard");

  return (
    <Layout>
      <BackNavbar history={history} />
      <Typography variant="h4" color="primary">
        Recieve
      </Typography>
      <Typography
        variant="body1"
        color="inherit"
        style={{ wordBreak: "break-all", margin: 20 }}
      >
        {publicKey}
      </Typography>
      <QRCode value={publicKey} />
      <Tooltip id="copy-address" title={tooltip}>
        <CopyToClipboard text={publicKey}>
          <Button
            variant="contained"
            color="primary"
            style={{ marginBottom: 40 }}
            onClick={() => {
              setTooltip("Copied to clipboard!");
              setTimeout(() => setTooltip("Copy to clipboard"), 1000);
            }}
          >
            COPY
          </Button>
        </CopyToClipboard>
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
