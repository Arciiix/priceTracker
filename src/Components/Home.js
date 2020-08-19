import React from "react";
import MaterialTable from "material-table";

import "../Styles/Home.css";
import ProductDialog from "./ProductDialog";
import DeleteDialog from "./DeleteDialog";
import HistoryChart from "./HistoryChart";

//DEV
const serverIp = "http://192.168.0.107:9182";

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

/*
It's deprecated because there were some problems with it, but it can be turned on with some limitations
The problem was with zooming - when you zoomed in, the site will pop an unhandled error
let h =
  window.innerHeight ||
  document.documentElement.clientHeight ||
  document.body.clientHeight;

let numberOfRows = Math.floor((h - 200) / 50);
DEPRECATED_AUTOROWS
*/

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
      isViewingHistoryPrices: false,
      historyPricesChartProducts: [],
    };
  }

  async componentDidMount() {
    let request = await fetch(`${serverIp}/getData`);
    if (request.status === 200) {
      let response = await request.json();
      this.setState(
        {
          products: response,
          isLoading: false,
        },
        this.forceUpdate
      );
    }
  }

  async deleteProducts(ids) {
    let request = await fetch(`${serverIp}/delete`, {
      method: "POST",
      body: JSON.stringify({ ids: ids }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (request.status === 200) {
      let productsArray = this.state.products;
      ids.forEach((elem) => {
        productsArray = productsArray.filter((e) => e.id !== elem);
      });
      this.setState({ products: productsArray });
    }
  }

  async saveTheChanges(changes) {
    if (this.state.currentEditedProduct.id) {
      await fetch(`${serverIp}/updateProduct`, {
        method: "POST",
        body: JSON.stringify({
          changes: changes.changes,
          previous: this.state.currentEditedProduct,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });
    } else {
      await fetch(`${serverIp}/newProduct`, {
        method: "POST",
        body: JSON.stringify(changes),
        headers: {
          "Content-Type": "application/json",
        },
      });
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
          serverIp={serverIp}
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

        <HistoryChart
          isOpened={this.state.isViewingHistoryPrices}
          that={this}
          products={this.state.historyPricesChartProducts}
          close={() => {
            this.setState({
              isViewingHistoryPrices: false,
              historyPricesChartProducts: [],
            });
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
              15,
              20,
              30,
              40,
              50,
              75,
              100,
              200,
              500,
            ],
            //See DEPRECATED_AUTOROWS
            //pageSize: numberOfRows,
            pageSize: 15,
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
              tooltip: "Zobacz historię cen tych produktów",
              icon: "history",
              onClick: (e, data) => {
                this.setState({
                  isViewingHistoryPrices: true,
                  historyPricesChartProducts: data,
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
