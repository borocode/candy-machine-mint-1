import "./Home.css";
import { useEffect, useState } from "react";
import styled from "styled-components";
import Countdown from "react-countdown";
import { Button, CircularProgress, Snackbar } from "@material-ui/core";
import Alert from "@material-ui/lab/Alert";
import { createTheme, ThemeProvider } from '@material-ui/core/styles';
import { responsiveFontSizes } from '@mui/material/styles';
import Typography from "@material-ui/core/Typography";
import background from "./assets/img/background.png"
import { Grid } from "@material-ui/core";
import { withStyles } from "@material-ui/core/styles";
import Header from "./Header";
import * as React from 'react';
import Box from '@mui/material/Box';

import * as anchor from "@project-serum/anchor";

import { LAMPORTS_PER_SOL } from "@solana/web3.js";

import { useWallet } from "@solana/wallet-adapter-react";
import { WalletDialogButton } from "@solana/wallet-adapter-material-ui";

import {
  CandyMachine,
  awaitTransactionSignatureConfirmation,
  getCandyMachineState,
  mintOneToken,
  shortenAddress,
} from "./candy-machine";
import { YoutubeSearchedFor } from "@material-ui/icons";
import shadows from "@material-ui/core/styles/shadows";

const ConnectButton = styled(WalletDialogButton)``;

const CounterText = styled.span``; // add your styles here

const MintContainer = styled.div``; // add your styles here

const MintButton = styled(Button)``; // add your styles here

const darkTheme = createTheme({
  palette: {
    type: 'dark',
  },
});

const theme = createTheme();

// theme.typography.h3 = {
//   fontSize: '1.2rem',
//   '@media (min-width:600px)': {
//     fontSize: '15rem',
//   },
//   [theme.breakpoints.up('md')]: {
//     fontSize: '2rem',
//   },
// };

const styles = {
  paperContainer: {
    backgroundImage: './assets/img/background.png',
  },
}

const WhiteTextTypography = withStyles({
  root: {
    color: "#FFFFFF",
    textAlign: 'center',
    fontSize: '4rem',
  '@media (min-width:600px)': {
    fontSize: '7rem',
  },
  [theme.breakpoints.up('md')]: {
    fontSize: '11rem',
  },
    /*shadows: "0 3px 5px 2px rgba(255, 105, 135, 0.3)"
    fonts*/
  }
})(Typography);

const SmallWhiteTextTypography = withStyles({
  root: {
    color: "#FFFFFF",
    fontSize: '1.4rem'
  /*  fonts*/
  }
})(Typography);

const GreyTextTypography = withStyles({
  root: {
    color: "#E0E0E0"
  }
})(Typography);

export interface HomeProps {
  candyMachineId: anchor.web3.PublicKey;
  config: anchor.web3.PublicKey;
  connection: anchor.web3.Connection;
  startDate: number;
  treasury: anchor.web3.PublicKey;
  txTimeout: number;
}



