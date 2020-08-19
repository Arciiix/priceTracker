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

class ProductDialog extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: false,
      url: "",
      previousName: "",
      previousUrl: "",
      customName: "",
      hasTheInformationBeenFetched: false,
      price: 0,
      originalName: "",
      urlError: false,
    };
  }

  componentDidUpdate() {
    if (
      this.props.currentEditedProduct &&
      this.props.currentEditedProduct.url !== this.state.previousUrl &&
      this.props.currentEditedProduct.name !== this.state.previousName
    ) {
      this.setState({
        url: this.props.currentEditedProduct.url,
        previousUrl: this.props.currentEditedProduct.url,
        customName: this.props.currentEditedProduct.name,
        previousName: this.props.currentEditedProduct.name,
        hasTheInformationBeenFetched: false,
        urlError: false,
      });
    }
  }

  async fetchInfo() {
    this.setState({ isLoading: true });
    let request = await fetch(`${this.props.serverIp}/getTheProductInfo`, {
      method: "POST",
      body: JSON.stringify({ url: this.state.url }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (request.status !== 200) {
      this.setState({ urlError: true, isLoading: false });
      return;
    }
    let response = await request.json();
    this.setState({
      isLoading: false,
      urlError: false,
      hasTheInformationBeenFetched: true,
      price: response.price,
      originalName: response.originalName,
    });
  }

  async save() {
    let request = await fetch(`${this.props.serverIp}/getTheProductInfo`, {
      method: "POST",
      body: JSON.stringify({ url: this.state.url }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (request.status !== 200) {
      this.setState({ urlError: true });
      return;
    }
    this.props.hideTheDialog.bind(this.props.that, true, {
      changes: {
        url: this.state.url,
        customName: this.state.customName,
      },
    })();
  }

  render() {
    return (
      <Dialog fullScreen open={this.props.isOpened}>
        <AppBar>
          <Toolbar>
            <IconButton
              edge="start"
              color="inherit"
              aria-label="Zamknij"
              onClick={this.props.hideTheDialog.bind(this.props.that, false)}
            >
              <CloseIcon />
            </IconButton>
            <Typography variant="h6">
              {this.props.currentEditedProduct &&
              this.props.currentEditedProduct.url !== ""
                ? "Edytuj"
                : "Dodaj"}
            </Typography>
            <IconButton
              edge="end"
              color="inherit"
              aria-label="Zapisz"
              onClick={this.save.bind(this)}
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
          error={this.state.urlError}
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
            <span className="infoText">{this.state.price} zł</span>
          </div>
        </div>
      </Dialog>
    );
  }
}
export default ProductDialog;
