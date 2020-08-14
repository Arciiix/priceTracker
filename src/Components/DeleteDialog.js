import React from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@material-ui/core";

class DeleteDialog extends React.Component {
  delete() {
    this.props.deleteFunc.apply(this.props.that, [this.props.productsToDelete]);
  }
  closeDialog() {
    this.props.close.apply(this.props.that);
  }
  render() {
    return (
      <Dialog open={this.props.isOpened} onClose={this.closeDialog.bind(this)}>
        <DialogTitle>
          <span style={{ fontSize: 25 }}>Usunąć?</span>
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Czy na pewno chcesz usunąć{" "}
            {this.props.productsToDelete.length === 1
              ? "ten produkt?"
              : `te produkty? (${this.props.productsToDelete.length})`}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            variant="contained"
            color="primary"
            onClick={this.closeDialog.bind(this)}
          >
            Anuluj
          </Button>
          <Button
            variant="contained"
            color="secondary"
            autoFocus
            onClick={() => {
              this.delete();
              this.closeDialog();
            }}
          >
            Usuń
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}
export default DeleteDialog;