const Home = (props: HomeProps) => {
  const [balance, setBalance] = useState<number>();
  const [isActive, setIsActive] = useState(false); // true when countdown completes
  const [isSoldOut, setIsSoldOut] = useState(false); // true when items remaining is zero
  const [isMinting, setIsMinting] = useState(false); // true when user got to press MINT
  const [counter, setCounter] = useState<any>({});
  const [price, setPrice] = useState<number | null>(null);


  const [alertState, setAlertState] = useState<AlertState>({
    open: false,
    message: "",
    severity: undefined,
  });

  const [startDate, setStartDate] = useState(new Date(props.startDate));

  const wallet = useWallet();
  const [candyMachine, setCandyMachine] = useState<CandyMachine>();

  const onMint = async () => {
    try {
      setIsMinting(true);
      if (wallet.connected && candyMachine?.program && wallet.publicKey) {
        const mintTxId = await mintOneToken(
          candyMachine,
          props.config,
          wallet.publicKey,
          props.treasury
        );

        const status = await awaitTransactionSignatureConfirmation(
          mintTxId,
          props.txTimeout,
          props.connection,
          "singleGossip",
          false
        );

        if (!status?.err) {
          setAlertState({
            open: true,
            message: "Congratulations! Mint succeeded!",
            severity: "success",
          });
        } else {
          setAlertState({
            open: true,
            message: "Mint failed! Please try again!",
            severity: "error",
          });
        }
      }
    } catch (error: any) {
      // TODO: blech:
      let message = error.msg || "Minting failed! Please try again!";
      if (!error.msg) {
        if (error.message.indexOf("0x138")) {
        } else if (error.message.indexOf("0x137")) {
          message = `SOLD OUT!`;
        } else if (error.message.indexOf("0x135")) {
          message = `Insufficient funds to mint. Please fund your wallet.`;
        }
      } else {
        if (error.code === 311) {
          message = `SOLD OUT!`;
          setIsSoldOut(true);
        } else if (error.code === 312) {
          message = `Minting period hasn't started yet.`;
        }
      }

      setAlertState({
        open: true,
        message,
        severity: "error",
      });
    } finally {
      if (wallet?.publicKey) {
        const balance = await props.connection.getBalance(wallet?.publicKey);
        setBalance(balance / LAMPORTS_PER_SOL);
      }
      setIsMinting(false);
    }
  };

  useEffect(() => {
    (async () => {
      if (wallet?.publicKey) {
        const balance = await props.connection.getBalance(wallet.publicKey);
        setBalance(balance / LAMPORTS_PER_SOL);
      }
    })();
  }, [wallet, props.connection]);

  useEffect(() => {
    (async () => {
      if (
        !wallet ||
        !wallet.publicKey ||
        !wallet.signAllTransactions ||
        !wallet.signTransaction
      ) {
        return;
      }

      const anchorWallet = {
        publicKey: wallet.publicKey,
        signAllTransactions: wallet.signAllTransactions,
        signTransaction: wallet.signTransaction,
      } as anchor.Wallet;

      const { candyMachine, goLiveDate, itemsRemaining, itemsAvailable, price } =
        await getCandyMachineState(
          anchorWallet,
          props.candyMachineId,
          props.connection
        );

      setIsSoldOut(itemsRemaining === 0);
      setStartDate(goLiveDate);
      setCandyMachine(candyMachine);
      setCounter({
        itemsRemaining,
        itemsAvailable
      });
      setPrice(price);
    })();
  }, [wallet, props.candyMachineId, props.connection]);

  return (
    <main>
    <Grid item>
      <Header />
        </Grid>
      <ThemeProvider theme={darkTheme}>
        <Typography align="center"><img src={background} alt="SOLSTATION PIXEL CONTACT SHEET" width="100%" resizeMode="center" position="relative"/></Typography><br />

        <WhiteTextTypography variant="h3" align="center" position="relative">
          SOLSTATION PIXEL <br />
                 </WhiteTextTypography>




         <SmallWhiteTextTypography align="center" variant="body1">
          <p> {counter.itemsRemaining} of {counter.itemsAvailable} left </p>
        </SmallWhiteTextTypography>

        <SmallWhiteTextTypography align="center" variant="body1">{wallet.connected && (
          <p>your balance: {(balance || 0).toLocaleString()} SOL</p>
        )}</SmallWhiteTextTypography>   

        
        <SmallWhiteTextTypography align="center" variant="body1">{wallet.connected && (
          <p>your addy: {shortenAddress(wallet.publicKey?.toBase58() || "")}</p>
        )}</SmallWhiteTextTypography>

{/* 
        <SmallWhiteTextTypography align="center" variant="body1">
          <p>how many left? {counter.itemsRemaining} </p>
        </SmallWhiteTextTypography> */}


        <Typography align="center" variant="body1">
        <MintContainer>
          {!wallet.connected ? (
            <ConnectButton>Connect Wallet</ConnectButton>
          ) : (
            <MintButton
              disabled={isSoldOut || isMinting || !isActive}
              onClick={onMint}
              variant="contained"
            >
              {isSoldOut ? (
                "SOLD OUT"
              ) : isActive ? (
                isMinting ? (
                  <CircularProgress />
                ) : (
                  `${price} SOL`
                )
              ) : (
                <Countdown
                  date={startDate}
                  onMount={({ completed }) => completed && setIsActive(true)}
                  onComplete={() => setIsActive(true)}
                  renderer={renderCounter}
                />
              )}
            </MintButton>
          )}
        </MintContainer>
        </Typography>

        <Grid container direction="column">
          <Grid item container>
          <Grid item xs={false} sm={1} />
            <Grid item xs={12} sm={4} alignItems="stretch">
              <SmallWhiteTextTypography variant="h6" align="center">
              <br />What is this? <br />
              </SmallWhiteTextTypography>
              <GreyTextTypography variant="body1" align="center">
                art
                <br />
                mint it or don't <br />
                idek if I wanna list these on digitaleyes<br /><br />
                
              </GreyTextTypography>
            </Grid>

            <Grid item xs={false} sm={2}/>

            <Grid item xs={12} sm={4} alignItems="stretch">
              <SmallWhiteTextTypography variant="h6" align="center">
              <br />What's next? <br />
              </SmallWhiteTextTypography>
              <GreyTextTypography variant="body1" align="center">
                {/* Still dropping animated SOLSTATION MINI  <br /><br />
                collection one by one <Button variant="text" 
                href="solstation.boroghor.com" 
                style={{textTransform: 'none'}}>at my Metaplex instance.  
                </Button>*/} RARE ROCK <br />2️⃣❌💯<br /><br /><br /><br />
              </GreyTextTypography>
            </Grid>

            {/* <Grid item xs={false} sm={1} /> */}

          </Grid>
        </Grid>


        <Snackbar
          open={alertState.open}
          autoHideDuration={6000}
          onClose={() => setAlertState({ ...alertState, open: false })}
        >
          <Alert
            onClose={() => setAlertState({ ...alertState, open: false })}
            severity={alertState.severity}
          >
            {alertState.message}
          </Alert>
        </Snackbar>
      </ThemeProvider>
    </main>
  );
};

interface AlertState {
  open: boolean;
  message: string;
  severity: "success" | "info" | "warning" | "error" | undefined;
}

const renderCounter = ({ days, hours, minutes, seconds, completed }: any) => {
  return (
    <CounterText>
      {hours} hours, {minutes} minutes, {seconds} seconds
    </CounterText>
  );
};

export default Home;
