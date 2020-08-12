import React from "react";
import {
  Backdrop,
  Dialog,
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  TextField,
  Button,
  CircularProgress,
} from "@material-ui/core";

import CloseIcon from "@material-ui/icons/Close";
import SaveIcon from "@material-ui/icons/Save";
import CreateIcon from "@material-ui/icons/Create";
import LocalOfferIcon from "@material-ui/icons/LocalOffer";

import "../Styles/Home.css";

class EditDialog extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: false,
      url: "",
      customName: "",
      hasTheInformationBeenFetched: false,
      price: 0,
      originalName: "",
    };
  }

  componentDidUpdate() {
    //DEV
    console.log(this.props.currentEditedProduct);
  }

  fetchInfo() {
    this.setState({ isLoading: true });
    //DEV
    //Fetch the info
    let price = 233;
    let name = "testowa nazwa";
    this.setState({
      isLoading: false,
      hasTheInformationBeenFetched: true,
      price: price,
      originalName: name,
    });
  }

  render() {
    return (
      <Dialog fullScreen open={this.props.isEditing}>
        <AppBar>
          <Toolbar>
            <IconButton
              edge="start"
              color="inherit"
              aria-label="Zamknij"
              onClick={this.props.turnOffEditMode.bind(this.props.that, false)}
            >
              <CloseIcon />
            </IconButton>
            <Typography variant="h6">Edytuj</Typography>
            <IconButton
              edge="end"
              color="inherit"
              aria-label="Zapisz"
              onClick={this.props.turnOffEditMode.bind(this.props.that, true, {
                changes: {
                  url: this.state.url,
                  customName: this.state.customName,
                },
              })}
            >
              <SaveIcon />
            </IconButton>
          </Toolbar>
        </AppBar>
        <Backdrop open={this.state.isLoading} style={{ zIndex: 9999 }}>
          <CircularProgress color="inherit" />
        </Backdrop>

        <TextField
          variant="outlined"
          label="URL"
          style={{ width: "75%" }}
          value={this.state.url}
          required
          onChange={(e) => {
            this.setState({ url: e.target.value });
          }}
        />
        <TextField
          variant="outlined"
          label="Niestandardowa nazwa"
          style={{ marginTop: 25, width: "75%" }}
          value={this.state.customName}
          onChange={(e) => {
            this.setState({ customName: e.target.value });
          }}
        />
        <Button
          variant="contained"
          color="primary"
          style={{ marginTop: 30 }}
          onClick={this.fetchInfo.bind(this)}
        >
          Pobierz informacje
        </Button>
        <div
          style={{
            display: this.state.hasTheInformationBeenFetched ? "flex" : "none",
            flexDirection: "column",
            marginTop: 100,
          }}
        >
          <div className="infoRow">
            <CreateIcon fontSize="inherit" />
            <span className="infoText">{this.state.originalName}</span>
          </div>
          <div className="infoRow">
            <LocalOfferIcon fontSize="inherit" />
            <span className="infoText">{this.state.price}</span>
          </div>
        </div>
      </Dialog>
    );
  }
}
export default EditDialog;
