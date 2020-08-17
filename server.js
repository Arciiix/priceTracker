const OPTIONS = {
  port: 9182,
  tableName: "products",
};

const SHOPS = {
  EMPTY: null,
  TEST: "test", //DEV
  MEDIAEXPERT: "MediaExpert",
  RTVEUROAGD: "RTV EURO AGD",
  MORELE: "morele.net",
};

const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const bodyParser = require("body-parser");
const cors = require("cors");
const fetch = require("node-fetch");
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

const db = new sqlite3.Database("./db.db", (err) => {
  if (err) {
    console.log(
      `[${formatDate(
        new Date()
      )}] Error while trying to connect to the database: ${err}`
    );
  } else {
    console.log(
      `[${formatDate(new Date())}] Connected to the database successfully`
    );
  }
});

app.get("/getData", async (req, res) => {
  let rows = await getDataFromDB();
  res.send(JSON.stringify(rows));
});

app.post("/newProduct", async (req, res) => {
  if (!req.body.changes || !req.body.changes.url) return res.sendStatus(400);

  let { url, customName } = req.body.changes;

  //Get a name and price of the product
  let newObj = await getTheProductInfo(url);
  if (newObj.error) return res.sendStatus(400);

  //If user has specifed custom name, set it, otherwise use the original one
  if (customName && customName !== "") {
    newObj.name = customName;
  } else {
    newObj.name = newObj.originalName;
  }

  newObj.historyPrices = JSON.stringify([
    {
      date: new Date().getTime(),
      price: newObj.price,
    },
  ]);

  //Add the new product to the database
  let addToDB = await addToDatabase(newObj);
  if (!addToDB) return res.sendStatus(500);
  res.sendStatus(200);
});

app.post("/updateProduct", async (req, res) => {
  if (!req.body.changes || !req.body.changes.url || !req.body.previous)
    return res.sendStatus(400);

  let { url, customName } = req.body.changes;

  //Get an original name and price of the product
  let newObj = await getTheProductInfo(url);
  if (newObj.error) return res.sendStatus(400);

  //If user has specifed custom name, set it, otherwise use the original or earlier specifed one
  if (customName && customName !== "") {
    newObj.name = customName;
  } else {
    newObj.name = req.body.previous.name;
  }

  let updateProductBool = await updateProduct(newObj, req.body.previous.id);
  if (!updateProductBool) return res.sendStatus(500);
  res.sendStatus(200);
});

app.post("/getTheProductInfo", async (req, res) => {
  if (!req.body.url) return res.sendStatus(400);

  let url = req.body.url;
  let info = await getTheProductInfo(url);
  if (info.error) {
    res.sendStatus(400);
  } else {
    res.send(JSON.stringify(info));
  }
});

app.post("/delete", async (req, res) => {
  if (!req.body.ids) return res.sendStatus(400);

  for (let productId of req.body.ids) {
    await deleteProduct(productId);
  }

  res.sendStatus(200);
});

function getTheProductInfo(url) {
  return new Promise(async (resolve, reject) => {
    let originalName,
      price,
      shop = SHOPS.EMPTY;
    if (url.includes("https://www.mediaexpert.pl/")) {
      shop = SHOPS.MEDIAEXPERT;
    } else if (url.includes("https://www.euro.com.pl/")) {
      shop = SHOPS.RTVEUROAGD;
    } else if (url.includes("https://www.morele.net/")) {
      shop = SHOPS.MORELE;
    }

    if (shop === SHOPS.EMPTY) {
      return resolve({ error: true });
    } else {
      let obj = await fetchTheDataFromShop(url, shop);
      if (!obj) {
        return resolve({ error: true });
      } else {
        ({ originalName, price } = obj);
      }
    }

    resolve({
      shop: shop,
      originalName: originalName,
      price: price,
      url: url,
    });
  });
}

