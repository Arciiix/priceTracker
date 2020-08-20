const OPTIONS = {
  port: 9182,
  tableName: "products",
  cronExpressionToCheckPrices: "0 10-20 * * *", //10 times a day (every hour from 10 to 20)
};

const EMAILACCOUNT = require("./emailAccount");

const SHOPS = {
  EMPTY: null,
  MEDIAEXPERT: "MediaExpert",
  RTVEUROAGD: "RTV EURO AGD",
  MORELE: "Morele.net",
  BOTLAND: "Botland",
  PSSTORE: "PlayStation Store",
};

const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const bodyParser = require("body-parser");
const cors = require("cors");
const fetch = require("node-fetch");
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const schedule = require("node-schedule");
const nodemailer = require("nodemailer");
const fs = require("fs");
const htmlMessage = fs.readFileSync("./email.min.html");
const path = require("path");

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.use(express.static(path.join(__dirname, "build")));

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

const transporter = nodemailer.createTransport(EMAILACCOUNT.auth);

transporter.verify((error, success) => {
  if (error) {
    console.log(
      `[${formatDate(
        new Date()
      )}] Error while connecting to the e-mail smtp: ${error}`
    );
  } else {
    console.log(
      `[${formatDate(new Date())}] Connected to the e-mail smtp successfully`
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
  console.log(`[${formatDate(new Date())}] Added a new product`);
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
  console.log(`[${formatDate(new Date())}] Updated a product successfully`);
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

  console.log(
    `[${formatDate(new Date())}] Deleted ${req.body.ids.length} product${
      req.body.ids.length > 1 ? "s" : ""
    }`
  );

  res.sendStatus(200);
});

app.get("*", (req, res) => {
  //If the server gets different request url than the previous endpoints, send the site
  res.sendFile("index.html");
});

function getTheProductInfo(url) {
  return new Promise(async (resolve, reject) => {
    let originalName,
      price,
      shop = SHOPS.EMPTY;
    if (!url) return resolve({ error: true });
    if (url.includes("https://www.mediaexpert.pl/")) {
      shop = SHOPS.MEDIAEXPERT;
    } else if (url.includes("https://www.euro.com.pl/")) {
      shop = SHOPS.RTVEUROAGD;
    } else if (url.includes("https://www.morele.net/")) {
      shop = SHOPS.MORELE;
    } else if (url.includes("https://botland.com.pl/")) {
      shop = SHOPS.BOTLAND;
    } else if (url.includes("https://store.playstation.com/")) {
      shop = SHOPS.PSSTORE;
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

//For tests
module.exports.productInfo = getTheProductInfo;

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
      case SHOPS.BOTLAND:
        price = parsedDocument
          .querySelector("#our_price_display")
          .textContent.replace("zł", "")
          .replace(",", ".");
        price = parseFloat(price);
        name = parsedDocument.querySelector("[itemprop=name]").textContent;
        break;
      case SHOPS.PSSTORE:
        price = parsedDocument
          .querySelector(".price-display__price")
          .textContent.replace("&nbps;", "")
          .replace("zł", "")
          .replace("zl", "")
          .replace(",", ".");
        price = parseFloat(price);
        name = parsedDocument.querySelector(".pdp__title").textContent;
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

function updateHistoryPrices(newPrice, previousHistoryPrices, id) {
  return new Promise((resolve, reject) => {
    let historyPrices = JSON.parse(previousHistoryPrices);
    historyPrices.push({ date: new Date().getTime(), price: newPrice });
    let query = `UPDATE ${OPTIONS.tableName} SET historyPrices = ? WHERE id = ? `;
    db.run(query, [JSON.stringify(historyPrices), id], (err) => {
      if (err) {
        console.log(
          `[${formatDate(
            new Date()
          )}] Error while trying to update product's history prices in the database: ${err}`
        );
        return resolve(false);
      }
      return resolve(true);
    });
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

function checkProductsPrices() {
  return new Promise(async (resolve, reject) => {
    let rows = await getDataFromDB();
    if (!rows) {
      return resolve(false);
    }
    rows.forEach(async (e) => {
      let data = await fetchTheDataFromShop(e.url, e.shop);
      if (!data) {
        console.log(
          `[${formatDate(
            new Date()
          )}] Error while trying to fetch product data in shop ${e.shop}`
        );
        return resolve(false);
      }
      if (data.price !== e.price) {
        let handler = await handleNewPrice(e, data.price);
        if (!handler) {
          console.log(
            `[${formatDate(
              new Date()
            )}] Error while trying to handle the price change (send an e-mail)`
          );
          return resolve(false);
        }
      }
    });
    console.log(`[${formatDate(new Date())}] Checked the products' prices`);
  });
}

function handleNewPrice(row, newPrice) {
  return new Promise(async (resolve, reject) => {
    let newObj = {
      ...row,
      ...{ price: newPrice },
    };
    let updateRow = await updateProduct(newObj, newObj.id);
    let updateHistoryPricesRow = await updateHistoryPrices(
      newPrice,
      row.historyPrices,
      row.id
    );
    if (!updateRow || !updateHistoryPricesRow) {
      console.log(
        `[${formatDate(
          new Date()
        )}] Error while trying to update rows in the database`
      );
      return resolve(false);
    }

    let isDiscount = row.price > newPrice;

    //Calculate the discount in percents
    let percent = isDiscount
      ? (row.price - newPrice) / row.price
      : (newPrice - row.price) / row.price;
    percent *= 100;
    percent = Math.round(percent);

    let messageBodyHTML = htmlMessage.toString(); //Copy the html message

    //If percent is more than 30, set the color to red when the price is higher, or to green, when it's lower, otherwise, set the color to black
    let percentTextColor =
      percent > 30 ? (isDiscount ? "#71EB7D" : "#D83D3D") : "#000000";

    //Set the correct content on the site
    messageBodyHTML = messageBodyHTML
      .replace("{title}", isDiscount ? "Obniżka" : "Zmiana ceny")
      .replace("{name}", row.name)
      .replace("{price}", newPrice + " zł")
      .replace("{shop}", row.shop)
      .replace("{percent}", percent)
      .replace("{previousPrice}", row.price + " zł")
      .replace("{percentTextColor}", percentTextColor);

    let messageBodyPlain = `Cena ${row.name} w sklepie ${row.shop} ${
      isDiscount ? "zmniejszyła się" : "zwiększyła się"
    } o ${percent}%, wynosząc ${newPrice} zł. Poprzednia wynosiła ${
      row.price
    } zł`;

    await transporter.sendMail({
      from: EMAILACCOUNT.email,
      to: EMAILACCOUNT.recipients,
      subject: isDiscount
        ? `Obniżka ceny ${row.name} w sklepie ${row.shop}`
        : `Zwiększenie ceny ${row.name} w sklepie ${row.shop}`,
      text: messageBodyPlain,
      html: messageBodyHTML,
      priority: "high",
    });

    console.log(
      `[${formatDate(new Date())}] The price of ${
        row.name
      } has changed to ${newPrice} from ${row.price} in shop ${
        row.shop
      }! E-mail has been sent.`
    );

    resolve(true);
  });
}

checkProductsPrices();

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

schedule.scheduleJob(OPTIONS.cronExpressionToCheckPrices, async () => {
  await checkProductsPrices();
});
