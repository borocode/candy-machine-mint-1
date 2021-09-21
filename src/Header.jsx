import React from "react";
import { AppBar, Toolbar, Typography, Button } from "@material-ui/core";
import AcUnitRoundedIcon from "@material-ui/icons/AcUnitRounded";
import AttachMoneyIcon from '@material-ui/icons/AttachMoney';
import { makeStyles } from "@material-ui/styles";
// These imports are needed for the Dialog
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import { createTheme, ThemeProvider, withStyles } from '@material-ui/core/styles';

// Icons
import TwitterIcon from "./assets/img/twitter.png";
import DiscordIcon from "./assets/img/discord.png"



const useStyles = makeStyles(() => ({
  typographyStyles: {
    flex: 1
  }
}));

const darkTheme = createTheme({
  palette: {
    type: 'dark',
  },
});

const Header = () => {

  const classes = useStyles();
  return (
    <ThemeProvider theme={darkTheme}>
        <AppBar position="relative" color="transparent">
          <Toolbar>

            <Typography>
              <Button size="medium" href="https://twitter.com/SOLSTATIONNFT" target="_blank">
                <img src={TwitterIcon} height = "30px" alt="SOLSTATIONNFT TWITTER" fullWidth={false} />
              </Button>
            {/*   <Button size="small" href="https://discord.gg/" target="_blank">
                <img src={DiscordIcon} height = "24px" />
              </Button>  */}
            </Typography>

            <div>
                <Button variant="contained" size="large" fullWidth={false} href="/" style={{textTransform: 'none'}} >
                  HOME
                </Button>
            </div>


            <div>
                <Button variant="outlined" size="large" color="info" href="https://solstation.boroghor.com" style={{textTransform: 'none'}}>
                  SOLSTATION MINI COLLECTION
                </Button>
            </div>

           </Toolbar>
        </AppBar>
    </ThemeProvider>


  );
};

export default Header;