function fetchTheDataFromShop(url, shop) {
  return new Promise(async (resolve, reject) => {
    if (!url || !shop) return resolve(false);
    let request;
    try {
      request = await fetch(url);
    } catch (err) {
      if (err) return resolve(false);
    }
    if (request.status !== 200) return resolve(false);
    let response = await request.text();
    let parsedDocument = new JSDOM(response);
    parsedDocument = parsedDocument.window.document;
    let price, name;

    switch (shop) {
      case SHOPS.MEDIAEXPERT:
        price =
          parsedDocument.querySelector("[data-price]").dataset.price / 100;
        price = parseFloat(price);
        name = parsedDocument.querySelector("h1.a-typo.is-primary").textContent;
        name = name.replace(/(\r\n|\n|\r)/gm, ""); //Remove the line-breaks
        break;
      case SHOPS.RTVEUROAGD:
        price = parsedDocument
          .querySelector(".selenium-price-normal")
          .textContent.replace("&nbps;", "")
          .replace("\n\t", "")
          .replace("zł", "")
          .replace(",", ".");
        price = parseFloat(price);
        name = parsedDocument
          .querySelector(".selenium-KP-product-name")
          .textContent.replace(/(\n|\t)/g, ""); //Remove the line-breaks and tabs
        break;
      case SHOPS.MORELE:
        price = parsedDocument
          .querySelector(".price-new")
          .textContent.replace("zł", "")
          .replace(",", ".");
        price = parseFloat(price);
        name = parsedDocument.querySelector(".prod-name").textContent.trim();
        break;
      default:
        return resolve(false);
        break;
    }
    return resolve({ originalName: name, price: price });
  });
}
function getDataFromDB() {
  return new Promise((resolve, reject) => {
    let query = `SELECT * FROM ${OPTIONS.tableName}`;
    db.all(query, [], (err, rows) => {
      if (err) {
        console.log(
          `[${formatDate(
            new Date()
          )}] Error while trying to fetch the database data: ${err}`
        );
        resolve([]);
      } else {
        resolve(rows);
      }
    });
  });
}

function addToDatabase(product) {
  return new Promise((resolve, reject) => {
    let query = `INSERT INTO ${OPTIONS.tableName} (id, name, originalName, shop, url, price, historyPrices) VALUES (?, ?, ?, ?, ?, ?, ?)`;
    db.run(
      query,
      [
        null,
        product.name,
        product.originalName,
        product.shop,
        product.url,
        product.price,
        product.historyPrices,
      ],
      (err) => {
        if (err) {
          console.log(
            `[${formatDate(
              new Date()
            )}] Error while trying to add row to the database: ${err}`
          );
          return resolve(false);
        }
        return resolve(true);
      }
    );
  });
}

function updateProduct(newObj, id) {
  return new Promise((resolve, reject) => {
    let query = `UPDATE ${OPTIONS.tableName} SET name = ?, originalName = ?, shop = ?, url = ?, price = ? WHERE id = ? `;
    db.run(
      query,
      [
        newObj.name,
        newObj.originalName,
        newObj.shop,
        newObj.url,
        newObj.price,
        id,
      ],
      (err) => {
        if (err) {
          console.log(
            `[${formatDate(
              new Date()
            )}] Error while trying to update row in the database: ${err}`
          );
          return resolve(false);
        }
        return resolve(true);
      }
    );
  });
}

function deleteProduct(id) {
  return new Promise((resolve, reject) => {
    let query = `DELETE FROM ${OPTIONS.tableName} WHERE id = ?`;
    db.run(query, [id], (err) => {
      if (err) {
        console.log(
          `[${formatDate(
            new Date()
          )}] Error while trying to delete row from the database: ${err}`
        );
        return resolve(false);
      }
      return resolve(true);
    });
  });
}

function formatDate(date) {
  return (
    date.toLocaleDateString("PL-pl", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }) +
    " " +
    date.toLocaleTimeString("PL-pl")
  );
}

app.listen(OPTIONS.port, () => {
  console.log(`[${formatDate(new Date())}] App has started at ${OPTIONS.port}`);
});
