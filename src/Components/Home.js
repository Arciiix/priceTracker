import React from "react";
import {
  Dialog,
  AppBar,
  Toolbar,
  IconButton,
  Typography,
} from "@material-ui/core";

import CloseIcon from "@material-ui/icons/Close";
import SaveIcon from "@material-ui/icons/Save";

import MaterialTable from "material-table";

import "../Styles/Home.css";

const translation = {
  body: {
    emptyDataSourceMessage: "Nie znaleziono żadnych produktów!",
    editRow: {
      deleteText: "Czy na pewno chcesz usunąć ten produkt?",
    },
  },
  toolbar: {
    searchPlaceholder: "Szukaj...",
    searchTooltip: "Szukaj",
    nRowsSelected: "Zaznaczone wiersze: {0}",
  },
  header: {
    actions: "Operacje",
  },
  pagination: {
    labelDisplayedRows: "{to} z {count}",
    firstTooltip: "Pierwsza strona",
    firstAriaLabel: "Pierwsza strona",
    previousTooltip: "Poprzednia strona",
    previousAriaLabel: "Poprzednia strona",
    nextTooltip: "Następna strona",
    nextAriaLabel: "Następna strona",
    lastTooltip: "Ostatnia strona",
    lastAriaLabel: "Ostatnia strona",
    labelRowsSelect: "wierszy",
  },
};

let h =
  window.innerHeight ||
  document.documentElement.clientHeight ||
  document.body.clientHeight;

let numberOfRows = Math.floor((h - 200) / 50);

class Home extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      products: [],
      isLoading: true,
      isEditing: false,
      currentEditedProduct: null,
    };
  }

  componentDidMount() {
    //DEV
    this.setState(
      {
        products: [
          { id: 1, name: "test", shop: "test1", price: 123 },
          { id: 2, name: "test2", shop: "test3", price: 423.3 },
          { id: 3, name: "test", shop: "test1", price: 123 },
          { id: 4, name: "test2", shop: "test3", price: 423.3 },
          { id: 5, name: "test", shop: "test1", price: 123 },
          { id: 6, name: "test2", shop: "test3", price: 423.3 },
          { id: 7, name: "test", shop: "test1", price: 123 },
          { id: 8, name: "test2", shop: "test3", price: 423.3 },
          { id: 9, name: "test", shop: "test1", price: 123 },
          { id: 10, name: "test2", shop: "test3", price: 423.3 },
          { id: 11, name: "test", shop: "test1", price: 123 },
          { id: 12, name: "test2", shop: "test3", price: 423.3 },
          { id: 13, name: "test", shop: "test1", price: 123 },
          { id: 14, name: "test2", shop: "test3", price: 423.3 },
          { id: 15, name: "test", shop: "test1", price: 123 },
          { id: 16, name: "test2", shop: "test3", price: 423.3 },
          { id: 17, name: "test", shop: "test1", price: 123 },
          { id: 18, name: "test2", shop: "test3", price: 423.3 },
          { id: 19, name: "test", shop: "test1", price: 123 },
          { id: 20, name: "test2", shop: "test3", price: 423.3 },
        ],
        isLoading: false,
      },
      this.forceUpdate
    );
  }

  deleteProducts(ids) {
    //DEV
    //ids are indexes of the items in database
    console.log(`Products to delete: ${ids.join(", ")}`);

    let productsArray = this.state.products;
    ids.forEach((elem) => {
      productsArray = productsArray.filter((e) => e.id !== elem);
    });
    this.setState({ products: productsArray });
  }

  saveTheChanges() {
    //DEV
    this.setState({ isEditing: false });
  }

  render() {
    return (
      <div className="container">
        <Dialog fullScreen open={this.state.isEditing}>
          <AppBar>
            <Toolbar>
              <IconButton
                edge="start"
                color="inherit"
                aria-label="Zamknij"
                onClick={() => {
                  this.setState({ isEditing: false });
                }}
              >
                <CloseIcon />
              </IconButton>
              <Typography variant="h6">Edytuj</Typography>
              <IconButton
                edge="end"
                color="inherit"
                aria-label="Zapisz"
                onClick={this.saveTheChanges.bind(this)}
              >
                <SaveIcon />
              </IconButton>
            </Toolbar>
          </AppBar>
        </Dialog>
        <MaterialTable
          isLoading={this.state.isLoading}
          localization={translation}
          title="Basic Selection Preview"
          columns={[
            { title: "Nazwa", field: "name" },
            { title: "Sklep", field: "shop" },
            {
              title: "Cena",
              field: "price",
              currencySetting: {
                locale: "PL-pl",
                currencyCode: "PLN",
                minimumFractionDigits: 0,
                maximumFractionDigits: 2,
              },
              type: "currency",
            },
          ]}
          data={this.state.products}
          options={{
            selection: true,
            showTitle: false,
            actionsColumnIndex: -1,
            pageSizeOptions: [
              this.state.products.length,
              5,
              10,
              20,
              40,
              50,
              75,
              100,
              200,
              500,
            ],
            pageSize: numberOfRows,
          }}
          actions={[
            {
              tooltip: "Usuń zaznaczone produkty",
              icon: "delete",
              onClick: (e, data) => {
                this.deleteProducts(data.map((e) => e.id));
              },
            },
            {
              tooltip: "Edytuj ten produkt",
              icon: "edit",
              position: "row",
              onClick: (e, data) => {
                this.setState({
                  currentEditedProduct: this.state.products[data.tableData.id],
                  isEditing: true,
                });
              },
            },
          ]}
        />
      </div>
    );
  }
}

export default Home;
