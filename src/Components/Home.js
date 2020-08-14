import React from "react";
import MaterialTable from "material-table";

import "../Styles/Home.css";
import ProductDialog from "./ProductDialog";
import DeleteDialog from "./DeleteDialog";

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
      isDialogOpened: false,
      currentEditedProduct: null,
      askDelete: false,
      idsToDelete: [],
    };
  }

  componentDidMount() {
    //DEV
    this.setState(
      {
        products: [
          {
            id: 1,
            name: "test",
            shop: "test1",
            price: 123,
            url: "http://example.com",
          },
          {
            id: 2,
            name: "test2",
            shop: "test3",
            price: 423.3,
            url: "http://example1.com",
          },
          {
            id: 3,
            name: "test",
            shop: "test1",
            price: 123,
            url: "http://example2.com",
          },
          {
            id: 4,
            name: "test2",
            shop: "test3",
            price: 423.3,
            url: "http://example3.com",
          },
          {
            id: 5,
            name: "test",
            shop: "test1",
            price: 123,
            url: "http://example1.com",
          },
          {
            id: 6,
            name: "test",
            shop: "test1",
            price: 123,
            url: "http://example.com",
          },
          {
            id: 7,
            name: "test2",
            shop: "test3",
            price: 423.3,
            url: "http://example1.com",
          },
          {
            id: 8,
            name: "test",
            shop: "test1",
            price: 123,
            url: "http://example2.com",
          },
          {
            id: 9,
            name: "test2",
            shop: "test3",
            price: 423.3,
            url: "http://example3.com",
          },
          {
            id: 10,
            name: "test",
            shop: "test1",
            price: 123,
            url: "http://example1.com",
          },
          {
            id: 11,
            name: "test",
            shop: "test1",
            price: 123,
            url: "http://example.com",
          },
          {
            id: 12,
            name: "test2",
            shop: "test3",
            price: 423.3,
            url: "http://example1.com",
          },
          {
            id: 13,
            name: "test",
            shop: "test1",
            price: 123,
            url: "http://example2.com",
          },
          {
            id: 14,
            name: "test2",
            shop: "test3",
            price: 423.3,
            url: "http://example3.com",
          },
          {
            id: 15,
            name: "test",
            shop: "test1",
            price: 123,
            url: "http://example1.com",
          },
          {
            id: 16,
            name: "test",
            shop: "test1",
            price: 123,
            url: "http://example.com",
          },
          {
            id: 17,
            name: "test2",
            shop: "test3",
            price: 423.3,
            url: "http://example1.com",
          },
          {
            id: 18,
            name: "test",
            shop: "test1",
            price: 123,
            url: "http://example2.com",
          },
          {
            id: 19,
            name: "test2",
            shop: "test3",
            price: 423.3,
            url: "http://example3.com",
          },
          {
            id: 20,
            name: "test",
            shop: "test1",
            price: 123,
            url: "http://example1.com",
          },
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

  saveTheChanges(changes) {
    if (this.state.currentEditedProduct.id) {
      //DEV
      console.log("Save the changes");
      console.log(changes);
    } else {
      console.log("Create the new product");
      console.log(changes);
    }

    this.setState({ isDialogOpened: false, currentEditedProduct: null });
  }

  render() {
    return (
      <div className="container">
        <ProductDialog
          isOpened={this.state.isDialogOpened}
          currentEditedProduct={this.state.currentEditedProduct}
          that={this}
          hideTheDialog={(shouldSaveTheChanges, changes) => {
            if (shouldSaveTheChanges) {
              this.saveTheChanges(changes);
            }
            this.setState({ isDialogOpened: false });
          }}
        />
        <DeleteDialog
          isOpened={this.state.askDelete}
          that={this}
          productsToDelete={this.state.idsToDelete}
          deleteFunc={this.deleteProducts}
          close={() => {
            this.setState({ askDelete: false });
          }}
        />

        <MaterialTable
          isLoading={this.state.isLoading}
          localization={translation}
          title="Price tracker"
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
            exportButton: true,
            exportAllData: true,
            exportFileName: `Prices-${new Date().toLocaleDateString("PL-pl")}`,
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
              tooltip: "Dodaj nowy produkt",
              icon: "add",
              isFreeAction: true,
              onClick: (e, data) => {
                this.setState({
                  currentEditedProduct: { url: "", name: "" },
                  isDialogOpened: true,
                });
              },
            },
            {
              tooltip: "Usuń zaznaczone produkty",
              icon: "delete",
              onClick: (e, data) => {
                this.setState({
                  askDelete: true,
                  idsToDelete: data.map((e) => e.id),
                });
              },
            },
            {
              tooltip: "Edytuj ten produkt",
              icon: "edit",
              position: "row",
              onClick: (e, data) => {
                this.setState({
                  currentEditedProduct: this.state.products[data.tableData.id],
                  isDialogOpened: true,
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
