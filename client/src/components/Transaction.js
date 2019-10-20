import React from "react";
import styled from "styled-components";
import moment from "moment";

const Transaction = ({ tx }) => {
  return (
    <Layout>
      <Type> Type: {tx.type} </Type>
      <Id> TxId: {tx.txId} </Id>
      <Src> From: {tx.srcAcc} </Src>
      <Tgt> To: {tx.tgtAcc} </Tgt>
      <Time> {moment(tx.timestamp).fromNow(moment())} ago </Time>
      <Amount> Amount: {tx.amount} </Amount>
    </Layout>
  );
};

export default Transaction;

const Layout = styled.div`
  height: 200px;
  display: grid;
  grid-template-areas:
    "time time type type"
    "src src src src"
    "tgt tgt tgt tgt"
    "amount amount id id";
  background: black;
  color: white;
  padding: 20px;
  margin: 30px;
`;

const Type = styled.p`
  grid-area: type;
`;

const Id = styled.p`
  grid-area: id;
`;

const Src = styled.p`
  grid-area: src;
`;

const Tgt = styled.p`
  grid-area: tgt;
`;

const Time = styled.p`
  grid-area: time;
`;

const Amount = styled.p`
  grid-area: amount;
`;
