import React, { useState, useEffect } from "react";
import useInterval from "../hooks/useInterval";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import styled from "styled-components";
import BackNavbar from "../components/BackNavbar";
import { BallBeat } from "react-pure-loaders";
import { claimTokens, getClaimReward } from "../api/chatApi";

export default function ClaimTokens({ history }) {
  const [reward, setReward] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function initialReq() {
      let claim = await getClaimReward();
      setReward(claim);
    }
    initialReq();
  });

  useInterval(async () => {
    let claim = await getClaimReward();
    setReward(claim);
  }, 5000);

  return (
    <Layout>
      <BackNavbar history={history} />
      <Typography variant="h5" align="center" style={{ margin: 10 }}>
        You can claim {reward} tokens right now
      </Typography>
      <BallBeat loading={loading} color={"#111111"} />
      <Button
        variant="contained"
        color="primary"
        onClick={() => {
          claimTokens();
          if (reward > 0 && loading === false) {
            setLoading(true);
            setTimeout(() => {
              setLoading(false);
              history.goBack();
            }, 6000);
          }
        }}
      >
        Claim
      </Button>
    </Layout>
  );
}

const Layout = styled.div`
  display: grid;
  grid-auto-rows: auto;
  justify-items: center;
  grid-row-gap: 20px;
`;
