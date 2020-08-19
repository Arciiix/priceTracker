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

import "../Styles/Home.css";
import ApexCharts from "react-apexcharts";

class HistoryChart extends React.Component {
  closeDialog() {
    this.props.close.apply(this.props.that);
  }

  render() {
    return (
      <Dialog fullScreen open={this.props.isOpened}>
        <AppBar>
          <Toolbar>
            <Typography variant="h6">Historia cen</Typography>
            <IconButton
              edge="start"
              color="inherit"
              aria-label="Zamknij"
              onClick={this.closeDialog.bind(this)}
            >
              <CloseIcon />
            </IconButton>
          </Toolbar>
        </AppBar>
        <div className="chartContainer">
          <ApexCharts
            options={{
              chart: {
                type: "line",
              },
              theme: {
                mode: "dark",
                palette: "palette1",
              },
              dataLabels: {
                enabled: false,
              },
              stroke: {
                curve: "smooth",
              },
              xaxis: {
                labels: {
                  show: false,
                },
              },
              yaxis: {
                labels: {
                  formatter: (val) => {
                    if (val !== undefined) {
                      return `${val} zł`;
                    } else {
                      return "Brak zmiany ceny";
                    }
                  },
                },
              },
            }}
            series={this.props.products.map((e) => {
              return {
                name: e.name,
                data: JSON.parse(e.historyPrices).map((e) => e.price),
              };
            })}
            type="line"
            width={"100%"}
            height={"100%"}
          />
        </div>
      </Dialog>
    );
  }
}

export default HistoryChart;
