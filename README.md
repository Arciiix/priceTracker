# Welcome to PriceTracker!

Have you ever wanted a app which tracks a price of the items, and when it gets lower, sends an e-mail notification? I hope this is what you're looking for :)

# Purpose

The app collects data about your products in the selected shops, and when a price of them changes, sends an e-mail.

# Instalation

1.  Download the source files
2.  Run `npm install`
3.  If you want, you can run `npm run test` and check whether the app gets the data correctly from the default shops.
4.  Run `npm run build`
5.  Make the emailAccount.js file inside the folder and configure your e-mail account credentials. That file should look like that:

```js
const OPTIONS = {
  email: "YOUREMAIL",
  recipients: "RECIPIENTS",
  auth: {
    //Example for gmail, see nodemailer docs
    service: "gmail",
    host: "http://smtp.gmail.com/",
    port: 465,
    secure: true,
    auth: {
      user: "YOUREMAIL",
      pass: "YOURPASSWORD",
    },
  },
};
module.exports = OPTIONS;
```

6. Run `node server.js`
7. Enjoy the app :)

## Currently supported shops

For now, the app supports only Polish electronic shops:

1.  MediaExpert
2.  RTV EURO AGD
3.  Morele
4.  Botland

but it doesn't mean you can't add your own :) It's very easy, you just need to know the basics of JavaScript and HTML DOM. If you want to do that:

1.  Edit the server.js file
2.  Edit the SHOPS enum and add your shop
3.  Edit the getTheProductInfo' if statement by adding:


    ```js
    else if (url.includes("yourShopBaseURLAdress")) {
    shop = SHOPS.YOURSHOP;
    }
    ```
    before the end of the if statement.

4.  Then edit the fetchTheDataFromShop function - edit the switch-case statement by adding some code to get the price and title.
5.  If you want to, you can write some tests in the productInfo.test.js file
6.  You're done :)
